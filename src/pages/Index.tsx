import { lazy, Suspense } from "react";
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

// Section-specific skeleton placeholders with fixed heights to prevent CLS
const LeaveTypesSkeleton = () => (
  <div className="pt-8 pb-8 md:pt-12 md:pb-12 bg-gradient-to-b from-muted/20 to-muted/40" style={{ minHeight: '320px' }}>
    <div className="container mx-auto px-4">
      <div className="grid md:grid-cols-3 gap-5 lg:gap-6 max-w-6xl mx-auto">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card rounded-2xl p-6 animate-pulse border border-border/50">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-muted" />
              <div className="w-16 h-8 bg-muted rounded-lg" />
            </div>
            <div className="h-6 bg-muted rounded w-3/4 mb-2" />
            <div className="h-4 bg-muted rounded w-1/2 mb-4" />
            <div className="space-y-2 mb-6">
              <div className="h-4 bg-muted rounded w-2/3" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
            <div className="h-12 bg-muted rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const HowItWorksSkeleton = () => (
  <div className="pt-16 md:pt-24 bg-white" style={{ minHeight: '500px' }}>
    <div className="container mx-auto px-4">
      <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
        <div className="h-10 bg-muted rounded w-2/3 mx-auto mb-4 animate-pulse" />
        <div className="h-6 bg-muted rounded w-1/2 mx-auto animate-pulse" />
      </div>
      <div className="grid md:grid-cols-3 gap-8 md:gap-6 max-w-6xl mx-auto">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-8 rounded-2xl border border-border animate-pulse">
            <div className="w-16 h-16 bg-muted rounded-xl mb-6" />
            <div className="h-7 bg-muted rounded w-3/4 mb-3" />
            <div className="h-4 bg-muted rounded w-full mb-2" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const BenefitsSkeleton = () => (
  <div className="py-16 md:py-24 gradient-subtle" style={{ minHeight: '700px' }}>
    <div className="container mx-auto px-4">
      <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
        <div className="h-10 bg-muted rounded w-2/3 mx-auto mb-4 animate-pulse" />
        <div className="h-6 bg-muted rounded w-1/2 mx-auto animate-pulse" />
      </div>
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white p-6 md:p-8 rounded-xl border border-border animate-pulse">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-muted rounded-lg flex-shrink-0" />
              <div className="flex-1">
                <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-full mb-1" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const TestimonialsSkeleton = () => (
  <div className="py-16 md:py-24 bg-white" style={{ minHeight: '600px' }}>
    <div className="container mx-auto px-4">
      <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
        <div className="h-10 bg-muted rounded w-1/2 mx-auto mb-4 animate-pulse" />
        <div className="h-6 bg-muted rounded w-2/3 mx-auto animate-pulse" />
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 rounded-xl border border-border animate-pulse">
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className="w-4 h-4 bg-muted rounded" />
              ))}
            </div>
            <div className="h-4 bg-muted rounded w-full mb-2" />
            <div className="h-4 bg-muted rounded w-full mb-2" />
            <div className="h-4 bg-muted rounded w-2/3 mb-4" />
            <div className="border-t pt-4">
              <div className="h-5 bg-muted rounded w-1/3 mb-1" />
              <div className="h-4 bg-muted rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const FAQSkeleton = () => (
  <div className="py-16 md:py-24 bg-white" style={{ minHeight: '600px' }}>
    <div className="container mx-auto px-4">
      <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
        <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-6 animate-pulse" />
        <div className="h-10 bg-muted rounded w-1/2 mx-auto mb-4 animate-pulse" />
        <div className="h-6 bg-muted rounded w-2/3 mx-auto animate-pulse" />
      </div>
      <div className="max-w-4xl mx-auto space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-gradient-card border border-border rounded-xl px-6 py-6 animate-pulse">
            <div className="h-6 bg-muted rounded w-3/4" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ContactSkeleton = () => (
  <div className="py-16 md:py-24 gradient-subtle" style={{ minHeight: '450px' }}>
    <div className="container mx-auto px-4">
      <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
        <div className="h-10 bg-muted rounded w-1/3 mx-auto mb-4 animate-pulse" />
        <div className="h-6 bg-muted rounded w-1/2 mx-auto animate-pulse" />
      </div>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-xl border border-border animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-muted rounded-lg flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-5 bg-muted rounded w-1/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Index = () => {
  // Schema.org structured data is now in index.html <head> for early loading

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main>
        {/* Hero loads immediately - above the fold */}
        <Hero />
        
        {/* Sections below the fold - lazy loaded with specific skeletons */}
        <Suspense fallback={<LeaveTypesSkeleton />}>
          <LeaveTypes />
        </Suspense>
        <Suspense fallback={<HowItWorksSkeleton />}>
          <HowItWorks />
        </Suspense>
        <Suspense fallback={<BenefitsSkeleton />}>
          <Benefits />
        </Suspense>
        <Suspense fallback={<TestimonialsSkeleton />}>
          <Testimonials />
        </Suspense>
        <Suspense fallback={<FAQSkeleton />}>
          <FAQ />
        </Suspense>
        <Suspense fallback={<ContactSkeleton />}>
          <Contact />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
