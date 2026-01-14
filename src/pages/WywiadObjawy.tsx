import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRef, useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
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
import { useLanguageNavigation } from "@/hooks/useLanguageNavigation";

interface UploadedFile {
  path: string;
  name: string;
}

const symptomsByCategory: Record<string, string[]> = {
  cold_pain: ["fever", "fatigue", "dizziness", "chills", "swollen_tonsils", "runny_nose", "sinusitis", "cough", "hoarseness", "sore_throat", "muscle_pain", "chest_heaviness"],
  gastro: ["no_appetite", "diarrhea", "food_poisoning", "vomiting", "abdominal_pain"],
  bladder: ["frequent_urination", "painful_urination", "bladder_pain", "urge", "oliguria"],
  injury: ["head", "neck", "spine", "chest", "abdomen", "pelvis", "shoulder", "forearm", "elbow", "hand", "hip", "thigh", "knee", "shin", "ankle"],
  menstruation: ["severe_pain", "heavy_bleeding", "irritation", "painful_start"],
  back_pain: ["back_spine", "sciatica", "shoulder_radiculopathy", "cervical_pain", "thoracic_pain", "upper_limb_radiation", "lower_limb_radiation", "tingling", "sitting_pain", "lumbar_pain", "lifting_problem", "standing_pain"],
  eye: ["burning", "redness", "tearing", "gritty", "discharge"],
  migraine: ["photophobia", "confusion", "history"],
  acute_stress: ["family_problems", "divorce", "family_issues", "death", "work", "job_loss"],
  psych: ["family_problems", "divorce", "family_issues", "death", "work", "job_loss"],
};

export default function WywiadObjawy() {
  const { t } = useTranslation(['forms', 'validation']);
  const { navigateToLocalized } = useLanguageNavigation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const symptomsSchema = useMemo(() => z.object({
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
    ], { required_error: t('validation:required') }),
    
    symptom_duration: z.enum(["today", "yesterday", "2_3", "4_5", "gt_5"], { required_error: t('validation:required') }),
    
    symptoms: z.array(z.string()).optional(),
    
    free_text_reason: z.string()
      .min(1, t('validation:required'))
      .max(1500),
  }), [t]);

  type SymptomsFormData = z.infer<typeof symptomsSchema>;

  const categories = [
    { value: "cold_pain", label: t('forms:symptoms.categories.cold_pain') },
    { value: "gastro", label: t('forms:symptoms.categories.gastro') },
    { value: "bladder", label: t('forms:symptoms.categories.bladder') },
    { value: "injury", label: t('forms:symptoms.categories.injury') },
    { value: "menstruation", label: t('forms:symptoms.categories.menstruation') },
    { value: "back_pain", label: t('forms:symptoms.categories.back_pain') },
    { value: "eye", label: t('forms:symptoms.categories.eye') },
    { value: "migraine", label: t('forms:symptoms.categories.migraine') },
    { value: "acute_stress", label: t('forms:symptoms.categories.acute_stress') },
    { value: "psych", label: t('forms:symptoms.categories.psych') },
  ];

  const durations = [
    { value: "today", label: t('forms:symptoms.durations.today') },
    { value: "yesterday", label: t('forms:symptoms.durations.yesterday') },
    { value: "2_3", label: t('forms:symptoms.durations.2_3') },
    { value: "4_5", label: t('forms:symptoms.durations.4_5') },
    { value: "gt_5", label: t('forms:symptoms.durations.gt_5') },
  ];
  
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
      toast.error(t('forms:common.maxFiles', { count: 3 }));
      return;
    }
    
    setIsUploading(true);
    const newUploadedFiles: UploadedFile[] = [];
    
    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} - max 10MB`);
        continue;
      }
      
      try {
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(7);
        const filePath = `attachments/${timestamp}-${randomId}-${file.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from('case-attachments')
          .upload(filePath, file);
        
        if (uploadError) {
          console.error('Upload error:', uploadError);
          continue;
        }
        
        newUploadedFiles.push({ path: filePath, name: file.name });
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
    
    if (newUploadedFiles.length > 0) {
      const allFiles = [...uploadedFiles, ...newUploadedFiles];
      setUploadedFiles(allFiles);
      localStorage.setItem('uploadedFiles_attachments', JSON.stringify(allFiles));
      toast.success(t('forms:common.dataSaved'));
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
    } catch (error) {
      console.error('Error removing file:', error);
    }
  };

  const onSubmit = async (data: SymptomsFormData) => {
    console.log("Wywiad objawy:", data);
    toast.success(t('forms:common.dataSaved'));
    navigateToLocalized('/podsumowanie');
  };

  const currentSymptoms = mainCategory ? symptomsByCategory[mainCategory] || [] : [];

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <ProgressSteps currentStep={4} />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('forms:symptoms.title')}</h1>
          <p className="text-muted-foreground">{t('forms:symptoms.subtitle')}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="main_category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('forms:symptoms.mainCategory')} *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('forms:symptoms.selectCategory')} />
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
                  <FormLabel>{t('forms:symptoms.duration')} *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('forms:symptoms.selectDuration')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {durations.map((dur) => (
                        <SelectItem key={dur.value} value={dur.value}>
                          {dur.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {mainCategory && currentSymptoms.length > 0 && (
              <FormField
                control={form.control}
                name="symptoms"
                render={() => (
                  <FormItem>
                    <FormLabel>{t('forms:symptoms.selectSymptoms')} {t('forms:common.optional')}</FormLabel>
                    <div className="space-y-2 max-h-64 overflow-y-auto border rounded-md p-4">
                      {currentSymptoms.map((symptomId) => (
                        <FormField
                          key={symptomId}
                          control={form.control}
                          name="symptoms"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(symptomId)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value || [];
                                    const updated = checked
                                      ? [...current, symptomId]
                                      : current.filter((id) => id !== symptomId);
                                    field.onChange(updated);
                                  }}
                                />
                              </FormControl>
                              <Label className="!mt-0 font-normal">
                                {t(`forms:symptoms.symptomLabels.${symptomId}`)}
                              </Label>
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
                  <FormLabel>{t('forms:symptoms.describeReason')} *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('forms:symptoms.describeReasonPlaceholder')}
                      className="min-h-[200px]"
                      maxLength={1500}
                      {...field}
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    {field.value?.length || 0}/1500 {t('forms:common.characters')}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>{t('forms:symptoms.attachDocumentation')} {t('forms:common.optional')}</FormLabel>
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
                      {t('forms:common.uploading')}
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      {t('forms:common.selectFiles')}
                    </>
                  )}
                </Button>
                
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2 mt-2">
                    <p className="text-sm text-muted-foreground">{t('forms:symptoms.uploadedFiles', { count: uploadedFiles.length })}</p>
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
                {t('forms:common.fileFormat')}
              </p>
            </FormItem>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => navigateToLocalized('/wywiad-ogolny')} className="flex-1">
                {t('forms:common.back')}
              </Button>
              <Button type="submit" className="flex-1" disabled={isUploading}>
                {t('forms:common.next')}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}