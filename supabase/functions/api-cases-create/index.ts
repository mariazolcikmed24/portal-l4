import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

interface CreateCaseRequest {
  profile_id: string;
  illness_start: string;
  illness_end: string;
  recipient_type: string;
  main_category: string;
  symptom_duration: string;
  free_text_reason: string;
  symptoms?: string[];
  employers?: any[];
  pregnant?: boolean;
  pregnancy_leave?: boolean;
  care_first_name?: string;
  care_last_name?: string;
  care_pesel?: string;
  has_allergy?: boolean;
  allergy_text?: string;
  has_meds?: boolean;
  meds_list?: string;
  chronic_conditions?: string[];
  chronic_other?: string;
  long_leave?: boolean;
  late_justification?: string;
  med24_channel_kind?: string;
  med24_booking_intent?: string;
  uniformed_service_name?: string;
  uniformed_nip?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify API key
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify API key
    const { data: isValid } = await supabaseAdmin.rpc('verify_api_key', { p_api_key: apiKey });
    if (!isValid) {
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log API key usage
    await supabaseAdmin.rpc('log_api_key_usage', { p_api_key: apiKey });

    const body: CreateCaseRequest = await req.json();

    // Validate required fields
    const requiredFields = ['profile_id', 'illness_start', 'illness_end', 'recipient_type', 'main_category', 'symptom_duration', 'free_text_reason'];
    for (const field of requiredFields) {
      if (!body[field as keyof CreateCaseRequest]) {
        return new Response(
          JSON.stringify({ error: `Missing required field: ${field}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Verify profile exists
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', body.profile_id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create case
    const { data: caseData, error: caseError } = await supabaseAdmin
      .from('cases')
      .insert({
        profile_id: body.profile_id,
        illness_start: body.illness_start,
        illness_end: body.illness_end,
        recipient_type: body.recipient_type,
        main_category: body.main_category,
        symptom_duration: body.symptom_duration,
        free_text_reason: body.free_text_reason,
        symptoms: body.symptoms || [],
        employers: body.employers || [],
        pregnant: body.pregnant || false,
        pregnancy_leave: body.pregnancy_leave || false,
        care_first_name: body.care_first_name,
        care_last_name: body.care_last_name,
        care_pesel: body.care_pesel,
        has_allergy: body.has_allergy || false,
        allergy_text: body.allergy_text,
        has_meds: body.has_meds || false,
        meds_list: body.meds_list,
        chronic_conditions: body.chronic_conditions || [],
        chronic_other: body.chronic_other,
        long_leave: body.long_leave || false,
        late_justification: body.late_justification,
        med24_channel_kind: body.med24_channel_kind || 'text_message',
        med24_booking_intent: body.med24_booking_intent || 'finalize',
        uniformed_service_name: body.uniformed_service_name,
        uniformed_nip: body.uniformed_nip,
        status: 'draft'
      })
      .select()
      .single();

    if (caseError) {
      console.error('Case creation error:', caseError);
      return new Response(
        JSON.stringify({ error: caseError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        case: caseData
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in api-cases-create:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});