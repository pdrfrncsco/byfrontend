import { ReactNode } from 'react'
import { Footer } from '@/modules/shared/components'

interface PublicLayoutProps {
  children: ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md">
      {children}
      <Footer />
    </div>
  )
}
