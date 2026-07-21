import { useState } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import {
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  Activity,
  CheckCircle2,
  XCircle,
  Pause,
  Zap,
  Users,
  FileText,
  Edit3,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { Badge, Button, Card } from '@/components/ui'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { competitionRoutes } from '../routes'
import { getCompetitionSidebarLinks } from '../constants'
import { useCompetition } from '../hooks/useCompetitions'
import { useCompetitionMatches } from '../hooks/useCompetitionPhase3'
import { useMatchEvents, useAddMatchEvent } from '../hooks/useMatchCenter'
import { useCompetitionAccess } from '../hooks/useCompetitionAccess'
import type { Match, MatchEvent, MatchStatus, EventType } from '../types'

// ─── Status Config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  MatchStatus,
  { label: string; icon: React.ComponentType<any>; variant: 'default' | 'success' | 'danger' | 'warning' | 'secondary' }
> = {
  scheduled: { label: 'Agendado', icon: Clock, variant: 'default' },
  live: { label: 'Em Jogo', icon: Activity, variant: 'warning' },
  finished: { label: 'Terminado', icon: CheckCircle2, variant: 'success' },
  postponed: { label: 'Adiado', icon: Pause, variant: 'secondary' },
  cancelled: { label: 'Cancelado', icon: XCircle, variant: 'danger' },
}

// ─── Event Icons ──────────────────────────────────────────────────────────────

const EVENT_ICONS: Record<string, { icon: React.ComponentType<any>; color: string; label: string }> = {
  goal: { icon: Zap, color: '#10b981', label: 'Golo' },
  own_goal: { icon: Zap, color: '#ef4444', label: 'Auto-Golo' },
  penalty_scored: { icon: Zap, color: '#3b82f6', label: 'Penálti Marcado' },
  penalty_missed: { icon: XCircle, color: '#9ca3af', label: 'Penálti Falhado' },
  yellow_card: { icon: AlertCircle, color: '#eab308', label: 'Cartão Amarelo' },
  red_card: { icon: AlertCircle, color: '#ef4444', label: 'Cartão Vermelho' },
  yellow_red: { icon: AlertCircle, color: '#f97316', label: '2º Amarelo' },
  substitution_in: { icon: Users, color: '#10b981', label: 'Entrou' },
  substitution_out: { icon: Users, color: '#64748b', label: 'Saiu' },
}

// ─── Match Header ─────────────────────────────────────────────────────────────

interface MatchHeaderProps {
  match: Match
  competitionId: string
  isDashboard?: boolean
}

function MatchHeader({ match, competitionId, isDashboard = false }: MatchHeaderProps) {
  const statusCfg = STATUS_CONFIG[match.status] ?? STATUS_CONFIG.scheduled
  const StatusIcon = statusCfg.icon
  const matchDate = new Date(match.match_date)
  const isLive = match.status === 'live'
  const isFinished = match.status === 'finished'
  const hasScore = match.home_score !== null && match.away_score !== null

  return (
    <div className={`relative overflow-hidden ${isDashboard ? 'bg-surface-container' : 'bg-gradient-to-br from-surface-container to-surface-container-high'} rounded-xl`}>
      {/* Live pulse indicator */}
      {isLive && (
        <div className="absolute right-4 top-4 flex items-center gap-2">
          <span className="flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500" />
          </span>
          <span className="text-sm font-semibold text-amber-500">AO VIVO</span>
        </div>
      )}

      <div className={`mx-auto max-w-4xl px-lg ${isDashboard ? 'py-lg' : 'py-2xl'}`}>
        {/* Breadcrumb */}
        <Link
          to={isDashboard ? competitionRoutes.adminDashboard(competitionId) : competitionRoutes.detail(competitionId)}
          className="mb-lg inline-flex items-center gap-xs text-sm text-on-surface-variant hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar à competição
        </Link>

        {/* Match info row */}
        <div className="mb-lg flex flex-wrap items-center gap-md text-sm text-on-surface-variant">
          <div className="flex items-center gap-xs">
            <Calendar className="h-4 w-4" />
            <span>
              {matchDate.toLocaleDateString('pt-PT', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
          <div className="flex items-center gap-xs">
            <Clock className="h-4 w-4" />
            <span>{matchDate.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          {match.venue && (
            <div className="flex items-center gap-xs">
              <MapPin className="h-4 w-4" />
              <span>{match.venue}</span>
            </div>
          )}
          <Badge variant={statusCfg.variant} className="flex items-center gap-1">
            <StatusIcon className="h-3 w-3" />
            {statusCfg.label}
          </Badge>
        </div>

        {/* Teams and Score */}
        <div className="flex items-center justify-center gap-lg">
          {/* Home Team */}
          <div className="flex flex-1 flex-col items-end gap-sm">
            <span className="text-right text-xl font-bold text-on-surface sm:text-2xl">
              {match.home_club_name}
            </span>
            {match.home_club_logo ? (
              <img
                src={match.home_club_logo}
                alt={match.home_club_name}
                className="h-16 w-16 rounded-full object-cover sm:h-20 sm:w-20"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-container/20 text-2xl font-bold text-primary sm:h-20 sm:w-20 sm:text-3xl">
                {match.home_club_name.charAt(0)}
              </div>
            )}
          </div>

          {/* Score */}
          <div className="flex flex-shrink-0 flex-col items-center gap-sm px-lg">
            {hasScore ? (
              <div className="flex items-center gap-sm text-4xl font-bold tabular-nums sm:text-5xl">
                <span className={isFinished ? 'text-on-surface' : 'text-amber-500'}>
                  {match.home_score}
                </span>
                <span className="text-on-surface-variant">—</span>
                <span className={isFinished ? 'text-on-surface' : 'text-amber-500'}>
                  {match.away_score}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-sm text-2xl font-bold text-on-surface-variant sm:text-3xl">
                {isLive ? <Activity className="h-8 w-8 text-amber-500" /> : 'VS'}
              </div>
            )}
            <span className="text-xs text-on-surface-variant">Jornada {match.round_number}</span>
          </div>

          {/* Away Team */}
          <div className="flex flex-1 flex-col items-start gap-sm">
            <span className="text-left text-xl font-bold text-on-surface sm:text-2xl">
              {match.away_club_name}
            </span>
            {match.away_club_logo ? (
              <img
                src={match.away_club_logo}
                alt={match.away_club_name}
                className="h-16 w-16 rounded-full object-cover sm:h-20 sm:w-20"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-container/20 text-2xl font-bold text-primary sm:h-20 sm:w-20 sm:text-3xl">
                {match.away_club_name.charAt(0)}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-xl flex justify-center gap-md">
          <Link to={isDashboard ? competitionRoutes.adminMatchLineup(competitionId, match.id) : competitionRoutes.matchLineup(competitionId, match.id)}>
            <Button variant="secondary" size="sm">
              <Users className="mr-xs h-4 w-4" />
              Escalações
            </Button>
          </Link>
          <Link to={isDashboard ? competitionRoutes.adminMatchReport(competitionId, match.id) : competitionRoutes.matchReport(competitionId, match.id)}>
            <Button variant="secondary" size="sm">
              <FileText className="mr-xs h-4 w-4" />
              Relatório
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── Event Timeline ───────────────────────────────────────────────────────────

interface EventTimelineProps {
  events: MatchEvent[]
  match: Match
  isLoading: boolean
}

function EventTimeline({ events, match, isLoading }: EventTimelineProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-xl">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <Card variant="flat" padding="lg">
        <div className="flex flex-col items-center gap-sm py-lg text-center">
          <Activity className="h-10 w-10 text-on-surface-variant/30" />
          <p className="font-medium text-on-surface-variant">Sem eventos registados</p>
          <p className="text-sm text-on-surface-variant/70">
            Os eventos do jogo serão apresentados aqui assim que forem registados.
          </p>
        </div>
      </Card>
    )
  }

  // Sort events by minute
  const sortedEvents = [...events].sort((a, b) => a.minute - b.minute)

  return (
    <div className="space-y-sm">
      {sortedEvents.map((event) => {
        const config = EVENT_ICONS[event.event_type] || EVENT_ICONS.goal
        const Icon = config.icon
        const isHome = event.club === match.home_club

        return (
          <div
            key={event.id}
            className={`flex items-center gap-md rounded-xl border border-outline-variant/20 bg-surface-container p-md ${
              isHome ? '' : 'flex-row-reverse'
            }`}
          >
            {/* Minute */}
            <div className="flex-shrink-0 text-center">
              <span className="inline-flex items-center gap-xs rounded-full bg-surface-container-high px-sm py-xs text-sm font-semibold text-on-surface">
                {event.extra_time ? `${event.minute}'` : `${event.minute}'`}
              </span>
            </div>

            {/* Event details */}
            <div className={`flex flex-1 items-center gap-sm ${isHome ? '' : 'flex-row-reverse'}`}>
              <div
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: `${config.color}20` }}
              >
                <Icon className="h-4 w-4" style={{ color: config.color }} />
              </div>
              <div className={`flex flex-col ${isHome ? 'text-left' : 'text-right'}`}>
                <span className="text-sm font-semibold text-on-surface">
                  {event.player_name || config.label}
                </span>
                <span className="text-xs text-on-surface-variant">
                  {event.event_type_label}
                  {event.notes && ` — ${event.notes}`}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Add Event Form ───────────────────────────────────────────────────────────

interface AddEventFormProps {
  match: Match
  competitionId: string
  onSuccess: () => void
  onCancel: () => void
}

function AddEventForm({ match, competitionId, onSuccess, onCancel }: AddEventFormProps) {
  const addEvent = useAddMatchEvent(competitionId, match.id)
  const [eventType, setEventType] = useState<EventType>('goal')
  const [minute, setMinute] = useState('')
  const [clubId, setClubId] = useState(match.home_club)
  const [extraTime, setExtraTime] = useState(false)
  const [notes, setNotes] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const minuteNum = parseInt(minute, 10)
    if (isNaN(minuteNum) || minuteNum < 0 || minuteNum > 120) return

    addEvent.mutate(
      {
        event_type: eventType,
        minute: minuteNum,
        extra_time: extraTime,
        club: clubId,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          setMinute('')
          setNotes('')
          onSuccess()
        },
      }
    )
  }

  return (
    <Card variant="flat" padding="lg">
      <form onSubmit={handleSubmit} className="space-y-md">
        <h3 className="flex items-center gap-sm text-base font-semibold text-on-surface">
          <Edit3 className="h-4 w-4" />
          Adicionar Evento
        </h3>

        <div className="grid gap-md sm:grid-cols-2">
          {/* Event Type */}
          <div className="space-y-xs">
            <label htmlFor="event-type" className="text-sm font-medium text-on-surface-variant">
              Tipo de Evento
            </label>
            <select
              id="event-type"
              value={eventType}
              onChange={(e) => setEventType(e.target.value as EventType)}
              className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-high px-md py-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="goal">Golo</option>
              <option value="own_goal">Auto-Golo</option>
              <option value="penalty_scored">Penálti Marcado</option>
              <option value="penalty_missed">Penálti Falhado</option>
              <option value="yellow_card">Cartão Amarelo</option>
              <option value="red_card">Cartão Vermelho</option>
              <option value="yellow_red">Segundo Amarelo</option>
              <option value="substitution_in">Substituição (Entra)</option>
              <option value="substitution_out">Substituição (Sai)</option>
            </select>
          </div>

          {/* Minute */}
          <div className="space-y-xs">
            <label htmlFor="minute" className="text-sm font-medium text-on-surface-variant">
              Minuto
            </label>
            <div className="flex items-center gap-sm">
              <input
                id="minute"
                type="number"
                min="0"
                max="120"
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                placeholder="45"
                required
                className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-high px-md py-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <label className="flex items-center gap-xs text-sm text-on-surface-variant">
                <input
                  type="checkbox"
                  checked={extraTime}
                  onChange={(e) => setExtraTime(e.target.checked)}
                  className="rounded border-outline-variant/30"
                />
                +
              </label>
            </div>
          </div>

          {/* Club */}
          <div className="space-y-xs">
            <label htmlFor="club" className="text-sm font-medium text-on-surface-variant">
              Clube
            </label>
            <select
              id="club"
              value={clubId}
              onChange={(e) => setClubId(e.target.value)}
              className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-high px-md py-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value={match.home_club}>{match.home_club_name}</option>
              <option value={match.away_club}>{match.away_club_name}</option>
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-xs">
            <label htmlFor="notes" className="text-sm font-medium text-on-surface-variant">
              Notas (opcional)
            </label>
            <input
              id="notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Pé esquerdo, cabeceamento..."
              className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-high px-md py-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-sm">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onCancel}
            disabled={addEvent.isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={addEvent.isPending}>
            {addEvent.isPending ? (
              <>
                <Loader2 className="mr-xs h-4 w-4 animate-spin" />
                A guardar...
              </>
            ) : (
              <>
                <Zap className="mr-xs h-4 w-4" />
                Adicionar
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  )
}

// ─── MatchCenterPage ──────────────────────────────────────────────────────────

export function MatchCenterPage() {
  const { compId, matchId } = useParams<{ compId: string; matchId: string }>()
  const competitionId = compId ?? ''
  const matchIdValue = matchId ?? ''
  const { isAdmin } = useCompetitionAccess()
  const location = useLocation()
  const isDashboard = location.pathname.startsWith('/dashboard')

  const { isLoading: loadingComp } = useCompetition(competitionId)
  const { data: matches = [], isLoading: loadingMatches } = useCompetitionMatches(competitionId)
  const { data: events = [], isLoading: loadingEvents } = useMatchEvents(competitionId, matchIdValue)

  const [showAddEvent, setShowAddEvent] = useState(false)

  // Find the specific match
  const match = (matches as Match[]).find((m) => m.id === matchIdValue)
  const sidebarLinks = getCompetitionSidebarLinks(competitionId)

  if (loadingComp || loadingMatches) {
    const LoadingComponent = () => (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
    if (isDashboard) {
      return (
        <DashboardLayout
          title="Jogo"
          subtitle="A carregar..."
          dashboardType="competition"
          sidebarLinks={sidebarLinks}
        >
          <LoadingComponent />
        </DashboardLayout>
      )
    }
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingComponent />
      </div>
    )
  }

  if (!match) {
    const NotFoundComponent = () => (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-md">
        <AlertCircle className="h-12 w-12 text-error opacity-70" />
        <p className="text-lg font-medium text-on-surface">Jogo não encontrado</p>
        <Link to={isDashboard ? competitionRoutes.adminDashboard(competitionId) : competitionRoutes.detail(competitionId)}>
          <Button variant="secondary" size="sm">
            Voltar à competição
          </Button>
        </Link>
      </div>
    )
    if (isDashboard) {
      return (
        <DashboardLayout
          title="Jogo não encontrado"
          dashboardType="competition"
          sidebarLinks={sidebarLinks}
        >
          <NotFoundComponent />
        </DashboardLayout>
      )
    }
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-md bg-background">
        <NotFoundComponent />
      </div>
    )
  }

  const pageContent = (
    <>
      {/* Match Header */}
      <MatchHeader match={match} competitionId={competitionId} isDashboard={isDashboard} />

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-lg py-xl">
        <div className="space-y-xl">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-sm text-lg font-semibold text-on-surface">
              <Activity className="h-5 w-5" />
              Cronologia de Eventos
            </h2>
            {isAdmin && !showAddEvent && (
              <Button variant="primary" size="sm" onClick={() => setShowAddEvent(true)}>
                <Edit3 className="mr-xs h-4 w-4" />
                Adicionar Evento
              </Button>
            )}
          </div>

          {/* Add Event Form */}
          {showAddEvent && isAdmin && (
            <AddEventForm
              match={match}
              competitionId={competitionId}
              onSuccess={() => setShowAddEvent(false)}
              onCancel={() => setShowAddEvent(false)}
            />
          )}

          {/* Event Timeline */}
          <EventTimeline events={events} match={match} isLoading={loadingEvents} />
        </div>
      </div>
    </>
  )

  if (isDashboard) {
    return (
      <DashboardLayout
        title={`${match.home_club_name} vs ${match.away_club_name}`}
        subtitle={`Jornada ${match.round_number}`}
        dashboardType="competition"
        sidebarLinks={sidebarLinks}
      >
        {pageContent}
      </DashboardLayout>
    )
  }

  return <div className="min-h-screen bg-background">{pageContent}</div>
}
