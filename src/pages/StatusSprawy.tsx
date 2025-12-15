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
      'draft': 'text-muted-foreground',
      'submitted': 'text-blue-500',
      'in_review': 'text-yellow-500',
      'completed': 'text-green-500',
      'rejected': 'text-destructive'
    };
    return colors[status] || 'text-muted-foreground';
  };

  const fetchMed24Status = async (visitId: string) => {
    setIsFetchingMed24(true);
    try {
      console.log('Fetching Med24 status for visit:', visitId);
      
      const { data, error } = await supabase.functions.invoke('med24-get-visit', {
        body: { visit_id: visitId }
      });

      if (error) {
        console.error('Error fetching Med24 status:', error);
        toast.error("Błąd podczas pobierania statusu z systemu medycznego");
        return null;
      }

      console.log('Med24 status response:', data);
      
      if (data?.visit) {
        setMed24Status(data.visit);
        return data.visit;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching Med24 status:', error);
      toast.error("Błąd podczas pobierania statusu");
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
      
      // Automatically fetch Med24 status if visit_id exists
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

  const handleRefreshMed24 = async () => {
    if (caseData?.med24_visit_id) {
      await fetchMed24Status(caseData.med24_visit_id);
      toast.success("Status zaktualizowany");
    }
  };

  const getMed24StatusInfo = () => {
    if (!med24Status) return null;

    if (med24Status.is_cancelled) {
      return {
        label: "Anulowana",
        icon: XCircle,
        color: "text-destructive",
        bgColor: "bg-destructive/10",
        borderColor: "border-destructive/20"
      };
    }
    
    if (med24Status.is_resolved) {
      return {
        label: "Zakończona",
        icon: CheckCircle,
        color: "text-green-500",
        bgColor: "bg-green-50",
        borderColor: "border-green-200"
      };
    }
    
    if (med24Status.is_booking_finalized) {
      return {
        label: "W trakcie realizacji",
        icon: Clock,
        color: "text-yellow-500",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200"
      };
    }
    
    return {
      label: "Oczekuje na przyjęcie",
      icon: Clock,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    };
  };

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

        {caseData && (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Informacje o wizycie</CardTitle>
                {caseData.med24_visit_id && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRefreshMed24}
                    disabled={isFetchingMed24}
                  >
                    {isFetchingMed24 ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Odśwież status
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Status lokalny</p>
                    <p className={`text-2xl font-bold ${getStatusColor(caseData.status)}`}>
                      {getStatusLabel(caseData.status)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Numer wizyty</p>
                    <p className="text-xl font-mono font-bold">{caseData.case_number}</p>
                  </div>
                </div>

                {/* Med24 Status Section */}
                {caseData.med24_visit_id && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">Status w systemie medycznym</p>
                    
                    {isFetchingMed24 ? (
                      <div className="flex items-center gap-2 p-4 bg-muted/30 rounded-lg">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        <span className="text-muted-foreground">Pobieranie statusu...</span>
                      </div>
                    ) : med24Status ? (
                      <div className={`p-4 rounded-lg border ${getMed24StatusInfo()?.bgColor} ${getMed24StatusInfo()?.borderColor}`}>
                        <div className="flex items-center gap-3">
                          {getMed24StatusInfo()?.icon && (
                            <div className={getMed24StatusInfo()?.color}>
                              {(() => {
                                const Icon = getMed24StatusInfo()?.icon;
                                return Icon ? <Icon className="w-6 h-6" /> : null;
                              })()}
                            </div>
                          )}
                          <div>
                            <p className={`text-lg font-semibold ${getMed24StatusInfo()?.color}`}>
                              {getMed24StatusInfo()?.label}
                            </p>
                            <div className="text-sm text-muted-foreground space-y-1 mt-1">
                              <p>Rezerwacja: {med24Status.is_booking_finalized ? "Potwierdzona" : "W trakcie"}</p>
                              <p>Wizyta: {med24Status.is_resolved ? "Zakończona" : "W trakcie"}</p>
                              {med24Status.is_cancelled && <p className="text-destructive">Wizyta została anulowana</p>}
                            </div>
                          </div>
                        </div>
                        
                        {med24Status.documentation_download_url && (
                          <div className="mt-4 pt-4 border-t">
                            <a 
                              href={med24Status.documentation_download_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-primary hover:underline"
                            >
                              Pobierz dokumentację medyczną
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 bg-muted/30 rounded-lg text-muted-foreground">
                        Nie udało się pobrać statusu z systemu medycznego
                      </div>
                    )}
                  </div>
                )}

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
                    <strong>Status:</strong> Twoja wizyta jest obecnie weryfikowana przez lekarza. Możesz otrzymać telefon w celu potwierdzenia danych.
                  </p>
                </CardContent>
              </Card>
            )}

            {caseData.status === 'completed' && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <p className="text-sm">
                    <strong>Gratulacje!</strong> E-zwolnienie zostało wystawione i wysłane do systemu ZUS oraz do Twojego pracodawcy. Potwierdzenie zostało wysłane na Twój adres email.
                  </p>
                </CardContent>
              </Card>
            )}

            {caseData.status === 'rejected' && (
              <Card className="bg-destructive/10 border-destructive/20">
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
