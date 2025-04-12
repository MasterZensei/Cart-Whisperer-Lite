import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Log environment variables status
console.log('Supabase URL defined:', !!supabaseUrl);
console.log('Supabase Key defined:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Check your .env file.');
}

// Create Supabase client
export const supabase = createClient(
  supabaseUrl || '',
  supabaseKey || ''
);

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