import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Public paths that don't require authentication
  const isPublicPath = path === '/login' || 
                       path === '/signup' || 
                       path === '/forgot-password' ||
                       path.startsWith('/api/auth');
  
  // Get auth token from cookies or headers
  const authToken = request.cookies.get('supabase-auth-token')?.value;
  
  // If accessing protected route without auth token, redirect to login
  if (!isPublicPath && !authToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If already logged in and trying to access login/signup, redirect to dashboard
  if (authToken && (path === '/login' || path === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Apply middleware to all routes
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/|api/health).*)',
  ],
} 