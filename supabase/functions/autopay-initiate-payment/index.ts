import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Autopay payment gateway integration
// Test URL: https://testpay.autopay.eu/payment
// Production URL: https://pay.autopay.eu/payment

interface PaymentRequest {
  case_id: string;
  payment_method?: string;
  amount?: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const { case_id, payment_method, amount = 7900 }: PaymentRequest = await req.json();

    if (!case_id) {
      return new Response(
        JSON.stringify({ error: "case_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Initiating Autopay payment for case:", case_id);

    // Get Autopay configuration
    const serviceId = Deno.env.get("AUTOPAY_SERVICE_ID");
    const hashKey = Deno.env.get("AUTOPAY_HASH_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!serviceId || !hashKey) {
      console.error("Autopay configuration missing");
      return new Response(
        JSON.stringify({ error: "Payment gateway not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update case payment status to pending and (optionally) save payment method
    const updatePayload: Record<string, unknown> = {
      payment_status: "pending",
      updated_at: new Date().toISOString(),
    };
    if (payment_method) updatePayload.payment_method = payment_method;

    const { data: caseData, error: updateError } = await supabase
      .from("cases")
      .update(updatePayload)
      .eq("id", case_id)
      .select("case_number, profile_id, profiles(email)")
      .single();

    if (updateError) {
      console.error("Failed to update case:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update case" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine environment early
    const isTest = Deno.env.get("AUTOPAY_TEST_MODE") !== "false";

    // Map payment method to Autopay gateway ID
    // https://developers.autopay.pl/online/kody-bramek
    // GatewayID=0 means the user picks the method on Autopay's page (paywall)
    // Per user choice: we use GatewayID=0 for "wybór na bramce"
    let gatewayId: string = "0";
    if (payment_method) {
      switch (payment_method) {
        case "blik":
          gatewayId = "509"; // BLIK
          break;
        case "card":
          gatewayId = "1500"; // Visa/Mastercard
          break;
        case "transfer":
          gatewayId = "0"; // Let user choose on gateway
          break;
      }
    }
    // For test environment without specific payment_method, still use "0" for paywall

    // Prepare payment parameters
    // Amount in PLN format (e.g., "79.00") - Autopay expects decimal format with dot separator
    const amountStr = (amount / 100).toFixed(2);
    const currency = "PLN";

    // IMPORTANT: Autopay OrderID max length is 32 chars.
    // UUID without dashes = 32 chars exactly, so we use case_id without dashes.
    const orderId = case_id.replace(/-/g, "");

    // Guard for TypeScript narrowing
    if (!caseData) {
      console.error("Case data missing after update", { case_id });
      return new Response(
        JSON.stringify({ error: "Case data missing" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Optional fields: Description, CustomerEmail, GatewayID.
    // Autopay hash validation depends on merchant configuration.
    // Docs: SHA256(ServiceID|OrderID|Amount|Description|GatewayID|Currency|CustomerEmail|HashKey)

    const description = "E-konsultacja lekarska";
    const profilesJoin: any = (caseData as any).profiles;
    const customerEmail = Array.isArray(profilesJoin)
      ? (profilesJoin[0]?.email ?? "")
      : (profilesJoin?.email ?? "");

    // NOTE: Some Autopay setups validate hash on URL-encoded values (spaces as '+', special chars percent-encoded).
    // We support both modes to eliminate INVALID_HASH.
    const hashMode = (Deno.env.get("AUTOPAY_HASH_MODE") || "raw").toLowerCase();

    const encodeQueryValue = (val: string) =>
      encodeURIComponent(val).replace(/%20/g, "+");

    const rawHashString = `${serviceId}|${orderId}|${amountStr}|${description}|${gatewayId}|${currency}|${customerEmail}|${hashKey}`;
    const encodedHashString = `${serviceId}|${orderId}|${amountStr}|${encodeQueryValue(description)}|${gatewayId}|${currency}|${encodeQueryValue(customerEmail)}|${hashKey}`;

    const hashString = hashMode === "urlencoded" ? encodedHashString : rawHashString;

    console.log("Hash mode:", hashMode);
    console.log(
      "Hash input string (masked):",
      hashString.replace(hashKey, "***")
    );
    console.log(
      "Alt hash (masked):",
      (hashMode === "urlencoded" ? rawHashString : encodedHashString).replace(hashKey, "***")
    );

    const encoder = new TextEncoder();
    const data = encoder.encode(hashString);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    
    // Autopay docs examples use lowercase hex
    const hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    console.log("Generated hash:", hash);

    // Build Autopay payment URL
    // Test: https://testpay.autopay.eu/payment
    // Production: https://pay.autopay.eu/payment
    const baseUrl = isTest ? "https://testpay.autopay.eu/payment" : "https://pay.autopay.eu/payment";

    // Return URL after payment - Autopay will redirect here with ServiceID, OrderID, Hash
    // Must match URL registered in Autopay panel
    const returnUrl = Deno.env.get("AUTOPAY_RETURN_URL") || "https://preview--portal-l4.lovable.app/potwierdzenie";

    const params = new URLSearchParams({
      ServiceID: serviceId,
      OrderID: orderId,
      Amount: amountStr,
      Currency: currency,
      Description: description,
      CustomerEmail: customerEmail,
      GatewayID: String(gatewayId),
      Hash: hash,
      ReturnURL: returnUrl,
    });
    
    console.log("Payment params:", Object.fromEntries(params.entries()));

    const paymentUrl = `${baseUrl}?${params.toString()}`;

    console.log("Payment URL generated:", paymentUrl);

    return new Response(
      JSON.stringify({
        // Backwards compatibility (GET redirect)
        payment_url: paymentUrl,

        // Preferred: POST redirect to gateway
        payment_base_url: baseUrl,
        payment_params: Object.fromEntries(params.entries()),

        order_id: orderId,
        case_id: case_id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Payment initiation error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
