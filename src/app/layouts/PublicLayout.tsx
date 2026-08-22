import { ReactNode } from 'react'
import { Footer, Navigation, type PublicHeaderVariant } from '@/modules/shared/components'

interface PublicLayoutProps {
  children: ReactNode
  variant?: PublicHeaderVariant
}

export function PublicLayout({ children, variant = 'landing' }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md">
      <Navigation variant={variant} />
      <main className={variant === 'landing' ? '' : 'pt-16'}>{children}</main>
      {variant !== 'minimal' && <Footer />}
    </div>
  )
}
