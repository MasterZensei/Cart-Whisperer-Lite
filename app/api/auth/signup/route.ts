import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    console.log('Simplified signup for:', email);

    // Return immediate success without any database operations
    return NextResponse.json({ 
      success: true,
      message: "Signup bypassed successfully. Please use the login page directly."
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 