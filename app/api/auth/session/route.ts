import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    // Extract the auth cookie directly from the request
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(cookie => {
        const [name, value] = cookie.split('=');
        return [name, value];
      })
    );
    
    const authToken = cookies['supabase-auth-token'];
    
    if (!authToken) {
      return NextResponse.json({ user: null });
    }
    
    // Verify the token with Supabase
    const { data, error } = await supabase.auth.getUser(authToken);
    
    if (error || !data.user) {
      // Return null user for invalid token
      return NextResponse.json({ user: null });
    }
    
    // Return the user data
    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { error: 'Failed to check session', user: null },
      { status: 500 }
    );
  }
} 