import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface ProgressStepsProps {
  currentStep: number;
}

export const ProgressSteps = ({ currentStep }: ProgressStepsProps) => {
  const { t } = useTranslation("common");

  const steps = [
    { number: 1, label: t("progressSteps.step2") }, // Illness dates
    { number: 2, label: t("progressSteps.step3") }, // Leave type
    { number: 3, label: t("progressSteps.step4") }, // General interview
    { number: 4, label: t("progressSteps.step5") }, // Symptoms
    { number: 5, label: t("progressSteps.step6") }, // Summary
    { number: 6, label: "Payment" }, // Using number 6 for payment
  ];

  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className={cn("flex items-center", index < steps.length - 1 ? "flex-1" : "")}>
            <div className="flex flex-col items-center">
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
          {t("progressSteps.stepOf", { current: currentStep, total: steps.length })}
        </p>
      </div>
    </div>
  );
};
