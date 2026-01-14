import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLanguageNavigation } from "@/hooks/useLanguageNavigation";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation("status");
  const { getLocalizedPath } = useLanguageNavigation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-primary">{t("notFound.title")}</h1>
        <p className="mb-6 text-xl text-muted-foreground">{t("notFound.description")}</p>
        <Link 
          to={getLocalizedPath("/")} 
          className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-primary-foreground font-medium hover:bg-primary/90 transition-smooth"
        >
          {t("notFound.backToHome")}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
