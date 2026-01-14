-- Remove the dangerous public access policy for cases table
DROP POLICY IF EXISTS "Anyone can view case by number" ON public.cases;

-- Update the existing policies to be more restrictive
-- Only authenticated users can view/update their own cases through their profile
DROP POLICY IF EXISTS "Users can view own cases" ON public.cases;
DROP POLICY IF EXISTS "Users can update own cases" ON public.cases;
DROP POLICY IF EXISTS "Users can insert own cases" ON public.cases;

-- SELECT: Only authenticated users can view cases linked to their profile
CREATE POLICY "Users can view own cases" 
ON public.cases 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = cases.profile_id 
    AND profiles.user_id = auth.uid()
    AND auth.uid() IS NOT NULL
  )
);

-- UPDATE: Only authenticated users can update cases linked to their profile
CREATE POLICY "Users can update own cases" 
ON public.cases 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = cases.profile_id 
    AND profiles.user_id = auth.uid()
    AND auth.uid() IS NOT NULL
  )
);

-- INSERT: Allow authenticated users to insert cases for their profile
-- Guest profiles are handled by service role (edge functions)
CREATE POLICY "Users can insert own cases" 
ON public.cases 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = cases.profile_id 
    AND (
      (profiles.user_id = auth.uid() AND auth.uid() IS NOT NULL)
      OR 
      (profiles.user_id IS NULL AND profiles.is_guest = true)
    )
  )
);