import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeleteAccountRequest {
  confirmEmail: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get token from header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('Auth error:', authError);
      throw new Error('Unauthorized');
    }

    const { confirmEmail }: DeleteAccountRequest = await req.json();

    // Check if email matches (additional security)
    if (confirmEmail !== user.email) {
      throw new Error('Email confirmation does not match');
    }

    console.log(`Deleting account for user: ${user.id}, email: ${user.email}`);

    // Call database function to delete data
    const { data: deletedData, error: deleteError } = await supabase.rpc(
      'delete_user_data',
      { target_user_id: user.id }
    );

    if (deleteError) {
      console.error('Delete error:', deleteError);
      throw new Error(`Failed to delete user data: ${deleteError.message}`);
    }

    console.log('Successfully deleted user data:', deletedData);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Account and all associated data have been deleted',
        deleted: deletedData,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in delete-user-account function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
