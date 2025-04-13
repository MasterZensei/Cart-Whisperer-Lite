-- First, create the necessary tables (if they don't exist)
-- Users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  store_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Store settings table
CREATE TABLE IF NOT EXISTS public.store_settings (
  id UUID PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES auth.users(id),
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
  store_id UUID NOT NULL REFERENCES auth.users(id),
  recovered BOOLEAN DEFAULT FALSE
);

-- Email events table
CREATE TABLE IF NOT EXISTS public.email_events (
  id UUID PRIMARY KEY,
  tracking_id UUID NOT NULL,
  cart_id UUID REFERENCES public.carts(id),
  customer_email TEXT NOT NULL,
  store_id UUID NOT NULL REFERENCES auth.users(id),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'bounced')),
  email_template TEXT
);

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

-- Create policies for users table
CREATE POLICY users_policy_select ON public.users
  FOR SELECT USING (auth.uid() = id OR auth.uid() = store_id);

CREATE POLICY users_policy_insert ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY users_policy_update ON public.users
  FOR UPDATE USING (auth.uid() = id OR auth.uid() = store_id)
  WITH CHECK (auth.uid() = id OR auth.uid() = store_id);

-- Create policies for store_settings table
CREATE POLICY store_settings_policy_select ON public.store_settings
  FOR SELECT USING (auth.uid() = store_id);

CREATE POLICY store_settings_policy_insert ON public.store_settings
  FOR INSERT WITH CHECK (auth.uid() = store_id);

CREATE POLICY store_settings_policy_update ON public.store_settings
  FOR UPDATE USING (auth.uid() = store_id)
  WITH CHECK (auth.uid() = store_id);

-- Create policies for carts table
CREATE POLICY carts_policy_select ON public.carts
  FOR SELECT USING (auth.uid() = store_id);

CREATE POLICY carts_policy_insert ON public.carts
  FOR INSERT WITH CHECK (auth.uid() = store_id);

CREATE POLICY carts_policy_update ON public.carts
  FOR UPDATE USING (auth.uid() = store_id)
  WITH CHECK (auth.uid() = store_id);

CREATE POLICY carts_policy_delete ON public.carts
  FOR DELETE USING (auth.uid() = store_id);

-- Create policies for email_events table
CREATE POLICY email_events_policy_select ON public.email_events
  FOR SELECT USING (auth.uid() = store_id);

CREATE POLICY email_events_policy_insert ON public.email_events
  FOR INSERT WITH CHECK (auth.uid() = store_id);

CREATE POLICY email_events_policy_update ON public.email_events
  FOR UPDATE USING (auth.uid() = store_id)
  WITH CHECK (auth.uid() = store_id);

-- Grant usage and select privileges to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated; 