import { ReactNode } from 'react'
import { PublicHeader } from '@/modules/shared/components'
import { Trophy, ShieldCheck, Flame, Star, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface EditorialPanelProps {
  badge?: string
  title?: string
  quote?: string
  author?: string
  stats?: Array<{
    icon: LucideIcon
    value: string
    label: string
    colorClass?: string
  }>
}

interface AuthLayoutProps {
  children: ReactNode
  variant?: 'split' | 'wide' | 'centered'
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'
  panelProps?: EditorialPanelProps
}

const defaultPanel: EditorialPanelProps = {
  badge: 'Escolha de +50 Ligas e Federações',
  title: 'A Plataforma Digital de Gestão Desportiva de Elite',
  quote:
    'A BolaYetu transformou a forma como gerimos o nosso campeonato regional. O registo de atletas e súmulas ao vivo agilizaram todo o nosso trabalho administrativo.',
  author: 'Manuel Neto, Diretor de Competições',
  stats: [
    {
      icon: ShieldCheck,
      value: '+10.000',
      label: 'Atletas Registados',
      colorClass: 'text-primary',
    },
    {
      icon: Flame,
      value: '+500',
      label: 'Jogos Realizados',
      colorClass: 'text-amber-500',
    },
  ],
}

export function AuthLayout({
  children,
  variant = 'split',
  maxWidth,
  panelProps = defaultPanel,
}: AuthLayoutProps) {
  const panel = { ...defaultPanel, ...panelProps }

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
  }[maxWidth || (variant === 'wide' ? '5xl' : variant === 'centered' ? 'xl' : 'md')]

  if (variant === 'wide' || variant === 'centered') {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-between relative overflow-hidden">
        <PublicHeader variant="minimal" />

        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-primary/10 rounded-full blur-[160px] pointer-events-none" />

        <main className="flex-1 pt-20 pb-12 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10">
          <div className={cn('w-full space-y-6', maxWidthClass)}>{children}</div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <PublicHeader variant="minimal" />

      <main className="flex-1 pt-16 grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-4rem)]">
        {/* Left Side: Form Container */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center p-md sm:p-xl lg:p-2xl">
          <div className={cn('w-full space-y-md', maxWidthClass)}>{children}</div>
        </div>

        {/* Right Side: Editorial Sports Panel (Visible on lg+) */}
        <div className="hidden lg:flex lg:col-span-6 relative bg-gradient-to-br from-card via-muted/40 to-background border-l border-border p-2xl flex-col justify-between overflow-hidden">
          {/* Background Ambient Glow */}
          <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[140px] pointer-events-none" />

          {/* Top Badge */}
          <div className="relative z-10 flex items-center gap-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-on-primary-fixed shadow-md">
              <Trophy className="h-5 w-5" />
            </div>
            <span className="font-display-lg text-xl font-black tracking-wider">
              BOLA<span className="text-primary">YETU</span>
            </span>
          </div>

          {/* Editorial Content & Testimonial */}
          <div className="relative z-10 space-y-lg max-w-lg">
            {panel.badge && (
              <div className="inline-flex items-center gap-xs rounded-full border border-primary/30 bg-primary/10 px-md py-xs text-xs font-bold text-primary">
                <Star className="h-3.5 w-3.5 fill-primary" /> {panel.badge}
              </div>
            )}

            {panel.title && (
              <h2 className="font-display-lg text-4xl font-black tracking-tight leading-tight">
                {panel.title}
              </h2>
            )}

            {panel.quote && (
              <blockquote className="border-l-2 border-primary pl-md space-y-xs">
                <p className="text-sm italic text-muted-foreground leading-relaxed">
                  "{panel.quote}"
                </p>
                {panel.author && (
                  <footer className="text-xs font-bold text-foreground">— {panel.author}</footer>
                )}
              </blockquote>
            )}
          </div>

          {/* Bottom Metrics Bar */}
          {panel.stats && panel.stats.length > 0 && (
            <div className="relative z-10 grid grid-cols-2 gap-md pt-lg border-t border-border/60">
              {panel.stats.map((stat, idx) => {
                const Icon = stat.icon
                return (
                  <div key={idx} className="flex items-center gap-sm">
                    <Icon className={cn('h-6 w-6 shrink-0', stat.colorClass || 'text-primary')} />
                    <div>
                      <div className="font-bold text-sm">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
