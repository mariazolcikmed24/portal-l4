import { Button } from "@/components/ui/button";
import { ArrowLeft, UserPlus, LogIn, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
const WyborSciezki = () => {
  return <div className="min-h-screen gradient-subtle flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          Powrót na stronę główną
        </Link>

        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-strong">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Uzyskaj zwolnienie lekarskie online
          </h1>
          <p className="text-muted-foreground mb-8">
            Wybierz sposób, w jaki chcesz kontynuować proces uzyskania e-zwolnienia
          </p>

          <div className="space-y-4">
            {/* Zaloguj się */}
            <Link to="/logowanie" className="block">
              <div className="group p-6 rounded-xl border-2 border-border hover:border-primary transition-all hover:shadow-soft cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <LogIn className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      Zaloguj się
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      Masz już konto? Zaloguj się, aby szybko wypełnić formularz z zapisanymi danymi
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Zarejestruj się */}
            <Link to="/rejestracja" className="block">
              <div className="group p-6 rounded-xl border-2 border-primary bg-primary/5 hover:bg-primary/10 transition-all hover:shadow-soft cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary text-white">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-xl font-semibold text-foreground">
                        Zarejestruj się
                      </h2>
                      <span className="px-2 py-1 text-xs font-medium bg-primary text-white rounded-full">
                        Polecane
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Utwórz konto, aby mieć dostęp do historii zwolnień i szybszego procesu w przyszłości
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            {/* Kup jako gość */}
            <Link to="/rejestracja?guest=true" className="block">
              <div className="group p-6 rounded-xl border-2 border-border hover:border-primary transition-all hover:shadow-soft cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">Zamawiam jako gość</h2>
                    <p className="text-muted-foreground text-sm">
                      Nie chcesz zakładać konta? Wypełnij formularz jednorazowo bez rejestracji
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          <div className="mt-8 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex gap-3">
              <div className="text-blue-600 mt-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Ważne informacje
                </p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Proces zajmuje około 5 minut</li>
                  <li>• Lekarz zastrzega sobie prawo do wykonania połączenia telefonicznego, w celu pogłębienia wywiadu.
Wykupienie e-konsultacji nie gwarantuje otrzymania wnioskowanego e-zwolnienia.</li>
                  <li>• Wykupienie e-konsultacji nie gwarantuje otrzymania wnioskowanego e-zwolnienia.</li>
                  <li>• Ostateczną decyzję podejmuje lekarz po analizie Twoich objawów</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default WyborSciezki;