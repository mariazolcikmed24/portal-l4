import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Rejestracja = () => {
  return (
    <div className="min-h-screen gradient-subtle flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          Powrót na stronę główną
        </Link>

        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-strong">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Rejestracja
          </h1>
          <p className="text-muted-foreground mb-8">
            Rozpocznij proces uzyskania zwolnienia lekarskiego online
          </p>

          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
            <p className="text-foreground font-semibold mb-2">
              Formularz rejestracji w budowie
            </p>
            <p className="text-sm text-muted-foreground">
              Ta sekcja zostanie wkrótce uruchomiona z pełnym, wieloetapowym formularzem medycznym.
            </p>
          </div>

          <div className="mt-8">
            <Link to="/" className="w-full">
              <Button variant="outline" size="lg" className="w-full">
                Wróć na stronę główną
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rejestracja;
