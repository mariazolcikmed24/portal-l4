import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ProgressSteps } from "@/components/layout/ProgressSteps";
import { Upload, Baby, Users } from "lucide-react";
import { useDataLayer } from "@/hooks/useDataLayer";

const medicalSchema = z
  .object({
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
  })
  .refine(
    (data) => {
      if (
        data.q_pregnant === "yes" &&
        data.q_preg_leave === "yes" &&
        (!data.upload_preg_card || data.upload_preg_card.length === 0)
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Karta ciąży jest wymagana dla zwolnienia ciążowego",
      path: ["upload_preg_card"],
    },
  )
  .refine(
    (data) => {
      if (data.q_chronic === "yes" && (!data.chronic_list || data.chronic_list.length === 0)) {
        return false;
      }
      return true;
    },
    {
      message: "Wybierz co najmniej jedną chorobę",
      path: ["chronic_list"],
    },
  )
  .refine(
    (data) => {
      if (data.q_chronic === "yes" && data.chronic_list?.includes("other") && !data.chronic_other_text) {
        return false;
      }
      return true;
    },
    {
      message: "Opisz inne choroby",
      path: ["chronic_other_text"],
    },
  )
  .refine(
    (data) => {
      if (data.q_allergy === "yes" && !data.allergy_text) {
        return false;
      }
      return true;
    },
    {
      message: "Podaj alergie",
      path: ["allergy_text"],
    },
  )
  .refine(
    (data) => {
      if (data.q_meds === "yes" && !data.meds_list) {
        return false;
      }
      return true;
    },
    {
      message: "Podaj listę leków",
      path: ["meds_list"],
    },
  )
  .refine(
    (data) => {
      if (data.q_long_leave === "yes" && (!data.upload_prev_docs || data.upload_prev_docs.length === 0)) {
        return false;
      }
      return true;
    },
    {
      message: "Dokumentacja poprzednich zwolnień jest wymagana",
      path: ["upload_prev_docs"],
    },
  );

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
  const pregCardInputRef = useRef<HTMLInputElement>(null);
  const prevDocsInputRef = useRef<HTMLInputElement>(null);
  const { pushEvent } = useDataLayer();

  // Check if this is a care leave (child or family member)
  const [isCareLeave, setIsCareLeave] = useState(false);
  const [isChildCare, setIsChildCare] = useState(false);
  const [patientName, setPatientName] = useState("");

  useEffect(() => {
    const savedLeaveData = localStorage.getItem("formData_rodzajZwolnienia");
    if (savedLeaveData) {
      const parsed = JSON.parse(savedLeaveData);
      if (parsed.leave_type === "care") {
        setIsCareLeave(true);
        setIsChildCare(true);
        setPatientName(parsed.care_first_name || "dziecka");
      } else if (parsed.leave_type === "care_family") {
        setIsCareLeave(true);
        setIsChildCare(false);
        setPatientName(parsed.care_family_first_name || "podopiecznego");
      }
    }
  }, []);

  // Get label for the patient based on leave type
  const getPatientLabel = () => {
    if (isChildCare) return "dziecka";
    if (isCareLeave) return "osoby chorej";
    return "";
  };

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
  const uploadPregCard = form.watch("upload_preg_card");
  const uploadPrevDocs = form.watch("upload_prev_docs");

  // Load saved data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem("formData_wywiadOgolny");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      // Don't restore file uploads
      delete parsed.upload_preg_card;
      delete parsed.upload_prev_docs;
      form.reset(parsed);
    }
  }, []);

  // Set default values for care leave (pregnancy and long leave questions not applicable)
  useEffect(() => {
    if (isCareLeave) {
      if (!form.getValues("q_pregnant")) {
        form.setValue("q_pregnant", "no");
      }
      if (!form.getValues("q_long_leave")) {
        form.setValue("q_long_leave", "no");
      }
    }
  }, [isCareLeave, form]);

  // Save data to localStorage on change
  useEffect(() => {
    const subscription = form.watch((value) => {
      // Don't save file uploads to localStorage
      const dataToSave = { ...value };
      delete dataToSave.upload_preg_card;
      delete dataToSave.upload_prev_docs;
      localStorage.setItem("formData_wywiadOgolny", JSON.stringify(dataToSave));
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const onSubmit = async (data: MedicalFormData) => {
    console.log("Wywiad ogólny:", data);
    pushEvent({
      event: "form_step_submit",
      form_name: "e_zwolnienie",
      step_number: 3,
      step_name: "wywiad_ogolny",
      has_chronic: data.q_chronic === "yes",
      takes_meds: data.q_meds === "yes",
    });
    toast.success("Dane zapisane");
    navigate("/wywiad-objawy");
  };

  // Helper function to get subject text based on leave type
  const getSubjectText = (forChildCare: string, forFamilyCare: string, forSelf: string) => {
    if (isChildCare) return forChildCare;
    if (isCareLeave) return forFamilyCare;
    return forSelf;
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <ProgressSteps currentStep={3} />

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {isCareLeave ? `Wywiad medyczny - stan zdrowia ${getPatientLabel()}` : "Wywiad medyczny - pytania ogólne"}
          </h1>
          <p className="text-muted-foreground">
            {isCareLeave
              ? `Odpowiedz na poniższe pytania dotyczące stanu zdrowia ${patientName}`
              : "Odpowiedz na poniższe pytania dotyczące Twojego stanu zdrowia"}
          </p>

          {isCareLeave && (
            <div className="mt-4 flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
              {isChildCare ? <Baby className="h-5 w-5 text-primary" /> : <Users className="h-5 w-5 text-primary" />}
              <span className="text-sm font-medium">
                Formularz dotyczy stanu zdrowia {getPatientLabel()}: <strong>{patientName}</strong>
              </span>
            </div>
          )}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Ciąża - tylko dla własnego zwolnienia (nie opieki) */}
            {!isCareLeave && (
              <Card>
                <CardHeader>
                  <CardTitle>Ciąża</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
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
                          render={({ field: { value, onChange, ...fieldProps } }) => (
                            <FormItem>
                              <FormLabel>Karta ciąży *</FormLabel>
                              <FormControl>
                                <div className="space-y-2">
                                  <Input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => onChange(e.target.files)}
                                    className="hidden"
                                    ref={pregCardInputRef}
                                  />
                                  <Button
                                    type="button"
                                    onClick={() => pregCardInputRef.current?.click()}
                                    className="w-full"
                                    size="lg"
                                  >
                                    <Upload className="mr-2 h-4 w-4" />
                                    Wybierz kartę ciąży
                                  </Button>
                                  {uploadPregCard && uploadPregCard.length > 0 && (
                                    <div className="text-sm text-muted-foreground">
                                      Wybrano: {uploadPregCard[0].name}
                                    </div>
                                  )}
                                </div>
                              </FormControl>
                              <p className="text-sm text-muted-foreground">Format: PDF, JPG, PNG (max 10MB)</p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Choroby przewlekłe */}
            <Card>
              <CardHeader>
                <CardTitle>Choroby przewlekłe</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="q_chronic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {getSubjectText(
                          `Czy ${patientName} cierpi na choroby przewlekłe? *`,
                          `Czy ${patientName} cierpi na choroby przewlekłe? *`,
                          "Czy cierpisz na choroby przewlekłe? *",
                        )}
                      </FormLabel>
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
              </CardContent>
            </Card>

            {/* Alergie */}
            <Card>
              <CardHeader>
                <CardTitle>Alergie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="q_allergy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {getSubjectText(
                          `Czy ${patientName} ma jakieś alergie? *`,
                          `Czy ${patientName} ma jakieś alergie? *`,
                          "Czy masz jakieś alergie? *",
                        )}
                      </FormLabel>
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
                        <FormLabel>
                          {getSubjectText(
                            "Wymień alergie dziecka *",
                            `Wymień alergie ${patientName} *`,
                            "Wymień alergie *",
                          )}
                        </FormLabel>
                        <FormControl>
                          <Textarea placeholder="Np. pyłki, orzechy, penicylina..." maxLength={500} {...field} />
                        </FormControl>
                        <p className="text-sm text-muted-foreground">{field.value?.length || 0}/500</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            {/* Leki */}
            <Card>
              <CardHeader>
                <CardTitle>Leki</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="q_meds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {getSubjectText(
                          `Czy ${patientName} bierze jakieś leki na stałe? *`,
                          `Czy ${patientName} bierze jakieś leki na stałe? *`,
                          "Czy bierzesz jakieś leki na stałe? *",
                        )}
                      </FormLabel>
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
                        <FormLabel>
                          {getSubjectText(
                            "Podaj leki przyjmowane przez dziecko *",
                            `Podaj leki przyjmowane przez ${patientName} *`,
                            "Podaj listę leków *",
                          )}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Nazwa leku, dawka, częstotliwość przyjmowania..."
                            maxLength={500}
                            {...field}
                          />
                        </FormControl>
                        <p className="text-sm text-muted-foreground">{field.value?.length || 0}/500</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            {/* Długotrwałe zwolnienie - nie dotyczy opieki nad dzieckiem */}
            {!isChildCare && (
              <Card>
                <CardHeader>
                  <CardTitle>Poprzednie zwolnienia</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="q_long_leave"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Czy w ciągu ostatniego roku miałeś/aś zwolnienia lekarskie przekraczające łącznie 33 dni? *
                        </FormLabel>
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
                      render={({ field: { value, onChange, ...fieldProps } }) => (
                        <FormItem>
                          <FormLabel>Dokumentacja poprzednich zwolnień *</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <Input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                multiple
                                onChange={(e) => onChange(e.target.files)}
                                className="hidden"
                                ref={prevDocsInputRef}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => prevDocsInputRef.current?.click()}
                                className="w-full"
                                size="lg"
                              >
                                <Upload className="mr-2 h-4 w-4" />
                                Wybierz dokumenty
                              </Button>
                              {uploadPrevDocs && uploadPrevDocs.length > 0 && (
                                <div className="text-sm text-muted-foreground">
                                  Wybrano:{" "}
                                  {Array.from(uploadPrevDocs)
                                    .map((f) => f.name)
                                    .join(", ")}
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <p className="text-sm text-muted-foreground">Format: PDF, JPG, PNG (max 10MB)</p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>
            )}

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate("/rodzaj-zwolnienia")} className="flex-1">
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
