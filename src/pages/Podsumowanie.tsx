import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressSteps } from "@/components/layout/ProgressSteps";

export default function Podsumowanie() {
  const navigate = useNavigate();

  // W rzeczywistej aplikacji dane byłyby pobrane z contextu/state
  const mockData = {
    userData: {
      firstName: "Jan",
      lastName: "Kowalski",
      email: "jan.kowalski@example.com",
      pesel: "90010112345",
    },
    dates: {
      start: "2025-01-20",
      end: "2025-01-27",
    },
    leaveType: "Polski pracodawca",
    price: "149 PLN",
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <ProgressSteps currentStep={5} />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Podsumowanie</h1>
          <p className="text-muted-foreground">Sprawdź poprawność wprowadzonych danych przed przejściem do płatności</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dane osobowe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Imię i nazwisko:</span>
                <span className="font-medium">{mockData.userData.firstName} {mockData.userData.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{mockData.userData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">PESEL:</span>
                <span className="font-medium">{mockData.userData.pesel}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Okres zwolnienia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data rozpoczęcia:</span>
                <span className="font-medium">{mockData.dates.start}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data zakończenia:</span>
                <span className="font-medium">{mockData.dates.end}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Typ zwolnienia</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="font-medium">{mockData.leaveType}</span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Wywiad medyczny</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Wypełniony formularz wywiadu medycznego</p>
            </CardContent>
          </Card>

          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Koszt usługi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-lg">E-konsultacja + e-ZLA:</span>
                <span className="text-2xl font-bold text-primary">{mockData.price}</span>
              </div>
            </CardContent>
          </Card>

          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Ważne:</strong> Lekarz może skontaktować się z Tobą telefonicznie w celu weryfikacji danych. 
              E-konsultacja nie gwarantuje wystawienia e-ZLA - ostateczną decyzję podejmuje lekarz na podstawie 
              wywiadu medycznego i obowiązujących przepisów.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button variant="outline" onClick={() => navigate("/daty-choroby")} className="flex-1">
              Edytuj dane
            </Button>
            <Button onClick={() => navigate("/platnosc")} className="flex-1">
              Przejdź do płatności
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}