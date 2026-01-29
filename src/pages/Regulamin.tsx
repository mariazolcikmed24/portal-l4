import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const Regulamin = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
            Regulamin serwisu e-zwolnienie.com.pl
          </h1>

          <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">§1. Postanowienia ogólne</h2>
              <ol className="list-decimal pl-6 space-y-2">
                <li>
                  Niniejszy Regulamin określa zasady korzystania z serwisu internetowego e-zwolnienie.com.pl 
                  (dalej: „Serwis").
                </li>
                <li>
                  Właścicielem i operatorem Serwisu jest <strong>Med24 Holding sp. z o.o.</strong> z siedzibą 
                  w Warszawie przy ul. Berezyńskiej 39 (03-908 Warszawa), wpisana przez Sąd Rejonowy dla m. st. Warszawy 
                  w Warszawie, XII Wydział Gospodarczy Krajowego Rejestru Sądowego do rejestru przedsiębiorców 
                  Krajowego Rejestru Sądowego pod numerem KRS 0000875629, REGON: 387834113, NIP: 5252847595.
                </li>
                <li>
                  Korzystanie z Serwisu oznacza akceptację niniejszego Regulaminu.
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">§2. Definicje</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Serwis</strong> – strona internetowa e-zwolnienie.com.pl</li>
                <li><strong>Użytkownik</strong> – osoba korzystająca z Serwisu</li>
                <li><strong>Pacjent</strong> – Użytkownik korzystający z usług telemedycznych</li>
                <li><strong>Lekarz</strong> – osoba uprawniona do wykonywania zawodu lekarza</li>
                <li><strong>e-zwolnienie</strong> – elektroniczne zwolnienie lekarskie (e-ZLA)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">§3. Usługi</h2>
              <ol className="list-decimal pl-6 space-y-2">
                <li>
                  Serwis umożliwia przeprowadzenie telemedycznej konsultacji lekarskiej, której celem może być 
                  uzyskanie elektronicznego zwolnienia lekarskiego.
                </li>
                <li>
                  Konsultacje prowadzone są przez lekarzy posiadających prawo wykonywania zawodu na terenie Polski.
                </li>
                <li>
                  Decyzja o wystawieniu zwolnienia lekarskiego należy wyłącznie do lekarza prowadzącego konsultację.
                </li>
                <li>
                  Serwis nie gwarantuje wystawienia zwolnienia lekarskiego – jest to decyzja medyczna podejmowana 
                  przez lekarza na podstawie wywiadu i oceny stanu zdrowia Pacjenta.
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">§4. Warunki korzystania</h2>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Użytkownik zobowiązany jest do podania prawdziwych danych osobowych.</li>
                <li>
                  Użytkownik oświadcza, że informacje przekazane lekarzowi są zgodne z prawdą i dotyczą 
                  jego rzeczywistego stanu zdrowia.
                </li>
                <li>Użytkownik musi być osobą pełnoletnią lub posiadać zgodę opiekuna prawnego.</li>
                <li>
                  Korzystanie z Serwisu w celu uzyskania zwolnienia lekarskiego bez uzasadnienia medycznego 
                  jest zabronione i może stanowić naruszenie prawa.
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">§5. Płatności</h2>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Usługi świadczone za pośrednictwem Serwisu są płatne.</li>
                <li>Cennik usług dostępny jest na stronie Serwisu przed rozpoczęciem procesu.</li>
                <li>Płatność realizowana jest za pośrednictwem zewnętrznego operatora płatności.</li>
                <li>
                  W przypadku niewystawienia zwolnienia przez lekarza, opłata za konsultację nie podlega zwrotowi, 
                  ponieważ usługa konsultacji medycznej została zrealizowana.
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">§6. Odpowiedzialność</h2>
              <ol className="list-decimal pl-6 space-y-2">
                <li>
                  Operator Serwisu nie ponosi odpowiedzialności za decyzje medyczne podejmowane przez lekarzy.
                </li>
                <li>
                  Operator nie ponosi odpowiedzialności za skutki podania przez Użytkownika nieprawdziwych 
                  lub niepełnych informacji.
                </li>
                <li>
                  W przypadku nagłego zagrożenia życia lub zdrowia, Użytkownik powinien niezwłocznie 
                  skontaktować się z numerem alarmowym 112 lub udać się na Izbę Przyjęć.
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">§7. Reklamacje</h2>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Reklamacje można składać drogą elektroniczną na adres: kontakt@e-zwolnienie.com.pl</li>
                <li>Reklamacja zostanie rozpatrzona w terminie 14 dni od jej otrzymania.</li>
                <li>Odpowiedź na reklamację zostanie wysłana na adres e-mail Użytkownika.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">§8. Postanowienia końcowe</h2>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Operator zastrzega sobie prawo do zmiany Regulaminu.</li>
                <li>
                  W sprawach nieuregulowanych niniejszym Regulaminem zastosowanie mają przepisy prawa polskiego.
                </li>
                <li>
                  Wszelkie spory będą rozstrzygane przez sąd właściwy dla siedziby Operatora.
                </li>
              </ol>
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

export default Regulamin;
