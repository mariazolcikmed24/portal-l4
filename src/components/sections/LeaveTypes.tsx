import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Baby, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

const leaveTypes = [
  {
    icon: FileText,
    title: "E-zwolnienie",
    description: "Zwolnienie lekarskie dla osób ubezpieczonych w ZUS",
    link: "/rejestracja?guest=true&type=zus",
    buttonText: "Uzyskaj e-zwolnienie",
  },
  {
    icon: Baby,
    title: "E-zwolnienie na dziecko",
    description: "Zwolnienie na opiekę nad chorym dzieckiem",
    link: "/rejestracja?guest=true&type=child",
    buttonText: "Uzyskaj zwolnienie",
  },
  {
    icon: GraduationCap,
    title: "Zaświadczenie Student/Uczeń",
    description: "Zaświadczenie o niezdolności do nauki dla studentów i uczniów",
    link: "/rejestracja?guest=true&type=student",
    buttonText: "Uzyskaj zaświadczenie",
  },
];

const LeaveTypes = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Wybierz rodzaj zwolnienia
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Wybierz odpowiedni typ dokumentu i rozpocznij proces uzyskania zwolnienia online
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {leaveTypes.map((type, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-strong transition-all duration-300 hover:border-primary/50 flex flex-col"
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <type.icon className="w-8 h-8 text-primary" aria-hidden="true" />
                </div>
                <CardTitle className="text-xl">{type.title}</CardTitle>
                <CardDescription className="text-sm">
                  {type.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 mt-auto">
                <Link to={type.link} className="block">
                  <Button variant="hero" className="w-full">
                    {type.buttonText}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LeaveTypes;
