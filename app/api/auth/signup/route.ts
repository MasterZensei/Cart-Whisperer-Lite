import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const { email, password, storeName } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    // Create a store settings record
    if (authData.user) {
      const storeSettingsId = uuidv4();
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
      }

      // Create a user record
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