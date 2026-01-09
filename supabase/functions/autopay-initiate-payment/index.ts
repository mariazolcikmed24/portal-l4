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
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log("Initiating Autopay payment for case:", case_id);

    // Get Autopay configuration
    const serviceId = Deno.env.get("AUTOPAY_SERVICE_ID")?.trim();
    const hashKey = Deno.env.get("AUTOPAY_HASH_KEY")?.trim();
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!serviceId || !hashKey) {
      console.error("Autopay configuration missing");
      return new Response(
        JSON.stringify({ error: "Payment gateway not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
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
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Determine environment early
    const isTest = Deno.env.get("AUTOPAY_TEST_MODE") !== "false";

    // Map payment method to Autopay gateway ID
    // https://developers.autopay.pl/online/kody-bramek
    // IMPORTANT: GatewayID is OPTIONAL. If omitted, Autopay paywall should allow user to choose.
    // If GatewayID is sent, it MUST be included in the hash string.
    let gatewayId: string | undefined;
    if (payment_method) {
      switch (payment_method) {
        case "blik":
          gatewayId = "509"; // BLIK
          break;
        case "card":
          gatewayId = "1500"; // Visa/Mastercard
          break;
        case "transfer":
          gatewayId = undefined; // Paywall (user chooses) -> omit GatewayID
          break;
      }
    }

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
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Hash per docs for TRANSACTION_START:
    // SHA256(ServiceID|OrderID|Amount|GatewayID|Currency|CustomerEmail|HashKey)
    // IMPORTANT: optional fields must be OMITTED (no empty placeholders) if not sent.
    // Description is optional (NIE) - removing it to test if hash works without it.

    // CustomerEmail is OPTIONAL in Autopay and can be sensitive to encoding/normalization on the gateway side.
    // For debugging INVALID_HASH, we temporarily OMIT CustomerEmail from both request params and hash.
    // (If this fixes the issue, we can re-introduce it conditionally / after confirmation from Autopay.)
    const customerEmail = "";

    // Hash order per docs: 1-ServiceID, 2-OrderID, 3-Amount, 5-GatewayID, 6-Currency, 7-CustomerEmail, HashKey
    // Skipping 4-Description (optional)
    const hashParts: string[] = [
      serviceId,
      orderId,
      amountStr,
    ];

    if (gatewayId) hashParts.push(String(gatewayId));
    hashParts.push(currency);

    // CustomerEmail omitted intentionally for now

    hashParts.push(hashKey);

    const hashString = hashParts.join("|");

    console.log("Hash input string (masked):", hashString.replace(hashKey, "***"));

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
      Hash: hash,
      ReturnURL: returnUrl,
    });

    if (gatewayId) params.set("GatewayID", String(gatewayId));
    // CustomerEmail omitted intentionally for now

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
      },
    );
  } catch (error) {
    console.error("Payment initiation error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
