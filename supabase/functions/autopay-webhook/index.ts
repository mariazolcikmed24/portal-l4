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

    // If payment successful, update case status to submitted and create Med24 visit
    if (dbPaymentStatus === "success" && updatedCase.status === "draft") {
      await supabase
        .from("cases")
        .update({ status: "submitted" })
        .eq("id", orderID);
      
      console.log("Case status updated to submitted");

      // Create Med24 visit
      try {
        const med24ApiUrl = Deno.env.get("MED24_API_URL");
        const med24Username = Deno.env.get("MED24_API_USERNAME");
        const med24Password = Deno.env.get("MED24_API_PASSWORD");
        const med24ServiceId = Deno.env.get("MED24_SERVICE_ID");

        if (med24ApiUrl && med24Username && med24Password) {
          // Fetch profile data for the case
          const { data: caseWithProfile } = await supabase
            .from("cases")
            .select("*, profile:profiles(*)")
            .eq("id", orderID)
            .single();

          if (caseWithProfile?.profile) {
            const profile = caseWithProfile.profile;
            
            const visitPayload = {
              channel_kind: "text_message",
              service_id: med24ServiceId || null,
              patient: {
                first_name: profile.first_name,
                last_name: profile.last_name,
                pesel: profile.pesel || null,
                date_of_birth: profile.date_of_birth || null,
                email: profile.email || null,
                phone_number: profile.phone || null,
                address: profile.street || null,
                house_number: profile.house_no || null,
                flat_number: profile.flat_no || null,
                postal_code: profile.postcode || null,
                city: profile.city || null,
              },
              external_tag: caseWithProfile.case_number || orderID,
              booking_intent: "finalize",
              queue: "urgent",
            };

            console.log("Creating Med24 visit:", JSON.stringify(visitPayload, null, 2));

            const basicAuth = btoa(`${med24Username}:${med24Password}`);
            const med24Response = await fetch(`${med24ApiUrl}/api/v2/external/visit`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Basic ${basicAuth}`,
              },
              body: JSON.stringify(visitPayload),
            });

            const med24Data = await med24Response.json();
            console.log("Med24 API response:", med24Response.status, JSON.stringify(med24Data, null, 2));

            if (med24Response.ok) {
              // Update case with Med24 visit data
              await supabase
                .from("cases")
                .update({
                  med24_visit_id: med24Data.id,
                  med24_visit_status: med24Data,
                  med24_external_tag: caseWithProfile.case_number || orderID,
                  med24_channel_kind: "text_message",
                  med24_booking_intent: "finalize",
                  med24_last_sync_at: new Date().toISOString(),
                })
                .eq("id", orderID);

              console.log("Med24 visit created successfully:", med24Data.id);
            } else {
              console.error("Med24 API error:", med24Data);
            }
          }
        } else {
          console.log("Med24 API not configured, skipping visit creation");
        }
      } catch (med24Error) {
        console.error("Error creating Med24 visit:", med24Error);
        // Don't fail the webhook, payment was still successful
      }
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
