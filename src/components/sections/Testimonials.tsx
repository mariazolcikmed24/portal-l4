import { Star, Quote } from "lucide-react";
import { useTranslation } from "react-i18next";

const Testimonials = () => {
  const { t } = useTranslation("landing");

  // Get testimonial items from translations
  const testimonialItems = t("testimonials.items", { returnObjects: true }) as Array<{
    name: string;
    role: string;
    content: string;
  }>;

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t("testimonials.title")} <span className="text-primary">{t("testimonials.titleHighlight")}</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground">
            {t("testimonials.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {testimonialItems.map((testimonial, index) => (
            <article
              key={index}
              className="gradient-card p-6 rounded-xl shadow-soft hover:shadow-medium transition-smooth border border-border relative"
            >
              {/* Quote icon */}
              <div className="absolute -top-3 -left-3 w-10 h-10 gradient-hero rounded-full flex items-center justify-center shadow-soft">
                <Quote className="w-5 h-5 text-white" aria-hidden="true" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4 mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-secondary text-secondary" aria-hidden="true" />
                ))}
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
            </article>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-12 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">10k+</div>
            <div className="text-sm text-muted-foreground">{t("testimonials.stats.patients")}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">4.9/5</div>
            <div className="text-sm text-muted-foreground">{t("testimonials.stats.rating")}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">24/7</div>
            <div className="text-sm text-muted-foreground">{t("testimonials.stats.availability")}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">30min</div>
            <div className="text-sm text-muted-foreground">{t("testimonials.stats.avgTime")}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
