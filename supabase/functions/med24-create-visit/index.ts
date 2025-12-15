import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Med24BookVisitPatientSchema {
  first_name: string;
  last_name: string;
  pesel?: string | null;
  date_of_birth?: string | null;
  email?: string | null;
  phone_number?: string | null;
  address?: string | null;
  house_number?: string | null;
  flat_number?: string | null;
  postal_code?: string | null;
  city?: string | null;
}

interface Med24BookVisitUrgentSchema {
  channel_kind: "video_call" | "text_message" | "phone_call";
  service_id?: string | null;
  patient: Med24BookVisitPatientSchema;
  external_tag?: string | null;
  booking_intent: "reserve" | "finalize";
  queue: "urgent";
}

interface CreateVisitRequest {
  case_id: string;
  channel_kind?: "video_call" | "text_message" | "phone_call";
  booking_intent?: "reserve" | "finalize";
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const med24ApiUrl = Deno.env.get('MED24_API_URL');
    const med24Username = Deno.env.get('MED24_API_USERNAME');
    const med24Password = Deno.env.get('MED24_API_PASSWORD');
    const med24ServiceId = Deno.env.get('MED24_SERVICE_ID');

    if (!med24ApiUrl || !med24Username || !med24Password) {
      console.error('Missing Med24 API configuration');
      return new Response(
        JSON.stringify({ error: 'Med24 API not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { case_id, channel_kind = "text_message", booking_intent = "finalize" }: CreateVisitRequest = await req.json();

    if (!case_id) {
      return new Response(
        JSON.stringify({ error: 'case_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Creating Med24 visit for case: ${case_id}`);

    // Fetch case with profile data
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('*, profile:profiles(*)')
      .eq('id', case_id)
      .single();

    if (caseError || !caseData) {
      console.error('Case not found:', caseError);
      return new Response(
        JSON.stringify({ error: 'Case not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const profile = caseData.profile;
    if (!profile) {
      console.error('Profile not found for case');
      return new Response(
        JSON.stringify({ error: 'Profile not found for case' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Map profile to Med24 patient schema
    const patient: Med24BookVisitPatientSchema = {
      first_name: profile.first_name,
      last_name: profile.last_name,
      pesel: profile.pesel || null,
      date_of_birth: profile.date_of_birth || null,
      email: profile.email || null,
      phone_number: profile.phone || null,
      address: profile.street || null,
      house_number: profile.house_no || null,
      flat_number: profile.flat_no || null,
      postal_code: profile.postcode || null,
      city: profile.city || null,
    };

    // Create Med24 visit payload
    const visitPayload: Med24BookVisitUrgentSchema = {
      channel_kind,
      service_id: med24ServiceId || null,
      patient,
      booking_intent,
      queue: "urgent",
    };

    console.log('Sending request to Med24 API:', JSON.stringify(visitPayload, null, 2));

    // Create Basic Auth header
    const basicAuth = btoa(`${med24Username}:${med24Password}`);

    // Call Med24 API
    const apiEndpoint = `${med24ApiUrl}/api/v2/external/visit`;
    console.log('Calling Med24 API endpoint:', apiEndpoint);
    
    const med24Response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${basicAuth}`,
      },
      body: JSON.stringify(visitPayload),
    });

    console.log('Med24 API response status:', med24Response.status);
    console.log('Med24 API response headers:', JSON.stringify(Object.fromEntries(med24Response.headers.entries())));
    
    const responseText = await med24Response.text();
    console.log('Med24 API raw response (first 500 chars):', responseText.substring(0, 500));
    
    let med24Data;
    try {
      med24Data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Med24 response as JSON:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Med24 API returned non-JSON response', 
          status: med24Response.status,
          responsePreview: responseText.substring(0, 200)
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!med24Response.ok) {
      console.error('Med24 API error:', med24Data);
      return new Response(
        JSON.stringify({ 
          error: 'Med24 API error', 
          details: med24Data,
          status: med24Response.status 
        }),
        { status: med24Response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update case with Med24 visit data
    const { error: updateError } = await supabase
      .from('cases')
      .update({
        med24_visit_id: med24Data.id,
        med24_visit_status: med24Data,
        med24_external_tag: caseData.case_number || case_id,
        med24_channel_kind: channel_kind,
        med24_booking_intent: booking_intent,
        med24_last_sync_at: new Date().toISOString(),
      })
      .eq('id', case_id);

    if (updateError) {
      console.error('Failed to update case with Med24 data:', updateError);
      // Don't fail the request, just log the error
    }

    console.log(`Successfully created Med24 visit: ${med24Data.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        visit_id: med24Data.id,
        visit_data: med24Data 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
