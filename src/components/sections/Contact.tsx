import { Mail } from "lucide-react";
const Contact = () => {
  return <section id="kontakt" className="pt-8 pb-16 md:pt-12 md:pb-24 gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Skontaktuj się <span className="text-primary">z nami</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            Masz pytania? Chętnie na nie odpowiemy. Jesteśmy do Twojej dyspozycji.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-xl shadow-soft border border-border">
              <h3 className="text-2xl font-bold text-foreground mb-6">Dane kontaktowe</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">E-mail</p>
                    <a href="mailto:kontakt@e-zwolnienie.com.pl" className="text-primary hover:underline">
                      kontakt@e-zwolnienie.com.pl
                    </a>
                    <p className="text-sm text-muted-foreground">Biuro obsługi pacjenta pracuje w godzinach 9:00 - 17:00 od poniedziałku do piątku.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default Contact;