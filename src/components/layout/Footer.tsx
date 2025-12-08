import { Shield } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-white py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 md:gap-12 mb-8">
          {/* Logo & Description */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 gradient-hero rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <span className="text-xl font-bold">e-<span className="text-primary">zwolnienie</span></span>
            </Link>
            <p className="text-sm text-gray-300 leading-relaxed">
              Profesjonalne zwolnienia lekarskie online. Szybko, bezpiecznie i zgodnie z prawem.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Szybkie linki</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#jak-to-dziala" className="text-gray-300 hover:text-primary transition-smooth">
                  Jak to działa?
                </a>
              </li>
              <li>
                <a href="#zalety" className="text-gray-300 hover:text-primary transition-smooth">
                  Zalety
                </a>
              </li>
              <li>
                <a href="#faq" className="text-gray-300 hover:text-primary transition-smooth">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#kontakt" className="text-gray-300 hover:text-primary transition-smooth">
                  Kontakt
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Informacje prawne</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/regulamin" className="text-gray-300 hover:text-primary transition-smooth">
                  Regulamin
                </Link>
              </li>
              <li>
                <Link to="/polityka-prywatnosci" className="text-gray-300 hover:text-primary transition-smooth">
                  Polityka prywatności
                </Link>
              </li>
              <li>
                <Link to="/rodo" className="text-gray-300 hover:text-primary transition-smooth">
                  Ochrona danych (RODO)
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-gray-300 hover:text-primary transition-smooth">
                  Polityka cookies
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Kontakt</h3>
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
            <p>&copy; {currentYear} e-zwolnienie. Wszelkie prawa zastrzeżone.</p>
            <p>Zwolnienia lekarskie online zgodne z przepisami ZUS</p>
          </div>
        </div>
      </div>

      {/* Schema.org Organization markup */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "MedicalOrganization",
          "name": "e-zwolnienie - Zwolnienia Lekarskie Online",
          "description": "Profesjonalna platforma medyczna oferująca zwolnienia lekarskie online. Konsultacje z licencjonowanymi lekarzami, legalne e-zwolnienia zgodne z przepisami ZUS.",
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
            "availableLanguage": "pl",
            "areaServed": "PL"
          },
          "medicalSpecialty": "Telemedycyna"
        })}
      </script>
    </footer>
  );
};

export default Footer;
