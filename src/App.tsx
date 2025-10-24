import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
