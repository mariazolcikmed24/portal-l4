import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

type PaymentStatus = "pending" | "success" | "fail" | "verifying" | "error";

export default function Potwierdzenie() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [status, setStatus] = useState<PaymentStatus>("verifying");
  const [caseNumber, setCaseNumber] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const verifyReturn = async () => {
      // Autopay sends: ServiceID, OrderID, Hash
      const serviceId = searchParams.get("ServiceID");
      const orderId = searchParams.get("OrderID");
      const hash = searchParams.get("Hash");

      // Legacy support: if we have 'case' param, it's from our old flow
      const legacyCaseNumber = searchParams.get("case");

      if (!serviceId || !orderId || !hash) {
        if (legacyCaseNumber) {
          // Legacy flow - just show the case number, don't clear data (status unknown)
          setCaseNumber(legacyCaseNumber);
          setStatus("pending");
          return;
        }

        // Fallback 1: cid=OrderID passed via ReturnURL (works even across domains)
        const cid = searchParams.get('cid');
        if (cid) {
          const caseId = cid.length === 32
            ? `${cid.slice(0, 8)}-${cid.slice(8, 12)}-${cid.slice(12, 16)}-${cid.slice(16, 20)}-${cid.slice(20)}`
            : cid;

          try {
            const { data, error } = await supabase.functions.invoke("get-case-status", {
              body: { case_id: caseId },
            });

            if (data?.success && data.case && !error) {
              setCaseNumber(data.case.case_number);
              if (data.case.payment_status === "success") {
                setStatus("success");
                clearFormData();
              } else if (data.case.payment_status === "fail") {
                setStatus("fail");
              } else {
                setStatus("pending");
              }
              return;
            }
          } catch (e) {
            console.error("CID fallback lookup failed:", e);
          }
        }
        
        // Fallback 2 (same-domain only): use saved case ID from localStorage
        const guestCaseId = localStorage.getItem('guestCaseId');
        if (guestCaseId) {
          try {
            const { data, error } = await supabase.functions.invoke("get-case-status", {
              body: { case_id: guestCaseId },
            });
            
            if (data?.success && data.case && !error) {
              setCaseNumber(data.case.case_number);
              if (data.case.payment_status === "success") {
                setStatus("success");
                clearFormData();
              } else if (data.case.payment_status === "fail") {
                setStatus("fail");
              } else {
                setStatus("pending");
              }
              return;
            }
          } catch (e) {
            console.error("Fallback case lookup failed:", e);
          }
        }
        
        setStatus("error");
        setErrorMessage("Brak wymaganych parametrów płatności");
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("autopay-verify-return", {
          body: { ServiceID: serviceId, OrderID: orderId, Hash: hash },
        });

        if (error || !data?.valid) {
          console.error("Verification failed:", error || data?.error);
          setStatus("error");
          setErrorMessage(data?.error || "Weryfikacja płatności nie powiodła się");
          return;
        }

        setCaseNumber(data.case_number);
        
        // Map payment status
        if (data.payment_status === "success") {
          setStatus("success");
          clearFormData(); // Only clear on confirmed success
        } else if (data.payment_status === "fail") {
          setStatus("fail");
          // Don't clear - user may want to retry
        } else {
          // pending - payment is being processed, don't clear yet
          setStatus("pending");
        }
      } catch (err) {
        console.error("Verification error:", err);
        setStatus("error");
        setErrorMessage("Wystąpił błąd podczas weryfikacji płatności");
      }
    };

    verifyReturn();
  }, [searchParams]);

  const clearFormData = () => {
    // Clear all form data and guest profile after successful payment
    localStorage.removeItem("formData_datyChoroby");
    localStorage.removeItem("formData_rodzajZwolnienia");
    localStorage.removeItem("formData_wywiadOgolny");
    localStorage.removeItem("formData_wywiadObjawy");
    localStorage.removeItem("uploadedFiles_attachments");
    localStorage.removeItem("guestProfile");
  };

  if (status === "verifying") {
    return (
      <div className="min-h-screen bg-background py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Weryfikacja płatności...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Błąd weryfikacji</h1>
          <p className="text-muted-foreground mb-6">{errorMessage}</p>
          <Button onClick={() => navigate("/")}>Wróć na stronę główną</Button>
        </div>
      </div>
    );
  }

  if (status === "fail") {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Płatność nieudana</h1>
          <p className="text-muted-foreground mb-6">
            Płatność nie została zrealizowana. Możesz spróbować ponownie.
          </p>
          {caseNumber && (
            <p className="text-sm text-muted-foreground mb-4">
              Numer sprawy: <span className="font-mono font-bold">{caseNumber}</span>
            </p>
          )}
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate("/")}>
              Strona główna
            </Button>
            <Button onClick={() => navigate("/platnosc")}>Spróbuj ponownie</Button>
          </div>
        </div>
      </div>
    );
  }

  const isPending = status === "pending";
  const StatusIcon = isPending ? Clock : CheckCircle;
  const statusColor = isPending ? "text-yellow-500" : "text-green-500";

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <StatusIcon className={`h-16 w-16 ${statusColor}`} />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {isPending ? "Zgłoszenie przyjęte" : "Płatność potwierdzona"}
          </h1>
          <p className="text-muted-foreground">
            {isPending
              ? "Twoje zgłoszenie zostało zarejestrowane. Oczekujemy na potwierdzenie płatności."
              : "Twoje zgłoszenie zostało pomyślnie opłacone i zarejestrowane."}
          </p>
        </div>

        {caseNumber && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Numer sprawy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <span className="text-2xl font-mono font-bold text-primary">{caseNumber}</span>
              </div>
              <p className="text-sm text-muted-foreground text-center mt-2">
                Zapisz ten numer - będzie potrzebny do śledzenia statusu sprawy
              </p>
            </CardContent>
          </Card>
        )}

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
                    Na podstawie wywiadu medycznego lekarz podejmie decyzję o wystawieniu e-zwolnienia. Pamiętaj, że e-konsultacja nie gwarantuje wystawienia zwolnienia.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Wysyłka e-zwolnienia</h3>
                  <p className="text-sm text-muted-foreground">
                    Jeśli lekarz podejmie pozytywną decyzję, e-zwolnienie zostanie automatycznie wysłane do systemu ZUS i do Twojego pracodawcy.
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
                <strong>Informacja dla studentów/uczniów:</strong>
                <br />
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

        {caseNumber && (
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Sprawdzisz stan swojej sprawy wkrótce za pomocą numeru {caseNumber}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
