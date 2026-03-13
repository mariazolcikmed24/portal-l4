import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { case_number } = await req.json();

    if (!case_number || typeof case_number !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Brak numeru transakcji' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const trimmed = case_number.trim().toUpperCase();

    // Accept both formats: payment_psp_ref (e.g. ACK6KMWAS9) or legacy case_number (EZ-XXXXXXXXX)
    const isLegacyCaseNumber = /^EZ-[A-Z0-9]{9}$/.test(trimmed);
    const isPspRef = /^[A-Z0-9]{6,20}$/.test(trimmed);

    if (!isLegacyCaseNumber && !isPspRef) {
      return new Response(
        JSON.stringify({ error: 'Nieprawidłowy format numeru transakcji' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Search by payment_psp_ref first, fallback to case_number for legacy
    const searchColumn = isLegacyCaseNumber ? 'case_number' : 'payment_psp_ref';

    const { data: caseData, error: caseError } = await supabaseAdmin
      .from('cases')
      .select(`
        id,
        case_number,
        payment_psp_ref,
        status,
        payment_status,
        illness_start,
        illness_end,
        created_at,
        updated_at,
        med24_visit_id,
        med24_visit_status
      `)
      .eq(searchColumn, trimmed)
      .maybeSingle();

    if (caseError) {
      console.error('Database error:', caseError);
      return new Response(
        JSON.stringify({ error: 'Błąd wyszukiwania' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!caseData) {
      return new Response(
        JSON.stringify({ error: 'Nie znaleziono wizyty o podanym numerze' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        case: caseData
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-case-status:', error);
    return new Response(
      JSON.stringify({ error: 'Wystąpił nieoczekiwany błąd' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
