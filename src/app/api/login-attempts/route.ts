import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const MAX_ATTEMPTS = Number(process.env.LOGIN_MAX_ATTEMPTS) || 5;
const LOCK_DURATION_MS = Number(process.env.LOGIN_LOCK_DURATION_MS) || 15 * 60 * 1000;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

async function getEntry(identifier: string | undefined, ip: string) {
  if (identifier) {
    const { data } = await supabaseAdmin.from('login_attempts').select('*').eq('identifier', identifier).maybeSingle();
    if (data) return data;
  }
  const { data } = await supabaseAdmin.from('login_attempts').select('*').eq('ip_address', ip).maybeSingle();
  return data;
}

async function reportFailure(identifier: string | undefined, ip: string) {
  const now = new Date().toISOString();
  if (identifier) {
    const { data } = await supabaseAdmin.from('login_attempts').select('*').eq('identifier', identifier).maybeSingle();
    if (data) {
      const newCount = Math.min(MAX_ATTEMPTS, (data.attempts_count || 0) + 1);
      const lockedUntil = newCount >= MAX_ATTEMPTS ? new Date(Date.now() + LOCK_DURATION_MS).toISOString() : null;
      await supabaseAdmin.from('login_attempts').update({ attempts_count: newCount, locked_until: lockedUntil, last_attempt_at: now }).eq('identifier', identifier);
      return { count: newCount, lockedUntil };
    }
    const newCount = 1;
    const lockedUntil = null;
    await supabaseAdmin.from('login_attempts').insert({ identifier, ip_address: ip, attempts_count: newCount, locked_until: lockedUntil, last_attempt_at: now });
    return { count: newCount, lockedUntil };
  }

  // ip-based
  const { data } = await supabaseAdmin.from('login_attempts').select('*').eq('ip_address', ip).maybeSingle();
  if (data) {
    const newCount = Math.min(MAX_ATTEMPTS, (data.attempts_count || 0) + 1);
    const lockedUntil = newCount >= MAX_ATTEMPTS ? new Date(Date.now() + LOCK_DURATION_MS).toISOString() : null;
    await supabaseAdmin.from('login_attempts').update({ attempts_count: newCount, locked_until: lockedUntil, last_attempt_at: now }).eq('ip_address', ip);
    return { count: newCount, lockedUntil };
  }
  await supabaseAdmin.from('login_attempts').insert({ identifier: null, ip_address: ip, attempts_count: 1, locked_until: null, last_attempt_at: now });
  return { count: 1, lockedUntil: null };
}

async function clearAttempts(identifier: string | undefined, ip: string) {
  if (identifier) {
    await supabaseAdmin.from('login_attempts').delete().eq('identifier', identifier);
  }
  await supabaseAdmin.from('login_attempts').delete().eq('ip_address', ip);
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? req.headers.get('x-real-ip') ?? 'unknown';
    const body = await req.json();
    const action: string = body?.action ?? 'check';
    const identifier: string | undefined = body?.identifier;

    const entry = await getEntry(identifier, ip);

    if (action === 'check') {
      const locked = entry?.locked_until && new Date(entry.locked_until).getTime() > Date.now();
      return NextResponse.json({ allowed: !locked, count: entry?.attempts_count ?? 0, attemptsLeft: Math.max(0, MAX_ATTEMPTS - (entry?.attempts_count ?? 0)), lockedUntil: entry?.locked_until ?? null });
    }

    if (action === 'report') {
      const success = Boolean(body?.success);
      if (success) {
        await clearAttempts(identifier, ip);
        return NextResponse.json({ ok: true });
      }

      const r = await reportFailure(identifier, ip);
      return NextResponse.json({ ok: true, count: r.count, attemptsLeft: Math.max(0, MAX_ATTEMPTS - r.count), lockedUntil: r.lockedUntil ?? null });
    }

    return NextResponse.json({ error: 'invalid action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
