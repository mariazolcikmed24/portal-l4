import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "Czy zwolnienie lekarskie online jest legalne?",
    answer: "Tak, zwolnienia lekarskie wystawiane online są w pełni legalne i zgodne z polskim prawem. Konsultacje prowadzą licencjonowani lekarze posiadający prawo wykonywania zawodu. e-zwolnienie jest akceptowane przez ZUS i pracodawców na takich samych zasadach jak tradycyjne zwolnienie."
  },
  {
    question: "Jak szybko otrzymam zwolnienie lekarskie?",
    answer: "Zwolnienie możesz otrzymać w ciągu 30 minut od zakończenia konsultacji z lekarzem. e-zwolnienie jest automatycznie wysyłane do ZUS i Twojego pracodawcy, więc nie musisz niczego dodatkowo załatwiać."
  },
  {
    question: "Czy lekarz na pewno wystawi mi zwolnienie?",
    answer: "Decyzję o wystawieniu zwolnienia podejmuje lekarz na podstawie przeprowadzonej konsultacji medycznej. Lekarz musi stwierdzić, że stan Twojego zdrowia uzasadnia czasową niezdolność do pracy. To nie jest usługa, która gwarantuje automatyczne wystawienie zwolnienia."
  },
  {
    question: "Na ile dni mogę otrzymać zwolnienie online?",
    answer: "e-zwolnienie może być wystawione na okres do 7 dni. Data początkowa może być maksymalnie 3 dni wstecz od dnia konsultacji. W przypadku konieczności dłuższego zwolnienia, lekarz może zalecić wizytę stacjonarną."
  },
  {
    question: "Czy moje dane są bezpieczne?",
    answer: "Tak, w pełni przestrzegamy przepisów RODO. Wszystkie dane są szyfrowane, przechowywane na bezpiecznych serwerach i dostępne tylko dla uprawnionych osób. Nigdy nie udostępniamy Twoich danych medycznych osobom trzecim bez Twojej zgody."
  },
  {
    question: "Jak wygląda proces uzyskania zwolnienia?",
    answer: "Proces składa się z trzech prostych kroków: 1) Wypełnij formularz medyczny online (5 minut), 2) Lekarz przeprowadzi konsultację telefoniczną, 3) Otrzymasz e-zwolnienie, które automatycznie trafi do ZUS i pracodawcy. Cały proces zajmuje maksymalnie 30 minut."
  },
  {
    question: "Czy mogę uzyskać zwolnienie na opiekę nad dzieckiem?",
    answer: "Tak, oferujemy również zwolnienia na opiekę nad chorym członkiem rodziny. W formularzu należy podać dane osoby chorej oraz pracodawcy. Lekarz oceni sytuację i wydecyduje o wystawieniu zwolnienia opiekuńczego."
  },
  {
    question: "Co jeśli jestem studentem lub uczniem?",
    answer: "Studenci i uczniowie również mogą skorzystać z naszej usługi. W takim przypadku zwolnienie nie jest wysyłane do pracodawcy, ale otrzymujesz dokument w formie PDF, który możesz przedstawić w szkole lub na uczelni."
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
                  {faq.answer}
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
              <p>{faq.answer}</p>
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
