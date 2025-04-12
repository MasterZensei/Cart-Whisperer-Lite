import { supabase } from './supabase';

export async function directSignIn(email: string, password: string) {
  try {
    // First check if the credentials are valid
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Direct sign in failed:', error.message);
      return { success: false, error: error.message };
    }

    if (!data.user || !data.session) {
      return { success: false, error: 'Authentication successful but no user or session returned' };
    }

    // After a successful login, attempt to fetch user info from your tables
    // This helps verify RLS policies are working
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError) {
      console.error('User data fetch failed:', userError.message);
      return { 
        success: true, 
        warning: `Auth succeeded but database access failed: ${userError.message}`,
        user: data.user,
        session: data.session
      };
    }

    return { 
      success: true, 
      user: data.user, 
      userData, 
      session: data.session 
    };

  } catch (err) {
    console.error('Unexpected error during direct sign in:', err);
    return { success: false, error: 'Unexpected error during authentication' };
  }
} 