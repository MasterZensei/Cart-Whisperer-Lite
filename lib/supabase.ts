import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Log environment variables status
console.log('Supabase URL defined:', !!supabaseUrl);
console.log('Supabase Key defined:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Check your .env file.');
  
  // In development, provide clear guidance on what's missing
  if (process.env.NODE_ENV === 'development') {
    console.error(`
    ----------------------------------------
    SUPABASE CONFIGURATION ERROR
    ----------------------------------------
    Please make sure your .env file contains:
    
    NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
    
    You can copy these from .env.example
    ----------------------------------------
    `);
  }
}

// Create Supabase client with fallback empty strings to prevent runtime errors
// But the client won't work properly without real credentials
export const supabase = createClient(
  supabaseUrl || '',
  supabaseKey || ''
);

// Set up auth state from localStorage if running in browser
if (typeof window !== 'undefined') {
  try {
    const storedSession = localStorage.getItem('session');
    if (storedSession) {
      const parsedSession = JSON.parse(storedSession);
      if (parsedSession.access_token) {
        // Initialize the supabase client with the stored access token
        console.log('Setting stored auth session from localStorage');
        supabase.auth.setSession({
          access_token: parsedSession.access_token,
          refresh_token: parsedSession.refresh_token || '',
        });
      }
    }
  } catch (error) {
    console.error('Error setting stored auth session:', error);
  }
}

// Helper function to check if Supabase is properly configured
export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    return { 
      success: !error,
      error: error?.message || null
    };
  } catch (err) {
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error checking Supabase connection'
    };
  }
}

// Types for our database tables
export type Cart = {
  id: string;
  customer_email: string;
  customer_name?: string;
  items: CartItem[];
  total_price: number;
  created_at: string;
  updated_at: string;
  recovery_url: string;
  store_id: string;
  recovered: boolean;
};

export type CartItem = {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
};

export type EmailEvent = {
  id: string;
  tracking_id: string;
  cart_id: string;
  customer_email: string;
  store_id: string;
  sent_at: string;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced';
  email_template?: string;
};

export type StoreSettings = {
  id: string;
  store_id: string;
  store_name: string;
  email_templates: EmailTemplate[];
  created_at: string;
  updated_at: string;
};

export type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  is_default: boolean;
};

export type User = {
  id: string;
  email: string;
  store_id: string;
  role: 'admin' | 'staff';
  created_at: string;
}; 