import { Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLanguageNavigation } from "@/hooks/useLanguageNavigation";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation("common");
  const { t: tSeo } = useTranslation("seo");
  const { getLocalizedPath, currentLanguage } = useLanguageNavigation();

  return (
    <footer className="bg-foreground text-white py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 md:gap-12 mb-8">
          {/* Logo & Description */}
          <div className="md:col-span-1">
            <Link to={getLocalizedPath("/")} className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 gradient-hero rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <span className="text-xl font-bold">e-<span className="text-primary">zwolnienie</span></span>
            </Link>
            <p className="text-sm text-gray-300 leading-relaxed">
              {t("footer.description")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{t("footer.quickLinks")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#jak-to-dziala" className="text-gray-300 hover:text-primary transition-smooth">
                  {t("nav.howItWorks")}
                </a>
              </li>
              <li>
                <a href="#zalety" className="text-gray-300 hover:text-primary transition-smooth">
                  {t("nav.benefits")}
                </a>
              </li>
              <li>
                <a href="#faq" className="text-gray-300 hover:text-primary transition-smooth">
                  {t("nav.faq")}
                </a>
              </li>
              <li>
                <a href="#kontakt" className="text-gray-300 hover:text-primary transition-smooth">
                  {t("nav.contact")}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{t("footer.legalInfo")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to={getLocalizedPath("/regulamin")} className="text-gray-300 hover:text-primary transition-smooth">
                  {t("footer.terms")}
                </Link>
              </li>
              <li>
                <Link to={getLocalizedPath("/polityka-prywatnosci")} className="text-gray-300 hover:text-primary transition-smooth">
                  {t("footer.privacy")}
                </Link>
              </li>
              <li>
                <Link to={getLocalizedPath("/rodo")} className="text-gray-300 hover:text-primary transition-smooth">
                  {t("footer.gdpr")}
                </Link>
              </li>
              <li>
                <Link to={getLocalizedPath("/cookies")} className="text-gray-300 hover:text-primary transition-smooth">
                  {t("footer.cookies")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{t("footer.contact")}</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="mailto:kontakt@e-zwolnienie.com.pl" className="hover:text-primary transition-smooth">
                  kontakt@e-zwolnienie.com.pl
                </a>
              </li>
              <li>
                <a href="tel:+48123456789" className="hover:text-primary transition-smooth">
                  +48 123 456 789
                </a>
              </li>
              <li>ul. Medyczna 1</li>
              <li>00-000 Warszawa</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>{t("footer.copyright", { year: currentYear })}</p>
            <p>{t("footer.zusCompliant")}</p>
          </div>
        </div>
      </div>

      {/* Schema.org Organization markup */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "MedicalOrganization",
          "name": tSeo("schema.organizationName"),
          "description": tSeo("schema.organizationDescription"),
          "url": "https://e-zwolnienie.com.pl/",
          "logo": "https://e-zwolnienie.com.pl/logo.png",
          "telephone": "+48123456789",
          "email": "kontakt@e-zwolnienie.com.pl",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "ul. Medyczna 1",
            "addressLocality": "Warszawa",
            "postalCode": "00-000",
            "addressCountry": "PL"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+48123456789",
            "contactType": "customer service",
            "availableLanguage": currentLanguage,
            "areaServed": "PL"
          },
          "medicalSpecialty": tSeo("schema.medicalSpecialty")
        })}
      </script>
    </footer>
  );
};

export default Footer;
