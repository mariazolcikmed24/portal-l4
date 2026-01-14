import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import HowItWorks from "@/components/sections/HowItWorks";
import Benefits from "@/components/sections/Benefits";
import FAQ from "@/components/sections/FAQ";
import Testimonials from "@/components/sections/Testimonials";
import Contact from "@/components/sections/Contact";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const Index = () => {
  const { t, i18n } = useTranslation("seo");
  const currentLang = i18n.language;

  useEffect(() => {
    // Update document title
    document.title = t("index.title");
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", t("index.description"));
    }

    // Schema.org BreadcrumbList and WebPage
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": t("index.breadcrumb"),
          "item": `https://e-zwolnienie.com.pl/${currentLang}`
        }
      ]
    };

    const webPageSchema = {
      "@context": "https://schema.org",
      "@type": "MedicalWebPage",
      "name": t("index.title"),
      "description": t("index.description"),
      "url": `https://e-zwolnienie.com.pl/${currentLang}`,
      "inLanguage": currentLang,
      "isPartOf": {
        "@type": "WebSite",
        "name": t("schema.siteName"),
        "url": "https://e-zwolnienie.com.pl/"
      },
      "about": {
        "@type": "MedicalProcedure",
        "name": t("schema.procedureName"),
        "procedureType": t("schema.procedureType"),
        "followup": t("schema.procedureFollowup")
      },
      "mainEntity": {
        "@type": "MedicalWebPage",
        "specialty": t("schema.medicalSpecialty"),
        "audience": {
          "@type": "PeopleAudience",
          "audienceType": t("schema.audienceType")
        }
      }
    };

    // Inject schemas
    const breadcrumbScript = document.createElement('script');
    breadcrumbScript.type = 'application/ld+json';
    breadcrumbScript.text = JSON.stringify(breadcrumbSchema);
    breadcrumbScript.id = 'breadcrumb-schema';
    document.head.appendChild(breadcrumbScript);

    const webPageScript = document.createElement('script');
    webPageScript.type = 'application/ld+json';
    webPageScript.text = JSON.stringify(webPageSchema);
    webPageScript.id = 'webpage-schema';
    document.head.appendChild(webPageScript);

    return () => {
      const breadcrumb = document.getElementById('breadcrumb-schema');
      const webpage = document.getElementById('webpage-schema');
      if (breadcrumb) document.head.removeChild(breadcrumb);
      if (webpage) document.head.removeChild(webpage);
    };
  }, [t, currentLang]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Benefits />
        <Testimonials />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
