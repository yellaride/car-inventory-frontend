import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public paths that don't require authentication
  const publicPaths = ['/login', '/'];
  const isPublicPath = publicPaths.includes(pathname);
  
  // Check localStorage token via headers (client-side only)
  // Middleware runs on server, so we allow all requests
  // Client-side auth check happens in pages
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
