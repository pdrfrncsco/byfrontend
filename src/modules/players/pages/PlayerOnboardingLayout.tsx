import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Activity, CheckCircle2, UserRound } from 'lucide-react'
import { ROUTES } from '@/constants/routes'

interface PlayerOnboardingLayoutProps {
  children: ReactNode
  step: 1 | 2 | 3
}

const steps = [
  { number: 1, label: 'Perfil', href: ROUTES.ONBOARDING_PLAYER, icon: UserRound },
  { number: 2, label: 'Futebol', href: ROUTES.ONBOARDING_PLAYER_FOOTBALL, icon: Activity },
  { number: 3, label: 'Revisão', href: ROUTES.ONBOARDING_PLAYER_REVIEW, icon: CheckCircle2 },
] as const

export function PlayerOnboardingLayout({ children, step }: PlayerOnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-on-surface">
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-md py-lg md:px-xl">
        <header className="mb-xl flex flex-col gap-lg md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Onboarding do jogador</p>
            <h1 className="mt-xs text-3xl font-bold text-on-surface">Complete o seu perfil</h1>
            <p className="mt-sm max-w-2xl text-sm text-on-surface-variant">
              Confirme os dados essenciais para ativar o portal do jogador e preparar pedidos de vínculo a clubes.
            </p>
          </div>

          <Link
            to={ROUTES.DASHBOARD_PLAYER}
            className="text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary"
          >
            Sair
          </Link>
        </header>

        <nav className="mb-lg grid gap-sm rounded-lg border border-outline-variant/40 bg-surface-container-low p-sm sm:grid-cols-3">
          {steps.map((item) => {
            const Icon = item.icon
            const active = item.number === step
            const complete = item.number < step
            return (
              <Link
                key={item.number}
                to={item.href}
                className={`flex items-center gap-sm rounded-lg px-md py-sm text-sm font-semibold transition-colors ${
                  active
                    ? 'bg-primary text-on-primary-fixed'
                    : complete
                      ? 'bg-primary-container/25 text-primary'
                      : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <section className="flex-1 rounded-xl border border-outline-variant/40 bg-surface-container-low p-lg">
          {children}
        </section>
      </main>
    </div>
  )
}
