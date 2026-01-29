import { Button } from "@/components/ui/button";
import { CheckCircle, Shield, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-doctor.jpg";
const Hero = () => {
  return <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden gradient-subtle">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="container mx-auto px-4 relative">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left column - Content */}
          <div className="space-y-6 md:space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium shadow-soft">
              <Shield className="w-4 h-4" aria-hidden="true" />
              <span>100% legalne i zgodne z przepisami</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Zwolnienia lekarskie online
              <span className="block text-primary mt-2">szybko i bez wychodzenia z domu</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
              Skonsultuj się z lekarzem online i otrzymaj e-zwolnienie w kilka minut. Profesjonalnie, bezpiecznie i zgodnie z RODO.
            </p>

            {/* Trust indicators */}
            <div className="flex flex-col sm:flex-row gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-secondary" aria-hidden="true" />
                <span className="text-foreground">Prawdziwi lekarze</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-secondary" aria-hidden="true" />
                <span className="text-foreground">Pełna poufność</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-secondary" aria-hidden="true" />
                <span className="text-foreground">Nawet w 15 minut</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
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

            {/* Trust badge */}
            <p className="text-sm text-muted-foreground">
              ✓ Ponad <strong className="text-foreground">250 000+</strong> zadowolonych pacjentów
            </p>
          </div>

          {/* Right column - Image */}
          <div className="relative hidden md:block">
            <div className="relative rounded-2xl overflow-hidden shadow-strong">
              <img src={heroImage} alt="Profesjonalny lekarz podczas konsultacji online - bezpieczne i legalne zwolnienia lekarskie e-zwolnienie" className="w-full h-auto object-cover" loading="eager" />
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