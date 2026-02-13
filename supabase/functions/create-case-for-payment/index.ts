import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type RecipientType =
  | "pl_employer"
  | "uniformed"
  | "student"
  | "foreign_employer"
  | "care"
  | "krus";

interface CreateCaseForPaymentRequest {
  profile_id: string;
  illness_start: string;
  illness_end: string;
  recipient_type: RecipientType;
  main_category: string;
  symptom_duration: string;
  free_text_reason: string;

  symptoms?: string[];
  pregnancy_leave?: boolean | null;
  pregnant?: boolean | null;
  has_allergy?: boolean | null;
  allergy_text?: string | null;
  has_meds?: boolean | null;
  meds_list?: string | null;
  chronic_conditions?: string[] | null;
  chronic_other?: string | null;
  long_leave?: boolean | null;
  late_justification?: string | null;
  attachment_file_ids?: string[] | null;
  employers?: { nip: string }[] | null;
  uniformed_service_name?: string | null;
  uniformed_nip?: string | null;
  care_first_name?: string | null;
  care_last_name?: string | null;
  care_pesel?: string | null;
}

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const body: CreateCaseForPaymentRequest = await req.json();

    const required = [
      "profile_id",
      "illness_start",
      "illness_end",
      "recipient_type",
      "main_category",
      "symptom_duration",
      "free_text_reason",
    ] as const;

    for (const k of required) {
      if (!body?.[k]) return json(400, { error: `Missing required field: ${k}` });
    }

    // Optional auth: if user is logged-in, enforce ownership of profile.
    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    let requesterUserId: string | null = null;
    if (authHeader?.toLowerCase().startsWith("bearer ")) {
      const token = authHeader.slice(7);
      const { data, error } = await supabaseAdmin.auth.getUser(token);
      if (!error && data?.user) requesterUserId = data.user.id;
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, user_id, is_guest")
      .eq("id", body.profile_id)
      .maybeSingle();

    if (profileError || !profile) return json(404, { error: "Profile not found" });

    if (requesterUserId) {
      if (profile.user_id !== requesterUserId) return json(403, { error: "Profile does not belong to user" });
    } else {
      // Guest flow: only allow creating a case for guest profiles.
      if (!profile.is_guest) return json(403, { error: "Guest profile required" });
    }

    const { data: caseData, error: caseError } = await supabaseAdmin
      .from("cases")
      .insert({
        profile_id: body.profile_id,
        illness_start: body.illness_start,
        illness_end: body.illness_end,
        recipient_type: body.recipient_type,
        main_category: body.main_category,
        symptom_duration: body.symptom_duration,
        free_text_reason: body.free_text_reason,
        symptoms: body.symptoms ?? [],
        pregnant: body.pregnant ?? null,
        pregnancy_leave: body.pregnancy_leave ?? null,
        has_allergy: body.has_allergy ?? null,
        allergy_text: body.allergy_text ?? null,
        has_meds: body.has_meds ?? null,
        meds_list: body.meds_list ?? null,
        chronic_conditions: body.chronic_conditions ?? [],
        chronic_other: body.chronic_other ?? null,
        long_leave: body.long_leave ?? null,
        late_justification: body.late_justification ?? null,
        attachment_file_ids: body.attachment_file_ids ?? [],
        employers: body.employers ?? [],
        uniformed_service_name: body.uniformed_service_name ?? null,
        uniformed_nip: body.uniformed_nip ?? null,
        care_first_name: body.care_first_name ?? null,
        care_last_name: body.care_last_name ?? null,
        care_pesel: body.care_pesel ?? null,
        payment_status: "pending",
        status: "draft",
      })
      .select("id, case_number")
      .single();

    if (caseError) {
      console.error("create-case-for-payment insert error:", caseError);
      return json(400, { error: caseError.message });
    }

    return json(201, { success: true, case: caseData });
  } catch (error) {
    console.error("Error in create-case-for-payment:", error);
    return json(500, { error: error instanceof Error ? error.message : "Internal server error" });
  }
});
