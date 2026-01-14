import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useRef, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ProgressSteps } from "@/components/layout/ProgressSteps";
import { Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLanguageNavigation } from "@/hooks/useLanguageNavigation";

export default function WywiadOgolny() {
  const { t } = useTranslation(['forms', 'validation']);
  const { navigateToLocalized } = useLanguageNavigation();
  const pregCardInputRef = useRef<HTMLInputElement>(null);
  const prevDocsInputRef = useRef<HTMLInputElement>(null);

  // Create schema with translated messages
  const medicalSchema = useMemo(() => z.object({
    q_pregnant: z.enum(["yes", "no"], { required_error: t('validation:required') }),
    q_preg_leave: z.enum(["yes", "no"]).optional(),
    upload_preg_card: z.instanceof(FileList).optional(),
    
    q_chronic: z.enum(["yes", "no"], { required_error: t('validation:required') }),
    chronic_list: z.array(z.string()).optional(),
    chronic_other_text: z.string().max(200).optional(),
    
    q_allergy: z.enum(["yes", "no"], { required_error: t('validation:required') }),
    allergy_text: z.string().max(500).optional(),
    
    q_meds: z.enum(["yes", "no"], { required_error: t('validation:required') }),
    meds_list: z.string().max(500).optional(),
    
    q_long_leave: z.enum(["yes", "no"], { required_error: t('validation:required') }),
    upload_prev_docs: z.instanceof(FileList).optional(),
  }).refine((data) => {
    if (data.q_pregnant === "yes" && data.q_preg_leave === "yes" && (!data.upload_preg_card || data.upload_preg_card.length === 0)) {
      return false;
    }
    return true;
  }, {
    message: t('validation:required'),
    path: ["upload_preg_card"],
  }).refine((data) => {
    if (data.q_chronic === "yes" && (!data.chronic_list || data.chronic_list.length === 0)) {
      return false;
    }
    return true;
  }, {
    message: t('validation:required'),
    path: ["chronic_list"],
  }).refine((data) => {
    if (data.q_chronic === "yes" && data.chronic_list?.includes("other") && !data.chronic_other_text) {
      return false;
    }
    return true;
  }, {
    message: t('validation:required'),
    path: ["chronic_other_text"],
  }).refine((data) => {
    if (data.q_allergy === "yes" && !data.allergy_text) {
      return false;
    }
    return true;
  }, {
    message: t('validation:required'),
    path: ["allergy_text"],
  }).refine((data) => {
    if (data.q_meds === "yes" && !data.meds_list) {
      return false;
    }
    return true;
  }, {
    message: t('validation:required'),
    path: ["meds_list"],
  }).refine((data) => {
    if (data.q_long_leave === "yes" && (!data.upload_prev_docs || data.upload_prev_docs.length === 0)) {
      return false;
    }
    return true;
  }, {
    message: t('validation:required'),
    path: ["upload_prev_docs"],
  }), [t]);

  type MedicalFormData = z.infer<typeof medicalSchema>;

  const chronicDiseases = [
    { id: "autoimmune", label: t('forms:generalInterview.chronicDiseases.diseases.autoimmune') },
    { id: "respiratory", label: t('forms:generalInterview.chronicDiseases.diseases.respiratory') },
    { id: "diabetes", label: t('forms:generalInterview.chronicDiseases.diseases.diabetes') },
    { id: "circulatory", label: t('forms:generalInterview.chronicDiseases.diseases.circulatory') },
    { id: "cancer", label: t('forms:generalInterview.chronicDiseases.diseases.cancer') },
    { id: "osteoporosis", label: t('forms:generalInterview.chronicDiseases.diseases.osteoporosis') },
    { id: "epilepsy", label: t('forms:generalInterview.chronicDiseases.diseases.epilepsy') },
    { id: "aids", label: t('forms:generalInterview.chronicDiseases.diseases.aids') },
    { id: "obesity", label: t('forms:generalInterview.chronicDiseases.diseases.obesity') },
    { id: "other", label: t('forms:generalInterview.chronicDiseases.diseases.other') },
  ];
  
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
    const savedData = localStorage.getItem('formData_wywiadOgolny');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      // Don't restore file uploads
      delete parsed.upload_preg_card;
      delete parsed.upload_prev_docs;
      form.reset(parsed);
    }
  }, []);

  // Save data to localStorage on change
  useEffect(() => {
    const subscription = form.watch((value) => {
      // Don't save file uploads to localStorage
      const dataToSave = { ...value };
      delete dataToSave.upload_preg_card;
      delete dataToSave.upload_prev_docs;
      localStorage.setItem('formData_wywiadOgolny', JSON.stringify(dataToSave));
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const onSubmit = async (data: MedicalFormData) => {
    console.log("Wywiad ogólny:", data);
    toast.success(t('forms:common.dataSaved'));
    navigateToLocalized('/wywiad-objawy');
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <ProgressSteps currentStep={3} />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('forms:generalInterview.title')}</h1>
          <p className="text-muted-foreground">{t('forms:generalInterview.subtitle')}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Pregnancy */}
            <Card>
              <CardHeader>
                <CardTitle>{t('forms:generalInterview.pregnancy.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="q_pregnant"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('forms:generalInterview.pregnancy.areYouPregnant')} *</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="preg_yes" />
                            <Label htmlFor="preg_yes">{t('forms:common.yes')}</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="preg_no" />
                            <Label htmlFor="preg_no">{t('forms:common.no')}</Label>
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
                          <FormLabel>{t('forms:generalInterview.pregnancy.needPregnancyLeave')} *</FormLabel>
                          <FormControl>
                            <RadioGroup onValueChange={field.onChange} value={field.value}>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="preg_leave_yes" />
                                <Label htmlFor="preg_leave_yes">{t('forms:common.yes')}</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="preg_leave_no" />
                                <Label htmlFor="preg_leave_no">{t('forms:common.no')}</Label>
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
                            <FormLabel>{t('forms:generalInterview.pregnancy.pregnancyCard')} *</FormLabel>
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
                                  {t('forms:generalInterview.pregnancy.selectCard')}
                                </Button>
                                {uploadPregCard && uploadPregCard.length > 0 && (
                                  <div className="text-sm text-muted-foreground">
                                    {uploadPregCard[0].name}
                                  </div>
                                )}
                              </div>
                            </FormControl>
                            <p className="text-sm text-muted-foreground">{t('forms:generalInterview.pregnancy.cardFormat')}</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Chronic Diseases */}
            <Card>
              <CardHeader>
                <CardTitle>{t('forms:generalInterview.chronicDiseases.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="q_chronic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('forms:generalInterview.chronicDiseases.haveChronicDiseases')} *</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="chronic_yes" />
                            <Label htmlFor="chronic_yes">{t('forms:common.yes')}</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="chronic_no" />
                            <Label htmlFor="chronic_no">{t('forms:common.no')}</Label>
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
                          <FormLabel>{t('forms:generalInterview.chronicDiseases.selectDiseases')} *</FormLabel>
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
                            <FormLabel>{t('forms:generalInterview.chronicDiseases.describeOther')} *</FormLabel>
                            <FormControl>
                              <Textarea placeholder={t('forms:generalInterview.chronicDiseases.describeOtherPlaceholder')} maxLength={200} {...field} />
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

            {/* Allergies */}
            <Card>
              <CardHeader>
                <CardTitle>{t('forms:generalInterview.allergies.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="q_allergy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('forms:generalInterview.allergies.haveAllergies')} *</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="allergy_yes" />
                            <Label htmlFor="allergy_yes">{t('forms:common.yes')}</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="allergy_no" />
                            <Label htmlFor="allergy_no">{t('forms:common.no')}</Label>
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
                        <FormLabel>{t('forms:generalInterview.allergies.listAllergies')} *</FormLabel>
                        <FormControl>
                          <Textarea placeholder={t('forms:generalInterview.allergies.listAllergiesPlaceholder')} maxLength={500} {...field} />
                        </FormControl>
                        <p className="text-sm text-muted-foreground">{field.value?.length || 0}/500</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            {/* Medications */}
            <Card>
              <CardHeader>
                <CardTitle>{t('forms:generalInterview.medications.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="q_meds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('forms:generalInterview.medications.takeMedications')} *</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="meds_yes" />
                            <Label htmlFor="meds_yes">{t('forms:common.yes')}</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="meds_no" />
                            <Label htmlFor="meds_no">{t('forms:common.no')}</Label>
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
                        <FormLabel>{t('forms:generalInterview.medications.listMedications')} *</FormLabel>
                        <FormControl>
                          <Textarea placeholder={t('forms:generalInterview.medications.listMedicationsPlaceholder')} maxLength={500} {...field} />
                        </FormControl>
                        <p className="text-sm text-muted-foreground">{field.value?.length || 0}/500</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            {/* Previous Leave */}
            <Card>
              <CardHeader>
                <CardTitle>{t('forms:generalInterview.previousLeave.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="q_long_leave"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('forms:generalInterview.previousLeave.hadLongLeave')} *</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} value={field.value}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="long_leave_yes" />
                            <Label htmlFor="long_leave_yes">{t('forms:common.yes')}</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="long_leave_no" />
                            <Label htmlFor="long_leave_no">{t('forms:common.no')}</Label>
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
                        <FormLabel>{t('forms:generalInterview.previousLeave.uploadDocs')} *</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <Input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => onChange(e.target.files)}
                              className="hidden"
                              ref={prevDocsInputRef}
                            />
                            <Button
                              type="button"
                              onClick={() => prevDocsInputRef.current?.click()}
                              className="w-full"
                              size="lg"
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              {t('forms:generalInterview.previousLeave.selectDocs')}
                            </Button>
                            {uploadPrevDocs && uploadPrevDocs.length > 0 && (
                              <div className="text-sm text-muted-foreground">
                                {uploadPrevDocs[0].name}
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <p className="text-sm text-muted-foreground">{t('forms:generalInterview.previousLeave.docsFormat')}</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => navigateToLocalized('/rodzaj-zwolnienia')} className="flex-1">
                {t('forms:common.back')}
              </Button>
              <Button type="submit" className="flex-1">
                {t('forms:common.next')}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}