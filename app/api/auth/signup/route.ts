import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const { email, password, storeName } = await request.json();
    console.log('Signup attempt:', { email, hasStoreName: !!storeName });

    if (!email || !password) {
      console.log('Signup rejected: Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Log the supabase URL being used
    console.log('Using Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Supabase key defined:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    // Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      console.error('Supabase auth signup error:', authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    console.log('Auth signup successful, user:', authData.user?.id);

    // Create a store settings record
    if (authData.user) {
      const storeSettingsId = uuidv4();
      console.log('Creating store settings with ID:', storeSettingsId);
      const { error: storeError } = await supabase
        .from('store_settings')
        .insert({
          id: storeSettingsId,
          store_id: authData.user.id,
          store_name: storeName || 'My Store',
          email_templates: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (storeError) {
        console.error('Error creating store settings:', storeError);
      } else {
        console.log('Store settings created successfully');
      }

      // Create a user record
      console.log('Creating user record');
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: email,
          store_id: authData.user.id,
          role: 'admin',
          created_at: new Date().toISOString(),
        });

      if (userError) {
        console.error('Error creating user record:', userError);
      } else {
        console.log('User record created successfully');
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during signup' },
      { status: 500 }
    );
  }
} 