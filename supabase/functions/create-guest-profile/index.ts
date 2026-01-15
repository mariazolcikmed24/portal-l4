import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const profileData = await req.json();

    // Validate required fields
    const requiredFields = ['first_name', 'last_name', 'email', 'pesel', 'phone', 'street', 'house_no', 'postcode', 'city'];
    for (const field of requiredFields) {
      if (!profileData[field]) {
        return new Response(
          JSON.stringify({ error: `Brakujące pole: ${field}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Insert guest profile using service role (bypasses RLS)
    const { data: insertedProfile, error } = await supabaseAdmin
      .from('profiles')
      .insert({
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        email: profileData.email,
        pesel: profileData.pesel,
        date_of_birth: profileData.date_of_birth || null,
        phone: profileData.phone,
        street: profileData.street,
        house_no: profileData.house_no,
        flat_no: profileData.flat_no || null,
        postcode: profileData.postcode,
        city: profileData.city,
        country: profileData.country || 'PL',
        consent_terms: profileData.consent_terms || false,
        consent_employment: profileData.consent_employment || false,
        consent_call: profileData.consent_call || false,
        consent_no_guarantee: profileData.consent_no_guarantee || false,
        consent_truth: profileData.consent_truth || false,
        consent_marketing_email: profileData.consent_marketing_email || false,
        consent_marketing_tel: profileData.consent_marketing_tel || false,
        is_guest: true,
        user_id: null,
      })
      .select('id, first_name, last_name, email, pesel')
      .single();

    if (error) {
      console.error('Error creating guest profile:', error);
      return new Response(
        JSON.stringify({ error: 'Nie udało się utworzyć profilu' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Guest profile created:', insertedProfile.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        profile: insertedProfile 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Wystąpił nieoczekiwany błąd' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
