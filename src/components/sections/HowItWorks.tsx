import { FileText, Video, Download, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const HowItWorks = () => {
  const { t } = useTranslation();
  
  const steps = [
    {
      icon: FileText,
      title: t('howItWorks.step1.title'),
      description: t('howItWorks.step1.description'),
      step: "01"
    },
    {
      icon: Video,
      title: t('howItWorks.step2.title'),
      description: t('howItWorks.step2.description'),
      step: "02"
    },
    {
      icon: Download,
      title: t('howItWorks.step3.title'),
      description: t('howItWorks.step3.description'),
      step: "03"
    }
  ];
  
  return (
    <section id="jak-to-dziala" className="pt-16 md:pt-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t('howItWorks.title')}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            {t('howItWorks.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-6 max-w-6xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <article key={index} className="relative group">
                <div className="gradient-card p-8 rounded-2xl shadow-soft hover:shadow-medium transition-smooth h-full border border-border">
                  {/* Step number */}
                  <div className="absolute -top-4 -right-4 w-16 h-16 gradient-hero rounded-full flex items-center justify-center shadow-medium text-white font-bold text-xl">
                    {step.step}
                  </div>

                  {/* Icon */}
                  <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-bounce">
                    <Icon className="w-8 h-8 text-primary" aria-hidden="true" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow connector (desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-primary" aria-hidden="true" />
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {/* Additional info */}
        <div className="mt-12 text-center">
          
        </div>
      </div>
    </section>
  );
};
export default HowItWorks;