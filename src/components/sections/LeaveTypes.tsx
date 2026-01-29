import { Button } from "@/components/ui/button";
import { CheckCircle, ChevronRight, FileText, Baby, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

const leaveTypes = [
  {
    title: "E-zwolnienie",
    subtitle: "Zwolnienie lekarskie L4",
    price: "79 zł",
    icon: FileText,
    features: ["Oficjalne L4 do ZUS", "Realizacja nawet w 15 minut", "100% online"],
    link: "/rejestracja?guest=true&type=zus",
    popular: true,
  },
  {
    title: "E-zwolnienie na dziecko",
    subtitle: "Opieka nad chorym dzieckiem",
    price: "79 zł",
    icon: Baby,
    features: ["Legalne zwolnienie L4", "Opieka do 14 lat", "Szybka realizacja"],
    link: "/rejestracja?guest=true&type=child",
    popular: false,
  },
  {
    title: "Zaświadczenie Student/Uczeń",
    subtitle: "Usprawiedliwienie nieobecności",
    price: "79 zł",
    icon: GraduationCap,
    features: ["Dla studentów i uczniów", "Akceptowane przez uczelnie", "Natychmiastowa realizacja"],
    link: "/rejestracja?guest=true&type=student",
    popular: false,
  },
];

const LeaveTypes = () => {
  return (
    <section className="pt-8 pb-8 md:pt-12 md:pb-12 bg-gradient-to-b from-muted/20 to-muted/40">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-5 lg:gap-6 max-w-6xl mx-auto">
          {leaveTypes.map((type, index) => {
            const IconComponent = type.icon;
            return (
              <Link
                key={index}
                to={type.link}
                className="group relative bg-card rounded-2xl p-6 shadow-soft hover:shadow-strong transition-all duration-300 flex flex-col border border-border/50 hover:border-primary/30 hover:-translate-y-1"
              >
                {/* Popular badge */}
                {type.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-md">
                      Najpopularniejsze
                    </span>
                  </div>
                )}

                {/* Icon and Price header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <IconComponent className="w-6 h-6 text-primary" aria-hidden="true" />
                  </div>
                  <span className="px-3 py-1.5 bg-primary text-primary-foreground text-sm font-bold rounded-lg shadow-sm">
                    {type.price}
                  </span>
                </div>

                {/* Title and subtitle */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {type.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {type.subtitle}
                  </p>
                </div>

                {/* Features list */}
                <div className="space-y-2.5 mb-6 flex-grow">
                  {type.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2.5">
                      <CheckCircle className="w-4 h-4 text-secondary flex-shrink-0" aria-hidden="true" />
                      <span className="text-muted-foreground text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="w-full justify-center gap-2 group-hover:gap-3 transition-all"
                  tabIndex={-1}
                >
                  Wypełnij formularz
                  <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LeaveTypes;
