-- Fix RLS policies for profiles table to prevent public exposure
-- Guest profiles should only be accessible via service role (edge functions)

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create new secure policies
-- SELECT: Only authenticated users can view their OWN profile (no guest access from client)
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- UPDATE: Only authenticated users can update their OWN profile
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- INSERT: Allow authenticated users to insert their own profile, 
-- OR allow service role to insert guest profiles (handled by edge functions)
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
);

-- Note: Guest profiles (is_guest = true, user_id = NULL) can only be created/accessed 
-- via service_role key in edge functions, which bypasses RLS