import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Users, Trophy, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { playerRoutes } from '../../routes'

export function PlayerOnboardingCompletePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center p-lg">
      <div className="w-full max-w-lg space-y-xl text-center">

        {/* Icon */}
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-container">
            <CheckCircle2 className="h-10 w-10 text-primary" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-sm">
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">
            Perfil criado com sucesso!
          </h1>
          <p className="text-base text-on-surface-variant">
            O seu perfil de jogador está pronto. Escolha o que quer fazer a seguir.
          </p>
        </div>

        {/* Action cards */}
        <div className="grid gap-md text-left sm:grid-cols-1">
          <button
            type="button"
            onClick={() => navigate(playerRoutes.linkClub)}
            className="group flex items-start gap-md rounded-xl border border-outline-variant/40 bg-surface-container-low p-md text-left transition-all hover:border-primary/40 hover:bg-surface-container"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-container group-hover:bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-on-surface">Solicitar vínculo a um clube</p>
              <p className="mt-0.5 text-sm text-on-surface-variant">
                Envie um pedido de registo a um clube existente na plataforma.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate(ROUTES.COMPETITIONS)}
            className="group flex items-start gap-md rounded-xl border border-outline-variant/40 bg-surface-container-low p-md text-left transition-all hover:border-primary/40 hover:bg-surface-container"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary-container group-hover:bg-secondary/10">
              <Trophy className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="font-semibold text-on-surface">Explorar competições</p>
              <p className="mt-0.5 text-sm text-on-surface-variant">
                Veja as competições disponíveis e saiba como participar.
              </p>
            </div>
          </button>
        </div>

        {/* Primary CTA */}
        <Button
          className="w-full"
          onClick={() => navigate(playerRoutes.dashboard)}
        >
          <LayoutDashboard className="h-4 w-4" />
          Ir para o meu portal
        </Button>

        <p className="text-xs text-on-surface-variant">
          Pode sempre actualizar o seu perfil a partir das definições do portal.
        </p>
      </div>
    </div>
  )
}
