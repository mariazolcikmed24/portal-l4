-- Create table for API keys
CREATE TABLE public.api_keys (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key_name text NOT NULL,
  api_key text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  last_used_at timestamp with time zone,
  allowed_endpoints text[] DEFAULT ARRAY[]::text[],
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Only system can manage API keys (no direct user access)
CREATE POLICY "API keys are system managed"
  ON public.api_keys
  FOR ALL
  USING (false);

-- Function to verify API key
CREATE OR REPLACE FUNCTION public.verify_api_key(p_api_key text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if API key exists and is active
  RETURN EXISTS (
    SELECT 1 
    FROM public.api_keys 
    WHERE api_key = p_api_key 
    AND is_active = true
  );
END;
$$;

-- Function to log API key usage
CREATE OR REPLACE FUNCTION public.log_api_key_usage(p_api_key text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.api_keys
  SET last_used_at = now()
  WHERE api_key = p_api_key;
END;
$$;

-- Insert initial API key for Med24
INSERT INTO public.api_keys (key_name, api_key, allowed_endpoints, metadata)
VALUES (
  'Med24 Integration',
  'med24_' || encode(gen_random_bytes(32), 'hex'),
  ARRAY['*'],
  '{"partner": "Med24", "description": "Main integration key for Med24 service"}'::jsonb
);