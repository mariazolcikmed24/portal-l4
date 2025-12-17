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
  payment_method: string;
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

    // Update case payment status to pending and save payment method
    const { data: caseData, error: updateError } = await supabase
      .from("cases")
      .update({
        payment_status: "pending",
        payment_method: payment_method,
        updated_at: new Date().toISOString(),
      })
      .eq("id", case_id)
      .select("case_number")
      .single();

    if (updateError) {
      console.error("Failed to update case:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update case" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Map payment method to Autopay gateway ID
    // https://developers.autopay.pl/online/kody-bramek
    let gatewayId: number | undefined;
    switch (payment_method) {
      case "blik":
        gatewayId = 509; // BLIK
        break;
      case "card":
        gatewayId = 1500; // Visa/Mastercard
        break;
      case "transfer":
        gatewayId = undefined; // Let user choose bank
        break;
    }

    // Prepare payment parameters
    // Amount in grosz (79 PLN = 7900 grosz)
    const amountStr = amount.toFixed(2);
    const currency = "PLN";
    const description = `E-konsultacja medyczna ${caseData.case_number || case_id}`;
    
    // Return URL after payment (will include transaction status)
    const returnUrl = `${req.headers.get("origin") || "https://e-zwolnienie.com.pl"}/potwierdzenie?case=${caseData.case_number}`;
    
    // Generate hash for security
    // Hash format: SHA256(serviceID|orderID|amount|currency|hashKey)
    const hashString = `${serviceId}|${case_id}|${amountStr}|${currency}|${hashKey}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(hashString);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    // Build Autopay payment URL
    // Test: https://testpay.autopay.eu/payment
    // Production: https://pay.autopay.eu/payment
    const isTest = Deno.env.get("AUTOPAY_TEST_MODE") !== "false";
    const baseUrl = isTest 
      ? "https://testpay.autopay.eu/payment" 
      : "https://pay.autopay.eu/payment";

    const params = new URLSearchParams({
      ServiceID: serviceId,
      OrderID: case_id,
      Amount: amountStr,
      Currency: currency,
      Description: description,
      Hash: hash,
      CustomerEmail: "", // Will be filled by profile if needed
    });

    // Add gateway ID if specific method selected
    if (gatewayId) {
      params.append("GatewayID", gatewayId.toString());
    }

    const paymentUrl = `${baseUrl}?${params.toString()}`;

    console.log("Payment URL generated:", paymentUrl);

    return new Response(
      JSON.stringify({ 
        payment_url: paymentUrl,
        case_number: caseData.case_number,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
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
