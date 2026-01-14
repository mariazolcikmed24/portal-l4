-- Fix guest case creation blocked by profiles RLS
-- Create security definer helper to validate profile ownership/guest status without relying on profiles RLS
CREATE OR REPLACE FUNCTION public.can_use_profile_for_case(p_profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = p_profile_id
      AND (
        (p.user_id IS NOT NULL AND auth.uid() IS NOT NULL AND p.user_id = auth.uid())
        OR
        (p.user_id IS NULL AND p.is_guest = true)
      )
  );
$$;

-- Replace cases INSERT policy to use the helper (avoids profiles RLS preventing the EXISTS)
DROP POLICY IF EXISTS "Users can insert own cases" ON public.cases;
CREATE POLICY "Users can insert own cases"
ON public.cases
FOR INSERT
WITH CHECK (public.can_use_profile_for_case(profile_id));

-- (Optional) keep existing SELECT/UPDATE policies as-is; they are auth-only by design.
