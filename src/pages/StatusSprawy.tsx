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

interface CaseStatusData {
  case_number: string;
  status: string;
  payment_status: string;
  illness_start: string;
  illness_end: string;
  created_at: string;
  updated_at: string;
}

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
  const [caseData, setCaseData] = useState<CaseStatusData | null>(null);
  const [med24Status, setMed24Status] = useState<Med24VisitStatus | null>(null);

  const handleSearch = async () => {
    if (!caseNumber.trim()) {
      toast.error("Wprowadź numer wizyty");
      return;
    }

    // Validate case number format
    const caseNumberPattern = /^EZ-[A-Z0-9]{9}$/i;
    if (!caseNumberPattern.test(caseNumber.trim())) {
      toast.error("Nieprawidłowy format numeru sprawy. Prawidłowy format: EZ-XXXXXXXXX");
      return;
    }

    setIsSearching(true);
    setMed24Status(null);
    
    try {
      // Use secure edge function instead of direct database query
      const { data, error } = await supabase.functions.invoke('get-case-status', {
        body: { case_number: caseNumber.trim().toUpperCase() }
      });

      if (error) {
        console.error('Search error:', error);
        toast.error("Wystąpił błąd podczas wyszukiwania");
        setCaseData(null);
        return;
      }
      
      if (data?.error) {
        toast.error(data.error);
        setCaseData(null);
        return;
      }

      if (!data?.case) {
        toast.error("Nie znaleziono wizyty o podanym numerze");
        setCaseData(null);
        return;
      }

      setCaseData(data.case);
      
      // Note: Med24 status is not available in public status check for security reasons
      // Only basic case status is shown
    } catch (error) {
      console.error('Błąd podczas wyszukiwania:', error);
      toast.error("Wystąpił błąd podczas wyszukiwania");
    } finally {
      setIsSearching(false);
    }
  };

  const handleRefresh = async () => {
    if (caseData) {
      await handleSearch();
      toast.success("Status zaktualizowany");
    }
  };

  // Unified status logic - based only on case status (no Med24 details for security)
  const getUnifiedStatus = () => {
    if (!caseData) return null;

    // If case is rejected
    if (caseData.status === 'rejected') {
      return {
        label: "Odrzucona",
        description: "Lekarz po analizie wywiadu medycznego podjął decyzję o niewystawieniu zwolnienia lekarskiego.",
        icon: XCircle,
        color: "text-destructive",
        bgColor: "bg-destructive/10",
        borderColor: "border-destructive/20"
      };
    }

    // If case is completed
    if (caseData.status === 'completed') {
      return {
        label: "Zakończona",
        description: "Wizyta została zakończona. Zwolnienie lekarskie zostało wystawione.",
        icon: CheckCircle,
        color: "text-green-500",
        bgColor: "bg-green-50",
        borderColor: "border-green-200"
      };
    }

    // If payment failed
    if (caseData.payment_status === 'fail') {
      return {
        label: "Płatność nieudana",
        description: "Płatność za wizytę nie została zrealizowana. Skontaktuj się z nami, aby dokończyć proces.",
        icon: XCircle,
        color: "text-destructive",
        bgColor: "bg-destructive/10",
        borderColor: "border-destructive/20"
      };
    }

    // If payment pending
    if (caseData.payment_status === 'pending') {
      return {
        label: "Oczekuje na płatność",
        description: "Oczekujemy na potwierdzenie płatności za wizytę.",
        icon: Clock,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200"
      };
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

  const status = getUnifiedStatus();

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
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Odśwież
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Unified Status Display */}
                <div className={`p-4 sm:p-6 rounded-lg border ${status.bgColor} ${status.borderColor}`}>
                  <div className="flex flex-col gap-3 sm:gap-4">
                    <div className="flex items-center gap-3">
                      <div className={status.color}>
                        <status.icon className="w-6 h-6 sm:w-8 sm:h-8" />
                      </div>
                      <p className={`text-xl sm:text-2xl font-bold ${status.color}`}>
                        {status.label}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-lg font-mono font-bold text-muted-foreground break-all mb-2">
                        {caseData.case_number}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {status.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Visit Details - only non-sensitive information */}
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
