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
  customerData?: Record<string, string>;
  hash: string;
}

// Simple XML parser for Autopay ITN format
function parseItnXml(xmlString: string): TransactionData | null {
  try {
    const getValue = (tag: string, within?: string): string => {
      const haystack = within ?? xmlString;
      const regex = new RegExp(`<${tag}>([^<]*)</${tag}>`);
      const match = haystack.match(regex);
      return (match ? match[1] : "").trim();
    };

    const customerDataBlockMatch = xmlString.match(/<customerData>([\s\S]*?)<\/customerData>/);
    const customerDataBlock = customerDataBlockMatch ? customerDataBlockMatch[1] : "";

    const customerDataTags = [
      "fName",
      "lName",
      "streetName",
      "streetHouseNo",
      "streetStaircaseNo",
      "streetPremiseNo",
      "postalCode",
      "city",
      "nrb",
    ];

    const customerData: Record<string, string> = {};
    for (const tag of customerDataTags) {
      const v = customerDataBlock ? getValue(tag, customerDataBlock) : "";
      if (v) customerData[tag] = v;
    }

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
      customerData: Object.keys(customerData).length ? customerData : undefined,
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

// Calculate hash (SHA256 default; SHA512 optional via AUTOPAY_HASH_ALGO)
async function calculateHash(input: string): Promise<string> {
  const algoRaw = (Deno.env.get("AUTOPAY_HASH_ALGO") || "sha256").toLowerCase();
  const algo: AlgorithmIdentifier = algoRaw === "sha512" ? "SHA-512" : "SHA-256";

  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest(algo, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Build XML confirmation response
function buildConfirmationXml(serviceID: string, orderID: string, confirmation: string, hash: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<confirmationList>
  <serviceID>${serviceID}</serviceID>
  <transactionsConfirmations>
    <transactionConfirmed>
      <orderID>${orderID}</orderID>
      <confirmation>${confirmation}</confirmation>
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
      customerData,
      hash,
    } = transactionData;

    // Verify ServiceID
    if (serviceID !== expectedServiceId) {
      console.error("ServiceID mismatch", { received: serviceID, expected: expectedServiceId });
      return new Response("Invalid ServiceID", { status: 403, headers: corsHeaders });
    }

    // Verify hash signature (CRITICAL for security)
    // Hash order per Autopay docs (screenshot):
    // 1. serviceID (required)
    // 2. orderID (required)
    // 3. remoteID (required)
    // 4. amount (required) - format: 0.00
    // 5. currency (required)
    // 6. gatewayID (optional - include only if present)
    // 7. paymentDate (required)
    // 8. paymentStatus (required)
    // 9. paymentStatusDetails (optional - include only if present)
    // + hashKey at the end
    
    // Build hash string with only non-empty optional fields
    const hashParts: string[] = [
      serviceID.trim(),
      orderID.trim(),
      remoteID.trim(),
      amount.trim(),
      currency.trim(),
    ];
    
    // gatewayID (position 6) - include only if non-empty
    if (gatewayID && gatewayID.trim()) {
      hashParts.push(gatewayID.trim());
    }
    
    hashParts.push(paymentDate.trim());
    hashParts.push(paymentStatus.trim());
    
    // paymentStatusDetails (position 9) - include only if non-empty
    if (paymentStatusDetails && paymentStatusDetails.trim()) {
      hashParts.push(paymentStatusDetails.trim());
    }
    
    hashParts.push(autopayHashKey.trim());
    
    const hashString = hashParts.join("|");
    console.log("Hash calculation string (masked):", hashString.replace(autopayHashKey.trim(), "KEY"));
    console.log("Hash parts count:", hashParts.length);
    console.log("gatewayID included:", !!(gatewayID && gatewayID.trim()));
    console.log("paymentStatusDetails included:", !!(paymentStatusDetails && paymentStatusDetails.trim()));
    
    const calculatedHash = await calculateHash(hashString);
    console.log("Received hash:", hash);
    console.log("Calculated hash:", calculatedHash);
    
    // Also try alternative hash formats for debugging
    let hashVerified = calculatedHash.toLowerCase() === hash?.toLowerCase();
    
    if (!hashVerified) {
      // Try with all fields including empty optionals as empty strings
      const fullHashParts = [
        serviceID.trim(),
        orderID.trim(),
        remoteID.trim(),
        amount.trim(),
        currency.trim(),
        gatewayID?.trim() || "",
        paymentDate.trim(),
        paymentStatus.trim(),
        paymentStatusDetails?.trim() || "",
        autopayHashKey.trim()
      ];
      const fullHashString = fullHashParts.join("|");
      const fullHash = await calculateHash(fullHashString);
      console.log("Alt hash (with empty optionals):", fullHash);
      
      if (fullHash.toLowerCase() === hash?.toLowerCase()) {
        hashVerified = true;
        console.log("Hash matched with empty optional fields included");
      }
    }
    
    if (!hashVerified) {
      // Try without pipe separators for optional empty fields
      const altParts = [
        serviceID.trim(),
        orderID.trim(),
        remoteID.trim(),
        amount.trim(),
        currency.trim(),
        ...(gatewayID?.trim() ? [gatewayID.trim()] : []),
        paymentDate.trim(),
        paymentStatus.trim(),
        ...(paymentStatusDetails?.trim() ? [paymentStatusDetails.trim()] : []),
        autopayHashKey.trim()
      ];
      const altHashString = altParts.join("|");
      const altHash = await calculateHash(altHashString);
      
      if (altHash.toLowerCase() === hash?.toLowerCase()) {
        hashVerified = true;
        console.log("Hash matched with trimmed parts variant");
      }
    }

    if (!hashVerified) {
      // Some service configurations appear to include customerData in hash for certain gateways.
      // This is NOT in the standard ITN docs, but we try it as a compatibility fallback.
      if (customerData && Object.keys(customerData).length) {
        const customerValues = [
          customerData.fName,
          customerData.lName,
          customerData.streetName,
          customerData.streetHouseNo,
          customerData.streetStaircaseNo,
          customerData.streetPremiseNo,
          customerData.postalCode,
          customerData.city,
          customerData.nrb,
        ].filter((v): v is string => !!v && v.trim() !== "").map((v) => v.trim());

        const customerHashParts = [...hashParts.slice(0, -1), ...customerValues, autopayHashKey.trim()];
        const customerHashString = customerHashParts.join("|");
        const customerHash = await calculateHash(customerHashString);
        console.log(
          "Alt hash (with customerData):",
          customerHash,
          "parts:",
          customerHashParts.length,
        );

        if (customerHash.toLowerCase() === hash?.toLowerCase()) {
          hashVerified = true;
          console.log("Hash matched with customerData fallback");
        }
      }
    }

    if (!hashVerified) {
      console.error("Hash verification FAILED", {
        received: hash,
        calculated: calculatedHash,
        hashStringMasked: hashString.replace(autopayHashKey.trim(), "KEY"),
      });
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

    // Fetch current case state BEFORE update
    const { data: currentCase, error: fetchError } = await supabase
      .from("cases")
      .select("payment_status, payment_psp_ref, status")
      .eq("id", caseId)
      .maybeSingle();

    if (fetchError) {
      console.error("Failed to fetch case:", fetchError);
      return new Response("Database fetch failed", { status: 500, headers: corsHeaders });
    }

    if (!currentCase) {
      console.error("Case not found:", caseId);
      // Still confirm to Autopay to stop retries
      // Will return CONFIRMED below
    }

    console.log("Current case state:", { 
      currentPaymentStatus: currentCase?.payment_status, 
      currentRemoteID: currentCase?.payment_psp_ref,
      incomingStatus: dbPaymentStatus,
      incomingRemoteID: remoteID
    });

    // Simplified model per Autopay docs:
    // 1. For non-SUCCESS: always confirm, update status only if not already SUCCESS
    // 2. For first SUCCESS: update status + run business logic (Med24)
    // 3. For subsequent SUCCESS: just confirm, no update
    
    let shouldUpdateDb = false;
    let shouldRunBusinessLogic = false;

    if (currentCase) {
      if (currentCase.payment_status === "success") {
        // Already SUCCESS - don't downgrade to PENDING/FAILURE (could be different remoteID)
        // Just confirm the ITN without updating
        console.log("Case already has SUCCESS status, skipping update");
        shouldUpdateDb = false;
        shouldRunBusinessLogic = false;
      } else if (dbPaymentStatus === "success") {
        // First SUCCESS - update and run business logic
        shouldUpdateDb = true;
        shouldRunBusinessLogic = currentCase.status === "draft";
        console.log("First SUCCESS received, will update and run business logic");
      } else {
        // PENDING or FAILURE when not yet SUCCESS - update status
        shouldUpdateDb = true;
        shouldRunBusinessLogic = false;
        console.log("Updating to", dbPaymentStatus);
      }
    }

    if (shouldUpdateDb && currentCase) {
      const { error: updateError } = await supabase
        .from("cases")
        .update({
          payment_status: dbPaymentStatus,
          payment_psp_ref: remoteID,
          updated_at: new Date().toISOString(),
        })
        .eq("id", caseId);

      if (updateError) {
        console.error("Failed to update case:", updateError);
        return new Response("Database update failed", { status: 500, headers: corsHeaders });
      }

      console.log("Case updated successfully:", {
        caseId,
        paymentStatus: dbPaymentStatus,
        pspRef: remoteID,
      });
    }

    // Run business logic only on first SUCCESS
    if (shouldRunBusinessLogic) {
      await supabase
        .from("cases")
        .update({ status: "submitted" })
        .eq("id", caseId);

      console.log("Case status changed to submitted, creating Med24 visit");

      // Create Med24 visit (fire and forget - don't block response)
      createMed24Visit(supabase, caseId).catch((err) => {
        console.error("Med24 visit creation failed:", err);
      });
    }

    // Build confirmation response with hash
    // Response hash per docs: SHA256(serviceID|orderID|confirmation|hashKey)
    // confirmation = "CONFIRMED" or "NOTCONFIRMED"
    const confirmation = "CONFIRMED";
    const confirmationHashString = `${serviceID}|${orderID}|${confirmation}|${autopayHashKey.trim()}`;
    const confirmationHash = await calculateHash(confirmationHashString);
    
    const responseXml = buildConfirmationXml(serviceID, orderID, confirmation, confirmationHash);
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
      consents: [
        { kind: "marketing_l4_portal_email", is_given: profile.consent_marketing_email ?? false },
        { kind: "marketing_l4_portal_phone", is_given: profile.consent_marketing_tel ?? false },
      ],
    };

    console.log("Creating Med24 visit:", JSON.stringify(visitPayload, null, 2));

    const basicAuth = btoa(`${med24Username}:${med24Password}`);
    const maxRetries = 3;
    const retryDelayMs = 5000;
    let med24Data: any = null;
    let med24ResponseOk = false;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Med24 API attempt ${attempt}/${maxRetries}`);
        const med24Response = await fetch(`${med24ApiUrl}/api/v2/external/visit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${basicAuth}`,
          },
          body: JSON.stringify(visitPayload),
        });

        const med24ResponseText = await med24Response.text();
        console.log("Med24 API response status:", med24Response.status);
        console.log("Med24 API response content-type:", med24Response.headers.get("content-type"));

        try {
          med24Data = JSON.parse(med24ResponseText);
        } catch {
          console.error(`Med24 API returned non-JSON response (attempt ${attempt}):`, med24ResponseText.substring(0, 500));
          if (attempt < maxRetries) {
            console.log(`Retrying in ${retryDelayMs / 1000}s...`);
            await new Promise((r) => setTimeout(r, retryDelayMs));
            continue;
          }
          console.error("All retry attempts exhausted. Med24 endpoint:", med24ApiUrl);
          return;
        }

        // If server error (5xx), retry
        if (med24Response.status >= 500 && attempt < maxRetries) {
          console.error(`Med24 API server error ${med24Response.status} (attempt ${attempt}):`, JSON.stringify(med24Data));
          console.log(`Retrying in ${retryDelayMs / 1000}s...`);
          await new Promise((r) => setTimeout(r, retryDelayMs));
          continue;
        }

        med24ResponseOk = med24Response.ok;
        console.log("Med24 API parsed response:", JSON.stringify(med24Data, null, 2));
        break; // Success or non-retryable error
      } catch (fetchError) {
        console.error(`Med24 API fetch error (attempt ${attempt}):`, fetchError);
        if (attempt < maxRetries) {
          console.log(`Retrying in ${retryDelayMs / 1000}s...`);
          await new Promise((r) => setTimeout(r, retryDelayMs));
          continue;
        }
        console.error("All retry attempts exhausted due to network errors");
        return;
      }
    }

    if (med24ResponseOk && med24Data) {
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

      // Generate PDF summary and upload files to Med24
      await generatePdfAndUploadFiles(caseId, med24Data.id);
    } else {
      console.error("Med24 API error:", med24Data);
    }
  } catch (med24Error) {
    console.error("Error creating Med24 visit:", med24Error);
  }
}

// Generate PDF summary and upload all files to Med24
async function generatePdfAndUploadFiles(caseId: string, visitId: string) {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    console.log(`Starting PDF generation and file upload for case ${caseId}, visit ${visitId}`);

    // Step 1: Generate PDF summary
    console.log("Calling generate-case-pdf function...");
    const pdfResponse = await fetch(`${supabaseUrl}/functions/v1/generate-case-pdf`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ case_id: caseId }),
    });

    const pdfResult = await pdfResponse.json();
    
    if (pdfResponse.ok && pdfResult.success) {
      console.log(`PDF generated successfully: ${pdfResult.pdf_path}`);
    } else {
      console.error("PDF generation failed:", pdfResult);
    }

    // Step 2: Upload all files (including the PDF) to Med24
    console.log("Calling med24-upload-files function...");
    const uploadResponse = await fetch(`${supabaseUrl}/functions/v1/med24-upload-files`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ case_id: caseId, visit_id: visitId }),
    });

    const uploadResult = await uploadResponse.json();
    
    if (uploadResponse.ok) {
      console.log(`File upload complete: ${uploadResult.uploaded}/${uploadResult.total} files uploaded`);
    } else {
      console.error("File upload failed:", uploadResult);
    }

  } catch (error) {
    console.error("Error in generatePdfAndUploadFiles:", error);
  }
}
