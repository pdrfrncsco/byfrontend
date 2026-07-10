import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Users,
  Shield,
  Crown,
  Loader2,
  AlertCircle,
  Check,
  Lock,
  Edit3,
  Goal,
} from 'lucide-react'
import { Badge, Button, Card } from '@/components/ui'
import { useCompetition } from '../hooks/useCompetitions'
import { useCompetitionMatches } from '../hooks/useCompetitionPhase3'
import {
  useLineups,
  useSubmitLineup,
  useConfirmLineup,
  useLockLineup,
} from '../hooks/useCompetitionAdvanced'
import type { Match, LineupSubmission, LineupPlayer, LineupPlayerStatus } from '../types'

// ─── Status Badge ─────────────────────────────────────────────────────────────

const LINEUP_STATUS_CONFIG: Record<
  string,
  { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'secondary' }
> = {
  draft: { label: 'Rascunho', variant: 'secondary' },
  submitted: { label: 'Submetida', variant: 'default' },
  confirmed: { label: 'Confirmada', variant: 'success' },
  locked: { label: 'Bloqueada', variant: 'warning' },
}

// ─── Formation Display ────────────────────────────────────────────────────────

interface FormationFieldProps {
  starters: LineupPlayer[]
  homeClubName: string
  awayClubName: string
  isHome: boolean
}

function FormationField({ starters, homeClubName, awayClubName, isHome }: FormationFieldProps) {
  // Group by position for formation display
  const positionGroups: Record<string, LineupPlayer[]> = {
    GK: [],
    DEF: [],
    MID: [],
    FWD: [],
  }

  starters.forEach((player) => {
    const pos = player.position?.toUpperCase() || ''
    if (pos.includes('GK') || pos.includes('GR')) {
      positionGroups.GK.push(player)
    } else if (pos.includes('CB') || pos.includes('LB') || pos.includes('RB') || pos.includes('DF')) {
      positionGroups.DEF.push(player)
    } else if (pos.includes('CM') || pos.includes('CDM') || pos.includes('CAM') || pos.includes('LM') || pos.includes('RM') || pos.includes('MF')) {
      positionGroups.MID.push(player)
    } else if (pos.includes('ST') || pos.includes('CF') || pos.includes('LW') || pos.includes('RW') || pos.includes('FW')) {
      positionGroups.FWD.push(player)
    } else {
      positionGroups.MID.push(player)
    }
  })

  return (
    <div className="relative mx-auto max-w-md">
      {/* Field background */}
      <div className="aspect-[3/4] rounded-2xl bg-gradient-to-b from-green-600 to-green-700 p-lg shadow-lg">
        {/* Field markings */}
        <div className="relative h-full rounded-xl border-2 border-white/30">
          {/* Center circle */}
          <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/30" />
          {/* Center line */}
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-white/30" />
          {/* Goal areas */}
          <div className="absolute left-1/2 top-0 h-16 w-32 -translate-x-1/2 border-b-2 border-l-2 border-r-2 border-white/30" />
          <div className="absolute bottom-0 left-1/2 h-16 w-32 -translate-x-1/2 border-t-2 border-l-2 border-r-2 border-white/30" />
        </div>

        {/* Players on field */}
        <div className="absolute inset-0 flex flex-col items-center justify-between py-lg">
          {/* Goalkeeper */}
          <div className="flex justify-center">
            <PlayerMarker player={positionGroups.GK[0]} />
          </div>

          {/* Defenders */}
          <div className="flex w-full justify-around px-lg">
            {positionGroups.DEF.slice(0, 4).map((player, i) => (
              <PlayerMarker key={player.id || i} player={player} />
            ))}
          </div>

          {/* Midfielders */}
          <div className="flex w-full justify-around px-lg">
            {positionGroups.MID.slice(0, 4).map((player, i) => (
              <PlayerMarker key={player.id || i} player={player} />
            ))}
          </div>

          {/* Forwards */}
          <div className="flex justify-center gap-xl">
            {positionGroups.FWD.slice(0, 2).map((player, i) => (
              <PlayerMarker key={player.id || i} player={player} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Player Marker ────────────────────────────────────────────────────────────

function PlayerMarker({ player }: { player?: LineupPlayer }) {
  if (!player) {
    return <div className="h-10 w-10 rounded-full bg-white/10" />
  }

  return (
    <div className="group relative flex flex-col items-center">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white shadow-md ${
          player.is_goalkeeper ? 'bg-amber-500' : 'bg-blue-600'
        }`}
      >
        {player.shirt_number}
      </div>
      {player.is_captain && (
        <Crown className="absolute -right-1 -top-1 h-4 w-4 text-amber-400" />
      )}
      <span className="mt-1 max-w-20 truncate text-center text-xs font-medium text-white drop-shadow">
        {player.player?.full_name?.split(' ').pop() || 'Jogador'}
      </span>
    </div>
  )
}

// ─── Player Card ──────────────────────────────────────────────────────────────

function PlayerCard({
  player,
  isStarter,
}: {
  player: LineupPlayer
  isStarter: boolean
}) {
  return (
    <div
      className={`flex items-center gap-sm rounded-lg border p-sm transition-all ${
        isStarter
          ? 'border-primary/30 bg-primary-container/10'
          : 'border-outline-variant/20 bg-surface-container'
      }`}
    >
      {/* Shirt number */}
      <div
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          player.is_goalkeeper
            ? 'bg-amber-500 text-white'
            : 'bg-primary-container/20 text-primary'
        }`}
      >
        {player.shirt_number}
      </div>

      {/* Player info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-xs">
          <span className="truncate text-sm font-medium text-on-surface">
            {player.player?.full_name || 'Jogador'}
          </span>
          {player.is_captain && <Crown className="h-3 w-3 text-amber-500" />}
          {player.is_goalkeeper && <Goal className="h-3 w-3 text-amber-600" />}
        </div>
        <span className="text-xs text-on-surface-variant">
          {player.position_display || player.position}
        </span>
      </div>

      {/* Status badge */}
      <Badge
        variant={isStarter ? 'success' : 'secondary'}
        className="text-xs"
      >
        {isStarter ? 'Titular' : 'Suplente'}
      </Badge>
    </div>
  )
}

// ─── Lineup Section ───────────────────────────────────────────────────────────

interface LineupSectionProps {
  lineup: LineupSubmission
  isHome: boolean
  match: Match
}

function LineupSection({ lineup, isHome, match }: LineupSectionProps) {
  const starters = lineup.starters || lineup.lineup_players?.filter((p) => p.status === 'starter') || []
  const substitutes = lineup.substitutes || lineup.lineup_players?.filter((p) => p.status === 'substitute') || []
  const statusConfig = LINEUP_STATUS_CONFIG[lineup.status] || LINEUP_STATUS_CONFIG.draft

  return (
    <div className="space-y-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-sm">
          <h3 className="text-lg font-semibold text-on-surface">
            {isHome ? match.home_club_name : match.away_club_name}
          </h3>
          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
        </div>
        {lineup.formation && (
          <span className="text-sm text-on-surface-variant">Formação: {lineup.formation}</span>
        )}
      </div>

      {/* Formation Field */}
      {starters.length > 0 && (
        <FormationField
          starters={starters}
          homeClubName={match.home_club_name}
          awayClubName={match.away_club_name}
          isHome={isHome}
        />
      )}

      {/* Starters List */}
      <div className="space-y-sm">
        <h4 className="flex items-center gap-xs text-sm font-semibold text-on-surface-variant">
          <Shield className="h-4 w-4" />
          Titulares ({starters.length})
        </h4>
        <div className="grid gap-sm sm:grid-cols-2">
          {starters.map((player) => (
            <PlayerCard key={player.id} player={player} isStarter />
          ))}
        </div>
      </div>

      {/* Substitutes List */}
      {substitutes.length > 0 && (
        <div className="space-y-sm">
          <h4 className="flex items-center gap-xs text-sm font-semibold text-on-surface-variant">
            <Users className="h-4 w-4" />
            Suplentes ({substitutes.length})
          </h4>
          <div className="grid gap-sm sm:grid-cols-2">
            {substitutes.map((player) => (
              <PlayerCard key={player.id} player={player} isStarter={false} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {starters.length === 0 && substitutes.length === 0 && (
        <Card variant="flat" padding="lg">
          <div className="flex flex-col items-center gap-sm py-lg text-center">
            <Users className="h-10 w-10 text-on-surface-variant/30" />
            <p className="font-medium text-on-surface-variant">Escalação não disponível</p>
            <p className="text-sm text-on-surface-variant/70">
              A escalação será apresentada aqui assim que for submetida.
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}

// ─── MatchLineupPage ──────────────────────────────────────────────────────────

export function MatchLineupPage() {
  const { compId, matchId } = useParams<{ compId: string; matchId: string }>()
  const competitionId = compId ?? ''
  const matchIdValue = matchId ?? ''

  const { data: competition, isLoading: loadingComp } = useCompetition(competitionId)
  const { data: matches = [], isLoading: loadingMatches } = useCompetitionMatches(competitionId)
  const { data: lineups = [], isLoading: loadingLineups } = useLineups(matchIdValue)

  const confirmLineup = useConfirmLineup(matchIdValue)
  const lockLineup = useLockLineup(matchIdValue)

  // Find the specific match
  const match = (matches as Match[]).find((m) => m.id === matchIdValue)

  // Find home and away lineups
  const homeLineup = (lineups as LineupSubmission[]).find((l) => l.club === match?.home_club)
  const awayLineup = (lineups as LineupSubmission[]).find((l) => l.club === match?.away_club)

  // TODO: derive isAdmin from auth context when available
  const isAdmin = false

  if (loadingComp || loadingMatches) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!match) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-md bg-background">
        <AlertCircle className="h-12 w-12 text-error opacity-70" />
        <p className="text-lg font-medium text-on-surface">Jogo não encontrado</p>
        <Link to={`/competitions/${competitionId}`}>
          <Button variant="secondary" size="sm">
            Voltar à competição
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface-container">
        <div className="mx-auto max-w-4xl px-lg py-lg">
          {/* Breadcrumb */}
          <Link
            to={`/competitions/${competitionId}/matches/${matchIdValue}`}
            className="mb-md inline-flex items-center gap-xs text-sm text-on-surface-variant hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao jogo
          </Link>

          <h1 className="flex items-center gap-sm text-xl font-semibold text-on-surface">
            <Users className="h-5 w-5" />
            Escalações
          </h1>
          <p className="mt-xs text-sm text-on-surface-variant">
            {match.home_club_name} vs {match.away_club_name}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-lg py-xl">
        {loadingLineups ? (
          <div className="flex items-center justify-center py-xl">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-2xl">
            {/* Home Team Lineup */}
            <Card variant="flat" padding="lg">
              {homeLineup ? (
                <LineupSection lineup={homeLineup} isHome match={match} />
              ) : (
                <div className="flex flex-col items-center gap-sm py-lg text-center">
                  <Users className="h-10 w-10 text-on-surface-variant/30" />
                  <p className="font-medium text-on-surface-variant">
                    Escalação do {match.home_club_name} não disponível
                  </p>
                </div>
              )}
            </Card>

            {/* Away Team Lineup */}
            <Card variant="flat" padding="lg">
              {awayLineup ? (
                <LineupSection lineup={awayLineup} isHome={false} match={match} />
              ) : (
                <div className="flex flex-col items-center gap-sm py-lg text-center">
                  <Users className="h-10 w-10 text-on-surface-variant/30" />
                  <p className="font-medium text-on-surface-variant">
                    Escalação do {match.away_club_name} não disponível
                  </p>
                </div>
              )}
            </Card>

            {/* Admin Actions */}
            {isAdmin && lineups.length > 0 && (
              <div className="flex justify-center gap-md">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => confirmLineup.mutate()}
                  disabled={confirmLineup.isPending}
                >
                  {confirmLineup.isPending ? (
                    <Loader2 className="mr-xs h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-xs h-4 w-4" />
                  )}
                  Confirmar Escalações
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => lockLineup.mutate()}
                  disabled={lockLineup.isPending}
                >
                  {lockLineup.isPending ? (
                    <Loader2 className="mr-xs h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="mr-xs h-4 w-4" />
                  )}
                  Bloquear Escalações
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
