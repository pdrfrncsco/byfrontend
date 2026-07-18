import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertTriangle, Loader2, Plus, User as UserIcon, X } from 'lucide-react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { useSuspensions, useCancelSuspension, useCreateSuspension } from '../hooks/useCompetitionAdvanced'
import { useCompetition } from '../hooks/useCompetitions'
import { useCompetitionAccess } from '../hooks/useCompetitionAccess'
import { competitionRoutes } from '../routes'
import { getCompetitionSidebarLinks } from '../constants'
import type { Suspension, SuspensionType, ManualSuspensionCreateData } from '../types'

const SUSPENSION_TYPE_LABELS: Record<SuspensionType, string> = {
  yellow_cards: 'Cartões Amarelos',
  red_card: 'Cartão Vermelho',
  double_yellow: 'Segundo Amarelo',
}

// ─── Suspension Card ──────────────────────────────────────────────────────────

function SuspensionCard({ suspension, isAdmin }: { suspension: Suspension; isAdmin: boolean }) {
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
          {cancel.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Cancelar'}
        </button>
      )}
    </div>
  )
}

// ─── Manual Suspension Form ───────────────────────────────────────────────────

function ManualSuspensionForm({
  competitionId,
  onClose,
}: {
  competitionId: string
  onClose: () => void
}) {
  const createSuspension = useCreateSuspension(competitionId)
  const [form, setForm] = useState<ManualSuspensionCreateData>({
    player: '',
    club: '',
    suspension_type: 'red_card',
    matches_suspended: 1,
    effective_from: new Date().toISOString().split('T')[0],
    reason: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: name === 'matches_suspended' ? Number(value) : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createSuspension.mutate(form, {
      onSuccess: () => onClose(),
    })
  }

  const inputClass =
    'w-full rounded-lg border border-outline-variant/30 bg-surface-container px-md py-sm text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30'
  const labelClass = 'block text-xs font-semibold uppercase tracking-wide text-on-surface-variant mb-xs'

  return (
    <Card variant="flat" padding="none" className="border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between pb-sm">
        <CardTitle className="flex items-center gap-sm text-sm">
          <Plus className="h-4 w-4 text-primary" />
          Nova Suspensão Manual
        </CardTitle>
        <button
          onClick={onClose}
          className="rounded-lg p-xs text-on-surface-variant transition-colors hover:bg-surface-container-high"
        >
          <X className="h-4 w-4" />
        </button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-md">
          <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
            <div>
              <label htmlFor="susp-player" className={labelClass}>ID do Jogador</label>
              <input
                id="susp-player"
                name="player"
                className={inputClass}
                placeholder="UUID do jogador"
                value={form.player}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="susp-club" className={labelClass}>ID do Clube</label>
              <input
                id="susp-club"
                name="club"
                className={inputClass}
                placeholder="UUID do clube"
                value={form.club}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-md sm:grid-cols-3">
            <div>
              <label htmlFor="susp-type" className={labelClass}>Motivo</label>
              <select
                id="susp-type"
                name="suspension_type"
                className={inputClass}
                value={form.suspension_type}
                onChange={handleChange}
              >
                <option value="red_card">Cartão Vermelho</option>
                <option value="yellow_cards">Cartões Amarelos</option>
                <option value="double_yellow">Segundo Amarelo</option>
              </select>
            </div>
            <div>
              <label htmlFor="susp-matches" className={labelClass}>Jogos de Suspensão</label>
              <input
                id="susp-matches"
                name="matches_suspended"
                type="number"
                min={1}
                max={99}
                className={inputClass}
                value={form.matches_suspended}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="susp-date" className={labelClass}>Vigência a Partir de</label>
              <input
                id="susp-date"
                name="effective_from"
                type="date"
                className={inputClass}
                value={form.effective_from}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="susp-reason" className={labelClass}>Justificação (opcional)</label>
            <textarea
              id="susp-reason"
              name="reason"
              rows={2}
              className={inputClass}
              placeholder="Ex: Expulsão por comportamento anti-desportivo"
              value={form.reason}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end gap-sm">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={createSuspension.isPending}>
              {createSuspension.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> A criar...</>
              ) : (
                'Criar Suspensão'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// ─── CompetitionSuspensionsPage ───────────────────────────────────────────────

/**
 * CompetitionSuspensionsPage — lists active and past suspensions, and allows
 * admins to create manual suspensions and cancel active ones.
 */
export function CompetitionSuspensionsPage() {
  const { id } = useParams<{ id: string }>()
  const competitionId = id ?? ''
  const sidebarLinks = getCompetitionSidebarLinks(competitionId)
  const { isAdmin } = useCompetitionAccess()
  const [showForm, setShowForm] = useState(false)

  const { data: competition, isLoading: loadingComp } = useCompetition(competitionId)
  const { data: suspensions = [], isLoading: loadingSuspensions } = useSuspensions(competitionId)

  const active = (suspensions as Suspension[]).filter(s => s.is_active)
  const past = (suspensions as Suspension[]).filter(s => !s.is_active)

  return (
    <DashboardLayout
      title="Suspensões"
      subtitle={!loadingComp && competition ? `${competition.name} — ${competition.season}` : 'Consultar suspensões ativas e cumpridas.'}
      dashboardType="competition"
      sidebarLinks={sidebarLinks}
      headerActions={
        <div className="flex items-center gap-sm">
          {isAdmin && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowForm(v => !v)}
              id="new-suspension-btn"
            >
              <Plus className="h-4 w-4" />
              <span>Nova Suspensão</span>
            </Button>
          )}
          <Button asChild variant="secondary" size="sm">
            <Link to={competitionRoutes.detail(competitionId)}>
              <AlertTriangle className="h-4 w-4" />
              <span>Ver página pública</span>
            </Link>
          </Button>
        </div>
      }
    >
      {/* Manual suspension form */}
      {isAdmin && showForm && (
        <div className="mb-lg">
          <ManualSuspensionForm competitionId={competitionId} onClose={() => setShowForm(false)} />
        </div>
      )}

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
            {isAdmin && (
              <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4" />
                Criar Suspensão Manual
              </Button>
            )}
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
            <Card variant="flat" padding="none" className="mt-lg">
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
    </DashboardLayout>
  )
}
