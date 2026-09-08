import { useNavigate } from 'react-router-dom'
import { CheckCircle2, CircleAlert, ArrowLeft } from 'lucide-react'
import { Button, Badge, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { useCompleteOnboardingStep, usePlayerOnboardingStatus, usePlayerWizard } from '../hooks'
import { PlayerOnboardingLayout } from './PlayerOnboardingLayout'

function StatusRow({ label, complete }: { label: string; complete: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-md">
      <span className="text-sm font-medium">{label}</span>
      {complete ? (
        <Badge variant="success">Completo</Badge>
      ) : (
        <Badge variant="warning">Pendente</Badge>
      )}
    </div>
  )
}

export function PlayerOnboardingReviewPage() {
  const navigate = useNavigate()
  const { data, isLoading } = usePlayerOnboardingStatus()
  const completeStep = useCompleteOnboardingStep()
  const { reset } = usePlayerWizard()
  const player = data?.player
  const readyToComplete = Boolean(
    data?.account_complete
      && data.personal_complete
      && data.football_complete
      && data.contact_complete
      && (data.guardian_complete || !player?.is_minor)
      && data.club_complete
  )

  const handleComplete = async () => {
    await completeStep.mutateAsync('review')
    reset()
    navigate(ROUTES.ONBOARDING_PLAYER_COMPLETE, { replace: true })
  }

  return (
    <PlayerOnboardingLayout
      step={8}
      isLastStep
      canGoForward={readyToComplete}
      onNext={handleComplete}
      onBack={() => navigate(ROUTES.ONBOARDING_PLAYER_CLUB)}
    >
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Revisão final</CardTitle>
          <CardDescription>
            Confirme se os requisitos mínimos foram preenchidos antes de entrar no portal do jogador.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-md">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">A validar perfil...</div>
          ) : (
            <>
              <div className="grid gap-md md:grid-cols-2">
                <StatusRow label="Dados pessoais" complete={Boolean(data?.has_basic_info ?? data?.personal_complete)} />
                <StatusRow label="Informação futebolística" complete={Boolean(data?.has_football_info ?? data?.football_complete)} />
                <StatusRow label="Contacto" complete={Boolean(data?.contact_complete)} />
                <StatusRow label="Identidade (opcional)" complete={Boolean(data?.identity_complete)} />
                <StatusRow label="Responsável legal" complete={Boolean(data?.guardian_complete || !player?.is_minor)} />
                <StatusRow label="Clube" complete={Boolean(data?.club_complete)} />
              </div>

              {player && (
                <div className="rounded-lg border border-border bg-muted/20 p-md">
                  <div className="flex flex-col gap-md md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{player.full_name}</h3>
                      <p className="mt-xs text-sm text-muted-foreground">
                        {player.position_label} · {player.nationality || 'Nacionalidade por definir'}
                      </p>
                    </div>
                    <Badge variant={player.is_public ? 'success' : 'secondary'}>
                      {player.is_public ? 'Perfil público' : 'Perfil privado'}
                    </Badge>
                  </div>
                </div>
              )}

              {!readyToComplete && (
                <div className="flex items-start gap-md rounded-lg border border-warning/30 bg-warning/10 p-md">
                  <CircleAlert className="mt-0.5 h-5 w-5 text-warning shrink-0" />
                  <div className="text-sm">
                    <h3 className="font-semibold">Ainda falta informação obrigatória</h3>
                    <p className="mt-xs text-muted-foreground">
                      Complete as etapas pendentes para ativar o portal do jogador.
                    </p>
                  </div>
                </div>
              )}

              {readyToComplete && (
                <div className="flex items-start gap-md rounded-lg border border-primary/30 bg-primary/10 p-md">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary shrink-0" />
                  <div className="text-sm">
                    <h3 className="font-semibold">Perfil pronto</h3>
                    <p className="mt-xs text-muted-foreground">
                      O onboarding foi concluído e o portal do jogador já pode ser utilizado.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-md">
                <Button type="button" variant="outline" onClick={() => navigate(ROUTES.ONBOARDING_PLAYER_CLUB)}>
                  <ArrowLeft className="mr-xs h-4 w-4" />
                  Voltar ao passo anterior
                </Button>
                <Button
                  type="button"
                  onClick={handleComplete}
                  loading={completeStep.isPending}
                  disabled={!readyToComplete || completeStep.isPending}
                >
                  Concluir onboarding
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </PlayerOnboardingLayout>
  )
}
