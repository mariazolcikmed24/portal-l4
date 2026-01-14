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
    // Some Autopay environments hash raw values, others hash form-url-encoded values.
    // In practice, most gateways verify hash on the *form-url-encoded* representation.
    // Default to "urlencoded" unless explicitly set to "raw".
    const hashMode = (Deno.env.get("AUTOPAY_HASH_MODE") || "urlencoded").trim().toLowerCase();

    // Autopay can be configured for SHA256 or SHA512. Default is SHA256.
    const hashAlgo = (Deno.env.get("AUTOPAY_HASH_ALGO") || "sha256").trim().toLowerCase();

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
    // NOTE: In practice, some Autopay environments expect GatewayID to be present even for paywall.
    // For paywall, we send GatewayID="0" and include it in the hash.
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
          gatewayId = "0"; // Paywall (user chooses)
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
    // SHA256(ServiceID|OrderID|Amount|Description|GatewayID|Currency|CustomerEmail|HashKey)
    // IMPORTANT: optional fields must be OMITTED (no empty placeholders) if not sent.

    const description = "E-konsultacja lekarska";

    // CustomerEmail optional. We still omit it from params for now, but we keep the extraction here
    // because some merchants have it enabled and we may need to include it.
    const profilesJoin: any = (caseData as any).profiles;
    const customerEmail = Array.isArray(profilesJoin)
      ? (profilesJoin[0]?.email ?? "")
      : (profilesJoin?.email ?? "");

    const computeHashHex = async (input: string): Promise<string> => {
      const algo = hashAlgo === "sha512" ? "SHA-512" : "SHA-256";
      const encoder = new TextEncoder();
      const data = encoder.encode(input);
      const hashBuffer = await crypto.subtle.digest(algo, data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    };

    // Some Autopay channels expect hashing on raw values, others expect hashing on
    // form-url-encoded values (application/x-www-form-urlencoded, spaces as '+').
    const formUrlEncode = (value: string) => encodeURIComponent(value).replace(/%20/g, "+");

    // Hash input order (per docs) - fields in NUMERICAL order:
    // 1-ServiceID | 2-OrderID | 3-Amount | 4-Description | 5-GatewayID | 6-Currency | 7-CustomerEmail | HashKey
    // IMPORTANT: Empty/missing optional fields must be OMITTED (no separator)!
    // Required fields: ServiceID(1), OrderID(2), Amount(3), CustomerEmail(7), Hash
    // Optional fields: Description(4), GatewayID(5), Currency(6)

    // Build hash parts dynamically - only include non-empty values
    const hashPartsRaw: string[] = [];
    const hashPartsEncoded: string[] = [];

    // 1. ServiceID (required)
    hashPartsRaw.push(serviceId);
    hashPartsEncoded.push(formUrlEncode(serviceId));

    // 2. OrderID (required)
    hashPartsRaw.push(orderId);
    hashPartsEncoded.push(formUrlEncode(orderId));

    // 3. Amount (required)
    hashPartsRaw.push(amountStr);
    hashPartsEncoded.push(formUrlEncode(amountStr));

    // 4. Description (optional) - we send it, so include
    if (description) {
      hashPartsRaw.push(description);
      hashPartsEncoded.push(formUrlEncode(description));
    }

    // 5. GatewayID (optional)
    // IMPORTANT: For paywall we previously sent GatewayID="0".
    // Autopay appears to treat "0" as equivalent to "not provided" for hash verification,
    // so we OMIT it from the hash when it's "0".
    if (gatewayId && gatewayId !== "0") {
      hashPartsRaw.push(String(gatewayId));
      hashPartsEncoded.push(formUrlEncode(String(gatewayId)));
    }

    // 6. Currency (optional) - we send it, so include
    if (currency) {
      hashPartsRaw.push(currency);
      hashPartsEncoded.push(formUrlEncode(currency));
    }

    // 7. CustomerEmail (required per docs)
    if (customerEmail) {
      hashPartsRaw.push(customerEmail);
      hashPartsEncoded.push(formUrlEncode(customerEmail));
    }

    // Finally, append hash key (always last, no separator issues - it's always present)
    hashPartsRaw.push(hashKey);
    hashPartsEncoded.push(hashKey); // Hash key is NOT url-encoded

    const hashStringRaw = hashPartsRaw.join("|");
    const hashStringEncoded = hashPartsEncoded.join("|");

    // Helpful logs for Autopay support (masked)
    console.log("Hash input raw (masked):", hashStringRaw.replace(hashKey, "***"));
    console.log(
      "Hash input encoded (masked):",
      hashStringEncoded.replace(hashKey, "***"),
      `(mode=${hashMode})`,
    );
    console.log("CustomerEmail value:", customerEmail || "(empty)");

    const hashInput = hashMode === "raw" ? hashStringRaw : hashStringEncoded;
    const hash = await computeHashHex(hashInput);

    console.log("Generated hash:", hash, `(algo=${hashAlgo}, mode=${hashMode})`);

    // Build Autopay payment URL
    // Test: https://testpay.autopay.eu/payment
    // Production: https://pay.autopay.eu/payment
    const baseUrl = isTest ? "https://testpay.autopay.eu/payment" : "https://pay.autopay.eu/payment";

    // Return URL after payment - Autopay will redirect here with ServiceID, OrderID, Hash
    // NOTE: ReturnURL is NOT part of TRANSACTION_START hash.
    // Must match URL registered in Autopay panel.
    const returnUrlBase =
      Deno.env.get("AUTOPAY_RETURN_URL") || "https://preview--portal-l4.lovable.app/potwierdzenie";

    // Always include cid=<OrderID> so the confirmation page can still find the case
    // even if Autopay doesn't append ServiceID/OrderID/Hash on redirect.
    const returnUrlObj = new URL(returnUrlBase);
    if (!returnUrlObj.searchParams.get("cid")) returnUrlObj.searchParams.set("cid", orderId);
    const returnUrl = returnUrlObj.toString();

    const params = new URLSearchParams({
      ServiceID: serviceId,
      OrderID: orderId,
      Amount: amountStr,
      Currency: currency,
      Description: description,
      Hash: hash,
      CustomerEmail: customerEmail,
      ReturnURL: returnUrl,
    });

    // Omit GatewayID when it's the paywall default ("0") to match Autopay hash expectations.
    if (gatewayId !== "0") params.set("GatewayID", String(gatewayId));

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
