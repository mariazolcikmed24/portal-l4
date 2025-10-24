import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  number: number;
  label: string;
  path: string;
}

const steps: Step[] = [
  { number: 1, label: "Daty choroby", path: "/daty-choroby" },
  { number: 2, label: "Rodzaj zwolnienia", path: "/rodzaj-zwolnienia" },
  { number: 3, label: "Wywiad ogólny", path: "/wywiad-ogolny" },
  { number: 4, label: "Objawy", path: "/wywiad-objawy" },
  { number: 5, label: "Podsumowanie", path: "/podsumowanie" },
  { number: 6, label: "Płatność", path: "/platnosc" },
];

interface ProgressStepsProps {
  currentStep: number;
}

export const ProgressSteps = ({ currentStep }: ProgressStepsProps) => {
  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all",
                  currentStep > step.number
                    ? "bg-primary text-primary-foreground"
                    : currentStep === step.number
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {currentStep > step.number ? (
                  <Check className="w-5 h-5" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={cn(
                  "text-xs mt-2 text-center hidden sm:block",
                  currentStep >= step.number
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-1 flex-1 mx-2 transition-all",
                  currentStep > step.number ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          Krok {currentStep} z {steps.length}
        </p>
      </div>
    </div>
  );
};
