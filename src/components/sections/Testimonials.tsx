import { Star, Quote } from "lucide-react";
const testimonials = [{
  name: "Anna K.",
  role: "Nauczycielka",
  content: "Świetna usługa! Zachorowałam w środku tygodnia i nie miałam siły iść do przychodni. Lekarz zadzwonił do mnie w 20 minut, przeprowadził profesjonalną konsultację i e-zwolnienie było już wysłane. Polecam!",
  rating: 5
}, {
  name: "Piotr M.",
  role: "Specjalista IT",
  content: "Bardzo profesjonalna obsługa. Lekarz był rzeczowy, zadawał konkretne pytania medyczne. Wszystko odbyło się sprawnie i zgodnie z przepisami. Czułem się bezpiecznie przez cały proces.",
  rating: 5
}, {
  name: "Magdalena W.",
  role: "Menadżer projektu",
  content: "Korzystałam z usługi już dwa razy. Za każdym razem szybko, profesjonalnie i bez zbędnych formalności. Oszczędność czasu jest niesamowita – nie muszę tracić pół dnia na wizytę w przychodni.",
  rating: 5
}, {
  name: "Tomasz R.",
  role: "Przedsiębiorca",
  content: "Idealne rozwiązanie dla osób pracujących. Wszystko online, bez wychodzenia z domu. Lekarz był bardzo pomocny i wyjaśnił mi wszystkie wątpliwości. Zdecydowanie będę korzystał ponownie.",
  rating: 5
}];
const Testimonials = () => {
  return <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Co mówią nasi <span className="text-primary">pacjenci</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            Dołącz do tysięcy zadowolonych użytkowników, którzy zaufali naszej platformie
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => <article key={index} className="gradient-card p-6 rounded-xl shadow-soft hover:shadow-medium transition-smooth border border-border relative">
              {/* Quote icon */}
              <div className="absolute -top-3 -left-3 w-10 h-10 gradient-hero rounded-full flex items-center justify-center shadow-soft">
                <Quote className="w-5 h-5 text-white" aria-hidden="true" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4 mt-2">
                {[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-secondary text-secondary" aria-hidden="true" />)}
              </div>

              {/* Content */}
              <p className="text-muted-foreground leading-relaxed mb-4 text-sm">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="border-t border-border pt-4">
                <p className="font-semibold text-foreground">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </article>)}
        </div>

        {/* Stats */}
        <div className="mt-12 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">250k+</div>
            <div className="text-sm text-muted-foreground">Zadowolonych pacjentów</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">4.9/5</div>
            <div className="text-sm text-muted-foreground">Średnia ocen</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">24/7</div>
            <div className="text-sm text-muted-foreground">Dostępność</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">30min</div>
            <div className="text-sm text-muted-foreground">Średni czas realizacji</div>
          </div>
        </div>
      </div>
    </section>;
};
export default Testimonials;