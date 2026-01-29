import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const Cookies = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
            Polityka Cookies
          </h1>

          <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Czym są pliki cookies?</h2>
              <p>
                Pliki cookies (ciasteczka) to małe pliki tekstowe zapisywane na Twoim urządzeniu podczas 
                korzystania ze strony internetowej. Służą one do prawidłowego funkcjonowania serwisu, 
                zapamiętywania preferencji oraz celów analitycznych.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Administrator</h2>
              <p>
                Administratorem plików cookies jest <strong>Med24 Holding sp. z o.o.</strong> z siedzibą 
                w Warszawie przy ul. Berezyńskiej 39 (03-908 Warszawa), KRS 0000875629, NIP: 5252847595.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Rodzaje wykorzystywanych cookies</h2>
              
              <div className="space-y-4 mt-4">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-semibold text-foreground">Cookies niezbędne</h3>
                  <p className="text-sm mt-1">
                    Wymagane do prawidłowego działania serwisu. Umożliwiają nawigację, logowanie i korzystanie 
                    z podstawowych funkcji. Bez nich serwis nie może funkcjonować prawidłowo.
                  </p>
                </div>
                
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-semibold text-foreground">Cookies funkcjonalne</h3>
                  <p className="text-sm mt-1">
                    Zapamiętują Twoje preferencje i ustawienia, np. wybór języka, aby poprawić komfort korzystania z serwisu.
                  </p>
                </div>
                
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-semibold text-foreground">Cookies analityczne</h3>
                  <p className="text-sm mt-1">
                    Pomagają nam zrozumieć, jak użytkownicy korzystają z serwisu. Zbierają anonimowe informacje 
                    o odwiedzanych stronach i czasie spędzonym w serwisie.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Okres przechowywania</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Cookies sesyjne</strong> – usuwane po zamknięciu przeglądarki</li>
                <li><strong>Cookies trwałe</strong> – przechowywane przez określony czas (zazwyczaj do 12 miesięcy)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">5. Zarządzanie cookies</h2>
              <p>
                Możesz zarządzać ustawieniami cookies w swojej przeglądarce:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Chrome: Ustawienia → Prywatność i bezpieczeństwo → Pliki cookies</li>
                <li>Firefox: Opcje → Prywatność i bezpieczeństwo → Ciasteczka</li>
                <li>Safari: Preferencje → Prywatność → Pliki cookies</li>
                <li>Edge: Ustawienia → Prywatność → Pliki cookies</li>
              </ul>
              <p className="mt-4 text-sm">
                Uwaga: Wyłączenie cookies niezbędnych może uniemożliwić korzystanie z niektórych funkcji serwisu.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">6. Kontakt</h2>
              <p>
                W przypadku pytań dotyczących polityki cookies, skontaktuj się z nami:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>E-mail: kontakt@e-zwolnienie.com.pl</li>
                <li>Adres: ul. Berezyńska 39, 03-908 Warszawa</li>
              </ul>
            </section>

            <p className="text-sm text-muted-foreground mt-12 pt-6 border-t">
              Ostatnia aktualizacja: styczeń 2026
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cookies;
