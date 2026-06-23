import { ReactNode } from 'react'
import { Navigation } from '@/modules/shared/components'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Navigation />
      <main className="max-w-container-max mx-auto px-gutter py-xl">{children}</main>
    </div>
  )
}
