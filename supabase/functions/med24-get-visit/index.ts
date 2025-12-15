import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const med24ApiUrl = Deno.env.get('MED24_API_URL');
    const med24Username = Deno.env.get('MED24_API_USERNAME');
    const med24Password = Deno.env.get('MED24_API_PASSWORD');

    if (!med24ApiUrl || !med24Username || !med24Password) {
      console.error('Missing Med24 API configuration');
      return new Response(
        JSON.stringify({ error: 'Med24 API not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get visit_id from multiple sources: body, URL path, or query params
    let finalVisitId: string | null = null;
    
    // Try to get from request body (POST)
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        if (body.visit_id) {
          finalVisitId = body.visit_id;
        }
      } catch {
        // Body parsing failed, continue to other methods
      }
    }
    
    // Try URL path
    if (!finalVisitId) {
      const url = new URL(req.url);
      const pathParts = url.pathname.split('/');
      const pathVisitId = pathParts[pathParts.length - 1];
      if (pathVisitId && pathVisitId !== 'med24-get-visit') {
        finalVisitId = pathVisitId;
      }
    }
    
    // Try query params
    if (!finalVisitId) {
      const url = new URL(req.url);
      finalVisitId = url.searchParams.get('visit_id');
    }

    if (!finalVisitId) {
      return new Response(
        JSON.stringify({ error: 'visit_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching Med24 visit: ${finalVisitId}`);

    // Create Basic Auth header
    const basicAuth = btoa(`${med24Username}:${med24Password}`);

    // Call Med24 API
    const med24Response = await fetch(`${med24ApiUrl}/api/v2/external/visit/${finalVisitId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${basicAuth}`,
      },
    });

    const med24Data = await med24Response.json();

    console.log('Med24 API response status:', med24Response.status);
    console.log('Med24 API response:', JSON.stringify(med24Data, null, 2));

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

    // Optionally update case with latest Med24 status
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find case by med24_visit_id and update status
    const { error: updateError } = await supabase
      .from('cases')
      .update({
        med24_visit_status: med24Data,
        med24_last_sync_at: new Date().toISOString(),
      })
      .eq('med24_visit_id', finalVisitId);

    if (updateError) {
      console.log('Could not update case (may not exist):', updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        visit: med24Data 
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
