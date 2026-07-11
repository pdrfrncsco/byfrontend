import i18n from 'i18next'
import { ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

i18n
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
          auth: {
            login: {
              title: 'Login',
              registerTitle: 'Criar Conta',
              email: 'Email',
              password: 'Senha',
              firstName: 'Nome',
              lastName: 'Apelido',
              phone: 'Telemóvel (Opcional)',
              confirmPassword: 'Confirmar Senha',
              submitLogin: 'Entrar',
              submitLoginLoading: 'A Entrar...',
              submitRegister: 'Criar Conta',
              submitRegisterLoading: 'A Criar Conta...',
              noAccount: 'Não tem conta?',
              hasAccount: 'Já tem conta?',
              registerLink: 'Registar-se',
              loginLink: 'Fazer Login',
              forgotPassword: 'Esqueceu a palavra-passe?',
              organizationCta: 'É uma organização?',
              organizationLink: 'Registar federação / liga',
            },
          },
          nav: {
            directory: 'Diretório',
            liveMatches: 'Jogos ao Vivo',
            scouting: 'Scouting',
            transfers: 'Transferências',
            enterpriseLogin: 'Login Enterprise',
            joinEcosystem: 'Juntar ao Ecossistema',
          },
          footer: {
            product: 'Produto',
            company: 'Empresa',
            legal: 'Legal',
            features: 'Funcionalidades',
            pricing: 'Preços',
            docs: 'Documentação',
            roadmap: 'Roadmap',
            about: 'Sobre',
            blog: 'Blog',
            contact: 'Contacte-nos',
            careers: 'Carreiras',
            privacy: 'Privacidade',
            terms: 'Termos de Serviço',
            cookies: 'Cookies',
            security: 'Segurança',
            status: 'Status',
            support: 'Suporte',
          },
          dashboard: {
            sublabels: {
              federation: 'Consola da Federação',
              executive: 'Ecrã Executivo',
              league: 'Painel de Liga',
              club: 'Portal de Clubes',
              competition: 'Organizador de Provas',
              default: 'BolaYetu Portal',
            },
            sidebar: {
              settings: 'Configurações',
              support: 'Suporte',
              logout: 'Terminar Sessão',
            },
            topbar: {
              globalTenant: 'Portal Global BolaYetu',
              searchPlaceholder: 'Pesquisar...',
              general: 'Geral',
              analytics: 'Análise',
              reports: 'Relatórios',
            },
          },
        },
      },
      en: {
        translation: {
          welcome: 'Welcome to BolaYetu',
          auth: {
            login: {
              title: 'Login',
              registerTitle: 'Create Account',
              email: 'Email',
              password: 'Password',
              firstName: 'First Name',
              lastName: 'Last Name',
              phone: 'Phone (Optional)',
              confirmPassword: 'Confirm Password',
              submitLogin: 'Sign In',
              submitLoginLoading: 'Signing In...',
              submitRegister: 'Create Account',
              submitRegisterLoading: 'Creating Account...',
              noAccount: "Don't have an account?",
              hasAccount: 'Already have an account?',
              registerLink: 'Sign Up',
              loginLink: 'Sign In',
              forgotPassword: 'Forgot password?',
              organizationCta: 'Are you an organization?',
              organizationLink: 'Register federation / league',
            },
          },
          nav: {
            directory: 'Directory',
            liveMatches: 'Live Matches',
            scouting: 'Scouting',
            transfers: 'Transfers',
            enterpriseLogin: 'Enterprise Login',
            joinEcosystem: 'Join Ecosystem',
          },
          footer: {
            product: 'Product',
            company: 'Company',
            legal: 'Legal',
            features: 'Features',
            pricing: 'Pricing',
            docs: 'Documentation',
            roadmap: 'Roadmap',
            about: 'About',
            blog: 'Blog',
            contact: 'Contact us',
            careers: 'Careers',
            privacy: 'Privacy',
            terms: 'Terms of Service',
            cookies: 'Cookies',
            security: 'Security',
            status: 'Status',
            support: 'Support',
          },
          dashboard: {
            sublabels: {
              federation: 'Federation Console',
              executive: 'Executive View',
              league: 'League Panel',
              club: 'Club Portal',
              competition: 'Competition Organizer',
              default: 'BolaYetu Portal',
            },
            sidebar: {
              settings: 'Settings',
              support: 'Support',
              logout: 'Sign Out',
            },
            topbar: {
              globalTenant: 'Global BolaYetu Portal',
              searchPlaceholder: 'Search...',
              general: 'General',
              analytics: 'Analytics',
              reports: 'Reports',
            },
          },
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
