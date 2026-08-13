import { Link } from 'react-router-dom'
import { CheckCircle2, CircleAlert } from 'lucide-react'
import { Button, Badge } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { usePlayerOnboardingStatus } from '../hooks'
import { PlayerOnboardingLayout } from './PlayerOnboardingLayout'

function StatusRow({ label, complete }: { label: string; complete: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-outline-variant/30 bg-surface-container p-md">
      <span className="text-sm font-medium text-on-surface">{label}</span>
      {complete ? (
        <Badge variant="success">Completo</Badge>
      ) : (
        <Badge variant="warning">Pendente</Badge>
      )}
    </div>
  )
}

export function PlayerOnboardingReviewPage() {
  const { data, isLoading } = usePlayerOnboardingStatus()
  const player = data?.player
  const complete = Boolean(data && !data.onboarding_required)

  return (
    <PlayerOnboardingLayout step={3} maxReachedStep={3}>
      <div className="space-y-lg">
        <div>
          <h2 className="text-xl font-semibold text-on-surface">Revisão final</h2>
          <p className="mt-xs text-sm text-on-surface-variant">
            Confirme se os requisitos mínimos foram preenchidos antes de entrar no portal do jogador.
          </p>
        </div>

        {isLoading ? (
          <div className="text-sm text-on-surface-variant">A validar perfil...</div>
        ) : (
          <>
            <div className="grid gap-md md:grid-cols-2">
              <StatusRow label="Dados pessoais" complete={Boolean(data?.personal_complete)} />
              <StatusRow label="Identidade" complete={Boolean(data?.identity_complete)} />
              <StatusRow label="Informação futebolística" complete={Boolean(data?.football_complete)} />
              <StatusRow label="Contacto" complete={Boolean(data?.contact_complete)} />
              <StatusRow label="Responsável legal" complete={Boolean(data?.guardian_complete || !player?.is_minor)} />
              <StatusRow label="Documentos" complete={Boolean(data?.documents_complete)} />
              <StatusRow label="Clube" complete={Boolean(data?.club_complete)} />
            </div>

            {player && (
              <div className="rounded-lg border border-outline-variant/30 bg-surface-container p-md">
                <div className="flex flex-col gap-md md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-on-surface">{player.full_name}</h3>
                    <p className="mt-xs text-sm text-on-surface-variant">
                      {player.position_label} · {player.nationality || 'Nacionalidade por definir'}
                    </p>
                  </div>
                  <Badge variant={player.is_public ? 'success' : 'secondary'}>
                    {player.is_public ? 'Perfil público' : 'Perfil privado'}
                  </Badge>
                </div>
              </div>
            )}

            {!complete && (
              <div className="flex items-start gap-md rounded-lg border border-warning/30 bg-warning-container/10 p-md">
                <CircleAlert className="mt-0.5 h-5 w-5 text-warning" />
                <div className="text-sm">
                  <h3 className="font-semibold text-on-surface">Ainda falta informação obrigatória</h3>
                  <p className="mt-xs text-on-surface-variant">
                    Complete as etapas pendentes para ativar o portal do jogador.
                  </p>
                </div>
              </div>
            )}

            {complete && (
              <div className="flex items-start gap-md rounded-lg border border-primary/30 bg-primary-container/10 p-md">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
                <div className="text-sm">
                  <h3 className="font-semibold text-on-surface">Perfil pronto</h3>
                  <p className="mt-xs text-on-surface-variant">
                    O onboarding foi concluído e o portal do jogador já pode ser utilizado.
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col-reverse gap-sm sm:flex-row sm:justify-between">
              <Button asChild variant="secondary">
                <Link to={ROUTES.ONBOARDING_PLAYER_FOOTBALL}>
                  Voltar ao passo anterior
                </Link>
              </Button>
              {complete ? (
                <Button asChild>
                  <Link to={ROUTES.ONBOARDING_PLAYER_COMPLETE}>
                    Concluir onboarding
                  </Link>
                </Button>
              ) : (
                <Button type="button" disabled>
                  Concluir onboarding
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </PlayerOnboardingLayout>
  )
}
