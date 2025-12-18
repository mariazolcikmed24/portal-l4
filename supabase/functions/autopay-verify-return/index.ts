import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Verify Autopay return redirect hash and fetch case data
// Per docs: Hash = SHA256(ServiceID|OrderID|HashKey)

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const { ServiceID, OrderID, Hash } = await req.json();

    console.log("Verifying Autopay return:", { ServiceID, OrderID });

    if (!ServiceID || !OrderID || !Hash) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters", valid: false }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const hashKey = Deno.env.get("AUTOPAY_HASH_KEY");
    const expectedServiceId = Deno.env.get("AUTOPAY_SERVICE_ID");

    if (!hashKey || !expectedServiceId) {
      console.error("Autopay configuration missing");
      return new Response(
        JSON.stringify({ error: "Configuration error", valid: false }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify ServiceID matches
    if (ServiceID !== expectedServiceId) {
      console.error("ServiceID mismatch", { received: ServiceID, expected: expectedServiceId });
      return new Response(
        JSON.stringify({ error: "Invalid ServiceID", valid: false }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify hash: SHA256(ServiceID|OrderID|HashKey)
    const hashString = `${ServiceID}|${OrderID}|${hashKey}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(hashString);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const calculatedHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    if (calculatedHash.toLowerCase() !== Hash.toLowerCase()) {
      console.error("Hash verification failed", { 
        received: Hash, 
        calculated: calculatedHash,
        input: hashString.replace(hashKey, "***")
      });
      return new Response(
        JSON.stringify({ error: "Invalid hash", valid: false }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Hash verified successfully");

    // Fetch case data by OrderID (we use case_number as OrderID)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: caseData, error: caseError } = await supabase
      .from("cases")
      .select("case_number, payment_status, status")
      .eq("case_number", OrderID)
      .single();

    if (caseError || !caseData) {
      console.error("Case not found:", caseError);
      return new Response(
        JSON.stringify({ error: "Case not found", valid: false }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Case found:", caseData);

    return new Response(
      JSON.stringify({
        valid: true,
        case_number: caseData.case_number,
        payment_status: caseData.payment_status,
        case_status: caseData.status,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Verification error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", valid: false }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
