import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ProgressSteps } from "@/components/layout/ProgressSteps";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const paymentSchema = z.object({
  payment_method: z.enum(["card", "blik", "transfer"], { required_error: "Wybierz metodę płatności" }),
  confirm_data: z.literal(true, { errorMap: () => ({ message: "Potwierdzenie jest wymagane" }) }),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

export default function Platnosc() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
  });

  const onSubmit = async (data: PaymentFormData) => {
    setIsProcessing(true);
    console.log("Płatność:", data);
    
    try {
      // Pobierz dane z localStorage
      const datyChoroby = JSON.parse(localStorage.getItem('formData_datyChoroby') || '{}');
      const rodzajZwolnienia = JSON.parse(localStorage.getItem('formData_rodzajZwolnienia') || '{}');
      const wywiadOgolny = JSON.parse(localStorage.getItem('formData_wywiadOgolny') || '{}');
      const wywiadObjawy = JSON.parse(localStorage.getItem('formData_wywiadObjawy') || '{}');
      
      // Znajdź profil użytkownika
      let profileId;
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();
        profileId = profile?.id;
      } else {
        // Dla gościa, znajdź ostatni profil gościa
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('is_guest', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        profileId = profile?.id;
      }

      if (!profileId) {
        throw new Error('Nie znaleziono profilu użytkownika');
      }

      // Zapisz sprawę do bazy danych
      const { data: caseData, error } = await supabase
        .from('cases')
        .insert({
          profile_id: profileId,
          illness_start: datyChoroby.illness_start,
          illness_end: datyChoroby.illness_end,
          recipient_type: rodzajZwolnienia.leave_type === 'pl_employer' ? 'pl_employer' : 
                         rodzajZwolnienia.leave_type === 'foreign_employer' ? 'foreign_employer' :
                         rodzajZwolnienia.leave_type === 'uniformed' ? 'uniformed' :
                         rodzajZwolnienia.leave_type === 'care' ? 'care' : 'student',
          pregnant: wywiadOgolny.q_pregnant === 'yes',
          pregnancy_leave: wywiadOgolny.q_preg_leave === 'yes',
          has_allergy: wywiadOgolny.q_allergy === 'yes',
          allergy_text: wywiadOgolny.allergy_text,
          has_meds: wywiadOgolny.q_meds === 'yes',
          meds_list: wywiadOgolny.meds_list,
          chronic_conditions: wywiadOgolny.chronic_list || [],
          chronic_other: wywiadOgolny.chronic_other,
          long_leave: wywiadOgolny.q_long_leave === 'yes',
          main_category: wywiadObjawy.main_category,
          symptom_duration: wywiadObjawy.symptom_duration,
          symptoms: wywiadObjawy.symptoms || [],
          free_text_reason: wywiadObjawy.free_text_reason,
          payment_method: data.payment_method,
          payment_status: 'success',
          status: 'submitted',
          late_justification: datyChoroby.late_justification,
        })
        .select('case_number')
        .single();

      if (error) throw error;

      toast.success("Płatność zakończona pomyślnie");
      
      // Clear all form data from localStorage after successful payment
      localStorage.removeItem('formData_datyChoroby');
      localStorage.removeItem('formData_rodzajZwolnienia');
      localStorage.removeItem('formData_wywiadOgolny');
      localStorage.removeItem('formData_wywiadObjawy');
      
      // Przekieruj z numerem sprawy
      navigate(`/potwierdzenie?case=${caseData.case_number}`);
    } catch (error: any) {
      console.error('Błąd podczas zapisywania sprawy:', error);
      toast.error("Wystąpił błąd podczas przetwarzania płatności");
    } finally {
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
                <span className="text-lg">E-konsultacja + e-ZLA:</span>
                <span className="text-3xl font-bold text-primary">79 PLN</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Metoda płatności *</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} value={field.value} className="space-y-3">
                      <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="flex-1 cursor-pointer">
                          <div className="font-medium">Karta płatnicza</div>
                          <div className="text-sm text-muted-foreground">Visa, Mastercard, Maestro</div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
                        <RadioGroupItem value="blik" id="blik" />
                        <Label htmlFor="blik" className="flex-1 cursor-pointer">
                          <div className="font-medium">BLIK</div>
                          <div className="text-sm text-muted-foreground">Szybka płatność kodem z aplikacji bankowej</div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-muted/50 cursor-pointer">
                        <RadioGroupItem value="transfer" id="transfer" />
                        <Label htmlFor="transfer" className="flex-1 cursor-pointer">
                          <div className="font-medium">Przelew online</div>
                          <div className="text-sm text-muted-foreground">Szybki przelew przez bank</div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirm_data"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
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
                <li>E-konsultacja nie gwarantuje wystawienia e-ZLA</li>
                <li>Ostateczną decyzję podejmuje lekarz</li>
                <li>Data początkowa zwolnienia to data przez Ciebie zadeklarowana</li>
              </ul>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate("/podsumowanie")} className="flex-1" disabled={isProcessing}>
                Wstecz
              </Button>
              <Button type="submit" className="flex-1" disabled={isProcessing}>
                {isProcessing ? "Przetwarzanie..." : "Zapłać 79 PLN"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}