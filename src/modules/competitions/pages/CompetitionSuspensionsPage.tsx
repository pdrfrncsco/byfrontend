import { useParams } from 'react-router-dom'
import { AlertTriangle, Loader2, User as UserIcon } from 'lucide-react'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { useSuspensions, useCancelSuspension } from '../hooks/useCompetitionAdvanced'
import { useCompetition } from '../hooks/useCompetitions'
import { useCompetitionAccess } from '../hooks/useCompetitionAccess'
import { CompetitionManagementFrame } from '../components/CompetitionManagementFrame'
import type { Suspension, SuspensionType } from '../types'

const SUSPENSION_TYPE_LABELS: Record<SuspensionType, string> = {
  yellow_cards: 'Cartões Amarelos',
  red_card: 'Cartão Vermelho',
  double_yellow: 'Segundo Amarelo',
}

interface SuspensionCardProps {
  suspension: Suspension
  isAdmin: boolean
}

function SuspensionCard({ suspension, isAdmin }: SuspensionCardProps) {
  const cancel = useCancelSuspension()

  return (
    <div className="flex items-center justify-between gap-md rounded-xl border border-outline-variant/20 bg-surface-container p-md transition-colors hover:bg-surface-container-high/50">
      <div className="flex items-center gap-sm">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-500/10">
          <UserIcon className="h-5 w-5 text-red-500" />
        </div>
        <div>
          <p className="font-medium text-on-surface">{suspension.player_name ?? 'Jogador'}</p>
          <p className="text-xs text-on-surface-variant">{suspension.club_name}</p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-xs">
        <Badge variant={suspension.is_active ? 'danger' : 'secondary'}>
          {suspension.is_active ? 'Ativo' : 'Cumprido'}
        </Badge>
        <p className="text-xs text-on-surface-variant">
          {SUSPENSION_TYPE_LABELS[suspension.suspension_type]}
        </p>
        <p className="text-xs font-medium text-on-surface">
          Falta{suspension.matches_remaining !== 1 ? 'm' : ''} {suspension.matches_remaining} jogo{suspension.matches_remaining !== 1 ? 's' : ''}
        </p>
      </div>

      {isAdmin && suspension.is_active && (
        <button
          onClick={() => cancel.mutate(suspension.id)}
          disabled={cancel.isPending}
          className="ml-sm flex-shrink-0 rounded-lg border border-outline-variant/30 px-sm py-xs text-xs text-on-surface-variant transition-colors hover:border-red-300 hover:bg-red-500/10 hover:text-red-600 disabled:opacity-50"
          title="Cancelar suspensão"
        >
          {cancel.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            'Cancelar'
          )}
        </button>
      )}
    </div>
  )
}

/**
 * CompetitionSuspensionsPage — lists active and past suspensions for a competition.
 */
export function CompetitionSuspensionsPage() {
  const { id } = useParams<{ id: string }>()
  const competitionId = id ?? ''
  const { isAdmin } = useCompetitionAccess()

  const { data: competition, isLoading: loadingComp } = useCompetition(competitionId)
  const { data: suspensions = [], isLoading: loadingSuspensions } = useSuspensions(competitionId)

  const active = (suspensions as Suspension[]).filter(s => s.is_active)
  const past = (suspensions as Suspension[]).filter(s => !s.is_active)

  return (
    <CompetitionManagementFrame
      backTo={`/competitions/${competitionId}`}
      backLabel="Voltar à Competição"
      badge={<><AlertTriangle className="h-3.5 w-3.5" /> Suspensões</>}
      title="Suspensões"
      description={!loadingComp && competition ? `${competition.name} — ${competition.season}` : undefined}
      contentClassName="mx-auto max-w-5xl"
    >
      {loadingSuspensions ? (
        <div className="flex items-center gap-sm py-xl text-sm text-on-surface-variant">
          <Loader2 className="h-4 w-4 animate-spin" />
          A carregar suspensões...
        </div>
      ) : suspensions.length === 0 ? (
        <Card variant="flat" padding="lg">
          <div className="flex flex-col items-center gap-md py-xl text-on-surface-variant">
            <AlertTriangle className="h-10 w-10 opacity-30" />
            <p className="font-medium">Nenhuma suspensão registada.</p>
            <p className="text-sm opacity-70">Não existem jogadores suspensos nesta competição.</p>
          </div>
        </Card>
      ) : (
        <>
          {/* Active suspensions */}
          {active.length > 0 && (
            <Card variant="flat" padding="none">
              <CardHeader>
                <CardTitle className="flex items-center gap-sm">
                  <span className="text-red-500">Suspensões Ativas</span>
                  <Badge variant="danger">{active.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-sm">
                  {active.map(s => (
                    <SuspensionCard key={s.id} suspension={s} isAdmin={isAdmin} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Past suspensions */}
          {past.length > 0 && (
            <Card variant="flat" padding="none">
              <CardHeader>
                <CardTitle className="flex items-center gap-sm text-on-surface-variant">
                  Suspensões Cumpridas
                  <span className="rounded-full bg-surface-container-high px-sm text-xs text-on-surface-variant">
                    {past.length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-sm">
                  {past.map(s => (
                    <SuspensionCard key={s.id} suspension={s} isAdmin={isAdmin} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </CompetitionManagementFrame>
  )
}
