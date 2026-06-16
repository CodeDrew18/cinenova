import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware: require authentication before allowing playback access
 * - Redirects unauthenticated users to `/login?next=...` when
 *   requesting `/content` with a `streamUrl` or `play` parameter.
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const { pathname, searchParams } = req.nextUrl;

  // Only require auth for playback-related requests
  const isContentPlayback = pathname.startsWith('/content') && (searchParams.has('streamUrl') || searchParams.has('play'));
  const isPlayRoute = pathname.startsWith('/play');

  if (isContentPlayback || isPlayRoute) {
    // Look for common Supabase auth cookie names — if none present, redirect
    const cookies = req.cookies.getAll ? req.cookies.getAll() : [];
    const hasAuthCookie = cookies.some((c) => /(supabase|sb[-_:]?|sb:|sb_access_token|sb-refresh-token|supabase-auth)/i.test(c.name));

    if (!hasAuthCookie) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/login';
      redirectUrl.searchParams.set('next', req.nextUrl.pathname + req.nextUrl.search);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return res;
}

export const config = {
  matcher: ['/content/:path*', '/play/:path*', '/play', '/content'],
};
