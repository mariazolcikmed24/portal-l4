import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ProgressSteps } from "@/components/layout/ProgressSteps";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDataLayer } from "@/hooks/useDataLayer";
import { formatPriceUI } from "@/lib/formatters";

const paymentSchema = z.object({
  confirm_data: z.literal(true, { errorMap: () => ({ message: "Potwierdzenie jest wymagane" }) }),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

export default function Platnosc() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const { pushEvent } = useDataLayer();

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
  });

  const onSubmit = async (data: PaymentFormData) => {
    setIsProcessing(true);
    console.log("Płatność:", data);

    try {
      // Pobierz dane z localStorage
      const datyChoroby = JSON.parse(localStorage.getItem("formData_datyChoroby") || "{}");
      const rodzajZwolnienia = JSON.parse(localStorage.getItem("formData_rodzajZwolnienia") || "{}");
      const wywiadOgolny = JSON.parse(localStorage.getItem("formData_wywiadOgolny") || "{}");
      const wywiadObjawy = JSON.parse(localStorage.getItem("formData_wywiadObjawy") || "{}");

      // Pobierz przesłane pliki z localStorage
      const uploadedAttachments = JSON.parse(localStorage.getItem("uploadedFiles_attachments") || "[]");
      const attachmentPaths = uploadedAttachments.map((f: { path: string }) => f.path);

      // Znajdź profil użytkownika
      let profileId;
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("id").eq("user_id", user.id).single();
        profileId = profile?.id;
      } else {
        // Dla gościa, pobierz ID z localStorage
        profileId = localStorage.getItem("guestProfileId");
      }

      if (!profileId) {
        throw new Error("Nie znaleziono profilu użytkownika");
      }

      // Utwórz sprawę po stronie backendu (działa również dla gościa)
      const recipient_type =
        rodzajZwolnienia.leave_type === "pl_employer"
          ? "pl_employer"
          : rodzajZwolnienia.leave_type === "foreign_employer"
            ? "foreign_employer"
            : rodzajZwolnienia.leave_type === "uniformed"
              ? "uniformed"
              : rodzajZwolnienia.leave_type === "care"
                ? "care"
                : rodzajZwolnienia.leave_type === "care_family"
                  ? "care"
                  : rodzajZwolnienia.leave_type === "krus"
                    ? "krus"
                    : "student";

      // Build employers array from NIPs
      const employers: { nip: string }[] = [];
      if (rodzajZwolnienia.leave_type === "pl_employer" && Array.isArray(rodzajZwolnienia.nips)) {
        rodzajZwolnienia.nips.forEach((nip: string) => employers.push({ nip }));
      } else if (rodzajZwolnienia.leave_type === "care" && Array.isArray(rodzajZwolnienia.care_nips)) {
        rodzajZwolnienia.care_nips.forEach((nip: string) => employers.push({ nip }));
      } else if (rodzajZwolnienia.leave_type === "care_family" && Array.isArray(rodzajZwolnienia.care_family_nips)) {
        rodzajZwolnienia.care_family_nips.forEach((nip: string) => employers.push({ nip }));
      }

      const { data: createCaseRes, error: createCaseErr } = await supabase.functions.invoke("create-case-for-payment", {
        body: {
          profile_id: profileId,
          illness_start: datyChoroby.illness_start,
          illness_end: datyChoroby.illness_end,
          recipient_type,
          pregnant: wywiadOgolny.q_pregnant === "yes",
          pregnancy_leave: wywiadOgolny.q_preg_leave === "yes",
          has_allergy: wywiadOgolny.q_allergy === "yes",
          allergy_text: wywiadOgolny.allergy_text,
          has_meds: wywiadOgolny.q_meds === "yes",
          meds_list: wywiadOgolny.meds_list,
          chronic_conditions: wywiadOgolny.chronic_list || [],
          chronic_other: wywiadOgolny.chronic_other_text,
          long_leave: wywiadOgolny.q_long_leave === "yes",
          main_category: wywiadObjawy.main_category,
          symptom_duration: wywiadObjawy.symptom_duration,
          symptoms: wywiadObjawy.symptoms || [],
          free_text_reason: wywiadObjawy.free_text_reason,
          attachment_file_ids: attachmentPaths,
          late_justification: datyChoroby.late_justification,
          employers,
          uniformed_service_name: rodzajZwolnienia.uniformed_service_name || null,
          uniformed_nip: rodzajZwolnienia.uniformed_nip || null,
          care_first_name: rodzajZwolnienia.care_first_name || rodzajZwolnienia.care_family_first_name || null,
          care_last_name: rodzajZwolnienia.care_last_name || rodzajZwolnienia.care_family_last_name || null,
          care_pesel: rodzajZwolnienia.care_pesel || rodzajZwolnienia.care_family_pesel || null,
        },
      });

      if (createCaseErr) {
        console.error("Case creation error:", createCaseErr);
        throw new Error((createCaseErr as any)?.message || "Nie udało się utworzyć sprawy");
      }

      const caseData = (createCaseRes as any)?.case;
      if (!caseData?.id) {
        throw new Error("Nie udało się utworzyć sprawy (brak ID)");
      }

      console.log("Case created:", caseData);

      // Wywołaj edge function do inicjowania płatności Autopay
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke("autopay-initiate-payment", {
        body: {
          case_id: caseData.id,
          amount: 7900, // 79 PLN w groszach
        },
      });

      if (paymentError) {
        console.error("Payment initiation error:", paymentError);
        throw new Error("Nie udało się zainicjować płatności");
      }

      console.log("Payment URL:", paymentData.payment_url);

      // Redirect to Autopay gateway.
      // Autopay initiation is specified as a POST (form submission).
      if (paymentData?.payment_base_url && paymentData?.payment_params) {
        const formEl = document.createElement("form");
        formEl.method = "POST";
        formEl.action = paymentData.payment_base_url;

        Object.entries(paymentData.payment_params as Record<string, string>).forEach(([key, value]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = value;
          formEl.appendChild(input);
        });

        document.body.appendChild(formEl);
        formEl.submit();
        return;
      }

      // Fallback: GET redirect
      window.location.href = paymentData.payment_url;
    } catch (error: any) {
      console.error("Błąd podczas zapisywania sprawy:", error);
      toast.error(error?.message || "Wystąpił błąd podczas przetwarzania płatności");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <ProgressSteps currentStep={6} />

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Płatność</h1>
          <p className="text-muted-foreground">Wybierz metodę płatności i dokończ proces</p>
        </div>

        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Do zapłaty</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-lg">E-konsultacja + e-zwolnienie:</span>
                <span className="text-3xl font-bold text-primary">79 PLN</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="confirm_data"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-normal">
                        Potwierdzam poprawność wszystkich podanych danych i akceptuję warunki usługi *
                      </FormLabel>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium">Ważne informacje:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Lekarz może skontaktować się z Tobą telefonicznie</li>
                <li>E-konsultacja nie gwarantuje wystawienia e-zwolnienia</li>
                <li>Ostateczną decyzję podejmuje lekarz</li>
                <li>Data początkowa zwolnienia to data przez Ciebie zadeklarowana</li>
              </ul>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/podsumowanie")}
                className="flex-1"
                disabled={isProcessing}
              >
                Wstecz
              </Button>
              <Button type="submit" className="flex-1" disabled={isProcessing}>
                {isProcessing ? "Przekierowywanie do płatności..." : "Zapłać 79 PLN"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
