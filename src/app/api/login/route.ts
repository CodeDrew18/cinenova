import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET || process.env.RECAPTCHA_SERVER_KEY || '';
const RECAPTCHA_MIN_SCORE = (() => {
  const v = parseFloat(process.env.RECAPTCHA_MIN_SCORE ?? '0.5');
  return Number.isFinite(v) && !Number.isNaN(v) ? v : 0.5;
})();
const MAX_ATTEMPTS = Number(process.env.LOGIN_MAX_ATTEMPTS) || 5;
const LOCK_DURATION_MS = Number(process.env.LOGIN_LOCK_DURATION_MS) || 15 * 60 * 1000;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  // We'll still export handlers, but runtime will error on use if not configured.
  console.warn('Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. /api/login will not work without them.');
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function incrementAttempt(identifier: string | null, ip: string) {
  const now = new Date().toISOString();

  if (identifier) {
    const { data } = await supabaseAdmin.from('login_attempts').select('*').eq('identifier', identifier).maybeSingle();
    if (data) {
      const newCount = (data.attempts_count || 0) + 1;
      const lockedUntil = newCount >= MAX_ATTEMPTS ? new Date(Date.now() + LOCK_DURATION_MS).toISOString() : null;
      await supabaseAdmin.from('login_attempts').update({ attempts_count: newCount, locked_until: lockedUntil, last_attempt_at: now }).eq('identifier', identifier);
      return { count: newCount, lockedUntil };
    }
    const newCount = 1;
    const lockedUntil = newCount >= MAX_ATTEMPTS ? new Date(Date.now() + LOCK_DURATION_MS).toISOString() : null;
    await supabaseAdmin.from('login_attempts').insert({ identifier, ip_address: ip, attempts_count: newCount, locked_until: lockedUntil, last_attempt_at: now });
    return { count: newCount, lockedUntil };
  }

  // fallback to ip-based tracking
  const { data } = await supabaseAdmin.from('login_attempts').select('*').eq('ip_address', ip).maybeSingle();
  if (data) {
    const newCount = (data.attempts_count || 0) + 1;
    const lockedUntil = newCount >= MAX_ATTEMPTS ? new Date(Date.now() + LOCK_DURATION_MS).toISOString() : null;
    await supabaseAdmin.from('login_attempts').update({ attempts_count: newCount, locked_until: lockedUntil, last_attempt_at: now }).eq('ip_address', ip);
    return { count: newCount, lockedUntil };
  }
  const newCount = 1;
  const lockedUntil = newCount >= MAX_ATTEMPTS ? new Date(Date.now() + LOCK_DURATION_MS).toISOString() : null;
  await supabaseAdmin.from('login_attempts').insert({ identifier: null, ip_address: ip, attempts_count: newCount, locked_until: lockedUntil, last_attempt_at: now });
  return { count: newCount, lockedUntil };
}

async function resetAttempts(identifier: string | null, ip: string) {
  if (identifier) {
    await supabaseAdmin.from('login_attempts').delete().eq('identifier', identifier);
  }
  // also delete any ip-based record
  await supabaseAdmin.from('login_attempts').delete().eq('ip_address', ip);
}

async function getAttemptEntry(identifier: string | null, ip: string) {
  if (identifier) {
    const { data } = await supabaseAdmin.from('login_attempts').select('*').eq('identifier', identifier).maybeSingle();
    if (data) return data;
  }
  const { data } = await supabaseAdmin.from('login_attempts').select('*').eq('ip_address', ip).maybeSingle();
  return data;
}

async function verifyRecaptcha(token: string) {
  if (!RECAPTCHA_SECRET) return false;
  const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${encodeURIComponent(RECAPTCHA_SECRET)}&response=${encodeURIComponent(token)}`,
  });
  const json = await res.json();
  // Debug helpful bits
  try {
    console.debug('[verifyRecaptcha] success=', json?.success, 'score=', json?.score, 'action=', json?.action, 'error-codes=', json['error-codes']);
  } catch (e) {
    // ignore
  }
  if (!json?.success) return false;
  // If score present (v3), enforce threshold
  if (typeof json.score === 'number' && json.score < RECAPTCHA_MIN_SCORE) return false;
  // If action present, ensure it matches the expected action
  if (json.action && json.action !== 'login') return false;
  return true;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { identifier, password, captchaToken, captchaProvider } = body ?? {};
    const ip = (req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown').split(',')[0].trim();

    // If username provided, try to resolve to email
    if (identifier && !identifier.includes('@')) {
      const { data: profile } = await supabaseAdmin.from('profiles').select('email').eq('username', identifier).maybeSingle();
      if (profile?.email) identifier = profile.email;
    }

    const entry = await getAttemptEntry(identifier ?? null, ip);
    const now = Date.now();
    if (entry?.locked_until && new Date(entry.locked_until).getTime() > now) {
      return NextResponse.json({ ok: false, locked: true, lockedUntil: entry.locked_until, attemptsLeft: Math.max(0, MAX_ATTEMPTS - (entry.attempts_count || 0)) }, { status: 429 });
    }

    // Verify reCAPTCHA server-side
    const captchaOk = !!(captchaToken && await verifyRecaptcha(captchaToken));

    if (!captchaOk) {
      const r = await incrementAttempt(identifier ?? null, ip);
      return NextResponse.json({ ok: false, message: 'CAPTCHA verification failed', attemptsCount: r.count, lockedUntil: r.lockedUntil }, { status: 400 });
    }

    // Authenticate against Supabase Auth (server-side) using the Supabase JS client
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ ok: false, message: 'Server not configured for server-side login' }, { status: 500 });
    }

    try {
      console.debug('[api/login] signIn attempt for identifier=', identifier, 'ip=', ip);
      const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({ email: identifier ?? '', password: password ?? '' });
      if (authError || !authData?.session) {
        const r = await incrementAttempt(identifier ?? null, ip);
        console.warn('[api/login] auth error', { message: authError?.message, code: (authError as any)?.code });
        return NextResponse.json({ ok: false, message: authError?.message || 'Invalid credentials', attemptsCount: r.count, lockedUntil: r.lockedUntil }, { status: 401 });
      }

      // Success: reset attempts for this identifier/ip
      await resetAttempts(identifier ?? null, ip);

      // Return the essential session tokens to the client
      const session = authData.session;
      return NextResponse.json({ ok: true, access_token: session?.access_token, refresh_token: session?.refresh_token, expires_at: session?.expires_at, user: authData.user }, { status: 200 });
    } catch (err) {
      console.error('[api/login] unexpected auth error', err);
      return NextResponse.json({ ok: false, message: 'Authentication error' }, { status: 500 });
    }
  } catch (err) {
    return NextResponse.json({ ok: false, message: String(err) }, { status: 500 });
  }
}
