import { Button } from "@/components/ui/button";
import { CheckCircle, Shield, Clock, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import heroImage from "@/assets/hero-doctor.jpg";

const Hero = () => {
  const [doctorsOnline, setDoctorsOnline] = useState(10);
  const [activeBadge, setActiveBadge] = useState(0);

  useEffect(() => {
    // Set random number on mount
    setDoctorsOnline(Math.floor(Math.random() * 7) + 7); // 7-13
    
    // Update doctors count every 30 seconds
    const doctorsInterval = setInterval(() => {
      setDoctorsOnline(Math.floor(Math.random() * 7) + 7);
    }, 30000);
    
    // Auto-rotate badges on mobile every 3 seconds
    const badgeInterval = setInterval(() => {
      setActiveBadge(prev => (prev === 0 ? 1 : 0));
    }, 3000);
    
    return () => {
      clearInterval(doctorsInterval);
      clearInterval(badgeInterval);
    };
  }, []);

  return <section className="relative pt-20 pb-8 md:pt-28 md:pb-12 lg:pt-24 overflow-hidden gradient-subtle">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="container mx-auto px-4 relative">
        <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-center">
          {/* Left column - Content */}
          <div className="space-y-4 md:space-y-5">
            {/* Mobile & Tablet: Rotating badges */}
            <div className="lg:hidden relative h-12 overflow-visible">
              <div 
                className={`absolute inset-0 flex items-center transition-all duration-500 ease-in-out ${
                  activeBadge === 0 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
                }`}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-secondary text-secondary-foreground rounded-full text-sm font-semibold shadow-soft">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                  </span>
                  <span>{doctorsOnline} lekarzy online</span>
                </div>
              </div>
              <div 
                className={`absolute inset-0 flex items-center transition-all duration-500 ease-in-out ${
                  activeBadge === 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
                }`}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary/10 text-primary rounded-full text-sm font-semibold border border-primary/20 shadow-soft">
                  <Users className="w-4 h-4" aria-hidden="true" />
                  <span><strong>250 000+</strong> zadowolonych pacjentów</span>
                </div>
              </div>
            </div>

            {/* Desktop: Both badges visible */}
            <div className="hidden lg:flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-full text-sm font-semibold shadow-soft">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                </span>
                <span>{doctorsOnline} lekarzy online</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold border border-primary/20 shadow-soft">
                <Users className="w-4 h-4" aria-hidden="true" />
                <span><strong>250 000+</strong> zadowolonych pacjentów</span>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              Zwolnienia lekarskie online
              <span className="block text-primary mt-1">szybko i bez wychodzenia z domu</span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
              Skonsultuj się z lekarzem online i otrzymaj e-zwolnienie w kilka minut. Profesjonalnie, bezpiecznie i zgodnie z RODO.
            </p>

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-3 text-sm">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-secondary" aria-hidden="true" />
                <span className="text-foreground">Legalnie i zgodnie z przepisami</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-secondary" aria-hidden="true" />
                <span className="text-foreground">Pełna poufność</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-secondary" aria-hidden="true" />
                <span className="text-foreground">Nawet w 15 minut</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link to="/rejestracja?guest=true">
                <Button variant="hero" size="lg" className="w-full sm:w-auto shadow-strong hover:shadow-glow">
                  Uzyskaj zwolnienie online
                </Button>
              </Link>
              <a href="#jak-to-dziala">
                <Button variant="medical" size="lg" className="w-full sm:w-auto">
                  Zobacz jak to działa
                </Button>
              </a>
            </div>

          </div>

          {/* Right column - Image */}
          <div className="relative hidden md:block">
            <div className="relative rounded-2xl overflow-hidden shadow-strong">
              <img 
                src={heroImage} 
                alt="Profesjonalny lekarz podczas konsultacji online - bezpieczne i legalne zwolnienia lekarskie e-zwolnienie" 
                className="w-full h-auto object-cover aspect-[4/3]"
                width={600}
                height={450}
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
            </div>
            
            {/* Floating card */}
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-strong max-w-xs">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 gradient-hero rounded-full flex items-center justify-center shadow-soft">
                  <Shield className="w-6 h-6 text-white" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Certyfikowani lekarze</p>
                  <p className="text-sm text-muted-foreground">Zgodne z prawem polskim</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default Hero;