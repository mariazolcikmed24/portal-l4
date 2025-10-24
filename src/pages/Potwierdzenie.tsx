import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Potwierdzenie() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const caseId = searchParams.get('case') || "EZ-" + Math.random().toString(36).substr(2, 9).toUpperCase();

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Zgłoszenie przyjęte</h1>
          <p className="text-muted-foreground">Twoje zgłoszenie zostało pomyślnie zarejestrowane</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Numer sprawy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <span className="text-2xl font-mono font-bold text-primary">{caseId}</span>
            </div>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Zapisz ten numer - będzie potrzebny do śledzenia statusu sprawy
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Co dalej?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Weryfikacja danych</h3>
                  <p className="text-sm text-muted-foreground">
                    Lekarz sprawdzi przesłane przez Ciebie dane i może skontaktować się telefonicznie w celu weryfikacji.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Decyzja lekarza</h3>
                  <p className="text-sm text-muted-foreground">
                    Na podstawie wywiadu medycznego lekarz podejmie decyzję o wystawieniu e-ZLA. Pamiętaj, że e-konsultacja nie gwarantuje wystawienia zwolnienia.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Wysyłka e-ZLA</h3>
                  <p className="text-sm text-muted-foreground">
                    Jeśli lekarz podejmie pozytywną decyzję, e-ZLA zostanie automatycznie wysłane do systemu ZUS i do Twojego pracodawcy.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Powiadomienie</h3>
                  <p className="text-sm text-muted-foreground">
                    Otrzymasz wiadomość e-mail z potwierdzeniem i szczegółami dotyczącymi Twojego zwolnienia.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <p className="text-sm">
                <strong>Informacja dla studentów/uczniów:</strong><br />
                Po pozytywnej decyzji lekarza otrzymasz dokument PDF na adres e-mail, który możesz pobrać i wykorzystać według potrzeb.
              </p>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            <Button onClick={() => navigate("/")} className="w-full">
              Wróć na stronę główną
            </Button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Sprawdzisz stan swojej sprawy wkrótce za pomocą numeru {caseId}
          </p>
        </div>
      </div>
    </div>
  );
}