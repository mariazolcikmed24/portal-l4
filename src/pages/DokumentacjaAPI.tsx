import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Copy, Play, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  requestBody?: string;
  responseExample?: string;
}

const endpoints: ApiEndpoint[] = [
  {
    method: "POST",
    path: "/api-auth-register",
    description: "Rejestracja nowego użytkownika wraz z zgodami marketingowymi",
    requestBody: JSON.stringify({
      email: "jan.kowalski@example.com",
      password: "bezpieczne_haslo123",
      first_name: "Jan",
      last_name: "Kowalski",
      pesel: "12345678901",
      phone: "+48123456789",
      street: "Testowa",
      house_number: "1",
      apartment_number: "2",
      postal_code: "00-001",
      city: "Warszawa",
      consent_marketing: true,
      consent_phone: false,
      consent_sms: true,
      consent_email: true
    }, null, 2),
    responseExample: JSON.stringify({
      user: {
        id: "uuid-here",
        email: "jan.kowalski@example.com"
      }
    }, null, 2)
  },
  {
    method: "POST",
    path: "/api-auth-login",
    description: "Logowanie użytkownika i otrzymanie tokenów dostępu",
    requestBody: JSON.stringify({
      email: "jan.kowalski@example.com",
      password: "bezpieczne_haslo123"
    }, null, 2),
    responseExample: JSON.stringify({
      access_token: "eyJhbGc...",
      refresh_token: "eyJhbGc...",
      user: { id: "uuid", email: "jan.kowalski@example.com" },
      profile: { first_name: "Jan", last_name: "Kowalski" }
    }, null, 2)
  },
  {
    method: "POST",
    path: "/api-cases-create",
    description: "Utworzenie nowej sprawy medycznej/wizyty",
    requestBody: JSON.stringify({
      profile_id: "uuid-user-profile",
      illness_start_date: "2025-01-15",
      illness_end_date: "2025-01-22",
      leave_type: "zwykłe",
      symptoms: ["kaszel", "gorączka"],
      medications: ["Paracetamol"],
      chronic_conditions: ["astma"],
      pregnancy_week: null,
      additional_notes: "Objawy od 3 dni"
    }, null, 2),
    responseExample: JSON.stringify({
      id: "case-uuid",
      status: "draft",
      created_at: "2025-01-15T10:00:00Z"
    }, null, 2)
  },
  {
    method: "GET",
    path: "/api-cases-get/{case_id}",
    description: "Pobranie szczegółów sprawy wraz z profilem pacjenta",
    responseExample: JSON.stringify({
      id: "case-uuid",
      profile_id: "user-uuid",
      status: "submitted",
      illness_start_date: "2025-01-15",
      illness_end_date: "2025-01-22",
      profiles: {
        first_name: "Jan",
        last_name: "Kowalski",
        pesel: "12345678901",
        phone: "+48123456789"
      }
    }, null, 2)
  },
  {
    method: "PATCH",
    path: "/api-cases-update-status/{case_id}/status",
    description: "Aktualizacja statusu sprawy i danych Med24",
    requestBody: JSON.stringify({
      status: "completed",
      payment_status: "paid",
      med24_visit_id: "MED24-12345",
      med24_visit_status: "completed",
      med24_service_id: "SERVICE-789"
    }, null, 2),
    responseExample: JSON.stringify({
      id: "case-uuid",
      status: "completed",
      med24_visit_id: "MED24-12345",
      updated_at: "2025-01-15T12:00:00Z"
    }, null, 2)
  },
  {
    method: "POST",
    path: "/api-consent-save",
    description: "Zapisanie zgód marketingowych dla użytkownika lub gościa",
    requestBody: JSON.stringify({
      profile_id: "uuid-or-guest-identifier",
      consent_marketing: true,
      consent_phone: false,
      consent_sms: true,
      consent_email: true
    }, null, 2),
    responseExample: JSON.stringify({
      id: "profile-uuid",
      consent_marketing: true,
      consent_updated_at: "2025-01-15T10:00:00Z"
    }, null, 2)
  }
];

const DokumentacjaAPI = () => {
  const [apiKey, setApiKey] = useState("");
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint>(endpoints[0]);
  const [requestBody, setRequestBody] = useState(endpoints[0].requestBody || "");
  const [caseId, setCaseId] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<"success" | "error" | null>(null);

  const baseUrl = "https://ftejarickpnxucpungck.supabase.co/functions/v1";

  const handleEndpointChange = (endpoint: ApiEndpoint) => {
    setSelectedEndpoint(endpoint);
    setRequestBody(endpoint.requestBody || "");
    setResponse("");
    setResponseStatus(null);
  };

  const handleTestEndpoint = async () => {
    if (!apiKey.trim()) {
      toast.error("Wprowadź klucz API");
      return;
    }

    setLoading(true);
    setResponse("");
    setResponseStatus(null);

    try {
      let url = `${baseUrl}${selectedEndpoint.path}`;
      
      // Replace {case_id} with actual caseId
      if (url.includes("{case_id}")) {
        if (!caseId.trim()) {
          toast.error("Wprowadź ID sprawy");
          setLoading(false);
          return;
        }
        url = url.replace("{case_id}", caseId);
      }

      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
      };

      if (selectedEndpoint.method !== "GET" && requestBody) {
        options.body = requestBody;
      }

      const res = await fetch(url, options);
      const data = await res.json();

      setResponse(JSON.stringify(data, null, 2));
      setResponseStatus(res.ok ? "success" : "error");
      
      if (res.ok) {
        toast.success("Zapytanie wykonane pomyślnie");
      } else {
        toast.error(`Błąd: ${res.status} ${res.statusText}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Nieznany błąd";
      setResponse(JSON.stringify({ error: errorMessage }, null, 2));
      setResponseStatus("error");
      toast.error("Błąd wykonania zapytania");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Skopiowano do schowka");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">Dokumentacja API e-ZLA</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Interaktywna dokumentacja REST API dla integracji z systemem Med24
            </p>
          </div>

          {/* API Key Input */}
          <Card>
            <CardHeader>
              <CardTitle>Klucz API</CardTitle>
              <CardDescription>
                Wprowadź swój klucz API aby testować endpointy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="Wklej klucz API..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="font-mono"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(apiKey)}
                  disabled={!apiKey}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Klucz API znajduje się w bazie danych w tabeli <code className="text-xs bg-muted px-1 py-0.5 rounded">api_keys</code>
              </p>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: Endpoint Selection */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Dostępne endpointy</CardTitle>
                  <CardDescription>
                    Wybierz endpoint do testowania
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {endpoints.map((endpoint, index) => (
                    <button
                      key={index}
                      onClick={() => handleEndpointChange(endpoint)}
                      className={`w-full text-left p-4 rounded-lg border transition-smooth ${
                        selectedEndpoint === endpoint
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Badge
                          variant={endpoint.method === "GET" ? "default" : "secondary"}
                          className="mt-1"
                        >
                          {endpoint.method}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-sm font-medium text-foreground break-all">
                            {endpoint.path}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {endpoint.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Right: Testing Interface */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Badge variant={selectedEndpoint.method === "GET" ? "default" : "secondary"}>
                          {selectedEndpoint.method}
                        </Badge>
                        <span className="font-mono text-lg">{selectedEndpoint.path}</span>
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {selectedEndpoint.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Case ID Input for GET/PATCH endpoints */}
                  {selectedEndpoint.path.includes("{case_id}") && (
                    <div className="space-y-2">
                      <Label htmlFor="caseId">ID Sprawy</Label>
                      <Input
                        id="caseId"
                        placeholder="Wprowadź UUID sprawy..."
                        value={caseId}
                        onChange={(e) => setCaseId(e.target.value)}
                        className="font-mono"
                      />
                    </div>
                  )}

                  {/* Request Body */}
                  {selectedEndpoint.method !== "GET" && (
                    <Tabs defaultValue="request" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="request">Request Body</TabsTrigger>
                        <TabsTrigger value="example">Przykład odpowiedzi</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="request" className="space-y-2">
                        <div className="flex justify-between items-center">
                          <Label>JSON Body</Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(requestBody)}
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Kopiuj
                          </Button>
                        </div>
                        <Textarea
                          value={requestBody}
                          onChange={(e) => setRequestBody(e.target.value)}
                          className="font-mono text-xs min-h-[300px]"
                          placeholder="Wprowadź JSON..."
                        />
                      </TabsContent>

                      <TabsContent value="example" className="space-y-2">
                        <Label>Przykładowa odpowiedź</Label>
                        <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[300px] text-xs">
                          {selectedEndpoint.responseExample}
                        </pre>
                      </TabsContent>
                    </Tabs>
                  )}

                  {/* GET endpoint example */}
                  {selectedEndpoint.method === "GET" && (
                    <div className="space-y-2">
                      <Label>Przykładowa odpowiedź</Label>
                      <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[300px] text-xs">
                        {selectedEndpoint.responseExample}
                      </pre>
                    </div>
                  )}

                  {/* Execute Button */}
                  <Button
                    onClick={handleTestEndpoint}
                    disabled={loading || !apiKey}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Wykonywanie...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Wykonaj zapytanie
                      </>
                    )}
                  </Button>

                  {/* Response */}
                  {response && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2">
                          Odpowiedź
                          {responseStatus === "success" && (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          )}
                          {responseStatus === "error" && (
                            <XCircle className="w-4 h-4 text-destructive" />
                          )}
                        </Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(response)}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Kopiuj
                        </Button>
                      </div>
                      <pre
                        className={`p-4 rounded-lg overflow-auto max-h-[400px] text-xs ${
                          responseStatus === "success"
                            ? "bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-900"
                            : "bg-destructive/10 border border-destructive/20"
                        }`}
                      >
                        {response}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Informacje</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-foreground">Base URL:</p>
                    <code className="text-xs bg-muted px-2 py-1 rounded block mt-1 break-all">
                      {baseUrl}
                    </code>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Uwierzytelnianie:</p>
                    <p className="text-muted-foreground mt-1">
                      Wszystkie zapytania wymagają nagłówka <code className="text-xs bg-muted px-1 py-0.5 rounded">x-api-key</code>
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Kody błędów:</p>
                    <ul className="text-muted-foreground mt-1 space-y-1">
                      <li>• 400 - Nieprawidłowe dane wejściowe</li>
                      <li>• 401 - Brak autoryzacji (nieprawidłowy klucz API)</li>
                      <li>• 404 - Nie znaleziono zasobu</li>
                      <li>• 500 - Błąd serwera</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DokumentacjaAPI;