import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useLanguageNavigation } from "@/hooks/useLanguageNavigation";
import { supportedLanguages, languageNames, SupportedLanguage } from "@/i18n";

const flags: Record<SupportedLanguage, string> = {
  pl: "🇵🇱",
  en: "🇬🇧",
};

interface LanguageSwitcherProps {
  variant?: "default" | "minimal";
  className?: string;
}

export const LanguageSwitcher = ({ 
  variant = "default",
  className = "" 
}: LanguageSwitcherProps) => {
  const { t } = useTranslation("common");
  const { currentLanguage, changeLanguage } = useLanguageNavigation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size={variant === "minimal" ? "sm" : "default"}
          className={`gap-2 ${className}`}
          aria-label={t("language.selectLanguage")}
        >
          <span className="text-lg" aria-hidden="true">
            {flags[currentLanguage]}
          </span>
          {variant === "default" && (
            <>
              <span className="hidden sm:inline">{languageNames[currentLanguage]}</span>
              <Globe className="w-4 h-4 sm:hidden" aria-hidden="true" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[120px]">
        {supportedLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => changeLanguage(lang)}
            className={`gap-2 cursor-pointer ${
              currentLanguage === lang ? "bg-muted" : ""
            }`}
          >
            <span className="text-lg" aria-hidden="true">
              {flags[lang]}
            </span>
            <span>{languageNames[lang]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
