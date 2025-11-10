import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

interface UpdateStatusRequest {
  status: string;
  payment_status?: string;
  med24_visit_id?: string;
  med24_visit_status?: any;
  med24_service_id?: string;
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

    // Get case_id from URL
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const caseId = pathParts[pathParts.length - 2]; // Before '/status'

    if (!caseId) {
      return new Response(
        JSON.stringify({ error: 'Missing case_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: UpdateStatusRequest = await req.json();

    if (!body.status) {
      return new Response(
        JSON.stringify({ error: 'Missing status' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare update data
    const updateData: any = {
      status: body.status,
      med24_last_sync_at: new Date().toISOString()
    };

    if (body.payment_status) updateData.payment_status = body.payment_status;
    if (body.med24_visit_id) updateData.med24_visit_id = body.med24_visit_id;
    if (body.med24_visit_status) updateData.med24_visit_status = body.med24_visit_status;
    if (body.med24_service_id) updateData.med24_service_id = body.med24_service_id;

    // Update case
    const { data: caseData, error: caseError } = await supabaseAdmin
      .from('cases')
      .update(updateData)
      .eq('id', caseId)
      .select()
      .single();

    if (caseError) {
      console.error('Case update error:', caseError);
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
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in api-cases-update-status:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});