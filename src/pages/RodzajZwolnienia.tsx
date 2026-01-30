import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Plus, X, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ProgressSteps } from "@/components/layout/ProgressSteps";

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

const leaveTypeSchema = z.discriminatedUnion("leave_type", [
  z.object({
    leave_type: z.literal("pl_employer"),
    nips: z.array(z.string().refine(validateNIP, "Nieprawidłowy NIP")).min(1, "Wymagany co najmniej jeden NIP"),
  }),
  z.object({
    leave_type: z.literal("uniformed"),
    uniformed_service_name: z.string().min(1, "Nazwa formacji jest wymagana").max(100),
    uniformed_nip: z.string().refine(validateNIP, "Nieprawidłowy NIP"),
  }),
  z.object({
    leave_type: z.literal("student"),
    student_ack: z.literal(true, { errorMap: () => ({ message: "Potwierdzenie jest wymagane" }) }),
  }),
  z.object({
    leave_type: z.literal("foreign_employer"),
  }),
  z.object({
    leave_type: z.literal("care"),
    care_nips: z.array(z.string().refine(validateNIP, "Nieprawidłowy NIP")).min(1, "Wymagany co najmniej jeden NIP"),
    care_first_name: z.string().min(1, "Imię jest wymagane").max(50),
    care_last_name: z.string().min(1, "Nazwisko jest wymagane").max(50),
    care_pesel: z.string().refine(validatePESEL, "Nieprawidłowy PESEL"),
  }),
  z.object({
    leave_type: z.literal("krus"),
    krus_number: z.string().min(1, "Numer KRUS jest wymagany").max(20, "Maksymalnie 20 znaków"),
  }),
  z.object({
    leave_type: z.literal("care_family"),
    care_family_nips: z.array(z.string().refine(validateNIP, "Nieprawidłowy NIP")).min(1, "Wymagany co najmniej jeden NIP"),
    care_family_first_name: z.string().min(1, "Imię jest wymagane").max(50),
    care_family_last_name: z.string().min(1, "Nazwisko jest wymagane").max(50),
    care_family_pesel: z.string().refine(validatePESEL, "Nieprawidłowy PESEL"),
  }),
]);

type LeaveTypeFormData = z.infer<typeof leaveTypeSchema>;

export default function RodzajZwolnienia() {
  const navigate = useNavigate();
  const [employerNips, setEmployerNips] = useState<string[]>([""]);
  const [careNips, setCareNips] = useState<string[]>([""]);
  const [careFamilyNips, setCareFamilyNips] = useState<string[]>([""]);
  const [showStudentDialog, setShowStudentDialog] = useState(false);
  
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
      
      // Migrate old care_family_nip (string) to care_family_nips (array)
      if (parsed.leave_type === "care_family" && parsed.care_family_nip && !parsed.care_family_nips) {
        parsed.care_family_nips = [parsed.care_family_nip];
        delete parsed.care_family_nip;
      }
      
      form.reset(parsed);
      
      if (parsed.leave_type === "pl_employer" && Array.isArray(parsed.nips) && parsed.nips.length > 0) {
        setEmployerNips(parsed.nips);
      }
      if (parsed.leave_type === "care" && Array.isArray(parsed.care_nips) && parsed.care_nips.length > 0) {
        setCareNips(parsed.care_nips);
      }
      if (parsed.leave_type === "care_family" && Array.isArray(parsed.care_family_nips) && parsed.care_family_nips.length > 0) {
        setCareFamilyNips(parsed.care_family_nips);
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
    toast.success("Dane zapisane");
    navigate("/wywiad-ogolny");
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

  const addCareFamilyNip = () => {
    setCareFamilyNips([...careFamilyNips, ""]);
  };

  const removeCareFamilyNip = (index: number) => {
    const newNips = careFamilyNips.filter((_, i) => i !== index);
    setCareFamilyNips(newNips);
    form.setValue("care_family_nips", newNips.filter(n => n), { shouldValidate: true, shouldDirty: true });
  };

  const updateCareFamilyNip = (index: number, value: string) => {
    const newNips = [...careFamilyNips];
    newNips[index] = value;
    setCareFamilyNips(newNips);
    form.setValue("care_family_nips", newNips.filter(n => n), { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <ProgressSteps currentStep={2} />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Rodzaj zwolnienia</h1>
          <p className="text-muted-foreground">Wybierz typ zwolnienia, którego potrzebujesz</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="leave_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Typ zwolnienia *</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} value={field.value}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pl_employer" id="pl_employer" />
                        <Label htmlFor="pl_employer">Zwolnienie dla ubezpieczonych w ZUS</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="care" id="care" />
                        <Label htmlFor="care">Zwolnienie na dziecko</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="student" id="student" />
                        <Label htmlFor="student">Student/Uczeń</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="uniformed" id="uniformed" />
                        <Label htmlFor="uniformed">Służby mundurowe/Studenci służb mundurowych</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="foreign_employer" id="foreign_employer" />
                        <Label htmlFor="foreign_employer">Pracodawca zagraniczny</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="care_family" id="care_family" />
                        <Label htmlFor="care_family">Opieka nad członkiem rodziny</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="krus" id="krus" />
                        <Label htmlFor="krus">Ubezpieczeni w KRUS</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {leaveType === "pl_employer" && (
              <div className="space-y-4">
                <div className="flex items-center gap-1">
                  <Label>NIP pracodawcy *</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger type="button" className="text-muted-foreground hover:text-foreground">
                        <HelpCircle className="h-4 w-4" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Osoby prowadzące własną działalność gospodarczą powinny podać numer NIP swojej działalności.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
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
                  <Plus className="h-4 w-4 mr-2" /> Dodaj pracodawcę
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
                      <FormLabel>Nazwa formacji *</FormLabel>
                      <FormControl>
                        <Input placeholder="Np. Policja, Straż Pożarna..." maxLength={100} {...field} />
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
                      <FormLabel>NIP *</FormLabel>
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
                  Zwolnienie nie zostanie wysłane do pracodawcy. Po akceptacji lekarza otrzymasz dokument PDF do pobrania.
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
                      <FormLabel className="!mt-0">Potwierdzam, że rozumiem *</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {leaveType === "care" && (
              <>
                <div className="space-y-4">
                  <div className="flex items-center gap-1">
                    <Label>NIP pracodawcy *</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger type="button" className="text-muted-foreground hover:text-foreground">
                          <HelpCircle className="h-4 w-4" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Osoby prowadzące własną działalność gospodarczą powinny podać numer NIP swojej działalności.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
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
                    <Plus className="h-4 w-4 mr-2" /> Dodaj pracodawcę
                  </Button>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold">Dane osoby chorej</h3>
                  <FormField
                    control={form.control}
                    name="care_first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Imię *</FormLabel>
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
                        <FormLabel>Nazwisko *</FormLabel>
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
                        <FormLabel>PESEL *</FormLabel>
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

            {leaveType === "krus" && (
              <FormField
                control={form.control}
                name="krus_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numer KRUS *</FormLabel>
                    <FormControl>
                      <Input placeholder="Wprowadź numer KRUS" maxLength={20} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {leaveType === "care_family" && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="care_family_nips"
                  render={() => (
                    <FormItem>
                      <div className="flex items-center gap-1">
                        <FormLabel>NIP pracodawcy *</FormLabel>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger type="button" className="text-muted-foreground hover:text-foreground">
                              <HelpCircle className="h-4 w-4" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>Osoby prowadzące własną działalność gospodarczą powinny podać numer NIP swojej działalności.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="space-y-2">
                        {careFamilyNips.map((nip, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              placeholder="0000000000"
                              maxLength={10}
                              value={nip}
                              onChange={(e) => updateCareFamilyNip(index, e.target.value.replace(/\D/g, ''))}
                            />
                            {careFamilyNips.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => removeCareFamilyNip(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addCareFamilyNip}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Dodaj pracodawcę
                      </Button>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-4">Dane osoby chorej</h3>
                <FormField
                  control={form.control}
                  name="care_family_first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Imię *</FormLabel>
                      <FormControl>
                        <Input placeholder="Jan" maxLength={50} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="care_family_last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nazwisko *</FormLabel>
                      <FormControl>
                        <Input placeholder="Kowalski" maxLength={50} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="care_family_pesel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PESEL *</FormLabel>
                      <FormControl>
                        <Input placeholder="00000000000" maxLength={11} {...field} onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate("/daty-choroby")} className="flex-1">
                Wstecz
              </Button>
              <Button type="submit" className="flex-1">
                Dalej
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <AlertDialog open={showStudentDialog} onOpenChange={setShowStudentDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Informacja dla studentów/uczniów</AlertDialogTitle>
            <AlertDialogDescription>
              Zwolnienie nie zostanie wysłane do pracodawcy. Po akceptacji lekarza otrzymasz dokument PDF, który możesz pobrać i wykorzystać według potrzeb.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button onClick={() => setShowStudentDialog(false)}>Rozumiem</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}