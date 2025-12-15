import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, RefreshCw, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

interface Med24VisitStatus {
  id: string;
  is_resolved: boolean;
  is_cancelled: boolean;
  is_booking_finalized: boolean;
  documentation_download_url?: string | null;
}

export default function StatusSprawy() {
  const [caseNumber, setCaseNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isFetchingMed24, setIsFetchingMed24] = useState(false);
  const [caseData, setCaseData] = useState<any>(null);
  const [med24Status, setMed24Status] = useState<Med24VisitStatus | null>(null);

  const fetchMed24Status = async (visitId: string) => {
    setIsFetchingMed24(true);
    try {
      const { data, error } = await supabase.functions.invoke('med24-get-visit', {
        body: { visit_id: visitId }
      });

      if (error) {
        console.error('Error fetching Med24 status:', error);
        return null;
      }
      
      if (data?.visit) {
        setMed24Status(data.visit);
        return data.visit;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching Med24 status:', error);
      return null;
    } finally {
      setIsFetchingMed24(false);
    }
  };

  const handleSearch = async () => {
    if (!caseNumber.trim()) {
      toast.error("Wprowadź numer wizyty");
      return;
    }

    setIsSearching(true);
    setMed24Status(null);
    
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('*, profiles(*)')
        .eq('case_number', caseNumber.trim())
        .maybeSingle();

      if (error) {
        console.error('Search error:', error);
        toast.error("Wystąpił błąd podczas wyszukiwania");
        setCaseData(null);
        return;
      }
      
      if (!data) {
        toast.error("Nie znaleziono wizyty o podanym numerze");
        setCaseData(null);
        return;
      }

      setCaseData(data);
      
      if (data.med24_visit_id) {
        await fetchMed24Status(data.med24_visit_id);
      }
    } catch (error) {
      console.error('Błąd podczas wyszukiwania:', error);
      toast.error("Wystąpił błąd podczas wyszukiwania");
    } finally {
      setIsSearching(false);
    }
  };

  const handleRefresh = async () => {
    if (caseData?.med24_visit_id) {
      await fetchMed24Status(caseData.med24_visit_id);
      toast.success("Status zaktualizowany");
    }
  };

  // Unified status logic
  const getUnifiedStatus = () => {
    // If case is rejected locally
    if (caseData?.status === 'rejected') {
      return {
        label: "Odrzucona",
        description: "Lekarz po analizie wywiadu medycznego podjął decyzję o niewystawieniu zwolnienia lekarskiego.",
        icon: XCircle,
        color: "text-destructive",
        bgColor: "bg-destructive/10",
        borderColor: "border-destructive/20"
      };
    }

    // If Med24 status is available, use it
    if (med24Status) {
      if (med24Status.is_cancelled) {
        return {
          label: "Anulowana",
          description: "Wizyta została anulowana.",
          icon: XCircle,
          color: "text-destructive",
          bgColor: "bg-destructive/10",
          borderColor: "border-destructive/20"
        };
      }
      
      if (med24Status.is_resolved) {
        return {
          label: "Zakończona",
          description: "",
          icon: CheckCircle,
          color: "text-green-500",
          bgColor: "bg-green-50",
          borderColor: "border-green-200"
        };
      }
    }

    // Default: in progress
    return {
      label: "W trakcie realizacji",
      description: "Twoja wizyta jest obecnie weryfikowana przez lekarza. Możesz otrzymać telefon w celu potwierdzenia danych.",
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200"
    };
  };

  const status = caseData ? getUnifiedStatus() : null;

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          Powrót na stronę główną
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Sprawdź status wizyty</h1>
          <p className="text-muted-foreground">Wprowadź numer wizyty, aby zobaczyć jej aktualny status</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Wyszukaj wizytę</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="Wprowadź numer wizyty (np. EZ-ABC123456)"
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

        {caseData && status && (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Informacje o wizycie</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh}
                  disabled={isFetchingMed24 || !caseData.med24_visit_id}
                >
                  {isFetchingMed24 ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Odśwież
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Unified Status Display */}
                <div className={`p-6 rounded-lg border ${status.bgColor} ${status.borderColor}`}>
                  <div className="flex items-start gap-4">
                    <div className={status.color}>
                      <status.icon className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className={`text-2xl font-bold ${status.color}`}>
                          {status.label}
                        </p>
                        <p className="text-lg font-mono font-bold text-muted-foreground">
                          {caseData.case_number}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {status.description}
                      </p>
                      
                      {med24Status?.documentation_download_url && (
                        <div className="mt-4">
                          <a 
                            href={med24Status.documentation_download_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                          >
                            Pobierz dokumentację medyczną
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Visit Details */}
                <div className="grid md:grid-cols-2 gap-4 pt-4">
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
          </div>
        )}
      </div>
    </div>
  );
}
