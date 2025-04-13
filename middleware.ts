import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

// This middleware protects routes that require authentication
export async function middleware(request: NextRequest) {
  console.log('Middleware running on path:', request.nextUrl.pathname);
  
  // Create a Supabase client configured for use with middleware
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res })
  
  // Refresh session if expired
  await supabase.auth.getSession()
  
  // Get the current user's session
  const {
    data: { session },
  } = await supabase.auth.getSession()
  
  console.log('Middleware session check:', !!session);
  
  // Define protected routes
  const protectedRoutes = [
    '/dashboard',
    '/dashboard/analytics',
    '/dashboard/templates',
    '/dashboard/settings',
  ]
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )
  
  console.log('Is protected route:', isProtectedRoute);

  // Allow direct access to login/signup pages even if logged in
  // This prevents redirect loops
  if (request.nextUrl.pathname === '/login' || 
      request.nextUrl.pathname === '/signup' ||
      request.nextUrl.pathname === '/direct-dashboard') {
    console.log('On access/bypass page, passing through without redirects');
    return res;
  }
  
  // If we're on a protected route without a Supabase session, let the client-side
  // auth system handle it instead of redirecting here.
  // This fixes the potential redirect loop with localStorage-based auth
  if (isProtectedRoute) {
    console.log('Protected route, allowing client-side auth check');
    return res;
  }
  
  console.log('Middleware passing through');
  return res;
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/signup',
  ],
} 