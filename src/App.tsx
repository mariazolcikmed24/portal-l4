import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";

// Lazy load all pages except Index (landing page)
const WyborSciezki = lazy(() => import("./pages/WyborSciezki"));
const Rejestracja = lazy(() => import("./pages/Rejestracja"));
const Logowanie = lazy(() => import("./pages/Logowanie"));
const DatyChoroby = lazy(() => import("./pages/DatyChoroby"));
const RodzajZwolnienia = lazy(() => import("./pages/RodzajZwolnienia"));
const WywiadOgolny = lazy(() => import("./pages/WywiadOgolny"));
const WywiadObjawy = lazy(() => import("./pages/WywiadObjawy"));
const Podsumowanie = lazy(() => import("./pages/Podsumowanie"));
const Platnosc = lazy(() => import("./pages/Platnosc"));
const Potwierdzenie = lazy(() => import("./pages/Potwierdzenie"));
const StatusSprawy = lazy(() => import("./pages/StatusSprawy"));
const PanelUzytkownika = lazy(() => import("./pages/PanelUzytkownika"));
const DokumentacjaAPI = lazy(() => import("./pages/DokumentacjaAPI"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Minimal loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/wybor-sciezki" element={<WyborSciezki />} />
              <Route path="/rejestracja" element={<Rejestracja />} />
              <Route path="/logowanie" element={<Logowanie />} />
              <Route path="/daty-choroby" element={<DatyChoroby />} />
              <Route path="/rodzaj-zwolnienia" element={<RodzajZwolnienia />} />
              <Route path="/wywiad-ogolny" element={<WywiadOgolny />} />
              <Route path="/wywiad-objawy" element={<WywiadObjawy />} />
              <Route path="/podsumowanie" element={<Podsumowanie />} />
              <Route path="/platnosc" element={<Platnosc />} />
              <Route path="/potwierdzenie" element={<Potwierdzenie />} />
              <Route path="/status" element={<StatusSprawy />} />
              <Route path="/status-sprawy" element={<StatusSprawy />} />
              <Route path="/panel" element={<PanelUzytkownika />} />
              <Route path="/api-docs" element={<DokumentacjaAPI />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
