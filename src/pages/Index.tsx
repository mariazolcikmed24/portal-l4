import { lazy, Suspense, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";

// Lazy load sections below the fold
const LeaveTypes = lazy(() => import("@/components/sections/LeaveTypes"));
const HowItWorks = lazy(() => import("@/components/sections/HowItWorks"));
const Benefits = lazy(() => import("@/components/sections/Benefits"));
const FAQ = lazy(() => import("@/components/sections/FAQ"));
const Testimonials = lazy(() => import("@/components/sections/Testimonials"));
const Contact = lazy(() => import("@/components/sections/Contact"));

// Minimal section loader
const SectionLoader = () => (
  <div className="py-12 flex justify-center">
    <div className="animate-pulse bg-muted rounded-lg h-48 w-full max-w-4xl mx-4"></div>
  </div>
);

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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main>
        {/* Hero loads immediately - above the fold */}
        <Hero />
        
        {/* Sections below the fold - lazy loaded */}
        <Suspense fallback={<SectionLoader />}>
          <LeaveTypes />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <HowItWorks />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <Benefits />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <Testimonials />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <FAQ />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <Contact />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
