-- First, create the necessary tables (if they don't exist)
-- Users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  store_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Store settings table
CREATE TABLE IF NOT EXISTS public.store_settings (
  id UUID PRIMARY KEY,
  store_id TEXT NOT NULL,
  store_name TEXT NOT NULL,
  email_templates JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Carts table
CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  items JSONB NOT NULL,
  total_price NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  recovery_url TEXT,
  store_id TEXT NOT NULL,
  recovered BOOLEAN DEFAULT FALSE
);

-- Email events table
CREATE TABLE IF NOT EXISTS public.email_events (
  id UUID PRIMARY KEY,
  tracking_id UUID NOT NULL,
  cart_id UUID REFERENCES public.carts(id),
  customer_email TEXT NOT NULL,
  store_id TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'bounced')),
  email_template TEXT
);

-- Create the ai_settings table to store user AI preferences
CREATE TABLE IF NOT EXISTS ai_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model TEXT NOT NULL DEFAULT 'gpt-3.5-turbo',
  temperature FLOAT NOT NULL DEFAULT 0.7,
  max_tokens INTEGER NOT NULL DEFAULT 1000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create the api_keys table to store user API keys
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service TEXT NOT NULL, -- 'openai', 'resend', etc.
  api_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, service)
);

-- Add RLS policies for ai_settings
ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own AI settings"
  ON ai_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI settings"
  ON ai_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI settings"
  ON ai_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Add RLS policies for api_keys
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own API keys"
  ON api_keys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own API keys"
  ON api_keys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys"
  ON api_keys FOR UPDATE
  USING (auth.uid() = user_id);

-- Add ai_prompt_templates table for customizable AI prompts
CREATE TABLE IF NOT EXISTS ai_prompt_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  system_prompt TEXT NOT NULL,
  user_prompt TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for ai_prompt_templates
ALTER TABLE ai_prompt_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own AI prompt templates"
  ON ai_prompt_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI prompt templates"
  ON ai_prompt_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI prompt templates"
  ON ai_prompt_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI prompt templates"
  ON ai_prompt_templates FOR DELETE
  USING (auth.uid() = user_id);

-- Create default AI prompt templates
INSERT INTO ai_prompt_templates (user_id, name, description, system_prompt, user_prompt, is_default) VALUES
  -- Use a placeholder user_id that will be replaced with the actual admin user id
  ('00000000-0000-0000-0000-000000000000', 
   'Standard Recovery Email', 
   'Default prompt for generating abandoned cart recovery emails',
   'You are an expert email marketer specializing in abandoned cart recovery with a proven track record of high conversion rates. 
   
   Create a personalized, compelling email to encourage the customer to complete their purchase. The email should be:
   
   1. Personalized to the customer and their specific cart items
   2. Concise and focused on conversion
   3. Including a sense of urgency without being pushy
   4. Highlighting the benefits of the products they''ve selected
   5. Formatted as clean, responsive HTML with inline CSS
   6. Including a prominent, compelling call-to-action button
   
   Return your response as HTML that can be directly used in an email. Include a subject line at the beginning of your response prefixed with ''SUBJECT: ''.
   
   The subject line should be attention-grabbing and personalized.',
   'Generate a recovery email for a customer with these details:
   
   CUSTOMER INFORMATION:
   - Name: {{customerName}}
   - Email: {{customerEmail}}
   
   CART DETAILS:
   - Total Items: {{totalItems}}
   - Total Value: {{cartTotal}}
   - Items in Cart:
   {{itemsList}}
   
   STORE INFORMATION:
   - Store Name: {{storeName}}
   - Recovery URL: {{recoveryUrl}}
   
   ADDITIONAL CONTEXT:
   - Make the email mobile-friendly
   - Include a prominent "Complete Your Purchase" button linking to the recovery URL
   - Keep the tone friendly and helpful, not pushy
   - Suggest that their items might sell out soon if appropriate
   - Include a small section addressing potential concerns (like shipping, returns, etc.)',
   TRUE);

-- Drop all existing policies first
DROP POLICY IF EXISTS users_policy_select ON public.users;
DROP POLICY IF EXISTS users_policy_insert ON public.users;
DROP POLICY IF EXISTS users_policy_update ON public.users;

DROP POLICY IF EXISTS store_settings_policy_select ON public.store_settings;
DROP POLICY IF EXISTS store_settings_policy_insert ON public.store_settings;
DROP POLICY IF EXISTS store_settings_policy_update ON public.store_settings;

DROP POLICY IF EXISTS carts_policy_select ON public.carts;
DROP POLICY IF EXISTS carts_policy_insert ON public.carts;
DROP POLICY IF EXISTS carts_policy_update ON public.carts;
DROP POLICY IF EXISTS carts_policy_delete ON public.carts;

DROP POLICY IF EXISTS email_events_policy_select ON public.email_events;
DROP POLICY IF EXISTS email_events_policy_insert ON public.email_events;
DROP POLICY IF EXISTS email_events_policy_update ON public.email_events;

-- Also drop policies by commonly used names
DROP POLICY IF EXISTS "Store owners can view their own carts" ON carts;
DROP POLICY IF EXISTS "Store owners can insert carts" ON carts;
DROP POLICY IF EXISTS "Store owners can update their own carts" ON carts;
DROP POLICY IF EXISTS "Store owners can delete their own carts" ON carts;

DROP POLICY IF EXISTS "Store owners can view their own email events" ON email_events;
DROP POLICY IF EXISTS "Store owners can insert email events" ON email_events;
DROP POLICY IF EXISTS "Store owners can update their own email events" ON email_events;

DROP POLICY IF EXISTS "Store owners can view their own store settings" ON store_settings;
DROP POLICY IF EXISTS "Store owners can update their own store settings" ON store_settings;
DROP POLICY IF EXISTS "Store owners can insert store settings" ON store_settings;

DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Admins can view all users in their store" ON users;
DROP POLICY IF EXISTS "Admins can insert users in their store" ON users;
DROP POLICY IF EXISTS "Users can view their own account" ON users;
DROP POLICY IF EXISTS "Users can update their own account" ON users;

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;

-- Create policies for users table with explicit type casting
CREATE POLICY users_policy_select ON public.users
  FOR SELECT USING (auth.uid()::text = store_id OR auth.uid() = id);

CREATE POLICY users_policy_insert ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY users_policy_update ON public.users
  FOR UPDATE USING (auth.uid()::text = store_id OR auth.uid() = id)
  WITH CHECK (auth.uid()::text = store_id OR auth.uid() = id);

-- Create policies for store_settings table with explicit type casting
CREATE POLICY store_settings_policy_select ON public.store_settings
  FOR SELECT USING (auth.uid()::text = store_id);

CREATE POLICY store_settings_policy_insert ON public.store_settings
  FOR INSERT WITH CHECK (auth.uid()::text = store_id);

CREATE POLICY store_settings_policy_update ON public.store_settings
  FOR UPDATE USING (auth.uid()::text = store_id)
  WITH CHECK (auth.uid()::text = store_id);

-- Create policies for carts table with explicit type casting
CREATE POLICY carts_policy_select ON public.carts
  FOR SELECT USING (auth.uid()::text = store_id);

CREATE POLICY carts_policy_insert ON public.carts
  FOR INSERT WITH CHECK (auth.uid()::text = store_id);

CREATE POLICY carts_policy_update ON public.carts
  FOR UPDATE USING (auth.uid()::text = store_id)
  WITH CHECK (auth.uid()::text = store_id);

CREATE POLICY carts_policy_delete ON public.carts
  FOR DELETE USING (auth.uid()::text = store_id);

-- Create policies for email_events table with explicit type casting
CREATE POLICY email_events_policy_select ON public.email_events
  FOR SELECT USING (auth.uid()::text = store_id);

CREATE POLICY email_events_policy_insert ON public.email_events
  FOR INSERT WITH CHECK (auth.uid()::text = store_id);

CREATE POLICY email_events_policy_update ON public.email_events
  FOR UPDATE USING (auth.uid()::text = store_id)
  WITH CHECK (auth.uid()::text = store_id);

-- Grant usage and select privileges to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated; 