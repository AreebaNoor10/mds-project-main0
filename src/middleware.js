import { NextResponse } from 'next/server';

export function middleware(request) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = path === '/login' || path === '/signup';

  // Get the email from cookies
  const email = request.cookies.get('userEmail')?.value || '';

  // If the path is public and user is logged in, redirect to dashboard
  if (isPublicPath && email) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If the path is not public and user is not logged in, redirect to login
  if (!isPublicPath && !email) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     * - login (login page)
     * - signup (signup page)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|login|signup).*)',
  ],
}; 