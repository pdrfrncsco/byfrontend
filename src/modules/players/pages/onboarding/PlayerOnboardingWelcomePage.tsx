import { useNavigate } from 'react-router-dom'
import { Trophy, ShieldCheck, Search, ArrowRight, UserCheck } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { usePlayerOnboardingState } from '@/modules/players/hooks/usePlayerOnboardingState'

export function PlayerOnboardingWelcomePage() {
  const navigate = useNavigate()
  const { onboardingState } = usePlayerOnboardingState()

  const handleStart = () => {
    // Resume from where the player left off; default to step 2 (identity) for fresh starts
    const destination = onboardingState?.nextRoute ?? ROUTES.ONBOARDING_PLAYER_IDENTITY
    // Don't go back to the welcome page itself
    navigate(destination === ROUTES.ONBOARDING_PLAYER ? ROUTES.ONBOARDING_PLAYER_IDENTITY : destination)
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex items-center justify-center p-md">
      <Card variant="glass" className="max-w-2xl w-full border-outline-variant/30 shadow-xl">
        <CardHeader className="text-center pb-sm">
          <div className="mx-auto mb-md flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Trophy className="h-8 w-8" />
          </div>
          <CardTitle className="text-3xl font-bold text-on-surface">
            Bem-vindo à BolaYetu!
          </CardTitle>
          <p className="mt-xs text-sm text-on-surface-variant max-w-lg mx-auto">
            Crie o seu perfil de jogador global e independente. Descubra como funciona a plataforma em 3 passos simples:
          </p>
        </CardHeader>

        <CardContent className="space-y-lg pt-md">
          <div className="grid gap-md sm:grid-cols-3">
            <div className="flex flex-col items-center text-center p-md rounded-xl bg-surface-container-low border border-outline-variant/20">
              <div className="mb-sm rounded-lg bg-primary-container/20 p-sm text-primary">
                <UserCheck className="h-6 w-6" />
              </div>
              <h4 className="font-semibold text-sm text-on-surface">1. Perfil Completo</h4>
              <p className="mt-xs text-xs text-on-surface-variant">
                Preencha os seus dados pessoais e estatísticas esportivas essenciais.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-md rounded-xl bg-surface-container-low border border-outline-variant/20">
              <div className="mb-sm rounded-lg bg-primary-container/20 p-sm text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h4 className="font-semibold text-sm text-on-surface">2. Vínculo Autônomo</h4>
              <p className="mt-xs text-xs text-on-surface-variant">
                Você controla o seu perfil. Envie solicitações de vínculo diretamente a clubes.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-md rounded-xl bg-surface-container-low border border-outline-variant/20">
              <div className="mb-sm rounded-lg bg-primary-container/20 p-sm text-primary">
                <Search className="h-6 w-6" />
              </div>
              <h4 className="font-semibold text-sm text-on-surface">3. Visibilidade</h4>
              <p className="mt-xs text-xs text-on-surface-variant">
                Acompanhe o seu histórico de partidas, competições e estatísticas consolidadas.
              </p>
            </div>
          </div>

          <div className="pt-md flex justify-center">
            <Button size="lg" className="w-full sm:w-auto px-xl gap-sm" onClick={handleStart}>
              <span>Começar Onboarding</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
