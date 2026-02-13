import { Shield, Clock, Lock, CheckCircle, Smartphone, FileCheck } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
const benefits = [{
  icon: Clock,
  title: "Szybko i wygodnie",
  description: "Otrzymasz zwolnienie nawet w 15 minut, bez wychodzenia z domu i czekania w kolejce."
}, {
  icon: Shield,
  title: "W 100% legalne",
  description: "Zwolnienia wystawiane przez licencjonowanych lekarzy zgodnie z obowiązującymi przepisami."
}, {
  icon: Lock,
  title: "Bezpieczeństwo danych",
  description: "Pełna zgodność z RODO. Twoje dane medyczne są szyfrowane i chronione najwyższymi standardami."
}, {
  icon: Smartphone,
  title: "Dostępne 24/7",
  description: "Skorzystaj z usługi o każdej porze dnia, również w weekendy i święta."
}, {
  icon: FileCheck,
  title: "Automatyczne wysłanie",
  description: "e-zwolnienie trafia bezpośrednio do ZUS i Twojego pracodawcy. Nie musisz nic załatwiać."
}, {
  icon: CheckCircle,
  title: "Doświadczeni lekarze",
  description: "Zespół certyfikowanych specjalistów z wieloletnim doświadczeniem w telemedycynie."
}];
const Benefits = () => {
  return <section id="zalety" className="pt-8 pb-16 md:pt-12 md:pb-24 gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Dlaczego <span className="text-primary">e-zwolnienie online?</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            Nowoczesne podejście do zwolnień lekarskich. Bezpiecznie, szybko i zgodnie z prawem.
          </p>
        </div>

        {/* Mobile: Carousel */}
        <div className="md:hidden max-w-sm mx-auto px-8">
          <Carousel className="w-full">
            <CarouselContent>
              {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return <CarouselItem key={index}>
                    <article className="bg-white p-6 rounded-xl shadow-soft border border-border">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-foreground mb-2">{benefit.title}</h3>
                          <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                        </div>
                      </div>
                    </article>
                  </CarouselItem>;
            })}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>

        {/* Desktop: Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => {
          const Icon = benefit.icon;
          return <article key={index} className="bg-white p-6 md:p-8 rounded-xl shadow-soft hover:shadow-medium transition-smooth border border-border group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-bounce">
                    <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              </article>;
        })}
        </div>

        {/* Trust section */}
        <div className="mt-12 md:mt-16 bg-white p-8 md:p-12 rounded-2xl shadow-medium max-w-4xl mx-auto border-2 border-primary/20">
          <div className="text-center">
            <div className="mb-6">
              <span className="text-2xl md:text-3xl font-bold">e-<span className="text-primary">zwolnienie</span>.com.pl</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Gwarancja bezpieczeństwa i legalności
            </h3>
            <p className="text-lg text-muted-foreground mb-6">
              Wszystkie konsultacje prowadzone są przez lekarzy posiadających prawo wykonywania zawodu na terenie
              Polski. Wystawione zwolnienia są w pełni zgodne z przepisami ZUS i polskim prawem medycznym.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-secondary" aria-hidden="true" />
                <span>Certyfikowani lekarze</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-secondary" aria-hidden="true" />
                <span>Zgodność z RODO</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-secondary" aria-hidden="true" />
                <span>Legalnie i zgodnie z przepisami</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-secondary" aria-hidden="true" />
                <span>Bezpieczne i poufne</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default Benefits;