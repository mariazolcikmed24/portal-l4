import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const RODO = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
            Ochrona danych osobowych (RODO)
          </h1>

          <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Administrator danych</h2>
              <p>
                Administratorem Twoich danych osobowych jest <strong>Med24 Holding sp. z o.o.</strong> z siedzibą 
                w Warszawie przy ul. Berezyńskiej 39 (03-908 Warszawa), wpisana przez Sąd Rejonowy dla m. st. Warszawy 
                w Warszawie, XII Wydział Gospodarczy Krajowego Rejestru Sądowego pod numerem KRS 0000875629, 
                REGON: 387834113, NIP: 5252847595.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Twoje prawa zgodnie z RODO</h2>
              <p>Na podstawie Rozporządzenia Parlamentu Europejskiego i Rady (UE) 2016/679 przysługują Ci następujące prawa:</p>
              
              <div className="bg-muted/30 p-6 rounded-lg mt-4 space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground">Prawo dostępu (art. 15 RODO)</h3>
                  <p className="text-sm mt-1">Masz prawo uzyskać informację, czy przetwarzamy Twoje dane, oraz uzyskać do nich dostęp.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-foreground">Prawo do sprostowania (art. 16 RODO)</h3>
                  <p className="text-sm mt-1">Masz prawo żądać poprawienia nieprawidłowych danych lub uzupełnienia niekompletnych.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-foreground">Prawo do usunięcia (art. 17 RODO)</h3>
                  <p className="text-sm mt-1">Masz prawo żądać usunięcia danych w określonych przypadkach (nie dotyczy dokumentacji medycznej).</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-foreground">Prawo do ograniczenia przetwarzania (art. 18 RODO)</h3>
                  <p className="text-sm mt-1">Masz prawo żądać ograniczenia przetwarzania w określonych sytuacjach.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-foreground">Prawo do przenoszenia (art. 20 RODO)</h3>
                  <p className="text-sm mt-1">Masz prawo otrzymać swoje dane w formacie nadającym się do odczytu maszynowego.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-foreground">Prawo do sprzeciwu (art. 21 RODO)</h3>
                  <p className="text-sm mt-1">Masz prawo sprzeciwić się przetwarzaniu danych na podstawie prawnie uzasadnionego interesu.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Dane medyczne</h2>
              <p>
                Dane dotyczące zdrowia (dane szczególnej kategorii) przetwarzamy na podstawie art. 9 ust. 2 lit. h RODO 
                w celu profilaktyki zdrowotnej, diagnozy medycznej i zapewnienia opieki zdrowotnej. Przetwarzanie 
                następuje pod nadzorem osób wykonujących zawód medyczny i zobowiązanych do zachowania tajemnicy zawodowej.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Jak skorzystać ze swoich praw?</h2>
              <p>
                Aby skorzystać ze swoich praw, skontaktuj się z nami:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>E-mail: kontakt@e-zwolnienie.com.pl</li>
                <li>Pisemnie: Med24 Holding sp. z o.o., ul. Berezyńska 39, 03-908 Warszawa</li>
              </ul>
              <p className="mt-4">
                Odpowiemy na Twoje żądanie bez zbędnej zwłoki, nie później niż w ciągu miesiąca od otrzymania żądania.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Prawo do skargi</h2>
              <p>
                Jeśli uważasz, że przetwarzanie Twoich danych narusza przepisy RODO, masz prawo wnieść skargę 
                do organu nadzorczego:
              </p>
              <div className="bg-muted/30 p-4 rounded-lg mt-2">
                <p className="font-medium text-foreground">Prezes Urzędu Ochrony Danych Osobowych</p>
                <p className="text-sm">ul. Stawki 2, 00-193 Warszawa</p>
                <p className="text-sm">www.uodo.gov.pl</p>
              </div>
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

export default RODO;
