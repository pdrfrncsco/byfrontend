import i18n from 'i18next'
import { ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

await i18n
  .use(LanguageDetector)
  .init({
    fallbackLng: 'pt-AO',
    debug: import.meta.env.DEV,
    ns: ['translation'],
    defaultNS: 'translation',
    resources: {
      'pt-AO': {
        translation: {
          welcome: 'Bem-vindo ao BolaYetu',
        },
      },
      en: {
        translation: {
          welcome: 'Welcome to BolaYetu',
        },
      },
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

interface I18nProviderProps {
  children: ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}

export { i18n }
