import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Logowanie = () => {
  return (
    <div className="min-h-screen gradient-subtle flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          Powrót na stronę główną
        </Link>

        <div className="bg-white p-8 md:p-10 rounded-2xl shadow-strong">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Logowanie
          </h1>
          <p className="text-muted-foreground mb-8">
            Zaloguj się do swojego konta
          </p>

          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center">
            <p className="text-foreground font-semibold mb-2">
              Panel logowania w budowie
            </p>
            <p className="text-sm text-muted-foreground">
              Funkcja logowania zostanie wkrótce aktywowana.
            </p>
          </div>

          <div className="mt-8 space-y-3">
            <Link to="/" className="w-full">
              <Button variant="outline" size="lg" className="w-full">
                Wróć na stronę główną
              </Button>
            </Link>
            <Link to="/rejestracja" className="w-full">
              <Button variant="ghost" size="lg" className="w-full">
                Nie masz konta? Zarejestruj się
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logowanie;
