import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

// This middleware protects routes that require authentication
export async function middleware(request: NextRequest) {
  // Create a Supabase client configured for use with middleware
  const supabase = createMiddlewareClient({ req: request, res: NextResponse.next() })
  
  // Refresh session if expired
  await supabase.auth.getSession()
  
  // Get the current user's session
  const {
    data: { session },
  } = await supabase.auth.getSession()
  
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
  
  // Redirect to login if trying to access a protected route without a session
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Redirect to dashboard if already logged in and trying to access login/signup
  if ((request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/signup',
  ],
} 