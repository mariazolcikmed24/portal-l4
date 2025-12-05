import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Autopay ITN (Instant Transaction Notification) webhook handler
// Documentation: https://developers.autopay.pl/online/itn

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    // Parse ITN data from Autopay (form-urlencoded or JSON)
    const contentType = req.headers.get("content-type") || "";
    let itnData: Record<string, string>;

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      itnData = Object.fromEntries(formData.entries()) as Record<string, string>;
    } else {
      itnData = await req.json();
    }

    console.log("Received ITN notification:", JSON.stringify(itnData, null, 2));

    // Extract key fields from ITN
    const {
      serviceID,      // Autopay service ID
      orderID,        // Our case ID
      remoteID,       // Autopay transaction ID
      amount,         // Transaction amount
      currency,       // Currency (PLN)
      paymentStatus,  // Payment status from Autopay
      hash,           // Security hash for verification
    } = itnData;

    // Verify hash signature (CRITICAL for security)
    const autopayHashKey = Deno.env.get("AUTOPAY_HASH_KEY");
    if (!autopayHashKey) {
      console.error("AUTOPAY_HASH_KEY not configured");
      return new Response("Server configuration error", { status: 500, headers: corsHeaders });
    }

    // Autopay hash verification: SHA256(serviceID|orderID|remoteID|amount|currency|paymentStatus|hashKey)
    const hashString = `${serviceID}|${orderID}|${remoteID}|${amount}|${currency}|${paymentStatus}|${autopayHashKey}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(hashString);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const calculatedHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

    if (calculatedHash.toLowerCase() !== hash?.toLowerCase()) {
      console.error("Hash verification failed", { received: hash, calculated: calculatedHash });
      return new Response("Invalid hash", { status: 403, headers: corsHeaders });
    }

    console.log("Hash verification successful");

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Map Autopay status to our payment_status enum
    let dbPaymentStatus: "pending" | "success" | "fail";
    switch (paymentStatus) {
      case "SUCCESS":
      case "CONFIRMED":
        dbPaymentStatus = "success";
        break;
      case "FAILURE":
      case "CANCELLED":
      case "REJECTED":
        dbPaymentStatus = "fail";
        break;
      default:
        dbPaymentStatus = "pending";
    }

    // Update case payment status
    const { data: updatedCase, error: updateError } = await supabase
      .from("cases")
      .update({
        payment_status: dbPaymentStatus,
        payment_psp_ref: remoteID,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderID)
      .select()
      .single();

    if (updateError) {
      console.error("Failed to update case:", updateError);
      return new Response("Database update failed", { status: 500, headers: corsHeaders });
    }

    console.log("Case updated successfully:", {
      caseId: orderID,
      paymentStatus: dbPaymentStatus,
      pspRef: remoteID,
    });

    // If payment successful, update case status to submitted
    if (dbPaymentStatus === "success" && updatedCase.status === "draft") {
      await supabase
        .from("cases")
        .update({ status: "submitted" })
        .eq("id", orderID);
      
      console.log("Case status updated to submitted");
    }

    // Return OK response (Autopay expects this)
    return new Response("OK", { 
      status: 200, 
      headers: { ...corsHeaders, "Content-Type": "text/plain" } 
    });

  } catch (error) {
    console.error("ITN webhook error:", error);
    return new Response("Internal server error", { status: 500, headers: corsHeaders });
  }
});
