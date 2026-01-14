import { Shield, Clock, Lock, CheckCircle, Smartphone, FileCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const Benefits = () => {
  const { t } = useTranslation("landing");

  const benefits = [
    {
      icon: Clock,
      title: t("benefits.items.fast.title"),
      description: t("benefits.items.fast.description")
    },
    {
      icon: Shield,
      title: t("benefits.items.legal.title"),
      description: t("benefits.items.legal.description")
    },
    {
      icon: Lock,
      title: t("benefits.items.secure.title"),
      description: t("benefits.items.secure.description")
    },
    {
      icon: Smartphone,
      title: t("benefits.items.available.title"),
      description: t("benefits.items.available.description")
    },
    {
      icon: FileCheck,
      title: t("benefits.items.automatic.title"),
      description: t("benefits.items.automatic.description")
    },
    {
      icon: CheckCircle,
      title: t("benefits.items.experienced.title"),
      description: t("benefits.items.experienced.description")
    }
  ];

  return (
    <section id="zalety" className="py-16 md:py-24 gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t("benefits.title")} <span className="text-primary">{t("benefits.titleHighlight")}</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            {t("benefits.subtitle")}
          </p>
        </div>

        {/* Mobile: Carousel */}
        <div className="md:hidden max-w-sm mx-auto px-8">
          <Carousel className="w-full">
            <CarouselContent>
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <CarouselItem key={index}>
                    <article className="bg-white p-6 rounded-xl shadow-soft border border-border">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-foreground mb-2">
                            {benefit.title}
                          </h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {benefit.description}
                          </p>
                        </div>
                      </div>
                    </article>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>

        {/* Desktop: Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <article
                key={index}
                className="bg-white p-6 md:p-8 rounded-xl shadow-soft hover:shadow-medium transition-smooth border border-border group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-bounce">
                    <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Trust section */}
        <div className="mt-12 md:mt-16 bg-white p-8 md:p-12 rounded-2xl shadow-medium max-w-4xl mx-auto border-2 border-primary/20">
          <div className="text-center">
            <Shield className="w-16 h-16 text-primary mx-auto mb-6" aria-hidden="true" />
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              {t("benefits.guarantee.title")}
            </h3>
            <p className="text-lg text-muted-foreground mb-6">
              {t("benefits.guarantee.description")}
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-secondary" aria-hidden="true" />
                <span>{t("benefits.guarantee.licensedDoctors")}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-secondary" aria-hidden="true" />
                <span>{t("benefits.guarantee.gdprCompliant")}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-secondary" aria-hidden="true" />
                <span>{t("benefits.guarantee.sslEncryption")}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-secondary" aria-hidden="true" />
                <span>{t("benefits.guarantee.zusAccepted")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
