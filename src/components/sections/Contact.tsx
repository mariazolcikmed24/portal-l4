import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
const contactSchema = z.object({
  name: z.string().trim().min(1, "Imię jest wymagane").max(100, "Imię może mieć maksymalnie 100 znaków"),
  email: z.string().trim().email("Nieprawidłowy adres e-mail").max(254, "E-mail może mieć maksymalnie 254 znaki"),
  message: z.string().trim().min(1, "Wiadomość jest wymagana").max(1000, "Wiadomość może mieć maksymalnie 1000 znaków")
});
const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Walidacja
      contactSchema.parse(formData);

      // Symulacja wysyłki (tutaj będzie integracja z backend)
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Wiadomość wysłana pomyślnie!", {
        description: "Odpowiemy na Twoje pytanie w ciągu 24 godzin."
      });

      // Reset formularza
      setFormData({
        name: "",
        email: "",
        message: ""
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach(err => {
          toast.error(err.message);
        });
      } else {
        toast.error("Wystąpił błąd. Spróbuj ponownie.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  return <section id="kontakt" className="py-16 md:py-24 gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Skontaktuj się <span className="text-primary">z nami</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            Masz pytania? Chętnie na nie odpowiemy. Jesteśmy do Twojej dyspozycji.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto">
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
                    <a href="mailto:kontakt@e-zla.pl" className="text-primary hover:underline">
                      kontakt@e-zla.pl
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Telefon</p>
                    <a href="tel:+48123456789" className="text-primary hover:underline">
                      +48 123 456 789
                    </a>
                    <p className="text-sm text-muted-foreground">Pon-Pt: 8:00 - 20:00</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Adres</p>
                    <p className="text-muted-foreground">
                      ul. Medyczna 1<br />
                      00-000 Warszawa
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-secondary/10 p-6 rounded-xl border border-secondary/20">
              <p className="text-sm text-foreground">
                <strong>Godziny konsultacji medycznych:</strong><br />
                Jesteśmy dostępni 24/7, aby zapewnić Ci pomoc w każdej chwili.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          
        </div>
      </div>
    </section>;
};
export default Contact;