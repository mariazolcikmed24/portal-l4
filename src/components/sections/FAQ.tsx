import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, ClipboardList, Stethoscope, FileCheck } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string | null;
  richAnswer?: boolean;
}

const faqs: FaqItem[] = [
  {
    question: "Czy zwolnienie lekarskie online jest legalne?",
    answer: "Tak, zwolnienia lekarskie wystawiane online są w pełni legalne i zgodne z polskim prawem. Konsultacje prowadzą licencjonowani lekarze posiadający prawo wykonywania zawodu. e-zwolnienie jest akceptowane przez ZUS i pracodawców na takich samych zasadach jak tradycyjne zwolnienie."
  },
  {
    question: "Jak szybko otrzymam zwolnienie lekarskie?",
    answer: "Zwolnienie możesz otrzymać nawet do 30 minut od złożenia Zamówienia (maksymalny czas realizacji konsultacji to 24 godziny) e-zwolnienie jest automatycznie wysyłane do ZUS i Twojego pracodawcy, więc nie musisz niczego dodatkowo załatwiać. Otrzymasz go również na maila podanego w formularzu."
  },
  {
    question: "Czy lekarz na pewno wystawi mi zwolnienie?",
    answer: "Decyzję o wystawieniu zwolnienia podejmuje lekarz na podstawie przeprowadzonej konsultacji medycznej. Lekarz musi stwierdzić, że stan Twojego zdrowia uzasadnia czasową niezdolność do pracy. To nie jest usługa, która gwarantuje automatyczne wystawienie zwolnienia."
  },
  {
    question: "Na ile dni mogę otrzymać zwolnienie online?",
    answer: "e-zwolnienie (L4) może zostać wystawione na liczbę dni odpowiadających potrzebie pacjenta -  w zależności od stanu zdrowia. Data początkowa może być maksymalnie 3 dni wstecz od dnia konsultacji. W przypadku konieczności dłuższego zwolnienia, lekarz może zalecić wizytę stacjonarną. Jeśli konieczne jest dłuższe zwolnienie, lekarz może zalecić dalsze leczenie lub wizytę stacjonarną. Warto pamiętać, że o wystawieniu zwolnienia i jego długości zawsze decyduje lekarz podczas konsultacji."
  },
  {
    question: "Czy moje dane są bezpieczne?",
    answer: "Tak, w pełni przestrzegamy przepisów RODO. Wszystkie dane są szyfrowane, przechowywane na bezpiecznych serwerach i dostępne tylko dla uprawnionych osób. Nigdy nie udostępniamy Twoich danych medycznych osobom trzecim bez Twojej zgody."
  },
  {
    question: "Jak wygląda proces uzyskania zwolnienia?",
    answer: null,
    richAnswer: true
  },
  {
    question: "Czy mogę uzyskać zwolnienie na opiekę nad dzieckiem?",
    answer: "Tak. Podczas konsultacji lekarz może wystawić zwolnienie na opiekę nad dzieckiem lub innym chorym członkiem Twojej rodziny (zwolnienie opiekuńcze). W formularzu podaj dane osoby chorej (wymagającej opieki) oraz dane Twojego pracodawcy. Lekarz oceni sytuację zdrowotną i podejmie decyzję o wystawieniu zwolnienia."
  },
  {
    question: "Co jeśli jestem studentem lub uczniem?",
    answer: "Studenci i uczniowie również mogą skorzystać z naszej usługi. W takim przypadku lekarz wystawi  zaświadczenie  na uczelnię (nie zwolnienie L4). Otrzymasz na maila dokument w formie PDF, który możesz przedstawić w szkole lub na uczelni. "
  },
  {
    question: "Jak otrzymam zwolnienie lekarskie?",
    answer: "Dokumentację medyczną w tym L4, zalecenia, e-receptę, skierowania na badania, zaświadczenia itp. wyślemy na adres EMAIL podany w formularzu rejestracyjnym."
  }
];

const FAQ = () => {
  return (
    <section id="faq" className="pt-8 pb-16 md:pt-12 md:pb-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
            <HelpCircle className="w-8 h-8 text-primary" aria-hidden="true" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Najczęściej zadawane <span className="text-primary">pytania</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            Wszystko, co musisz wiedzieć o zwolnieniach lekarskich online
          </p>
        </div>

        {/* FAQ content always in DOM - answers hidden with CSS, not conditional render */}
        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-gradient-card border border-border rounded-xl px-6 shadow-soft hover:shadow-medium transition-smooth overflow-hidden"
              >
                <AccordionTrigger className="text-left text-lg font-semibold text-foreground hover:text-primary py-6 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                  {faq.richAnswer ? (
                    <div className="space-y-4">
                      <p>Proces składa się z trzech prostych kroków:</p>
                      <ol className="space-y-3">
                        <li className="flex gap-3 items-start">
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <ClipboardList className="w-4 h-4 text-primary" />
                          </span>
                          <div>
                            <span className="font-semibold text-foreground">Wypełniasz formularz medyczny online</span>
                            <span className="text-muted-foreground"> — zajmie ci to do 2 minut.</span>
                          </div>
                        </li>
                        <li className="flex gap-3 items-start">
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Stethoscope className="w-4 h-4 text-primary" />
                          </span>
                          <div>
                            <span className="font-semibold text-foreground">Lekarz weryfikuje dane z wypełnionego przez Ciebie formularza medycznego</span>
                            <span className="text-muted-foreground"> — i w razie potrzeby przeprowadza konsultację telefoniczną z Tobą.</span>
                          </div>
                        </li>
                        <li className="flex gap-3 items-start">
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <FileCheck className="w-4 h-4 text-primary" />
                          </span>
                          <div>
                            <span className="font-semibold text-foreground">Otrzymujesz e-zwolnienie</span>
                            <span className="text-muted-foreground"> — które automatycznie trafia na Twojego maila, do ZUS i Twojego pracodawcy.</span>
                          </div>
                        </li>
                      </ol>
                      <p className="text-sm bg-muted/50 rounded-lg px-4 py-2.5 border border-border">
                        ⏱️ Cały proces zajmuje nawet <span className="font-semibold text-foreground">30 minut</span>, najczęściej do 4h, maksymalnie 24h.
                      </p>
                    </div>
                  ) : (
                    faq.answer
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Hidden FAQ content for SEO - always in DOM */}
        <div className="sr-only" aria-hidden="true">
          {faqs.map((faq, index) => (
            <div key={`seo-${index}`}>
              <h3>{faq.question}</h3>
              <p>{faq.richAnswer ? "Proces składa się z trzech prostych kroków: 1) Wypełniasz formularz medyczny online, zajmie ci to do 2 minut 2) Lekarz weryfikuje dane z wypełnionego przez Ciebie formularza medycznego i w razie potrzeby przeprowadza konsultację telefoniczną z Tobą. 3) Otrzymujesz e-zwolnienie, które automatycznie trafia na Twojego maila, do ZUS i Twojego pracodawcy. Cały proces zajmuje nawet 30 minut, najczęściej do 4h, maksymalnie 24h." : faq.answer}</p>
            </div>
          ))}
        </div>

        {/* Additional help */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Nie znalazłeś odpowiedzi na swoje pytanie?
          </p>
          <a
            href="#kontakt"
            className="text-primary font-semibold hover:underline transition-smooth"
          >
            Skontaktuj się z nami →
          </a>
        </div>
      </div>

      {/* Schema.org markup moved to index.html <head> for early loading */}
    </section>
  );
};

export default FAQ;
