import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const medicalSchema = z.object({
  q_pregnant: z.enum(["yes", "no"], { required_error: "Odpowiedź jest wymagana" }),
  q_preg_leave: z.enum(["yes", "no"]).optional(),
  upload_preg_card: z.instanceof(FileList).optional(),
  
  q_chronic: z.enum(["yes", "no"], { required_error: "Odpowiedź jest wymagana" }),
  chronic_list: z.array(z.string()).optional(),
  chronic_other_text: z.string().max(200).optional(),
  
  q_allergy: z.enum(["yes", "no"], { required_error: "Odpowiedź jest wymagana" }),
  allergy_text: z.string().max(500).optional(),
  
  q_meds: z.enum(["yes", "no"], { required_error: "Odpowiedź jest wymagana" }),
  meds_list: z.string().max(500).optional(),
  
  q_long_leave: z.enum(["yes", "no"], { required_error: "Odpowiedź jest wymagana" }),
  upload_prev_docs: z.instanceof(FileList).optional(),
}).refine((data) => {
  if (data.q_pregnant === "yes" && data.q_preg_leave === "yes" && (!data.upload_preg_card || data.upload_preg_card.length === 0)) {
    return false;
  }
  return true;
}, {
  message: "Karta ciąży jest wymagana dla zwolnienia ciążowego",
  path: ["upload_preg_card"],
}).refine((data) => {
  if (data.q_chronic === "yes" && (!data.chronic_list || data.chronic_list.length === 0)) {
    return false;
  }
  return true;
}, {
  message: "Wybierz co najmniej jedną chorobę",
  path: ["chronic_list"],
}).refine((data) => {
  if (data.q_chronic === "yes" && data.chronic_list?.includes("other") && !data.chronic_other_text) {
    return false;
  }
  return true;
}, {
  message: "Opisz inne choroby",
  path: ["chronic_other_text"],
}).refine((data) => {
  if (data.q_allergy === "yes" && !data.allergy_text) {
    return false;
  }
  return true;
}, {
  message: "Podaj alergie",
  path: ["allergy_text"],
}).refine((data) => {
  if (data.q_meds === "yes" && !data.meds_list) {
    return false;
  }
  return true;
}, {
  message: "Podaj listę leków",
  path: ["meds_list"],
}).refine((data) => {
  if (data.q_long_leave === "yes" && (!data.upload_prev_docs || data.upload_prev_docs.length === 0)) {
    return false;
  }
  return true;
}, {
  message: "Dokumentacja poprzednich zwolnień jest wymagana",
  path: ["upload_prev_docs"],
});

type MedicalFormData = z.infer<typeof medicalSchema>;

const chronicDiseases = [
  { id: "autoimmune", label: "Choroby autoimmunologiczne" },
  { id: "respiratory", label: "Choroby układu oddechowego" },
  { id: "diabetes", label: "Cukrzyca" },
  { id: "circulatory", label: "Choroby układu krążenia" },
  { id: "cancer", label: "Nowotwór" },
  { id: "osteoporosis", label: "Osteoporoza" },
  { id: "epilepsy", label: "Padaczka" },
  { id: "aids", label: "AIDS" },
  { id: "obesity", label: "Otyłość" },
  { id: "other", label: "Inne" },
];

export default function WywiadOgolny() {
  const navigate = useNavigate();
  
  const form = useForm<MedicalFormData>({
    resolver: zodResolver(medicalSchema),
  });

  const qPregnant = form.watch("q_pregnant");
  const qPregLeave = form.watch("q_preg_leave");
  const qChronic = form.watch("q_chronic");
  const chronicList = form.watch("chronic_list") || [];
  const qAllergy = form.watch("q_allergy");
  const qMeds = form.watch("q_meds");
  const qLongLeave = form.watch("q_long_leave");

  const onSubmit = async (data: MedicalFormData) => {
    console.log("Wywiad ogólny:", data);
    toast.success("Dane zapisane");
    navigate("/wywiad-objawy");
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Wywiad medyczny - pytania ogólne</h1>
          <p className="text-muted-foreground">Odpowiedz na poniższe pytania dotyczące Twojego stanu zdrowia</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Ciąża */}
            <FormField
              control={form.control}
              name="q_pregnant"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Czy jesteś w ciąży? *</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} value={field.value}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="preg_yes" />
                        <Label htmlFor="preg_yes">Tak</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="preg_no" />
                        <Label htmlFor="preg_no">Nie</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {qPregnant === "yes" && (
              <>
                <FormField
                  control={form.control}
                  name="q_preg_leave"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Czy potrzebujesz zwolnienia ciążowego? *</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="preg_leave_yes" />
                            <Label htmlFor="preg_leave_yes">Tak</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="preg_leave_no" />
                            <Label htmlFor="preg_leave_no">Nie</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {qPregLeave === "yes" && (
                  <FormField
                    control={form.control}
                    name="upload_preg_card"
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormItem>
                        <FormLabel>Karta ciąży *</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => onChange(e.target.files)}
                            {...field}
                          />
                        </FormControl>
                        <p className="text-sm text-muted-foreground">Format: PDF, JPG, PNG (max 10MB)</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}

            {/* Choroby przewlekłe */}
            <FormField
              control={form.control}
              name="q_chronic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Czy cierpisz na choroby przewlekłe? *</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} value={field.value}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="chronic_yes" />
                        <Label htmlFor="chronic_yes">Tak</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="chronic_no" />
                        <Label htmlFor="chronic_no">Nie</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {qChronic === "yes" && (
              <>
                <FormField
                  control={form.control}
                  name="chronic_list"
                  render={() => (
                    <FormItem>
                      <FormLabel>Wybierz choroby *</FormLabel>
                      <div className="space-y-2">
                        {chronicDiseases.map((disease) => (
                          <FormField
                            key={disease.id}
                            control={form.control}
                            name="chronic_list"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(disease.id)}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || [];
                                      const updated = checked
                                        ? [...current, disease.id]
                                        : current.filter((id) => id !== disease.id);
                                      field.onChange(updated);
                                    }}
                                  />
                                </FormControl>
                                <Label className="!mt-0 font-normal">{disease.label}</Label>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {chronicList.includes("other") && (
                  <FormField
                    control={form.control}
                    name="chronic_other_text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Opisz inne choroby *</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Opisz inne choroby przewlekłe..." maxLength={200} {...field} />
                        </FormControl>
                        <p className="text-sm text-muted-foreground">{field.value?.length || 0}/200</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}

            {/* Alergie */}
            <FormField
              control={form.control}
              name="q_allergy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Czy masz jakieś alergie? *</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} value={field.value}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="allergy_yes" />
                        <Label htmlFor="allergy_yes">Tak</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="allergy_no" />
                        <Label htmlFor="allergy_no">Nie</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {qAllergy === "yes" && (
              <FormField
                control={form.control}
                name="allergy_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wymień alergie *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Np. pyłki, orzechy, penicylina..." maxLength={500} {...field} />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">{field.value?.length || 0}/500</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Leki */}
            <FormField
              control={form.control}
              name="q_meds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Czy bierzesz jakieś leki na stałe? *</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} value={field.value}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="meds_yes" />
                        <Label htmlFor="meds_yes">Tak</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="meds_no" />
                        <Label htmlFor="meds_no">Nie</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {qMeds === "yes" && (
              <FormField
                control={form.control}
                name="meds_list"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wymień leki *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Np. Acard, Concor, Euthyrox..." maxLength={500} {...field} />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">{field.value?.length || 0}/500</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Długie zwolnienie */}
            <FormField
              control={form.control}
              name="q_long_leave"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Czy byłeś na zwolnieniu dłuższym niż 2 tygodnie w ciągu ostatnich 3 miesięcy? *</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} value={field.value}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="long_yes" />
                        <Label htmlFor="long_yes">Tak</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="long_no" />
                        <Label htmlFor="long_no">Nie</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {qLongLeave === "yes" && (
              <FormField
                control={form.control}
                name="upload_prev_docs"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>Dokumentacja poprzednich zwolnień *</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        multiple
                        onChange={(e) => onChange(e.target.files)}
                        {...field}
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">Format: PDF, JPG, PNG (max 10MB każdy, max 3 pliki)</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">
                Wstecz
              </Button>
              <Button type="submit" className="flex-1">
                Dalej
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}