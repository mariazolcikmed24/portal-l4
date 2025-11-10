import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  pesel: string;
  date_of_birth: string;
  phone: string;
  street: string;
  house_no: string;
  flat_no?: string;
  postcode: string;
  city: string;
  country?: string;
  consent_terms: boolean;
  consent_employment: boolean;
  consent_call: boolean;
  consent_no_guarantee: boolean;
  consent_truth: boolean;
  consent_marketing_email?: boolean;
  consent_marketing_tel?: boolean;
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

    const body: RegisterRequest = await req.json();

    // Validate required fields
    const requiredFields = [
      'email', 'password', 'first_name', 'last_name', 'pesel', 
      'date_of_birth', 'phone', 'street', 'house_no', 'postcode', 'city'
    ];
    
    for (const field of requiredFields) {
      if (!body[field as keyof RegisterRequest]) {
        return new Response(
          JSON.stringify({ error: `Missing required field: ${field}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Create user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: {
        first_name: body.first_name,
        last_name: body.last_name,
        pesel: body.pesel,
        date_of_birth: body.date_of_birth,
        phone: body.phone,
        street: body.street,
        house_no: body.house_no,
        flat_no: body.flat_no,
        postcode: body.postcode,
        city: body.city,
        country: body.country || 'PL',
        consent_terms: body.consent_terms,
        consent_employment: body.consent_employment,
        consent_call: body.consent_call,
        consent_no_guarantee: body.consent_no_guarantee,
        consent_truth: body.consent_truth,
        consent_marketing_email: body.consent_marketing_email || false,
        consent_marketing_tel: body.consent_marketing_tel || false
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        user_id: authData.user.id,
        email: authData.user.email
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in api-auth-register:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});