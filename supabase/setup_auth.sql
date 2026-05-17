-- ==============================================================================
-- STREAMBIBLE DUAL: Secure Authentication & Profiles Setup
-- Adheres to OWASP Top 10 (A01: Broken Access Control, A03: Injection)
-- ==============================================================================

-- 1. Create the Profiles table to securely store claimed room IDs
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  claimed_room_id VARCHAR(8) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enforce Row Level Security (RLS) - OWASP A01: Broken Access Control
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Policy: Users can only update their own profile (e.g., to claim an ID)
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- ==============================================================================
-- OWASP A01: Broken Access Control - Prevention
-- We DO NOT allow public SELECT on the profiles table because it contains emails.
-- Instead, we use a secure RPC function that only returns a boolean to check availability.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.check_room_available(room_code VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  is_taken BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE claimed_room_id = room_code) INTO is_taken;
  RETURN NOT is_taken;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create an Auth Trigger to auto-generate a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; -- SECURITY DEFINER ensures the trigger runs with elevated privileges to insert the row

-- Drop the trigger if it exists to avoid errors on re-runs
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Bind the trigger to the auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- Security Note: 
-- Because we rely on Supabase Auth, password hashing, JWT signing, and session 
-- management (OWASP A02, A07) are natively handled and secured by Supabase.
-- ==============================================================================
