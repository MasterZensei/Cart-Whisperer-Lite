import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    console.log('Signin attempt:', { email });

    if (!email || !password) {
      console.log('Signin rejected: Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Log the supabase URL being used
    console.log('Using Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Supabase key defined:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    // Sign in the user with Supabase Auth
    console.log('Attempting Supabase auth...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Supabase auth error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    console.log('Signin successful, user:', data.user.id);
    console.log('Session data present:', !!data.session);
    
    // Check if session data is complete
    if (!data.session || !data.session.access_token) {
      console.error('Warning: Session data incomplete', data.session);
    }
    
    // Provide the complete session data for client-side storage
    const responseData = {
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      session: {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        expires_at: data.session?.expires_at,
        user: data.session?.user,
      },
    };
    
    console.log('Sending response data with complete session');
    
    // Set a direct Supabase cookie to help with session persistence
    const response = NextResponse.json(responseData);
    
    return response;
  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during sign in' },
      { status: 500 }
    );
  }
} 