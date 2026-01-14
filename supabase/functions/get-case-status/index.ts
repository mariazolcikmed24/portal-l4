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

    if (!case_number) {
      return new Response(
        JSON.stringify({ error: 'Numer sprawy jest wymagany' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate case_number format (EZ-XXXXXXXXX)
    const caseNumberPattern = /^EZ-[A-Z0-9]{9}$/i;
    if (!caseNumberPattern.test(case_number.trim())) {
      return new Response(
        JSON.stringify({ error: 'Nieprawidłowy format numeru sprawy' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Query only non-sensitive status information
    const { data: caseData, error: caseError } = await supabase
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

    if (caseError) {
      console.error('Database error:', caseError);
      return new Response(
        JSON.stringify({ error: 'Błąd podczas wyszukiwania sprawy' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!caseData) {
      return new Response(
        JSON.stringify({ error: 'Nie znaleziono sprawy o podanym numerze' }),
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
