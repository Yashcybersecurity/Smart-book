import { NextResponse } from 'next/server';

const PUBLIC_ROUTES = new Set(['/login', '/signup', '/offline']);

function decodeJWTPayload(token) {
  try {
    const b64 = token.split('.')[1];
    const padded = b64.padEnd(b64.length + (4 - (b64.length % 4)) % 4, '=');
    return JSON.parse(atob(padded.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_ROUTES.has(pathname);
  const sessionCookie = request.cookies.get('session')?.value;

  // Determine session validity purely by cookie presence + JWT expiry decode
  let sessionValid = false;
  if (sessionCookie) {
    const payload = decodeJWTPayload(sessionCookie);
    sessionValid = payload && payload.exp * 1000 > Date.now();
  }

  if (!isPublic && !sessionValid) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    if (pathname !== '/') url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from login / signup
  if (sessionValid && (pathname === '/login' || pathname === '/signup')) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  // Redirect root
  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = sessionValid ? '/dashboard' : '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons|logos|api).*)'],
};
