import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import LeaveTypes from "@/components/sections/LeaveTypes";
import HowItWorks from "@/components/sections/HowItWorks";
import Benefits from "@/components/sections/Benefits";
import FAQ from "@/components/sections/FAQ";
import Testimonials from "@/components/sections/Testimonials";
import Contact from "@/components/sections/Contact";
import { useEffect } from "react";
const Index = () => {
  useEffect(() => {
    // Schema.org BreadcrumbList and WebPage
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [{
        "@type": "ListItem",
        "position": 1,
        "name": "Strona główna",
        "item": "https://e-zwolnienie.com.pl/"
      }]
    };
    const webPageSchema = {
      "@context": "https://schema.org",
      "@type": "MedicalWebPage",
      "name": "Zwolnienie lekarskie online – szybko, legalnie i bez wychodzenia z domu",
      "description": "Zdobądź zwolnienie lekarskie online w kilka minut. Konsultacja z lekarzem, legalne L4, bez wizyty. Wygodnie, bezpiecznie, profesjonalnie.",
      "url": "https://e-zwolnienie.com.pl/",
      "inLanguage": "pl",
      "isPartOf": {
        "@type": "WebSite",
        "name": "e-zwolnienie",
        "url": "https://e-zwolnienie.com.pl/"
      },
      "about": {
        "@type": "MedicalProcedure",
        "name": "Telemedyczna konsultacja lekarska",
        "procedureType": "Zdalna konsultacja medyczna",
        "followup": "Wystawienie elektronicznego zwolnienia lekarskiego"
      },
      "mainEntity": {
        "@type": "MedicalWebPage",
        "specialty": "Telemedycyna",
        "audience": {
          "@type": "PeopleAudience",
          "audienceType": "Pacjenci wymagający zwolnienia lekarskiego"
        }
      }
    };

    // Inject schemas
    const breadcrumbScript = document.createElement('script');
    breadcrumbScript.type = 'application/ld+json';
    breadcrumbScript.text = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(breadcrumbScript);
    const webPageScript = document.createElement('script');
    webPageScript.type = 'application/ld+json';
    webPageScript.text = JSON.stringify(webPageSchema);
    document.head.appendChild(webPageScript);
    return () => {
      document.head.removeChild(breadcrumbScript);
      document.head.removeChild(webPageScript);
    };
  }, []);
  return <div className="min-h-screen flex flex-col">
      <Header />
      <main>
        <Hero />
        <LeaveTypes className="" />
        <HowItWorks />
        <Benefits />
        <Testimonials />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </div>;
};
export default Index;