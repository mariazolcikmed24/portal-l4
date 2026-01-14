import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useLanguageSync } from "./hooks/useLanguageSync";
import Index from "./pages/Index";
import WyborSciezki from "./pages/WyborSciezki";
import Rejestracja from "./pages/Rejestracja";
import Logowanie from "./pages/Logowanie";
import DatyChoroby from "./pages/DatyChoroby";
import RodzajZwolnienia from "./pages/RodzajZwolnienia";
import WywiadOgolny from "./pages/WywiadOgolny";
import WywiadObjawy from "./pages/WywiadObjawy";
import Podsumowanie from "./pages/Podsumowanie";
import Platnosc from "./pages/Platnosc";
import Potwierdzenie from "./pages/Potwierdzenie";
import StatusSprawy from "./pages/StatusSprawy";
import PanelUzytkownika from "./pages/PanelUzytkownika";
import DokumentacjaAPI from "./pages/DokumentacjaAPI";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Component that handles language sync
const LanguageSyncWrapper = ({ children }: { children: React.ReactNode }) => {
  useLanguageSync();
  return <>{children}</>;
};

// Root redirect based on detected/stored language
const RootRedirect = () => {
  const storedLang = localStorage.getItem('i18nextLng');
  const browserLang = navigator.language.split('-')[0];
  const targetLang = storedLang || (browserLang === 'en' ? 'en' : 'pl');
  return <Navigate to={`/${targetLang}`} replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <LanguageSyncWrapper>
            <Routes>
              {/* Root redirect */}
              <Route path="/" element={<RootRedirect />} />
              
              {/* Polish routes */}
              <Route path="/pl" element={<Index />} />
              <Route path="/pl/wybor-sciezki" element={<WyborSciezki />} />
              <Route path="/pl/rejestracja" element={<Rejestracja />} />
              <Route path="/pl/logowanie" element={<Logowanie />} />
              <Route path="/pl/daty-choroby" element={<DatyChoroby />} />
              <Route path="/pl/rodzaj-zwolnienia" element={<RodzajZwolnienia />} />
              <Route path="/pl/wywiad-ogolny" element={<WywiadOgolny />} />
              <Route path="/pl/wywiad-objawy" element={<WywiadObjawy />} />
              <Route path="/pl/podsumowanie" element={<Podsumowanie />} />
              <Route path="/pl/platnosc" element={<Platnosc />} />
              <Route path="/pl/potwierdzenie" element={<Potwierdzenie />} />
              <Route path="/pl/status" element={<StatusSprawy />} />
              <Route path="/pl/status-sprawy" element={<StatusSprawy />} />
              <Route path="/pl/panel" element={<PanelUzytkownika />} />
              <Route path="/pl/api-docs" element={<DokumentacjaAPI />} />
              
              {/* English routes */}
              <Route path="/en" element={<Index />} />
              <Route path="/en/choose-path" element={<WyborSciezki />} />
              <Route path="/en/registration" element={<Rejestracja />} />
              <Route path="/en/login" element={<Logowanie />} />
              <Route path="/en/illness-dates" element={<DatyChoroby />} />
              <Route path="/en/leave-type" element={<RodzajZwolnienia />} />
              <Route path="/en/general-interview" element={<WywiadOgolny />} />
              <Route path="/en/symptoms" element={<WywiadObjawy />} />
              <Route path="/en/summary" element={<Podsumowanie />} />
              <Route path="/en/payment" element={<Platnosc />} />
              <Route path="/en/confirmation" element={<Potwierdzenie />} />
              <Route path="/en/status" element={<StatusSprawy />} />
              <Route path="/en/case-status" element={<StatusSprawy />} />
              <Route path="/en/dashboard" element={<PanelUzytkownika />} />
              <Route path="/en/api-docs" element={<DokumentacjaAPI />} />
              
              {/* Legacy routes - redirect to Polish */}
              <Route path="/wybor-sciezki" element={<Navigate to="/pl/wybor-sciezki" replace />} />
              <Route path="/rejestracja" element={<Navigate to="/pl/rejestracja" replace />} />
              <Route path="/logowanie" element={<Navigate to="/pl/logowanie" replace />} />
              <Route path="/daty-choroby" element={<Navigate to="/pl/daty-choroby" replace />} />
              <Route path="/rodzaj-zwolnienia" element={<Navigate to="/pl/rodzaj-zwolnienia" replace />} />
              <Route path="/wywiad-ogolny" element={<Navigate to="/pl/wywiad-ogolny" replace />} />
              <Route path="/wywiad-objawy" element={<Navigate to="/pl/wywiad-objawy" replace />} />
              <Route path="/podsumowanie" element={<Navigate to="/pl/podsumowanie" replace />} />
              <Route path="/platnosc" element={<Navigate to="/pl/platnosc" replace />} />
              <Route path="/potwierdzenie" element={<Navigate to="/pl/potwierdzenie" replace />} />
              <Route path="/status" element={<Navigate to="/pl/status" replace />} />
              <Route path="/status-sprawy" element={<Navigate to="/pl/status-sprawy" replace />} />
              <Route path="/panel" element={<Navigate to="/pl/panel" replace />} />
              <Route path="/api-docs" element={<Navigate to="/pl/api-docs" replace />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </LanguageSyncWrapper>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
