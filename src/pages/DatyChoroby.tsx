import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ProgressSteps } from "@/components/layout/ProgressSteps";
import { useLanguageNavigation } from "@/hooks/useLanguageNavigation";

export default function DatyChoroby() {
  const { t } = useTranslation(['forms', 'validation']);
  const { navigateToLocalized } = useLanguageNavigation();
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  
  // Create schema with translated error messages
  const datesSchema = useMemo(() => z.object({
    illness_start: z.date({
      required_error: t('validation:dates.startRequired'),
    }).refine((date) => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      return date >= threeDaysAgo;
    }, t('validation:dates.tooFarBack')),
    
    illness_end: z.date({
      required_error: t('validation:dates.endRequired'),
    }),
    
    late_justification: z.string().max(500, t('validation:required')).optional(),
  }).refine((data) => {
    const maxEndDate = new Date(data.illness_start);
    maxEndDate.setDate(maxEndDate.getDate() + 6);
    return data.illness_end <= maxEndDate;
  }, {
    message: t('validation:dates.tooLong'),
    path: ["illness_end"],
  }).refine((data) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(data.illness_start);
    startDate.setHours(0, 0, 0, 0);
    
    if (startDate < today && !data.late_justification) {
      return false;
    }
    return true;
  }, {
    message: t('validation:required'),
    path: ["late_justification"],
  }), [t]);

  type DatesFormData = z.infer<typeof datesSchema>;
  
  const form = useForm<DatesFormData>({
    resolver: zodResolver(datesSchema),
  });

  const watchStart = form.watch("illness_start");
  const needsJustification = watchStart && new Date(watchStart).setHours(0,0,0,0) < new Date().setHours(0,0,0,0);

  // Load saved data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('formData_datyChoroby');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      if (parsed.illness_start) {
        parsed.illness_start = new Date(parsed.illness_start);
      }
      if (parsed.illness_end) {
        parsed.illness_end = new Date(parsed.illness_end);
      }
      form.reset(parsed);
    }
  }, []);

  // Save data to localStorage on change
  useEffect(() => {
    const subscription = form.watch((value) => {
      localStorage.setItem('formData_datyChoroby', JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const onSubmit = async (data: DatesFormData) => {
    console.log("Daty choroby:", data);
    toast.success(t('forms:common.dataSaved'));
    navigateToLocalized('/rodzaj-zwolnienia');
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <ProgressSteps currentStep={1} />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('forms:illnessDates.title')}</h1>
          <p className="text-muted-foreground">{t('forms:illnessDates.subtitle')}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="illness_start"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t('forms:illnessDates.startDate')} *</FormLabel>
                  <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd.MM.yyyy")
                          ) : (
                            <span>{t('forms:common.selectDate')}</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                          setStartDateOpen(false);
                        }}
                        disabled={(date) => {
                          const threeDaysAgo = new Date();
                          threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
                          const today = new Date();
                          return date < threeDaysAgo || date > today;
                        }}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="illness_end"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t('forms:illnessDates.endDate')} *</FormLabel>
                  <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd.MM.yyyy")
                          ) : (
                            <span>{t('forms:common.selectDate')}</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                          setEndDateOpen(false);
                        }}
                        disabled={(date) => {
                          if (!watchStart) return true;
                          const maxDate = new Date(watchStart);
                          maxDate.setDate(maxDate.getDate() + 6);
                          return date < watchStart || date > maxDate;
                        }}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {needsJustification && (
              <FormField
                control={form.control}
                name="late_justification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('forms:illnessDates.lateJustification')} *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('forms:illnessDates.lateJustificationPlaceholder')}
                        className="min-h-[100px]"
                        maxLength={500}
                        {...field}
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      {field.value?.length || 0}/500 {t('forms:common.characters')}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => navigateToLocalized('/wybor-sciezki')} className="flex-1">
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