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
    const { case_number, case_id } = await req.json();

    if (!case_number && !case_id) {
      return new Response(
        JSON.stringify({ error: 'Numer sprawy lub ID jest wymagany' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let caseData = null;
    let caseError = null;

    if (case_id) {
      // Lookup by case_id (UUID)
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidPattern.test(case_id)) {
        return new Response(
          JSON.stringify({ error: 'Nieprawidłowy format ID sprawy' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const result = await supabase
        .from('cases')
        .select(`
          case_number,
          status,
          payment_status,
          illness_start,
          illness_end,
          created_at,
          updated_at
        `)
        .eq('id', case_id)
        .maybeSingle();
      
      caseData = result.data;
      caseError = result.error;
    } else {
      // Lookup by case_number
      const caseNumberPattern = /^EZ-[A-Z0-9]{9}$/i;
      if (!caseNumberPattern.test(case_number.trim())) {
        return new Response(
          JSON.stringify({ error: 'Nieprawidłowy format numeru sprawy' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const result = await supabase
        .from('cases')
        .select(`
          case_number,
          status,
          payment_status,
          illness_start,
          illness_end,
          created_at,
          updated_at
        `)
        .eq('case_number', case_number.trim().toUpperCase())
        .maybeSingle();
      
      caseData = result.data;
      caseError = result.error;
    }

    if (caseError) {
      console.error('Database error:', caseError);
      return new Response(
        JSON.stringify({ error: 'Błąd podczas wyszukiwania sprawy' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!caseData) {
      return new Response(
        JSON.stringify({ error: 'Nie znaleziono sprawy' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return only safe, non-sensitive status information
    return new Response(
      JSON.stringify({
        success: true,
        case: {
          case_number: caseData.case_number,
          status: caseData.status,
          payment_status: caseData.payment_status,
          illness_start: caseData.illness_start,
          illness_end: caseData.illness_end,
          created_at: caseData.created_at,
          updated_at: caseData.updated_at
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-case-status:', error);
    return new Response(
      JSON.stringify({ error: 'Wystąpił błąd serwera' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
