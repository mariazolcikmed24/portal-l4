import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

export default function StatusSprawy() {
  const navigate = useNavigate();
  const [caseNumber, setCaseNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [caseData, setCaseData] = useState<any>(null);

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'draft': 'Robocza',
      'submitted': 'Złożona',
      'in_review': 'W trakcie weryfikacji',
      'completed': 'Zakończona',
      'rejected': 'Odrzucona'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'draft': 'text-gray-500',
      'submitted': 'text-blue-500',
      'in_review': 'text-yellow-500',
      'completed': 'text-green-500',
      'rejected': 'text-red-500'
    };
    return colors[status] || 'text-gray-500';
  };

  const handleSearch = async () => {
    if (!caseNumber.trim()) {
      toast.error("Wprowadź numer sprawy");
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*, profiles(*)')
        .eq('case_number', caseNumber.trim())
        .single();

      if (error || !data) {
        toast.error("Nie znaleziono sprawy o podanym numerze");
        setCaseData(null);
      } else {
        setCaseData(data);
      }
    } catch (error) {
      console.error('Błąd podczas wyszukiwania:', error);
      toast.error("Wystąpił błąd podczas wyszukiwania");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          Powrót na stronę główną
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Sprawdź status sprawy</h1>
          <p className="text-muted-foreground">Wprowadź numer sprawy, aby zobaczyć jej aktualny status</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Wyszukaj sprawę</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="Wprowadź numer sprawy (np. EZ-ABC123456)"
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={isSearching}>
                <Search className="w-4 h-4 mr-2" />
                {isSearching ? "Szukam..." : "Szukaj"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {caseData && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informacje o sprawie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className={`text-2xl font-bold ${getStatusColor(caseData.status)}`}>
                      {getStatusLabel(caseData.status)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Numer sprawy</p>
                    <p className="text-xl font-mono font-bold">{caseData.case_number}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Data rozpoczęcia zwolnienia</p>
                    <p className="font-medium">{format(new Date(caseData.illness_start), 'dd.MM.yyyy', { locale: pl })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data zakończenia zwolnienia</p>
                    <p className="font-medium">{format(new Date(caseData.illness_end), 'dd.MM.yyyy', { locale: pl })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data zgłoszenia</p>
                    <p className="font-medium">{format(new Date(caseData.created_at), 'dd.MM.yyyy HH:mm', { locale: pl })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ostatnia aktualizacja</p>
                    <p className="font-medium">{format(new Date(caseData.updated_at), 'dd.MM.yyyy HH:mm', { locale: pl })}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {caseData.status === 'in_review' && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <p className="text-sm">
                    <strong>Status:</strong> Twoja sprawa jest obecnie weryfikowana przez lekarza. Możesz otrzymać telefon w celu potwierdzenia danych.
                  </p>
                </CardContent>
              </Card>
            )}

            {caseData.status === 'completed' && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <p className="text-sm">
                    <strong>Gratulacje!</strong> E-ZLA zostało wystawione i wysłane do systemu ZUS oraz do Twojego pracodawcy. Potwierdzenie zostało wysłane na Twój adres email.
                  </p>
                </CardContent>
              </Card>
            )}

            {caseData.status === 'rejected' && (
              <Card className="bg-red-50 border-red-200">
                <CardContent className="pt-6">
                  <p className="text-sm">
                    <strong>Odmowa wystawienia e-ZLA:</strong> Lekarz po analizie wywiadu medycznego podjął decyzję o niewystawieniu zwolnienia lekarskiego. Szczegółowe informacje zostały wysłane na Twój adres email.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
