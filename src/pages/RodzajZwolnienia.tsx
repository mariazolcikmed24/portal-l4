import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect, useMemo } from "react";
import { Plus, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ProgressSteps } from "@/components/layout/ProgressSteps";
import { useLanguageNavigation } from "@/hooks/useLanguageNavigation";

const validateNIP = (nip: string): boolean => {
  if (!/^\d{10}$/.test(nip)) return false;
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  const sum = nip.split('').slice(0, 9).reduce((acc, digit, i) => acc + parseInt(digit) * weights[i], 0);
  return sum % 11 === parseInt(nip[9]);
};

const validatePESEL = (pesel: string): boolean => {
  if (!/^\d{11}$/.test(pesel)) return false;
  const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
  const sum = pesel.split('').slice(0, 10).reduce((acc, digit, i) => acc + parseInt(digit) * weights[i], 0);
  return (10 - (sum % 10)) % 10 === parseInt(pesel[10]);
};

export default function RodzajZwolnienia() {
  const { t } = useTranslation(['forms', 'validation']);
  const { navigateToLocalized } = useLanguageNavigation();
  const [employerNips, setEmployerNips] = useState<string[]>([""]);
  const [careNips, setCareNips] = useState<string[]>([""]);
  const [showStudentDialog, setShowStudentDialog] = useState(false);

  // Create schema with translated messages
  const leaveTypeSchema = useMemo(() => z.discriminatedUnion("leave_type", [
    z.object({
      leave_type: z.literal("pl_employer"),
      nips: z.array(z.string().refine(validateNIP, t('validation:pesel.invalid'))).min(1, t('validation:required')),
    }),
    z.object({
      leave_type: z.literal("uniformed"),
      uniformed_service_name: z.string().min(1, t('validation:required')).max(100),
      uniformed_nip: z.string().refine(validateNIP, t('validation:pesel.invalid')),
    }),
    z.object({
      leave_type: z.literal("student"),
      student_ack: z.literal(true, { errorMap: () => ({ message: t('validation:required') }) }),
    }),
    z.object({
      leave_type: z.literal("foreign_employer"),
    }),
    z.object({
      leave_type: z.literal("care"),
      care_nips: z.array(z.string().refine(validateNIP, t('validation:pesel.invalid'))).min(1, t('validation:required')),
      care_first_name: z.string().min(1, t('validation:firstName.required')).max(50),
      care_last_name: z.string().min(1, t('validation:lastName.required')).max(50),
      care_pesel: z.string().refine(validatePESEL, t('validation:pesel.invalid')),
    }),
  ]), [t]);

  type LeaveTypeFormData = z.infer<typeof leaveTypeSchema>;
  
  const form = useForm<LeaveTypeFormData>({
    resolver: zodResolver(leaveTypeSchema),
    defaultValues: {
      leave_type: "pl_employer",
      nips: [],
    },
  });

  const leaveType = form.watch("leave_type");

  // Load saved data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('formData_rodzajZwolnienia');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      form.reset(parsed);
      if (parsed.nips && parsed.nips.length > 0) {
        if (parsed.leave_type === "pl_employer") {
          setEmployerNips(parsed.nips);
        } else if (parsed.leave_type === "pl_care") {
          setCareNips(parsed.nips);
        }
      }
    }
  }, []);

  // Save data to localStorage on change
  useEffect(() => {
    const subscription = form.watch((value) => {
      localStorage.setItem('formData_rodzajZwolnienia', JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const onSubmit = async (data: LeaveTypeFormData) => {
    console.log("Rodzaj zwolnienia:", data);
    toast.success(t('forms:common.dataSaved'));
    navigateToLocalized('/wywiad-ogolny');
  };

  const addEmployerNip = () => {
    setEmployerNips([...employerNips, ""]);
  };

  const removeEmployerNip = (index: number) => {
    const newNips = employerNips.filter((_, i) => i !== index);
    setEmployerNips(newNips);
    form.setValue("nips", newNips.filter(n => n), { shouldValidate: true, shouldDirty: true });
  };

  const updateEmployerNip = (index: number, value: string) => {
    const newNips = [...employerNips];
    newNips[index] = value;
    setEmployerNips(newNips);
    form.setValue("nips", newNips.filter(n => n), { shouldValidate: true, shouldDirty: true });
  };

  const addCareNip = () => {
    setCareNips([...careNips, ""]);
  };

  const removeCareNip = (index: number) => {
    const newNips = careNips.filter((_, i) => i !== index);
    setCareNips(newNips);
    form.setValue("care_nips", newNips.filter(n => n), { shouldValidate: true, shouldDirty: true });
  };

  const updateCareNip = (index: number, value: string) => {
    const newNips = [...careNips];
    newNips[index] = value;
    setCareNips(newNips);
    form.setValue("care_nips", newNips.filter(n => n), { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <ProgressSteps currentStep={2} />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('forms:leaveType.title')}</h1>
          <p className="text-muted-foreground">{t('forms:leaveType.subtitle')}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="leave_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('forms:leaveType.typeLabel')} *</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} value={field.value}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pl_employer" id="pl_employer" />
                        <Label htmlFor="pl_employer">{t('forms:leaveType.types.pl_employer')}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="uniformed" id="uniformed" />
                        <Label htmlFor="uniformed">{t('forms:leaveType.types.uniformed')}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="student" id="student" />
                        <Label htmlFor="student">{t('forms:leaveType.types.student')}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="foreign_employer" id="foreign_employer" />
                        <Label htmlFor="foreign_employer">{t('forms:leaveType.types.foreign_employer')}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="care" id="care" />
                        <Label htmlFor="care">{t('forms:leaveType.types.care')}</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {leaveType === "pl_employer" && (
              <div className="space-y-4">
                <Label>{t('forms:leaveType.employerNip')} *</Label>
                {employerNips.map((nip, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="0000000000"
                      maxLength={10}
                      value={nip}
                      onChange={(e) => updateEmployerNip(index, e.target.value.replace(/\D/g, ''))}
                    />
                    {employerNips.length > 1 && (
                      <Button type="button" variant="outline" size="icon" onClick={() => removeEmployerNip(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {(form.formState.errors as any)?.nips?.root?.message && (
                  <p className="text-sm text-destructive">{(form.formState.errors as any).nips.root.message}</p>
                )}
                {(form.formState.errors as any)?.nips?.[0]?.message && (
                  <p className="text-sm text-destructive">{(form.formState.errors as any).nips[0].message}</p>
                )}
                <Button type="button" variant="outline" onClick={addEmployerNip} className="w-full">
                  <Plus className="h-4 w-4 mr-2" /> {t('forms:leaveType.addEmployer')}
                </Button>
              </div>
            )}

            {leaveType === "uniformed" && (
              <>
                <FormField
                  control={form.control}
                  name="uniformed_service_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('forms:leaveType.serviceName')} *</FormLabel>
                      <FormControl>
                        <Input placeholder={t('forms:leaveType.serviceNamePlaceholder')} maxLength={100} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="uniformed_nip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('forms:leaveType.nip')} *</FormLabel>
                      <FormControl>
                        <Input placeholder="0000000000" maxLength={10} {...field} onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {leaveType === "student" && (
              <div className="p-4 border rounded-lg bg-muted/50">
                <p className="text-sm mb-4">
                  {t('forms:leaveType.studentInfo')}
                </p>
                <FormField
                  control={form.control}
                  name="student_ack"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="h-4 w-4"
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">{t('forms:leaveType.studentConfirm')} *</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {leaveType === "care" && (
              <>
                <div className="space-y-4">
                  <Label>{t('forms:leaveType.employerNip')} *</Label>
                  {careNips.map((nip, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="0000000000"
                        maxLength={10}
                        value={nip}
                        onChange={(e) => updateCareNip(index, e.target.value.replace(/\D/g, ''))}
                      />
                      {careNips.length > 1 && (
                        <Button type="button" variant="outline" size="icon" onClick={() => removeCareNip(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {(form.formState.errors as any)?.care_nips?.root?.message && (
                    <p className="text-sm text-destructive">{(form.formState.errors as any).care_nips.root.message}</p>
                  )}
                  {(form.formState.errors as any)?.care_nips?.[0]?.message && (
                    <p className="text-sm text-destructive">{(form.formState.errors as any).care_nips[0].message}</p>
                  )}
                  <Button type="button" variant="outline" onClick={addCareNip} className="w-full">
                    <Plus className="h-4 w-4 mr-2" /> {t('forms:leaveType.addEmployer')}
                  </Button>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold">{t('forms:leaveType.carePersonData')}</h3>
                  <FormField
                    control={form.control}
                    name="care_first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('forms:leaveType.firstName')} *</FormLabel>
                        <FormControl>
                          <Input placeholder="Jan" maxLength={50} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="care_last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('forms:leaveType.lastName')} *</FormLabel>
                        <FormControl>
                          <Input placeholder="Kowalski" maxLength={50} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="care_pesel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('forms:leaveType.pesel')} *</FormLabel>
                        <FormControl>
                          <Input placeholder="00000000000" maxLength={11} {...field} onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => navigateToLocalized('/daty-choroby')} className="flex-1">
                {t('forms:common.back')}
              </Button>
              <Button type="submit" className="flex-1">
                {t('forms:common.next')}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <AlertDialog open={showStudentDialog} onOpenChange={setShowStudentDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('forms:leaveType.studentDialogTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('forms:leaveType.studentDialogDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button onClick={() => setShowStudentDialog(false)}>{t('forms:leaveType.understand')}</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}