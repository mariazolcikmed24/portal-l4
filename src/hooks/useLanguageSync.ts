import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { reverseRouteMappings, SupportedLanguage, supportedLanguages } from '@/i18n';

/**
 * Hook to synchronize the i18n language with the URL path
 * Should be used at the top level of the app (e.g., in App.tsx or a layout component)
 */
export const useLanguageSync = () => {
  const location = useLocation();
  const { i18n } = useTranslation();

  useEffect(() => {
    const path = location.pathname;
    
    // Check if the path has a language prefix
    const langMatch = path.match(/^\/(pl|en)(\/|$)/);
    
    if (langMatch) {
      const pathLang = langMatch[1] as SupportedLanguage;
      if (supportedLanguages.includes(pathLang) && i18n.language !== pathLang) {
        i18n.changeLanguage(pathLang);
      }
    } else {
      // No language prefix - check reverse mappings
      const mapping = reverseRouteMappings[path];
      if (mapping && i18n.language !== mapping.lang) {
        i18n.changeLanguage(mapping.lang);
      }
    }
    
    // Update HTML lang attribute
    document.documentElement.lang = i18n.language;
  }, [location.pathname, i18n]);

  return {
    currentLanguage: i18n.language as SupportedLanguage,
  };
};
