import { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Activity, CheckCircle2, UserRound, Lock } from 'lucide-react'
import { ROUTES } from '@/constants/routes'

interface PlayerOnboardingLayoutProps {
  children: ReactNode
  /** Current step (1 = Profile, 2 = Football, 3 = Review) */
  step: 1 | 2 | 3
  /** Highest step the user has unlocked based on saved data */
  maxReachedStep?: 1 | 2 | 3
}

const steps = [
  { number: 1 as const, label: 'Perfil', href: ROUTES.ONBOARDING_PLAYER_PROFILE, icon: UserRound },
  { number: 2 as const, label: 'Futebol', href: ROUTES.ONBOARDING_PLAYER_FOOTBALL, icon: Activity },
  { number: 3 as const, label: 'Revisão', href: ROUTES.ONBOARDING_PLAYER_REVIEW, icon: CheckCircle2 },
]

export function PlayerOnboardingLayout({
  children,
  step,
  maxReachedStep = 1,
}: PlayerOnboardingLayoutProps) {
  const navigate = useNavigate()

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

          <button
            type="button"
            onClick={() => navigate(ROUTES.DASHBOARD_PLAYER)}
            className="text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary"
          >
            Sair
          </button>
        </header>

        {/* Step indicator — tabs are only clickable for already-reached steps */}
        <nav className="mb-lg grid gap-sm rounded-lg border border-outline-variant/40 bg-surface-container-low p-sm sm:grid-cols-3">
          {steps.map((item) => {
            const Icon = item.icon
            const active = item.number === step
            const completed = item.number < step
            const unlocked = item.number <= maxReachedStep
            const isClickable = unlocked && !active

            const baseClass = 'flex items-center gap-sm rounded-lg px-md py-sm text-sm font-semibold transition-colors'
            const stateClass = active
              ? 'bg-primary text-on-primary-fixed cursor-default'
              : completed && unlocked
                ? 'bg-primary-container/25 text-primary hover:bg-primary-container/40 cursor-pointer'
                : unlocked
                  ? 'text-on-surface-variant hover:bg-surface-container cursor-pointer'
                  : 'text-on-surface-variant/40 cursor-not-allowed'

            if (isClickable && unlocked) {
              return (
                <Link
                  key={item.number}
                  to={item.href}
                  className={`${baseClass} ${stateClass}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            }

            return (
              <div
                key={item.number}
                className={`${baseClass} ${stateClass}`}
                title={!unlocked ? 'Complete o passo anterior primeiro' : undefined}
              >
                {!unlocked ? <Lock className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                <span>{item.label}</span>
                {!unlocked && (
                  <span className="ml-auto text-xs opacity-60">Bloqueado</span>
                )}
              </div>
            )
          })}
        </nav>

        {/* Progress bar */}
        <div className="mb-lg h-1 w-full overflow-hidden rounded-full bg-surface-container-high">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${((step - 1) / 2) * 100}%` }}
          />
        </div>

        <section className="flex-1 rounded-xl border border-outline-variant/40 bg-surface-container-low p-lg">
          {children}
        </section>
      </main>
    </div>
  )
}
