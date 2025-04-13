import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Public paths that don't require authentication
  const isPublicPath = path === '/login' || 
                       path === '/signup' || 
                       path === '/forgot-password' ||
                       path === '/' || // Home page is public
                       path.startsWith('/api/auth');
  
  // Get auth token from cookies or headers
  const authToken = request.cookies.get('supabase-auth-token')?.value;
  const hasAuthToken = !!authToken && authToken.length > 10; // Basic validation
  
  // Set a custom header to signal to the client-side that redirection is happening
  // This will help prevent blank screens during navigation
  const response = NextResponse.next();
  
  // Add headers to improve navigation experience
  response.headers.set('x-middleware-cache', 'no-cache');
  response.headers.set('x-requested-path', path);
  response.headers.set('Cache-Control', 'no-store, must-revalidate');
  response.headers.set('x-navigation-transition', 'true');
  
  // If accessing protected route without auth token, redirect to login
  if (!isPublicPath && !hasAuthToken) {
    console.log(`Middleware: Redirecting unauthenticated request from ${path} to login`);
    const redirectUrl = new URL('/login', request.url);
    
    // Add query parameters to improve the navigation experience
    redirectUrl.searchParams.set('redirect', encodeURIComponent(path));
    redirectUrl.searchParams.set('from', 'middleware');
    
    const redirectResponse = NextResponse.redirect(redirectUrl);
    
    // Add navigation transition headers to redirect
    redirectResponse.headers.set('x-middleware-cache', 'no-cache');
    redirectResponse.headers.set('x-requested-path', path);
    redirectResponse.headers.set('Cache-Control', 'no-store, must-revalidate');
    redirectResponse.headers.set('x-navigation-transition', 'true');
    
    return redirectResponse;
  }
  
  // If already logged in and trying to access login/signup, redirect to dashboard
  if (hasAuthToken && (path === '/login' || path === '/signup')) {
    console.log(`Middleware: Redirecting authenticated user from ${path} to dashboard`);
    const redirectResponse = NextResponse.redirect(new URL('/dashboard', request.url));
    
    // Add navigation transition headers to redirect
    redirectResponse.headers.set('x-middleware-cache', 'no-cache');
    redirectResponse.headers.set('x-requested-path', path);
    redirectResponse.headers.set('Cache-Control', 'no-store, must-revalidate');
    redirectResponse.headers.set('x-navigation-transition', 'true');
    
    return redirectResponse;
  }

  return response;
}

// Apply middleware selectively to reduce unnecessary processing
export const config = {
  matcher: [
    // Apply to auth-related routes and dashboard
    '/',
    '/dashboard/:path*',
    '/settings/:path*',
    '/api/auth/:path*',
    '/api/ai-prompts/:path*', // Also protect AI prompts routes
    '/login',
    '/signup',
    '/forgot-password',
  ],
} 