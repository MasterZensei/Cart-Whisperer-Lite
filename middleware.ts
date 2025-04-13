import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This middleware now does nothing but pass through all requests
export async function middleware(request: NextRequest) {
  console.log('Middleware running on path (BYPASS MODE):', request.nextUrl.pathname);
  
  // Just pass through all requests without any auth checks
  return NextResponse.next();
}

// Only run on login page to avoid affecting other routes
export const config = {
  matcher: [
    '/login',
  ],
} 