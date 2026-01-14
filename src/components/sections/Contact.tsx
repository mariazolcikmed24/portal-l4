import { Mail, Phone, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";

const Contact = () => {
  const { t } = useTranslation("landing");

  return (
    <section id="kontakt" className="py-16 md:py-24 gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t("contact.title")} <span className="text-primary">{t("contact.titleHighlight")}</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            {t("contact.subtitle")}
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-xl shadow-soft border border-border">
              <h3 className="text-2xl font-bold text-foreground mb-6">{t("contact.contactInfo")}</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{t("contact.email")}</p>
                    <a href="mailto:kontakt@e-zwolnienie.com.pl" className="text-primary hover:underline">
                      kontakt@e-zwolnienie.com.pl
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{t("contact.phone")}</p>
                    <a href="tel:+48123456789" className="text-primary hover:underline">
                      +48 123 456 789
                    </a>
                    <p className="text-sm text-muted-foreground">{t("contact.phoneHours")}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{t("contact.address")}</p>
                    <p className="text-muted-foreground">
                      ul. Medyczna 1<br />
                      00-000 Warszawa
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-secondary/10 p-6 rounded-xl border border-secondary/20">
              <p className="text-sm text-foreground">
                <strong>{t("contact.consultationHours")}</strong><br />
                {t("contact.available247")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
