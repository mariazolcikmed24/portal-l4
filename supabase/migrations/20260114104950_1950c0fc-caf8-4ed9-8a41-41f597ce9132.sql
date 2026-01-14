-- Add RLS policy to allow guest profile creation
-- Guests can create profiles where user_id IS NULL and is_guest = true
CREATE POLICY "Guests can insert guest profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  user_id IS NULL 
  AND is_guest = true
);