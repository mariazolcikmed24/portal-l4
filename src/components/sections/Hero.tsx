import { Button } from "@/components/ui/button";
import { CheckCircle, Shield, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import { useLanguageNavigation } from "@/hooks/useLanguageNavigation";
import heroImage from "@/assets/hero-doctor.jpg";

const Hero = () => {
  const { t } = useTranslation("landing");
  const { getLocalizedPath } = useLanguageNavigation();

  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden gradient-subtle">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="container mx-auto px-4 relative">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 md:space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium shadow-soft">
              <Shield className="w-4 h-4" aria-hidden="true" />
              <span>{t("hero.badge")}</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              {t("hero.title")}
              <span className="block text-primary mt-2">{t("hero.titleHighlight")}</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
              {t("hero.description")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-secondary" aria-hidden="true" />
                <span className="text-foreground">{t("hero.trustIndicators.realDoctors")}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-secondary" aria-hidden="true" />
                <span className="text-foreground">{t("hero.trustIndicators.fullConfidentiality")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-secondary" aria-hidden="true" />
                <span className="text-foreground">{t("hero.trustIndicators.upTo30Min")}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to={getLocalizedPath("/rejestracja", "guest=true")}>
                <Button variant="hero" size="lg" className="w-full sm:w-auto shadow-strong hover:shadow-glow">
                  {t("hero.cta")}
                </Button>
              </Link>
              <a href="#jak-to-dziala">
                <Button variant="medical" size="lg" className="w-full sm:w-auto">
                  {t("hero.ctaSecondary")}
                </Button>
              </a>
            </div>

            <p className="text-sm text-muted-foreground">
              <Trans i18nKey="hero.patients" ns="landing">
                ✓ Ponad <strong className="text-foreground">10 000+</strong> zadowolonych pacjentów
              </Trans>
            </p>
          </div>

          <div className="relative hidden md:block">
            <div className="relative rounded-2xl overflow-hidden shadow-strong">
              <img
                src={heroImage}
                alt={t("hero.heroImageAlt")}
                className="w-full h-auto object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
            </div>
            
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-strong max-w-xs">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 gradient-hero rounded-full flex items-center justify-center shadow-soft">
                  <Shield className="w-6 h-6 text-white" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{t("hero.certifiedDoctors")}</p>
                  <p className="text-sm text-muted-foreground">{t("hero.polishLaw")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
