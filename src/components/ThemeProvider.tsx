'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  const router = useRouter();

  React.useEffect(() => {
    // Idle timeout in milliseconds (default 15 minutes)
    const IDLE_TIMEOUT = Number(process.env.NEXT_PUBLIC_IDLE_TIMEOUT_MS) || 15 * 60 * 1000;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const logout = async () => {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error('Error signing out on idle:', e);
      }
      try {
        router.push('/login');
      } catch (e) {
        // ignore
      }
    };

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(logout, IDLE_TIMEOUT);
    };

    const events: Array<keyof DocumentEventMap | keyof WindowEventMap> = [
      'mousemove',
      'keydown',
      'mousedown',
      'touchstart',
      'scroll',
    ];

    events.forEach((ev) => window.addEventListener(ev, resetTimer, { passive: true } as AddEventListenerOptions));
    document.addEventListener('visibilitychange', resetTimer as EventListener);

    // start timer
    resetTimer();

    return () => {
      if (timer) clearTimeout(timer);
      events.forEach((ev) => window.removeEventListener(ev, resetTimer as EventListener));
      document.removeEventListener('visibilitychange', resetTimer as EventListener);
    };
  }, [router]);

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}