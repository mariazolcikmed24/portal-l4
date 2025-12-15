import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UploadFilesRequest {
  case_id: string;
  visit_id: string;
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
    const { case_id, visit_id }: UploadFilesRequest = await req.json();

    if (!case_id || !visit_id) {
      return new Response(
        JSON.stringify({ error: 'case_id and visit_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Uploading files for case ${case_id} to Med24 visit ${visit_id}`);

    // Fetch case to get file references
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .select('attachment_file_ids, pregnancy_card_file_id, long_leave_docs_file_id')
      .eq('id', case_id)
      .single();

    if (caseError || !caseData) {
      console.error('Case not found:', caseError);
      return new Response(
        JSON.stringify({ error: 'Case not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Collect all file paths to upload
    const filePaths: string[] = [];
    
    // Add attachment files
    if (caseData.attachment_file_ids && caseData.attachment_file_ids.length > 0) {
      filePaths.push(...caseData.attachment_file_ids);
    }
    
    // Add pregnancy card if exists
    if (caseData.pregnancy_card_file_id) {
      filePaths.push(caseData.pregnancy_card_file_id);
    }
    
    // Add long leave docs if exists
    if (caseData.long_leave_docs_file_id) {
      filePaths.push(caseData.long_leave_docs_file_id);
    }

    if (filePaths.length === 0) {
      console.log('No files to upload for this case');
      return new Response(
        JSON.stringify({ success: true, uploaded: 0, message: 'No files to upload' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${filePaths.length} files to upload:`, filePaths);

    // Create Basic Auth header for Med24
    const basicAuth = btoa(`${med24Username}:${med24Password}`);
    const uploadResults: { path: string; success: boolean; med24FileId?: string; error?: string }[] = [];

    // Upload each file to Med24
    for (const filePath of filePaths) {
      try {
        console.log(`Downloading file from storage: ${filePath}`);
        
        // Download file from Supabase Storage
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('case-attachments')
          .download(filePath);

        if (downloadError || !fileData) {
          console.error(`Failed to download file ${filePath}:`, downloadError);
          uploadResults.push({ path: filePath, success: false, error: downloadError?.message || 'Download failed' });
          continue;
        }

        // Get file name from path
        const fileName = filePath.split('/').pop() || 'attachment';
        
        // Determine MIME type from file extension
        const extension = fileName.split('.').pop()?.toLowerCase();
        let mimeType = 'application/octet-stream';
        if (extension === 'pdf') mimeType = 'application/pdf';
        else if (extension === 'jpg' || extension === 'jpeg') mimeType = 'image/jpeg';
        else if (extension === 'png') mimeType = 'image/png';
        
        // Create a new Blob with explicit MIME type
        const typedBlob = new Blob([await fileData.arrayBuffer()], { type: mimeType });
        
        // Create FormData for Med24 upload
        const formData = new FormData();
        formData.append('file', typedBlob, fileName);

        console.log(`Uploading file ${fileName} (${mimeType}, ${typedBlob.size} bytes) to Med24 visit ${visit_id}`);

        // Upload to Med24
        const med24Response = await fetch(`${med24ApiUrl}/api/v2/external/visit/${visit_id}/files`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${basicAuth}`,
          },
          body: formData,
        });

        const responseText = await med24Response.text();
        console.log(`Med24 upload response for ${fileName}:`, med24Response.status, responseText);

        if (med24Response.ok) {
          let med24FileId;
          try {
            const responseData = JSON.parse(responseText);
            med24FileId = responseData.id;
          } catch {
            // Response might not be JSON
          }
          uploadResults.push({ path: filePath, success: true, med24FileId });
          console.log(`Successfully uploaded ${fileName} to Med24`);
        } else {
          uploadResults.push({ path: filePath, success: false, error: `Med24 error: ${med24Response.status} - ${responseText}` });
          console.error(`Failed to upload ${fileName} to Med24:`, responseText);
        }
      } catch (fileError) {
        console.error(`Error processing file ${filePath}:`, fileError);
        uploadResults.push({ path: filePath, success: false, error: String(fileError) });
      }
    }

    const successCount = uploadResults.filter(r => r.success).length;
    console.log(`Upload complete: ${successCount}/${filePaths.length} files uploaded successfully`);

    return new Response(
      JSON.stringify({ 
        success: successCount > 0,
        uploaded: successCount,
        total: filePaths.length,
        results: uploadResults
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
