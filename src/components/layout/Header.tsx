import { Button } from "@/components/ui/button";
import { Shield, Phone, Menu, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-border z-50 shadow-soft">
      <nav className="container mx-auto px-4 py-4" aria-label="Główna nawigacja">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 transition-smooth hover:opacity-80">
            <div className="w-10 h-10 gradient-hero rounded-lg flex items-center justify-center shadow-soft">
              <Shield className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <span className="text-xl font-bold text-foreground">e-<span className="text-primary">zwolnienie</span></span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("jak-to-dziala")}
              className="text-foreground hover:text-primary transition-smooth font-medium"
            >
              Jak to działa?
            </button>
            <button
              onClick={() => scrollToSection("zalety")}
              className="text-foreground hover:text-primary transition-smooth font-medium"
            >
              Zalety
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="text-foreground hover:text-primary transition-smooth font-medium"
            >
              FAQ
            </button>
            <Link
              to="/status"
              className="text-foreground hover:text-primary transition-smooth font-medium"
            >
              Sprawdź status sprawy
            </Link>
            <button
              onClick={() => scrollToSection("kontakt")}
              className="text-foreground hover:text-primary transition-smooth font-medium"
            >
              Kontakt
            </button>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <Link to="/panel">
                <Button variant="ghost">
                  <User className="w-4 h-4 mr-2" />
                  Moje konto
                </Button>
              </Link>
            ) : (
              <Link to="/logowanie">
                <Button variant="ghost">Zaloguj się</Button>
              </Link>
            )}
            <Link to="/wybor-sciezki">
              <Button variant="hero" size="lg">
                Uzyskaj zwolnienie
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-smooth"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu mobilne"
            aria-expanded={mobileMenuOpen}
          >
            <Menu className="w-6 h-6 text-foreground" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border pt-4 space-y-3 animate-in fade-in slide-in-from-top-2">
            <button
              onClick={() => scrollToSection("jak-to-dziala")}
              className="block w-full text-left px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-smooth font-medium"
            >
              Jak to działa?
            </button>
            <button
              onClick={() => scrollToSection("zalety")}
              className="block w-full text-left px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-smooth font-medium"
            >
              Zalety
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="block w-full text-left px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-smooth font-medium"
            >
              FAQ
            </button>
            <Link
              to="/status"
              className="block w-full text-left px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-smooth font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sprawdź status sprawy
            </Link>
            <button
              onClick={() => scrollToSection("kontakt")}
              className="block w-full text-left px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-smooth font-medium"
            >
              Kontakt
            </button>
            <div className="flex flex-col gap-2 pt-2">
              {user ? (
                <Link to="/panel" className="w-full">
                  <Button variant="outline" className="w-full">
                    <User className="w-4 h-4 mr-2" />
                    Moje konto
                  </Button>
                </Link>
              ) : (
                <Link to="/logowanie" className="w-full">
                  <Button variant="outline" className="w-full">Zaloguj się</Button>
                </Link>
              )}
              <Link to="/wybor-sciezki" className="w-full">
                <Button variant="hero" size="lg" className="w-full">
                  Uzyskaj zwolnienie
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
