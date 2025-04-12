import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Check if Supabase environment variables are set
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Test connection to Supabase
    const { data, error } = await supabase.from('users').select('*').limit(1);

    return NextResponse.json({
      environment: {
        supabaseUrlDefined: !!supabaseUrl,
        supabaseKeyDefined: !!supabaseKey,
      },
      connection: {
        success: !error,
        error: error ? error.message : null,
        data: data ? 'Data retrieved successfully' : 'No data',
      }
    });
  } catch (error) {
    console.error('Supabase test error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during Supabase test' },
      { status: 500 }
    );
  }
} 