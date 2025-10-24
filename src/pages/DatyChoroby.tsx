import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ProgressSteps } from "@/components/layout/ProgressSteps";

const datesSchema = z.object({
  illness_start: z.date({
    required_error: "Data zachorowania jest wymagana",
  }).refine((date) => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    return date >= threeDaysAgo;
  }, "Data nie może być starsza niż 3 dni wstecz"),
  
  illness_end: z.date({
    required_error: "Data zakończenia jest wymagana",
  }),
  
  late_justification: z.string().max(500, "Uzasadnienie nie może przekraczać 500 znaków").optional(),
}).refine((data) => {
  const maxEndDate = new Date(data.illness_start);
  maxEndDate.setDate(maxEndDate.getDate() + 7);
  return data.illness_end <= maxEndDate;
}, {
  message: "Data zakończenia nie może być późniejsza niż 7 dni od daty zachorowania",
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
  message: "Uzasadnienie opóźnienia jest wymagane dla daty w przeszłości",
  path: ["late_justification"],
});

type DatesFormData = z.infer<typeof datesSchema>;

export default function DatyChoroby() {
  const navigate = useNavigate();
  
  const form = useForm<DatesFormData>({
    resolver: zodResolver(datesSchema),
  });

  const watchStart = form.watch("illness_start");
  const needsJustification = watchStart && new Date(watchStart).setHours(0,0,0,0) < new Date().setHours(0,0,0,0);

  const onSubmit = async (data: DatesFormData) => {
    console.log("Daty choroby:", data);
    toast.success("Dane zapisane");
    navigate("/rodzaj-zwolnienia");
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <ProgressSteps currentStep={1} />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Daty choroby</h1>
          <p className="text-muted-foreground">Podaj daty okresu, na który potrzebujesz zwolnienia lekarskiego</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="illness_start"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data zachorowania *</FormLabel>
                  <Popover>
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
                            <span>Wybierz datę</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
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
                  <FormLabel>Data zakończenia *</FormLabel>
                  <Popover>
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
                            <span>Wybierz datę</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => {
                          if (!watchStart) return true;
                          const maxDate = new Date(watchStart);
                          maxDate.setDate(maxDate.getDate() + 7);
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
                    <FormLabel>Uzasadnienie opóźnienia *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Podaj powód zgłoszenia choroby z opóźnieniem..."
                        className="min-h-[100px]"
                        maxLength={500}
                        {...field}
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      {field.value?.length || 0}/500 znaków
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate("/wybor-sciezki")} className="flex-1">
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