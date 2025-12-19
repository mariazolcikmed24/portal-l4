import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Autopay ITN (Instant Transaction Notification) webhook handler
// Documentation: https://developers.autopay.pl/online/dokumentacja#powiadomienia-natychmiastowe-(itn)
// 
// Format: POST with application/x-www-form-urlencoded
// Parameter: transactions = Base64 encoded XML document

interface TransactionData {
  serviceID: string;
  orderID: string;
  remoteID: string;
  amount: string;
  currency: string;
  gatewayID?: string;
  paymentDate: string;
  paymentStatus: string;
  paymentStatusDetails?: string;
  hash: string;
}

// Simple XML parser for Autopay ITN format
function parseItnXml(xmlString: string): TransactionData | null {
  try {
    const getValue = (tag: string): string => {
      const regex = new RegExp(`<${tag}>([^<]*)</${tag}>`);
      const match = xmlString.match(regex);
      return (match ? match[1] : "").trim();
    };

    return {
      serviceID: getValue("serviceID"),
      orderID: getValue("orderID"),
      remoteID: getValue("remoteID"),
      amount: getValue("amount"),
      currency: getValue("currency"),
      gatewayID: getValue("gatewayID") || undefined,
      paymentDate: getValue("paymentDate"),
      paymentStatus: getValue("paymentStatus"),
      paymentStatusDetails: getValue("paymentStatusDetails") || undefined,
      hash: getValue("hash"),
    };
  } catch (e) {
    console.error("XML parsing error:", e);
    return null;
  }
}

// Convert OrderID (UUID without dashes) back to UUID with dashes
function orderIdToCaseId(orderId: string): string {
  // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  if (orderId.length !== 32) return orderId;
  return `${orderId.slice(0, 8)}-${orderId.slice(8, 12)}-${orderId.slice(12, 16)}-${orderId.slice(16, 20)}-${orderId.slice(20)}`;
}

// Calculate SHA256 hash
async function calculateHash(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Build XML confirmation response
function buildConfirmationXml(serviceID: string, orderID: string, hash: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<confirmationList>
  <serviceID>${serviceID}</serviceID>
  <transactionsConfirmations>
    <transactionConfirmed>
      <orderID>${orderID}</orderID>
      <confirmation>OK</confirmation>
    </transactionConfirmed>
  </transactionsConfirmations>
  <hash>${hash}</hash>
</confirmationList>`;
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
    const autopayHashKey = Deno.env.get("AUTOPAY_HASH_KEY");
    const expectedServiceId = Deno.env.get("AUTOPAY_SERVICE_ID");
    
    if (!autopayHashKey || !expectedServiceId) {
      console.error("Autopay configuration missing");
      return new Response("Server configuration error", { status: 500, headers: corsHeaders });
    }

    // Parse the request - Autopay sends transactions parameter as Base64 encoded XML
    const contentType = req.headers.get("content-type") || "";
    let transactionData: TransactionData | null = null;

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      const transactionsBase64 = formData.get("transactions") as string;
      
      if (!transactionsBase64) {
        console.error("No transactions parameter in request");
        return new Response("Missing transactions parameter", { status: 400, headers: corsHeaders });
      }

      // Decode Base64 to XML
      const xmlString = atob(transactionsBase64);
      console.log("Decoded ITN XML:", xmlString);
      
      transactionData = parseItnXml(xmlString);
    } else {
      // Fallback for testing - accept JSON directly
      const jsonData = await req.json();
      console.log("Received ITN as JSON (test mode):", JSON.stringify(jsonData, null, 2));
      transactionData = jsonData as TransactionData;
    }

    if (!transactionData) {
      console.error("Failed to parse transaction data");
      return new Response("Invalid transaction data", { status: 400, headers: corsHeaders });
    }

    console.log("Parsed ITN data:", JSON.stringify(transactionData, null, 2));

    const {
      serviceID,
      orderID,
      remoteID,
      amount,
      currency,
      gatewayID,
      paymentDate,
      paymentStatus,
      paymentStatusDetails,
      hash,
    } = transactionData;

    // Verify ServiceID
    if (serviceID !== expectedServiceId) {
      console.error("ServiceID mismatch", { received: serviceID, expected: expectedServiceId });
      return new Response("Invalid ServiceID", { status: 403, headers: corsHeaders });
    }

    // Verify hash signature (CRITICAL for security)
    // Hash order per docs: serviceID|orderID|remoteID|amount|currency|gatewayID|paymentDate|paymentStatus|paymentStatusDetails|hashKey
    // Note: Include optional fields only if present in the ITN
    const hashParts: string[] = [serviceID, orderID, remoteID, amount, currency];
    if (gatewayID) hashParts.push(gatewayID);
    hashParts.push(paymentDate, paymentStatus);
    if (paymentStatusDetails) hashParts.push(paymentStatusDetails);
    hashParts.push(autopayHashKey);

    const hashString = hashParts.join("|");
    console.log("Hash input (masked):", hashString.replace(autopayHashKey, "***"));

    const calculatedHash = await calculateHash(hashString);

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
        dbPaymentStatus = "success";
        break;
      case "FAILURE":
        dbPaymentStatus = "fail";
        break;
      case "PENDING":
      default:
        dbPaymentStatus = "pending";
    }

    // Convert OrderID back to case UUID
    const caseId = orderIdToCaseId(orderID);
    console.log("Converted OrderID to case_id:", { orderID, caseId });

    // Update case payment status
    const { data: updatedCase, error: updateError } = await supabase
      .from("cases")
      .update({
        payment_status: dbPaymentStatus,
        payment_psp_ref: remoteID,
        updated_at: new Date().toISOString(),
      })
      .eq("id", caseId)
      .select()
      .single();

    if (updateError) {
      console.error("Failed to update case:", updateError);
      return new Response("Database update failed", { status: 500, headers: corsHeaders });
    }

    console.log("Case updated successfully:", {
      caseNumber: orderID,
      paymentStatus: dbPaymentStatus,
      pspRef: remoteID,
    });

    // If payment successful, update case status to submitted and create Med24 visit
    if (dbPaymentStatus === "success" && updatedCase.status === "draft") {
      await supabase
        .from("cases")
        .update({ status: "submitted" })
        .eq("id", caseId);

      // Create Med24 visit (fire and forget - don't block response)
      createMed24Visit(supabase, caseId).catch((err) => {
        console.error("Med24 visit creation failed:", err);
      });
    }

    // Build confirmation response with hash
    // Response hash: SHA256(serviceID|orderID|confirmation|hashKey)
    const confirmationHashString = `${serviceID}|${orderID}|OK|${autopayHashKey}`;
    const confirmationHash = await calculateHash(confirmationHashString);
    
    const responseXml = buildConfirmationXml(serviceID, orderID, confirmationHash);
    console.log("Sending confirmation XML:", responseXml);

    return new Response(responseXml, {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/xml; charset=utf-8" },
    });

  } catch (error) {
    console.error("ITN webhook error:", error);
    return new Response("Internal server error", { status: 500, headers: corsHeaders });
  }
});

// Background task to create Med24 visit
async function createMed24Visit(supabase: any, caseId: string) {
  try {
    const med24ApiUrl = Deno.env.get("MED24_API_URL");
    const med24Username = Deno.env.get("MED24_API_USERNAME");
    const med24Password = Deno.env.get("MED24_API_PASSWORD");
    const med24ServiceId = Deno.env.get("MED24_SERVICE_ID");

    if (!med24ApiUrl || !med24Username || !med24Password) {
      console.log("Med24 API not configured, skipping visit creation");
      return;
    }

    // Fetch profile data for the case
    const { data: caseWithProfile } = await supabase
      .from("cases")
      .select("*, profile:profiles(*)")
      .eq("id", caseId)
      .single();

    if (!caseWithProfile?.profile) {
      console.error("No profile found for case:", caseId);
      return;
    }

    const profile = caseWithProfile.profile;

    const visitPayload = {
      channel_kind: "phone_call",
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
      booking_intent: "finalize",
      queue: "urgent",
    };

    console.log("Creating Med24 visit:", JSON.stringify(visitPayload, null, 2));

    const basicAuth = btoa(`${med24Username}:${med24Password}`);
    const med24Response = await fetch(`${med24ApiUrl}/api/v2/external/visit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${basicAuth}`,
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
          med24_channel_kind: "phone_call",
          med24_booking_intent: "finalize",
          med24_last_sync_at: new Date().toISOString(),
        })
        .eq("id", caseId);

      console.log("Med24 visit created successfully:", med24Data.id);

      // Upload files to Med24 if any
      // TODO: Implement file upload via med24-upload-files function
    } else {
      console.error("Med24 API error:", med24Data);
    }
  } catch (med24Error) {
    console.error("Error creating Med24 visit:", med24Error);
  }
}
