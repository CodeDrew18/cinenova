'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { User, Lock, LogIn, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState(''); // Username or Email
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    let loginEmail = identifier;

    // If input is a username (no @), resolve email via profiles table
    if (!identifier.includes('@')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', identifier)
        .single();
      
      if (profile) {
        loginEmail = profile.email;
      } else {
        setMessage('Username not found. Please use your email or sign up.');
        setLoading(false);
        return;
      }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      router.push('/');
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-950 pt-20 pb-10">
      <div className="bg-neutral-900 p-10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.7)] border border-white/10 max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic">
            CINE<span className="text-red-600">NOVA</span>
          </h1>
          <p className="text-neutral-400 text-sm font-medium uppercase tracking-widest italic">Welcome Back</p>
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
                className="w-full bg-neutral-800/50 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white placeholder-neutral-600 focus:outline-none focus:border-red-600/50 focus:ring-4 focus:ring-red-600/10 transition-all"
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
                className="w-full bg-neutral-800/50 border border-white/5 rounded-xl py-4 pl-12 pr-12 text-white placeholder-neutral-600 focus:outline-none focus:border-red-600/50 focus:ring-4 focus:ring-red-600/10 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-red-700 transition-all transform active:scale-95 flex items-center justify-center gap-3 shadow-lg shadow-red-600/20"
            disabled={loading}
          >
            {loading ? 'Entering...' : <><LogIn size={18} /> Login</>}
          </button>
        </form>

        {message && <div className="p-4 rounded-xl bg-red-500/10 text-red-500 text-center text-xs font-bold uppercase tracking-tight">{message}</div>}

        <div className="text-center pt-2">
          <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest italic">
            New to Cinenova? <Link href="/signup" className="text-white hover:text-red-600 transition-colors ml-1 underline decoration-red-600/30 underline-offset-4">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}