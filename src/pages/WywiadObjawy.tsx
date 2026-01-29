import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ProgressSteps } from "@/components/layout/ProgressSteps";
import { Upload, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const symptomsSchema = z.object({
  main_category: z.enum([
    "cold_pain",
    "gastro",
    "bladder",
    "injury",
    "menstruation",
    "back_pain",
    "eye",
    "migraine",
    "acute_stress",
    "psych",
  ], { required_error: "Kategoria jest wymagana" }),
  
  symptom_duration: z.enum(["today", "yesterday", "2_3", "4_5", "gt_5"], { required_error: "Czas trwania jest wymagany" }),
  
  symptoms: z.array(z.string()).optional(),
  
  free_text_reason: z.string()
    .min(1, "Opis jest wymagany")
    .max(1500, "Opis nie może przekraczać 1500 znaków"),
});

type SymptomsFormData = z.infer<typeof symptomsSchema>;

interface UploadedFile {
  path: string;
  name: string;
}

const categories = [
  { value: "cold_pain", label: "Przeziębienie lub bóle" },
  { value: "gastro", label: "Zatrucie i problemy żołądkowe" },
  { value: "bladder", label: "Problemy z pęcherzem" },
  { value: "injury", label: "Urazy" },
  { value: "menstruation", label: "Menstruacja / miesiączka" },
  { value: "back_pain", label: "Bóle pleców" },
  { value: "eye", label: "Problemy z oczami" },
  { value: "migraine", label: "Migrena" },
  { value: "acute_stress", label: "Ostre reakcje na stres" },
  { value: "psych", label: "Problemy psychologiczne" },
];

const symptomsByCategory: Record<string, { id: string; label: string }[]> = {
  cold_pain: [
    { id: "fever", label: "Gorączka >38°C" },
    { id: "fatigue", label: "Zmęczenie" },
    { id: "dizziness", label: "Zawroty głowy" },
    { id: "chills", label: "Dreszcze" },
    { id: "swollen_tonsils", label: "Spuchnięte migdałki" },
    { id: "runny_nose", label: "Katar" },
    { id: "sinus_pain", label: "Ból zatok" },
    { id: "sinus_pressure", label: "Ucisk w okolicy zatok" },
    { id: "cough", label: "Kaszel" },
    { id: "hoarseness", label: "Chrypka" },
    { id: "sore_throat", label: "Ból gardła" },
    { id: "muscle_pain", label: "Ból mięśni" },
    { id: "chest_heaviness", label: "Uczucie ciężkości w klatce piersiowej" },
  ],
  gastro: [
    { id: "no_appetite", label: "Brak apetytu" },
    { id: "diarrhea", label: "Biegunka" },
    { id: "food_poisoning", label: "Zatrucie pokarmowe" },
    { id: "vomiting", label: "Wymioty" },
    { id: "abdominal_pain", label: "Ból brzucha" },
  ],
  bladder: [
    { id: "frequent_urination", label: "Częste oddawanie moczu" },
    { id: "painful_urination", label: "Bolesne oddawanie moczu" },
    { id: "bladder_pain", label: "Ból pęcherza" },
    { id: "urge", label: "Parcie na mocz" },
    { id: "oliguria", label: "Skąpomocz" },
  ],
  injury: [
    { id: "head", label: "Głowa i czaszka" },
    { id: "neck", label: "Szyja" },
    { id: "spine", label: "Kręgosłup" },
    { id: "chest", label: "Klatka piersiowa" },
    { id: "abdomen", label: "Brzuch" },
    { id: "pelvis", label: "Miednica" },
    { id: "shoulder", label: "Barki i ramię" },
    { id: "forearm", label: "Przedramię" },
    { id: "elbow", label: "Łokieć" },
    { id: "hand", label: "Ręka/nadgarstek" },
    { id: "hip", label: "Biodro" },
    { id: "thigh", label: "Udo" },
    { id: "knee", label: "Kolano" },
    { id: "shin", label: "Podudzie" },
    { id: "ankle", label: "Staw skokowy/stopa" },
  ],
  menstruation: [
    { id: "severe_pain", label: "Silne bóle miesiączkowe" },
    { id: "heavy_bleeding", label: "Obfite krwawienie" },
    { id: "irritation", label: "Rozdrażnienie" },
    { id: "painful_start", label: "Bolesny początek miesiączki" },
  ],
  back_pain: [
    { id: "back_spine", label: "Ból pleców/kręgosłupa" },
    { id: "sciatica", label: "Rwa kulszowa" },
    { id: "shoulder_radiculopathy", label: "Rwa barkowa" },
    { id: "cervical_pain", label: "Ból w odcinku szyjnym" },
    { id: "thoracic_pain", label: "Ból w odcinku piersiowym" },
    { id: "upper_limb_radiation", label: "Promieniowanie do kończyny górnej" },
    { id: "lower_limb_radiation", label: "Promieniowanie do kończyny dolnej" },
    { id: "tingling", label: "Mrowienie w kończynach" },
    { id: "sitting_pain", label: "Ból w pozycji siedzącej" },
    { id: "lumbar_pain", label: "Ból w odcinku lędźwiowo-krzyżowym" },
    { id: "lifting_problem", label: "Problem z podnoszeniem ciężkich przedmiotów" },
    { id: "standing_pain", label: "Ból w pozycji stojącej" },
  ],
  eye: [
    { id: "burning", label: "Pieczenie" },
    { id: "redness", label: "Zaczerwienienie oczu" },
    { id: "tearing", label: "Łzawienie" },
    { id: "gritty", label: "Uczucie piasku pod powiekami" },
    { id: "discharge", label: "Ropa w oczach" },
  ],
  migraine: [
    { id: "photophobia", label: "Światłowstręt" },
    { id: "confusion", label: "Rozkojarzenie" },
    { id: "history", label: "Migrena rozpoznana w przeszłości" },
  ],
  acute_stress: [
    { id: "family_problems", label: "Problemy rodzinne" },
    { id: "divorce", label: "Stres (rozwód)" },
    { id: "family_issues", label: "Stres (problemy rodzinne)" },
    { id: "death", label: "Stres (śmierć bliskiej osoby)" },
    { id: "work", label: "Stres (praca)" },
    { id: "job_loss", label: "Stres (utrata pracy)" },
  ],
  psych: [
    { id: "family_problems", label: "Problemy rodzinne" },
    { id: "divorce", label: "Stres (rozwód)" },
    { id: "family_issues", label: "Stres (problemy rodzinne)" },
    { id: "death", label: "Stres (śmierć bliskiej osoby)" },
    { id: "work", label: "Stres (praca)" },
    { id: "job_loss", label: "Stres (utrata pracy)" },
  ],
};

export default function WywiadObjawy() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const form = useForm<SymptomsFormData>({
    resolver: zodResolver(symptomsSchema),
  });

  const mainCategory = form.watch("main_category");

  // Load saved data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('formData_wywiadObjawy');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      form.reset(parsed);
    }
    
    // Load uploaded files from localStorage
    const savedFiles = localStorage.getItem('uploadedFiles_attachments');
    if (savedFiles) {
      setUploadedFiles(JSON.parse(savedFiles));
    }
  }, []);

  // Save data to localStorage on change
  useEffect(() => {
    const subscription = form.watch((value) => {
      localStorage.setItem('formData_wywiadObjawy', JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    if (uploadedFiles.length + files.length > 3) {
      toast.error("Maksymalnie możesz załączyć 3 pliki");
      return;
    }
    
    setIsUploading(true);
    const newUploadedFiles: UploadedFile[] = [];
    
    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`Plik ${file.name} jest za duży (max 10MB)`);
        continue;
      }
      
      try {
        // Generate unique path
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(7);
        const filePath = `attachments/${timestamp}-${randomId}-${file.name}`;
        
        console.log(`Uploading file: ${file.name} to ${filePath}`);
        
        const { error: uploadError } = await supabase.storage
          .from('case-attachments')
          .upload(filePath, file);
        
        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error(`Błąd przesyłania pliku ${file.name}`);
          continue;
        }
        
        newUploadedFiles.push({ path: filePath, name: file.name });
        console.log(`Successfully uploaded: ${file.name}`);
      } catch (error) {
        console.error('Error uploading file:', error);
        toast.error(`Błąd przesyłania pliku ${file.name}`);
      }
    }
    
    if (newUploadedFiles.length > 0) {
      const allFiles = [...uploadedFiles, ...newUploadedFiles];
      setUploadedFiles(allFiles);
      localStorage.setItem('uploadedFiles_attachments', JSON.stringify(allFiles));
      toast.success(`Przesłano ${newUploadedFiles.length} plik(ów)`);
    }
    
    setIsUploading(false);
  };

  const handleRemoveFile = async (filePath: string) => {
    try {
      await supabase.storage
        .from('case-attachments')
        .remove([filePath]);
      
      const updatedFiles = uploadedFiles.filter(f => f.path !== filePath);
      setUploadedFiles(updatedFiles);
      localStorage.setItem('uploadedFiles_attachments', JSON.stringify(updatedFiles));
      toast.success("Plik usunięty");
    } catch (error) {
      console.error('Error removing file:', error);
      toast.error("Błąd usuwania pliku");
    }
  };

  const onSubmit = async (data: SymptomsFormData) => {
    console.log("Wywiad objawy:", data);
    toast.success("Dane zapisane");
    navigate("/podsumowanie");
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <ProgressSteps currentStep={4} />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Wywiad medyczny - objawy</h1>
          <p className="text-muted-foreground">Opisz swoją główną dolegliwość i objawy</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="main_category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategoria głównej dolegliwości *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz kategorię" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="symptom_duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Czas trwania objawów *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz czas trwania" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="today">Dzisiaj</SelectItem>
                      <SelectItem value="yesterday">Wczoraj</SelectItem>
                      <SelectItem value="2_3">2-3 dni</SelectItem>
                      <SelectItem value="4_5">4-5 dni</SelectItem>
                      <SelectItem value="gt_5">Ponad 5 dni</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {mainCategory && symptomsByCategory[mainCategory] && (
              <FormField
                control={form.control}
                name="symptoms"
                render={() => (
                  <FormItem>
                    <FormLabel>Wybierz objawy (opcjonalnie)</FormLabel>
                    <div className="space-y-2 max-h-64 overflow-y-auto border rounded-md p-4">
                      {symptomsByCategory[mainCategory].map((symptom) => (
                        <FormField
                          key={symptom.id}
                          control={form.control}
                          name="symptoms"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(symptom.id)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value || [];
                                    const updated = checked
                                      ? [...current, symptom.id]
                                      : current.filter((id) => id !== symptom.id);
                                    field.onChange(updated);
                                  }}
                                />
                              </FormControl>
                              <Label className="!mt-0 font-normal">{symptom.label}</Label>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="free_text_reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opisz objawy zdrowotne oraz okoliczności, które uniemożliwiają Ci wykonywanie pracy *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Opisz szczegółowo swoje objawy, okoliczności ich wystąpienia oraz wpływ na Twoją zdolność do pracy..."
                      className="min-h-[200px]"
                      maxLength={1500}
                      {...field}
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    {field.value?.length || 0}/1500 znaków
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Załącz dokumentację medyczną (opcjonalnie)</FormLabel>
              <div className="space-y-2">
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                  ref={fileInputRef}
                  disabled={isUploading}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                  size="lg"
                  disabled={isUploading || uploadedFiles.length >= 3}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Przesyłanie...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Wybierz pliki
                    </>
                  )}
                </Button>
                
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2 mt-2">
                    <p className="text-sm text-muted-foreground">Przesłane pliki ({uploadedFiles.length}/3):</p>
                    {uploadedFiles.map((file) => (
                      <div key={file.path} className="flex items-center justify-between bg-muted/50 p-2 rounded">
                        <span className="text-sm truncate flex-1">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(file.path)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Format: PDF, JPG, PNG (max 10MB każdy, max 3 pliki)
              </p>
            </FormItem>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate("/wywiad-ogolny")} className="flex-1">
                Wstecz
              </Button>
              <Button type="submit" className="flex-1" disabled={isUploading}>
                Dalej do podsumowania
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
