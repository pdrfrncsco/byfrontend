import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { ptAO } from './locales/pt-AO'
import { en } from './locales/en'

export const resources = {
  'pt-AO': { translation: ptAO },
  pt: { translation: ptAO },
  en: { translation: en },
} as const

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt-AO',
    supportedLngs: ['pt-AO', 'pt', 'en'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  })

export { i18n }
export default i18n
