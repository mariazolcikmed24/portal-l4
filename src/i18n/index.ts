import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import Polish translations
import plCommon from './locales/pl/common.json';
import plLanding from './locales/pl/landing.json';
import plSeo from './locales/pl/seo.json';
import plValidation from './locales/pl/validation.json';
import plStatus from './locales/pl/status.json';
import plForms from './locales/pl/forms.json';

// Import English translations
import enCommon from './locales/en/common.json';
import enLanding from './locales/en/landing.json';
import enSeo from './locales/en/seo.json';
import enValidation from './locales/en/validation.json';
import enStatus from './locales/en/status.json';
import enForms from './locales/en/forms.json';

export const supportedLanguages = ['pl', 'en'] as const;
export type SupportedLanguage = typeof supportedLanguages[number];

export const languageNames: Record<SupportedLanguage, string> = {
  pl: 'Polski',
  en: 'English',
};

// Route mappings for language-prefixed URLs
export const routeMappings: Record<string, Record<SupportedLanguage, string>> = {
  '/': { pl: '/pl', en: '/en' },
  '/rejestracja': { pl: '/pl/rejestracja', en: '/en/registration' },
  '/logowanie': { pl: '/pl/logowanie', en: '/en/login' },
  '/daty-choroby': { pl: '/pl/daty-choroby', en: '/en/illness-dates' },
  '/rodzaj-zwolnienia': { pl: '/pl/rodzaj-zwolnienia', en: '/en/leave-type' },
  '/wywiad-ogolny': { pl: '/pl/wywiad-ogolny', en: '/en/general-interview' },
  '/wywiad-objawy': { pl: '/pl/wywiad-objawy', en: '/en/symptoms' },
  '/podsumowanie': { pl: '/pl/podsumowanie', en: '/en/summary' },
  '/platnosc': { pl: '/pl/platnosc', en: '/en/payment' },
  '/potwierdzenie': { pl: '/pl/potwierdzenie', en: '/en/confirmation' },
  '/status': { pl: '/pl/status', en: '/en/status' },
  '/status-sprawy': { pl: '/pl/status-sprawy', en: '/en/case-status' },
  '/panel': { pl: '/pl/panel', en: '/en/dashboard' },
  '/api-docs': { pl: '/pl/api-docs', en: '/en/api-docs' },
  '/wybor-sciezki': { pl: '/pl/wybor-sciezki', en: '/en/choose-path' },
};

// Reverse mapping for route detection
export const reverseRouteMappings: Record<string, { basePath: string; lang: SupportedLanguage }> = {};
Object.entries(routeMappings).forEach(([basePath, langPaths]) => {
  Object.entries(langPaths).forEach(([lang, fullPath]) => {
    reverseRouteMappings[fullPath] = { basePath, lang: lang as SupportedLanguage };
  });
});

const resources = {
  pl: {
    common: plCommon,
    landing: plLanding,
    seo: plSeo,
    validation: plValidation,
    status: plStatus,
    forms: plForms,
  },
  en: {
    common: enCommon,
    landing: enLanding,
    seo: enSeo,
    validation: enValidation,
    status: enStatus,
    forms: enForms,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pl',
    defaultNS: 'common',
    ns: ['common', 'landing', 'seo', 'validation', 'status', 'forms'],
    
    detection: {
      order: ['path', 'localStorage', 'navigator'],
      lookupFromPathIndex: 0,
      caches: ['localStorage'],
    },
    
    interpolation: {
      escapeValue: false,
    },
    
    react: {
      useSuspense: false,
    },
  });

// Update HTML lang attribute when language changes
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
  localStorage.setItem('i18nextLng', lng);
});

// Set initial HTML lang
document.documentElement.lang = i18n.language;

export default i18n;
