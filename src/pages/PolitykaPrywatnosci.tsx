import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const PolitykaPrywatnosci = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
            Polityka Prywatności
          </h1>

          <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Administrator danych osobowych</h2>
              <p>
                Administratorem Twoich danych osobowych jest <strong>Med24 Holding sp. z o.o.</strong> z siedzibą 
                w Warszawie przy ul. Berezyńskiej 39 (03-908 Warszawa), wpisana przez Sąd Rejonowy dla m. st. Warszawy 
                w Warszawie, XII Wydział Gospodarczy Krajowego Rejestru Sądowego do rejestru przedsiębiorców 
                Krajowego Rejestru Sądowego pod numerem KRS 0000875629, REGON: 387834113, NIP: 5252847595.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Kontakt z administratorem</h2>
              <p>
                W sprawach związanych z ochroną danych osobowych możesz skontaktować się z nami:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>E-mail: kontakt@e-zwolnienie.com.pl</li>
                <li>Adres: ul. Berezyńska 39, 03-908 Warszawa</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Cel i podstawa przetwarzania danych</h2>
              <p>Twoje dane osobowe przetwarzamy w następujących celach:</p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>Świadczenie usług telemedycznych i wystawianie zwolnień lekarskich (art. 6 ust. 1 lit. b RODO)</li>
                <li>Realizacja obowiązków prawnych związanych z prowadzeniem dokumentacji medycznej (art. 6 ust. 1 lit. c RODO)</li>
                <li>Marketing bezpośredni własnych usług (art. 6 ust. 1 lit. f RODO)</li>
                <li>Dochodzenie lub obrona przed roszczeniami (art. 6 ust. 1 lit. f RODO)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Kategorie przetwarzanych danych</h2>
              <p>W ramach świadczenia usług przetwarzamy następujące kategorie danych:</p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>Dane identyfikacyjne (imię, nazwisko, PESEL, data urodzenia)</li>
                <li>Dane kontaktowe (adres e-mail, numer telefonu, adres zamieszkania)</li>
                <li>Dane dotyczące zdrowia (informacje o objawach, chorobach, lekach)</li>
                <li>Dane pracodawcy (w celu wysłania e-zwolnienia)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">5. Okres przechowywania danych</h2>
              <p>
                Dokumentacja medyczna przechowywana jest przez okres 20 lat od końca roku kalendarzowego, 
                w którym dokonano ostatniego wpisu, zgodnie z obowiązującymi przepisami prawa. 
                Pozostałe dane przechowujemy przez okres niezbędny do realizacji celów, dla których zostały zebrane.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">6. Twoje prawa</h2>
              <p>W związku z przetwarzaniem danych osobowych przysługują Ci następujące prawa:</p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>Prawo dostępu do swoich danych</li>
                <li>Prawo do sprostowania danych</li>
                <li>Prawo do usunięcia danych („prawo do bycia zapomnianym")</li>
                <li>Prawo do ograniczenia przetwarzania</li>
                <li>Prawo do przenoszenia danych</li>
                <li>Prawo do sprzeciwu wobec przetwarzania</li>
                <li>Prawo do cofnięcia zgody w dowolnym momencie</li>
                <li>Prawo do wniesienia skargi do Prezesa UODO</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">7. Bezpieczeństwo danych</h2>
              <p>
                Stosujemy odpowiednie środki techniczne i organizacyjne zapewniające bezpieczeństwo 
                przetwarzanych danych osobowych, w tym szyfrowanie SSL, bezpieczne serwery 
                oraz kontrolę dostępu do danych.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">8. Odbiorcy danych</h2>
              <p>Twoje dane mogą być przekazywane:</p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>ZUS (w celu przekazania e-zwolnienia)</li>
                <li>Pracodawcy (w celu przekazania e-zwolnienia)</li>
                <li>Dostawcom usług IT wspierających działanie serwisu</li>
                <li>Podmiotom uprawnionym na podstawie przepisów prawa</li>
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

export default PolitykaPrywatnosci;
