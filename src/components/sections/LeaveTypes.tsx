import { Button } from "@/components/ui/button";
import { CheckCircle, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const leaveTypes = [
  {
    title: "E-zwolnienie",
    price: "79 zł",
    features: ["Oficjalne L4 ZUS", "Szybka realizacja"],
    link: "/rejestracja?guest=true&type=zus",
  },
  {
    title: "E-zwolnienie na dziecko",
    price: "79 zł",
    features: ["Opieka nad chorym dzieckiem", "Legalne zwolnienie L4"],
    link: "/rejestracja?guest=true&type=child",
  },
  {
    title: "Zaświadczenie Student/Uczeń",
    price: "49 zł",
    features: ["Dla studentów i uczniów", "Szybka realizacja"],
    link: "/rejestracja?guest=true&type=student",
  },
];

const LeaveTypes = () => {
  return (
    <section className="pt-8 pb-16 md:pt-12 md:pb-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {leaveTypes.map((type, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-strong transition-all duration-300 flex flex-col"
            >
              {/* Header with title and price */}
              <div className="flex items-start justify-between mb-6">
                <h3 className="text-xl font-bold text-foreground pr-4">
                  {type.title}
                </h3>
                <span className="px-4 py-1.5 bg-primary text-white text-sm font-semibold rounded-lg whitespace-nowrap">
                  {type.price}
                </span>
              </div>

              {/* Features list */}
              <div className="space-y-3 mb-6 flex-grow">
                {type.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-secondary flex-shrink-0" aria-hidden="true" />
                    <span className="text-muted-foreground text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Link to={type.link} className="block mt-auto">
                <Button variant="hero" size="lg" className="w-full justify-center gap-2">
                  Wypełnij formularz
                  <ChevronRight className="w-5 h-5" aria-hidden="true" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LeaveTypes;
