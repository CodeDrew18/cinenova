"use client";

import React, { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { User, Lock, LogIn, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [attemptsCount, setAttemptsCount] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const router = useRouter();

  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  // Load reCAPTCHA v3 script (invisible) on mount
  useEffect(() => {
    if (!recaptchaSiteKey) return;
    if (typeof window === 'undefined') return;
    const win = window as any;
    if (win.grecaptcha) {
      console.debug('[reCAPTCHA v3] grecaptcha already present');
      return;
    }
    const s = document.createElement('script');
    s.src = `https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`;
    s.async = true;
    s.defer = true;
    s.onload = () => console.debug('[reCAPTCHA v3] script loaded');
    s.onerror = () => setMessage('Failed to load reCAPTCHA script. Check site key and network.');
    document.head.appendChild(s);
    // keep the script loaded across HMR; do not remove on unmount
  }, [recaptchaSiteKey]);

  // Auto-login helpers
  const lastAutoAttemptRef = useRef<number>(0);
  const autoAttemptTimerRef = useRef<number | null>(null);

  const MAX_ATTEMPTS = 5;
  const CLIENT_LOCK_MS = 2 * 60 * 1000; // 2 minutes client-side lock when max attempts reached

  const formatTime = (ms: number | null) => {
    if (!ms || ms <= 0) return '00:00';
    const total = Math.floor(ms / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // session + attempts check
  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session ?? null;
        if (session) {
          router.push('/profile');
          return;
        }

        const ipCheck = await fetch('/api/login-attempts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'check', identifier: undefined }),
        });
        const ipData = await ipCheck.json();
        setAttemptsCount((ipData.count) ?? 0);
        if (ipData.lockedUntil) {
          const val = typeof ipData.lockedUntil === 'number' ? ipData.lockedUntil : Date.parse(ipData.lockedUntil);
          setLockedUntil(Number.isFinite(val) ? val : null);
        }
        if (ipData.lockedUntil && (typeof ipData.lockedUntil === 'number' ? ipData.lockedUntil : Date.parse(ipData.lockedUntil)) > Date.now()) {
          setMessage('Too many incorrect attempts. Please try again later.');
        }
      } catch (e) {
        try {
          const raw = localStorage.getItem('loginAttempts');
          if (raw) {
            const parsed = JSON.parse(raw);
            setAttemptsCount(parsed.count ?? 0);
            const lu = parsed.lockedUntil ?? null;
            setLockedUntil(lu ? (typeof lu === 'number' ? lu : Date.parse(lu)) : null);
            if (lu && (typeof lu === 'number' ? lu : Date.parse(lu)) > Date.now()) {
              setMessage('Too many incorrect attempts. Please try again later.');
            }
          }
        } catch (err) {
          // ignore
        }
      }
    })();
  }, [router]);

  // reCAPTCHA debug helper (non-invasive)
  useEffect(() => {
    if (!recaptchaSiteKey) return;
    const win = typeof window !== 'undefined' ? (window as any) : null;
    try {
      console.debug('[reCAPTCHA debug] siteKey=', recaptchaSiteKey);
      console.debug('[reCAPTCHA debug] grecaptcha=', typeof win?.grecaptcha);
      const scriptEl = document.querySelector("script[src*='recaptcha']") as HTMLScriptElement | null;
      console.debug('[reCAPTCHA debug] script tag present=', !!scriptEl, scriptEl?.getAttribute('src'));
      const iframeEl = document.querySelector("iframe[src*='recaptcha']") as HTMLIFrameElement | null;
      console.debug('[reCAPTCHA debug] iframe present=', !!iframeEl, iframeEl?.getAttribute('src'));
    } catch (e) {
      console.error('[reCAPTCHA debug] error reading DOM', e);
    }
  }, [recaptchaSiteKey]);

  // No Turnstile: use reCAPTCHA only

  // lockout countdown
  useEffect(() => {
    if (!lockedUntil) {
      setTimeLeft(null);
      return;
    }
    const tick = () => {
      const diff = (lockedUntil ?? 0) - Date.now();
      if (diff <= 0) {
        setLockedUntil(null);
        setAttemptsCount(0);
        localStorage.removeItem('loginAttempts');
        setTimeLeft(null);
        setMessage('You may try logging in again.');
        return;
      }
      setTimeLeft(diff);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lockedUntil]);

  // If attempts reach MAX_ATTEMPTS but server didn't provide a lockedUntil, apply a short client lock
  useEffect(() => {
    if (attemptsCount >= MAX_ATTEMPTS) {
      if (!lockedUntil || lockedUntil <= Date.now()) {
        const newLocked = Date.now() + CLIENT_LOCK_MS;
        setLockedUntil(newLocked);
        try {
          localStorage.setItem('loginAttempts', JSON.stringify({ count: attemptsCount, lockedUntil: newLocked }));
        } catch (e) {
          // ignore
        }
        setMessage('Too many incorrect attempts. Please try again later.');
      }
    }
  }, [attemptsCount]);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (lockedUntil && lockedUntil > Date.now()) {
      setMessage('Too many incorrect attempts. Please try again later.');
      setLoading(false);
      return;
    }

    let loginEmail = identifier;
    if (!identifier.includes('@')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', identifier)
        .maybeSingle();
      if (profile?.email) loginEmail = profile.email;
      else {
        setMessage('Username not found. Please use your email or sign up.');
        setLoading(false);
        return;
      }
    }

    // Obtain reCAPTCHA v3 token at submit time
    if (!recaptchaSiteKey) {
      setMessage('reCAPTCHA site key not configured.');
      setLoading(false);
      return;
    }

    const win = typeof window !== 'undefined' ? (window as any) : null;
    if (!win?.grecaptcha) {
      setMessage('reCAPTCHA not loaded yet; please reload the page.');
      setLoading(false);
      return;
    }

    let token: string;
    try {
      token = await new Promise<string>((resolve, reject) => {
        try {
          win.grecaptcha.ready(() => {
            win.grecaptcha.execute(recaptchaSiteKey, { action: 'login' }).then((t: string) => resolve(t)).catch(reject);
          });
        } catch (err) {
          reject(err);
        }
      });
    } catch (err) {
      console.error('grecaptcha execute failed', err);
      setMessage('reCAPTCHA execution failed. Please try again.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: loginEmail, password, captchaToken: token, captchaProvider: 'recaptcha' }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setMessage(data?.message || 'Login failed');
        if (data?.lockedUntil) setLockedUntil(new Date(data.lockedUntil).getTime());
        setAttemptsCount(data?.attemptsCount ?? attemptsCount + 1);
        setLoading(false);
        return;
      }

      const access_token = data?.access_token;
      const refresh_token = data?.refresh_token;
      if (access_token && refresh_token) await supabase.auth.setSession({ access_token, refresh_token });

      setAttemptsCount(0);
      setLockedUntil(null);
      localStorage.removeItem('loginAttempts');
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('login request failed', err);
      setMessage('Login request failed.');
      setLoading(false);
      return;
    }
    setLoading(false);
  };

  // Auto-login function and debounce: attempt login automatically when user pauses typing with credentials filled
  const tryAutoLogin = async () => {
    if (loading) return;
    if (!identifier || !password) return;
    if (lockedUntil && lockedUntil > Date.now()) return;
    if (!recaptchaSiteKey) return;
    const now = Date.now();
    if (now - lastAutoAttemptRef.current < 10000) return;
    lastAutoAttemptRef.current = now;

    setLoading(true);
    setMessage('Attempting auto-login...');

    // resolve username -> email if needed
    let loginEmail = identifier;
    if (!identifier.includes('@')) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', identifier)
          .maybeSingle();
        if (profile?.email) loginEmail = profile.email;
        else {
          setLoading(false);
          setMessage('Username not found.');
          return;
        }
      } catch (err) {
        setLoading(false);
        setMessage('Lookup failed.');
        return;
      }
    }

    const win = typeof window !== 'undefined' ? (window as any) : null;
    if (!win?.grecaptcha) {
      setLoading(false);
      setMessage('reCAPTCHA not loaded yet; please reload the page.');
      return;
    }

    let token: string;
    try {
      token = await new Promise<string>((resolve, reject) => {
        try {
          win.grecaptcha.ready(() => {
            win.grecaptcha.execute(recaptchaSiteKey, { action: 'login' }).then((t: string) => resolve(t)).catch(reject);
          });
        } catch (err) { reject(err); }
      });
    } catch (err) {
      console.error('grecaptcha execute failed', err);
      setMessage('reCAPTCHA execution failed.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: loginEmail, password, captchaToken: token, captchaProvider: 'recaptcha' }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setMessage(data?.message || 'Auto-login failed');
        if (data?.lockedUntil) setLockedUntil(new Date(data.lockedUntil).getTime());
        setAttemptsCount(data?.attemptsCount ?? attemptsCount + 1);
        setLoading(false);
        return;
      }

      const access_token = data?.access_token;
      const refresh_token = data?.refresh_token;
      if (access_token && refresh_token) await supabase.auth.setSession({ access_token, refresh_token });

      setAttemptsCount(0);
      setLockedUntil(null);
      localStorage.removeItem('loginAttempts');
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('auto-login request failed', err);
      setMessage('Auto-login request failed.');
      setLoading(false);
      return;
    }
    setLoading(false);
  };

  useEffect(() => {
    if (autoAttemptTimerRef.current) window.clearTimeout(autoAttemptTimerRef.current);
    autoAttemptTimerRef.current = window.setTimeout(() => {
      tryAutoLogin();
    }, 900);
    return () => { if (autoAttemptTimerRef.current) window.clearTimeout(autoAttemptTimerRef.current); };
  }, [identifier, password]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-neutral-950 pt-20 pb-10 transition-colors duration-300">
      <div className="bg-white dark:bg-neutral-900 p-10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.3)] dark:shadow-[0_0_50px_rgba(0,0,0,0.7)] border border-neutral-200 dark:border-white/10 max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-black tracking-tighter text-neutral-950 dark:text-white uppercase italic">
            CINE<span className="text-red-600">NOVA</span>
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium uppercase tracking-widest italic">Welcome Back</p>
        </div>

        <div className="mt-6">
          {lockedUntil && lockedUntil > Date.now() ? (
            <div className="w-full p-3 rounded-md bg-red-50 text-red-700 text-sm font-bold text-center">Locked — try again in {formatTime(timeLeft)}</div>
          ) : (
            <div className="w-full p-3 rounded-md bg-yellow-50 text-yellow-800 text-sm font-semibold text-center">Attempts remaining: {Math.max(0, MAX_ATTEMPTS - attemptsCount)}</div>
          )}
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-4">
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-red-600 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Username or Email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-200 dark:border-white/5 rounded-xl py-4 pl-12 pr-4 text-neutral-950 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-600 focus:outline-none focus:border-red-600/50 focus:ring-4 focus:ring-red-600/10 transition-all"
                required
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-red-600 transition-colors" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-200 dark:border-white/5 rounded-xl py-4 pl-12 pr-12 text-neutral-950 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-600 focus:outline-none focus:border-red-600/50 focus:ring-4 focus:ring-red-600/10 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-950 dark:hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {recaptchaSiteKey ? (
              <div className="text-center text-xs text-neutral-500">reCAPTCHA v3 (invisible) is active.</div>
            ) : (
              <div className="text-center text-xs text-neutral-500">CAPTCHA unavailable. Set NEXT_PUBLIC_RECAPTCHA_SITE_KEY in your .env.local and restart.</div>
            )}

            <button
              type="submit"
              className="w-full bg-red-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-red-700 transition-all transform active:scale-95 flex items-center justify-center gap-3 shadow-lg shadow-red-600/20"
              disabled={loading}
            >
              {loading ? 'Entering...' : <><LogIn size={18} /> Login</>}
            </button>
          </div>
        </form>

        {!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && (
          <div className="text-center mt-3">
            <div className="inline-block px-3 py-2 rounded-md bg-yellow-50 text-yellow-800 text-xs font-medium">
              No public CAPTCHA key configured. Set NEXT_PUBLIC_RECAPTCHA_SITE_KEY in your .env.local
            </div>
          </div>
        )}

        {message && <div className="p-4 rounded-xl bg-red-500/10 text-red-500 text-center text-xs font-bold uppercase tracking-tight">{message}</div>}

        <div className="text-center pt-2">
          <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest italic">
            New to Cinenova? <Link href="/signup" className="text-neutral-950 dark:text-white hover:text-red-600 transition-colors ml-1 underline decoration-red-600/30 underline-offset-4">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
