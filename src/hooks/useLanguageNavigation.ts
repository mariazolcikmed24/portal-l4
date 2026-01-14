import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { routeMappings, reverseRouteMappings, SupportedLanguage, supportedLanguages } from '@/i18n';

/**
 * Hook for handling language-aware navigation
 */
export const useLanguageNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();

  /**
   * Get the current language from the URL path
   */
  const getLanguageFromPath = useCallback((path: string): SupportedLanguage | null => {
    const match = path.match(/^\/(pl|en)(\/|$)/);
    return match ? (match[1] as SupportedLanguage) : null;
  }, []);

  /**
   * Get the base path without language prefix
   */
  const getBasePathFromPath = useCallback((path: string): string => {
    const mapping = reverseRouteMappings[path];
    if (mapping) {
      return mapping.basePath;
    }
    // Remove language prefix if present
    const withoutPrefix = path.replace(/^\/(pl|en)/, '');
    return withoutPrefix || '/';
  }, []);

  /**
   * Navigate to a localized route
   */
  const navigateToLocalized = useCallback(
    (basePath: string, options?: { replace?: boolean; state?: unknown }) => {
      const currentLang = i18n.language as SupportedLanguage;
      const mapping = routeMappings[basePath];
      
      if (mapping && mapping[currentLang]) {
        navigate(mapping[currentLang], options);
      } else {
        // Fallback: add language prefix
        const localizedPath = `/${currentLang}${basePath === '/' ? '' : basePath}`;
        navigate(localizedPath, options);
      }
    },
    [navigate, i18n.language]
  );

  /**
   * Change language and update the URL accordingly
   */
  const changeLanguage = useCallback(
    async (newLang: SupportedLanguage) => {
      if (!supportedLanguages.includes(newLang)) return;

      await i18n.changeLanguage(newLang);
      
      const currentPath = location.pathname;
      const basePath = getBasePathFromPath(currentPath);
      const mapping = routeMappings[basePath];
      
      if (mapping && mapping[newLang]) {
        navigate(mapping[newLang] + location.search, { replace: true });
      } else {
        // Fallback: replace language prefix
        const newPath = currentPath.replace(/^\/(pl|en)/, `/${newLang}`);
        navigate(newPath + location.search, { replace: true });
      }
    },
    [i18n, location, navigate, getBasePathFromPath]
  );

  /**
   * Get the localized path for a given base path
   */
  const getLocalizedPath = useCallback(
    (basePath: string, queryString?: string): string => {
      const currentLang = i18n.language as SupportedLanguage;
      const mapping = routeMappings[basePath];
      
      let path: string;
      if (mapping && mapping[currentLang]) {
        path = mapping[currentLang];
      } else {
        path = `/${currentLang}${basePath === '/' ? '' : basePath}`;
      }
      
      return queryString ? `${path}?${queryString}` : path;
    },
    [i18n.language]
  );

  return {
    currentLanguage: i18n.language as SupportedLanguage,
    getLanguageFromPath,
    getBasePathFromPath,
    navigateToLocalized,
    changeLanguage,
    getLocalizedPath,
  };
};
