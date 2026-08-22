import { ReactNode } from 'react'
import { PublicHeader } from '@/modules/shared/components'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] flex items-center justify-center transition-colors duration-300">
      <PublicHeader variant="minimal" />
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="glow-bg">
          <div className="glow-circle glow-1" />
          <div className="glow-circle glow-2" />
        </div>
      </div>
      <div className="relative w-full flex items-center justify-center p-lg">{children}</div>
    </div>
  )
}
