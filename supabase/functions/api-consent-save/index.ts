import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

interface ConsentRequest {
  profile_id: string;
  consent_marketing_email?: boolean;
  consent_marketing_tel?: boolean;
  consent_ip?: string;
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

    const body: ConsentRequest = await req.json();

    if (!body.profile_id) {
      return new Response(
        JSON.stringify({ error: 'Missing profile_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update consent in profile
    const updateData: any = {
      consent_timestamp: new Date().toISOString()
    };

    if (body.consent_marketing_email !== undefined) {
      updateData.consent_marketing_email = body.consent_marketing_email;
    }
    if (body.consent_marketing_tel !== undefined) {
      updateData.consent_marketing_tel = body.consent_marketing_tel;
    }
    if (body.consent_ip) {
      updateData.consent_ip = body.consent_ip;
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', body.profile_id)
      .select()
      .single();

    if (profileError) {
      console.error('Consent update error:', profileError);
      return new Response(
        JSON.stringify({ error: profileError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        profile: profile
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in api-consent-save:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});