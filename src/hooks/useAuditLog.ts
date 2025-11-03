import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AuditAction = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';

interface LogAccessParams {
  action: AuditAction;
  tableName: string;
  recordId?: string;
}

export const useAuditLog = () => {
  const { user } = useAuth();

  const logAccess = useCallback(
    async ({ action, tableName, recordId }: LogAccessParams) => {
      if (!user) return;

      try {
        // Pobierz IP użytkownika (przybliżone - można używać zewnętrznej usługi)
        const ipResponse = await fetch('https://api.ipify.org?format=json').catch(() => null);
        const ipData = ipResponse ? await ipResponse.json() : null;
        const ipAddress = ipData?.ip || 'unknown';

        const userAgent = navigator.userAgent;

        // Wywołaj funkcję bazodanową do logowania
        const { error } = await supabase.rpc('log_data_access', {
          p_user_id: user.id,
          p_action: action,
          p_table_name: tableName,
          p_record_id: recordId || null,
          p_ip_address: ipAddress,
          p_user_agent: userAgent,
        });

        if (error) {
          console.error('Failed to log access:', error);
        }
      } catch (error) {
        console.error('Error logging access:', error);
      }
    },
    [user]
  );

  return { logAccess };
};
