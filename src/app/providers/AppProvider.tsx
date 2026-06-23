import { ReactNode } from 'react'
import { AuthProvider } from './AuthProvider'
import { TenantProvider } from './TenantProvider'
import { ThemeProvider } from './ThemeProvider'
import { QueryProvider } from './QueryProvider'
import { I18nProvider } from './I18nProvider'

interface AppProviderProps {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <TenantProvider>
      <AuthProvider>
        <QueryProvider>
          <I18nProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </I18nProvider>
        </QueryProvider>
      </AuthProvider>
    </TenantProvider>
  )
}
