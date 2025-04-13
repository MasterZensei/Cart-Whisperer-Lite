import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';
import { rateLimiter } from '@/lib/rate-limiter';
import { logger } from '@/lib/logger';

// Input validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(request: Request) {
  logger.info('Sign-in attempt', { context: 'auth:signin' });
  
  // Apply rate limiting (5 attempts per minute)
  try {
    const rateLimit = await rateLimiter(request as any, {
      limit: 5,
      windowInSeconds: 60,
      keyGenerator: (req) => {
        const forwarded = request.headers.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0].trim() : 'anonymous';
        return `auth:signin:${ip}`;
      },
    });
    
    // Return rate limit response if limit exceeded
    if (rateLimit) {
      logger.warn('Rate limit exceeded for sign-in', { 
        context: 'auth:signin:rate-limit',
        additionalData: { 
          headers: Object.fromEntries([...request.headers.entries()].filter(([key]) => !key.includes('cookie')))
        }
      });
      return rateLimit;
    }
  } catch (error) {
    logger.error(error as Error, { 
      context: 'auth:signin:rate-limit-error',
      additionalData: { route: 'api/auth/signin' }
    });
    // Continue without rate limiting if there's an error with the rate limiter
  }
  
  try {
    // Check CSRF token from headers and cookies
    const csrfToken = request.headers.get('x-csrf-token');
    
    // Extract the csrf-token cookie
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(cookie => {
        const [name, value] = cookie.split('=');
        return [name, value];
      })
    );
    
    const storedCsrfToken = cookies['csrf-token'];
    
    if (!csrfToken || csrfToken !== storedCsrfToken) {
      logger.warn('Invalid CSRF token', { 
        context: 'auth:signin:csrf',
        additionalData: { 
          hasToken: !!csrfToken,
          hasStoredToken: !!storedCsrfToken
        }
      });
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }
    
    // Parse and validate input
    const body = await request.json();
    const validationResult = loginSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors[0].message;
      logger.info('Validation error during signin', { 
        context: 'auth:signin:validation',
        additionalData: { error: errorMessage }
      });
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }
    
    const { email, password } = validationResult.data;
    
    // Sign in the user with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      logger.warn('Supabase auth error', { 
        context: 'auth:signin:supabase',
        additionalData: { 
          error: error.message,
          email: email.replace(/(?<=.).(?=.*@)/g, '*'), // Mask email for privacy
        }
      });
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    // Create response with auth token set in cookies
    const response = NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
      }
    });

    // Set auth cookies
    if (data.session) {
      // Set HTTPOnly cookies for authentication
      response.cookies.set('supabase-auth-token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
        sameSite: 'lax',
      });
      
      response.cookies.set('supabase-refresh-token', data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
        sameSite: 'lax',
      });
    }
    
    logger.info('Successful sign-in', { 
      context: 'auth:signin:success',
      additionalData: { 
        userId: data.user.id,
        email: data.user.email ? data.user.email.replace(/(?<=.).(?=.*@)/g, '*') : 'unknown', // Mask email for privacy
      }
    });
    
    return response;
  } catch (error) {
    logger.error(error as Error, { 
      context: 'auth:signin:unexpected',
      additionalData: { 
        route: 'api/auth/signin',
        requestInfo: {
          url: request.url,
          method: request.method,
          headers: Object.fromEntries([...request.headers.entries()]
            .filter(([key]) => !['cookie', 'authorization'].includes(key.toLowerCase())))
        }
      }
    });
    return NextResponse.json(
      { error: 'An unexpected error occurred during sign in' },
      { status: 500 }
    );
  }
} 