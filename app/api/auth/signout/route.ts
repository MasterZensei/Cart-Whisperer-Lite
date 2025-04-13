import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Create response and clear cookies
    const response = NextResponse.json({ success: true });
    
    // Clear auth cookies
    response.cookies.set('supabase-auth-token', '', {
      expires: new Date(0),
      path: '/',
    });
    
    response.cookies.set('supabase-refresh-token', '', {
      expires: new Date(0),
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Sign out error:', error);
    return NextResponse.json(
      { error: 'Failed to sign out' },
      { status: 500 }
    );
  }
} 