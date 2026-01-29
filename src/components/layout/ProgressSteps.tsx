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
      {/* Progress bar container */}
      <div className="relative flex items-center justify-between">
        {/* Background line - spans full width */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted" style={{ left: '20px', right: '20px' }} />
        
        {/* Progress line - fills based on current step */}
        <div 
          className="absolute top-5 h-0.5 bg-primary transition-all duration-300"
          style={{ 
            left: '20px',
            width: `calc(${((currentStep - 1) / (steps.length - 1)) * 100}% - ${currentStep === steps.length ? 0 : 20}px)`
          }}
        />
        
        {/* Steps */}
        {steps.map((step) => (
          <div key={step.number} className="relative z-10 flex flex-col items-center">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all border-4 border-background",
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
                "text-xs mt-2 text-center hidden sm:block whitespace-nowrap",
                currentStep >= step.number
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
      
      {/* Mobile step indicator */}
      <div className="mt-4 text-center sm:hidden">
        <p className="text-sm font-medium text-foreground">
          {steps.find(s => s.number === currentStep)?.label}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Krok {currentStep} z {steps.length}
        </p>
      </div>
    </div>
  );
};
