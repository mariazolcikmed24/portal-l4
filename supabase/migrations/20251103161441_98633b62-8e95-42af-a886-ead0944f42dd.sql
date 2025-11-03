-- Tabela audit logs do śledzenia dostępu do danych
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL, -- 'SELECT', 'INSERT', 'UPDATE', 'DELETE'
  table_name text NOT NULL,
  record_id uuid,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Index dla szybszego wyszukiwania
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX idx_audit_logs_table_record ON public.audit_logs(table_name, record_id);

-- RLS: użytkownicy widzą tylko swoje logi, admini wszystko
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit logs"
ON public.audit_logs
FOR SELECT
USING (auth.uid() = user_id);

-- Funkcja do usuwania wszystkich danych użytkownika (GDPR)
CREATE OR REPLACE FUNCTION public.delete_user_data(target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count jsonb;
BEGIN
  -- Sprawdź, czy wywołujący może usunąć te dane (tylko własne)
  IF auth.uid() != target_user_id THEN
    RAISE EXCEPTION 'Unauthorized: You can only delete your own data';
  END IF;

  -- Zbierz statystyki
  deleted_count := jsonb_build_object(
    'cases', (SELECT COUNT(*) FROM cases WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = target_user_id)),
    'profiles', (SELECT COUNT(*) FROM profiles WHERE user_id = target_user_id),
    'audit_logs', (SELECT COUNT(*) FROM audit_logs WHERE user_id = target_user_id)
  );

  -- Usuń wszystkie powiązane dane (CASCADE usuwa cases automatycznie)
  DELETE FROM public.profiles WHERE user_id = target_user_id;
  DELETE FROM public.audit_logs WHERE user_id = target_user_id;
  
  -- Usuń konto użytkownika z auth.users
  DELETE FROM auth.users WHERE id = target_user_id;

  RETURN deleted_count;
END;
$$;

-- Funkcja pomocnicza do logowania dostępu (wywoływana z Edge Functions)
CREATE OR REPLACE FUNCTION public.log_data_access(
  p_user_id uuid,
  p_action text,
  p_table_name text,
  p_record_id uuid DEFAULT NULL,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO public.audit_logs (user_id, action, table_name, record_id, ip_address, user_agent)
  VALUES (p_user_id, p_action, p_table_name, p_record_id, p_ip_address, p_user_agent)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;