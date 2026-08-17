import { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import {
  Users,
  Shield,
  Crown,
  Loader2,
  AlertCircle,
  Check,
  Lock,
  Goal,
} from 'lucide-react'
import { Badge, Button, Card } from '@/components/ui'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { competitionRoutes } from '../routes'
import { getCompetitionSidebarLinks } from '../constants'
import { useCompetition } from '../hooks/useCompetitions'
import { useCompetitionMatches } from '../hooks/useCompetitionMatches'
import {
  useLineups,
  useConfirmLineup,
  useLockLineup,
} from '../hooks/useCompetitionAdvanced'
import { useCompetitionAccess } from '../hooks/useCompetitionAccess'
import { matchApi } from '../services/match.api'
import type { Match, LineupSubmission, LineupPlayer } from '../types'
import { MatchLineupGrid } from '../components'

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
}

function FormationField({ starters }: FormationFieldProps) {
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
      <div className="aspect-[3/4] rounded-2xl bg-gradient-to-b from-primary-container/40 via-surface-container to-surface-container-high p-lg shadow-lg shadow-primary/10">
        {/* Field markings */}
        <div className="relative h-full rounded-xl border-2 border-outline-variant/50 bg-[radial-gradient(circle_at_center,rgba(var(--color-primary-rgb),0.08),transparent_60%)]">
          {/* Center circle */}
          <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-outline-variant/50" />
          {/* Center line */}
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-outline/40" />
          {/* Goal areas */}
          <div className="absolute left-1/2 top-0 h-16 w-32 -translate-x-1/2 border-b-2 border-l-2 border-r-2 border-outline-variant/50" />
          <div className="absolute bottom-0 left-1/2 h-16 w-32 -translate-x-1/2 border-t-2 border-l-2 border-r-2 border-outline-variant/50" />
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
        className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold shadow-md ${
          player.is_goalkeeper ? 'bg-amber-100 text-amber-700 border-2 border-amber-300' : 'bg-primary-container text-primary border-2 border-primary/30'
        }`}
      >
        {player.shirt_number}
      </div>
      {player.is_captain && (
        <Crown className="absolute -right-1 -top-1 h-4 w-4 text-amber-500" />
      )}
      <span className="mt-1 max-w-20 truncate text-center text-xs font-medium text-on-surface">
        {player.player?.full_name?.split(' ').pop() || 'Jogador'}
      </span>
    </div>
  )
}

// ─── Player Card ──────────────────────────────────────────────────────────────

function PlayerCard({
  player,
  isStarter,
  editable = false,
  onDragStart,
  onDrop,
}: {
  player: LineupPlayer
  isStarter: boolean
  editable?: boolean
  onDragStart?: () => void
  onDrop?: () => void
}) {
  return (
    <div
      draggable={editable}
      onDragStart={onDragStart}
      onDragOver={(event) => editable && event.preventDefault()}
      onDrop={(event) => { event.preventDefault(); onDrop?.() }}
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
            ? 'bg-amber-100 text-amber-700 border border-amber-200'
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
  editable?: boolean
  onSave?: (teamId: string, formation: string, starters: LineupPlayer[], substitutes: LineupPlayer[]) => Promise<void>
  onConfirm?: (clubId: string) => void
  onConfirmPending?: boolean
}

function LineupSection({ lineup, isHome, match, editable = false, onSave, onConfirm, onConfirmPending = false }: LineupSectionProps) {
  // Derive starters/substitutes from props (memoized so deps are stable)
  const derivedStarters = useMemo(
    () => lineup.starters ?? lineup.lineup_players?.filter((p) => String(p.status).toLowerCase() === 'starter') ?? [],
    [lineup],
  )
  const derivedSubstitutes = useMemo(
    () => lineup.substitutes ?? lineup.lineup_players?.filter((p) => String(p.status).toLowerCase() === 'substitute') ?? [],
    [lineup],
  )

  const [starterPlayers, setStarterPlayers] = useState<LineupPlayer[]>(derivedStarters)
  const [substitutePlayers, setSubstitutePlayers] = useState<LineupPlayer[]>(derivedSubstitutes)

  // Sync internal drag-and-drop state when backend data changes
  useEffect(() => {
    setStarterPlayers(derivedStarters)
    setSubstitutePlayers(derivedSubstitutes)
  }, [derivedStarters, derivedSubstitutes])

  const [draggedPlayer, setDraggedPlayer] = useState<{ id: string; source: 'starter' | 'substitute' } | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const statusConfig = LINEUP_STATUS_CONFIG[String(lineup.status).toLowerCase()] || LINEUP_STATUS_CONFIG.draft
  const playerId = (player: LineupPlayer) => player.id || player.player_id || player.playerId
  const movePlayer = (target: 'starter' | 'substitute', targetId?: string) => {
    if (!draggedPlayer || !editable) return
    const sourcePlayers = draggedPlayer.source === 'starter' ? starterPlayers : substitutePlayers
    const sourcePlayer = sourcePlayers.find(player => playerId(player) === draggedPlayer.id)
    if (!sourcePlayer) return
    const nextSource = sourcePlayers.filter(player => playerId(player) !== draggedPlayer.id)
    const targetPlayers = (target === 'starter' ? starterPlayers : substitutePlayers).filter(player => playerId(player) !== draggedPlayer.id)
    const insertionIndex = targetId ? targetPlayers.findIndex(player => playerId(player) === targetId) : targetPlayers.length
    const nextTarget = [...targetPlayers]
    nextTarget.splice(Math.max(0, insertionIndex), 0, sourcePlayer)
    if (draggedPlayer.source === 'starter') setStarterPlayers(nextSource)
    else setSubstitutePlayers(nextSource)
    if (target === 'starter') setStarterPlayers(nextTarget)
    else setSubstitutePlayers(nextTarget)
    setDraggedPlayer(null)
  }
  const save = async () => {
    if (!onSave) return
    setIsSaving(true)
    try { await onSave(lineup.club, lineup.formation || '4-4-2', starterPlayers, substitutePlayers) }
    finally { setIsSaving(false) }
  }

  return (
      <MatchLineupGrid
      formation={lineup.formation}
      starters={starterPlayers}
      substitutes={substitutePlayers}
      editable={editable}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-sm">
          <h3 className="text-lg font-semibold text-on-surface">
            {isHome ? match.home_club_name : match.away_club_name}
          </h3>
          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
        </div>
        <div className="flex items-center gap-sm">
          {lineup.formation && (
            <span className="text-sm text-on-surface-variant">Formação: {lineup.formation}</span>
          )}

          {onConfirm && String(lineup.status).toLowerCase() === 'submitted' && (
            <>
              <Button variant="primary" size="sm" onClick={() => setShowConfirm(true)} disabled={onConfirmPending}>
                {onConfirmPending ? <Loader2 className="mr-xs h-4 w-4 animate-spin" /> : <Check className="mr-xs h-4 w-4" />}
                Aceitar
              </Button>

              {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-surface-container/70 backdrop-blur-[1px]" onClick={() => setShowConfirm(false)} />
                  <Card padding="lg" className="relative z-10 max-w-md mx-4">
                    <h3 className="text-lg font-semibold">Confirmar aceitação</h3>
                    <p className="text-sm text-on-surface-variant mt-sm">Tem a certeza que deseja aceitar a escalação do clube <strong>{isHome ? match.home_club_name : match.away_club_name}</strong>? Esta ação irá confirmar a escalação.</p>
                    <div className="mt-md flex justify-end gap-sm">
                      <Button variant="secondary" size="sm" onClick={() => setShowConfirm(false)}>Cancelar</Button>
                      <Button variant="primary" size="sm" onClick={() => { setShowConfirm(false); onConfirm(lineup.club); }} disabled={onConfirmPending}>
                        {onConfirmPending ? <Loader2 className="mr-xs h-4 w-4 animate-spin" /> : <Check className="mr-xs h-4 w-4" />}
                        Confirmar
                      </Button>
                    </div>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Formation Field */}
      {starterPlayers.length > 0 && (
        <FormationField starters={starterPlayers} />
      )}

      {/* Starters List */}
      <div className="space-y-sm">
        <h4 className="flex items-center gap-xs text-sm font-semibold text-on-surface-variant">
          <Shield className="h-4 w-4" />
          Titulares ({starterPlayers.length})
        </h4>
        <div className="grid gap-sm sm:grid-cols-2">
            {starterPlayers.map((player) => (
            <PlayerCard key={playerId(player)} player={player} isStarter editable={editable} onDragStart={() => setDraggedPlayer({ id: playerId(player), source: 'starter' })} onDrop={() => movePlayer('starter', playerId(player))} />
          ))}
        </div>
      </div>

      {/* Substitutes List */}
          {substitutePlayers.length > 0 && (
        <div className="space-y-sm">
          <h4 className="flex items-center gap-xs text-sm font-semibold text-on-surface-variant">
            <Users className="h-4 w-4" />
            Suplentes ({substitutePlayers.length})
          </h4>
            <div className="grid gap-sm sm:grid-cols-2" onDragOver={(event) => editable && event.preventDefault()} onDrop={() => movePlayer('substitute')}>
            {substitutePlayers.map((player) => (
              <PlayerCard key={playerId(player)} player={player} isStarter={false} editable={editable} onDragStart={() => setDraggedPlayer({ id: playerId(player), source: 'substitute' })} onDrop={() => movePlayer('substitute', playerId(player))} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {editable && onSave && (
        <div className="flex justify-end">
          <Button type="button" variant="primary" size="sm" onClick={() => void save()} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-xs h-4 w-4 animate-spin" /> : <Check className="mr-xs h-4 w-4" />}
            Guardar escalação
          </Button>
        </div>
      )}

      {starterPlayers.length === 0 && substitutePlayers.length === 0 && (
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
    </MatchLineupGrid>
  )
}

// ─── MatchLineupPage ──────────────────────────────────────────────────────────

export function MatchLineupPage() {
  const { compId, matchId } = useParams<{ compId: string; matchId: string }>()
  const competitionId = compId ?? ''
  const matchIdValue = matchId ?? ''
  const { isAdmin } = useCompetitionAccess()
  const location = useLocation()
  const isDashboard = location.pathname.startsWith('/dashboard')

  // Only allow editing when on dashboard routes (club/org admin flows happen in dashboard)
  const allowEditing = isAdmin && isDashboard

  const { isLoading: loadingComp } = useCompetition(competitionId)
  const { data: matches = [], isLoading: loadingMatches } = useCompetitionMatches(competitionId)
  const { data: lineups = [], isLoading: loadingLineups } = useLineups(matchIdValue)

  const confirmLineup = useConfirmLineup(matchIdValue)
  const lockLineup = useLockLineup(matchIdValue)

  // Find the specific match
  const match = (matches as Match[]).find((m) => m.id === matchIdValue)

    // Find home and away lineups — only show submissions that were approved by the organization
    const VISIBLE_STATUSES = new Set(['confirmed', 'locked'])
  const homeLineup = (lineups as LineupSubmission[]).find((l) => l.club === match?.home_club && VISIBLE_STATUSES.has(String(l.status).toLowerCase()))
    const awayLineup = (lineups as LineupSubmission[]).find((l) => l.club === match?.away_club && VISIBLE_STATUSES.has(String(l.status).toLowerCase()))

    // Also detect submitted-but-not-confirmed submissions so public page can show an informative message
    const homeLineupSubmitted = (lineups as LineupSubmission[]).find((l) => l.club === match?.home_club && String(l.status).toLowerCase() === 'submitted')
    const awayLineupSubmitted = (lineups as LineupSubmission[]).find((l) => l.club === match?.away_club && String(l.status).toLowerCase() === 'submitted')

  const sidebarLinks = getCompetitionSidebarLinks(competitionId)
  const saveLineup = async (teamId: string, formation: string, starters: LineupPlayer[], substitutes: LineupPlayer[]) => {
    const players = [...starters.map(player => ({ ...player, status: 'starter' as const })), ...substitutes.map(player => ({ ...player, status: 'substitute' as const }))].map(player => ({
      player_id: player.playerId || player.player_id || player.player?.id || player.id,
      status: player.status,
      position: player.positionSpecific || player.position,
      shirt_number: player.playerNumber || player.shirt_number || 0,
      is_captain: player.is_captain ?? false,
      is_goalkeeper: player.position === 'GK' || player.is_goalkeeper,
      formation_position: player.formation_position,
    }))
    await matchApi.submitLineup(matchIdValue, teamId, { formation, players })
  }

  if (loadingComp || loadingMatches) {
    const LoadingComponent = () => (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
    if (isDashboard) {
      return (
        <DashboardLayout
          title="Escalações"
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
        <Link to={isDashboard ? competitionRoutes.adminMatchCenter(competitionId, matchIdValue) : competitionRoutes.matchCenter(competitionId, matchIdValue)}>
          <Button variant="secondary" size="sm">
            Voltar ao jogo
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
      {/* Header */}
 

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
              {homeLineup && ((homeLineup.starters?.length ?? 0) > 0 || (homeLineup.substitutes?.length ?? 0) > 0 || ((homeLineup as any).lineup_players?.length ?? 0) > 0) ? (
                <LineupSection lineup={homeLineup} isHome match={match} editable={allowEditing && match.status !== 'live' && match.status !== 'finished'} onSave={saveLineup} onConfirm={(clubId) => confirmLineup.mutate(clubId)} onConfirmPending={confirmLineup.isPending} />
              ) : homeLineupSubmitted && !allowEditing ? (
                <Card variant="flat" padding="lg">
                  <div className="flex flex-col items-center gap-sm py-lg text-center">
                    <Users className="h-10 w-10 text-on-surface-variant/30" />
                    <p className="font-medium text-on-surface-variant">Escalação submetida</p>
                    <p className="text-sm text-on-surface-variant/70">A escalação foi submetida pelo clube e aguarda aprovação da Organização.</p>
                  </div>
                </Card>
              ) : (
                <LineupSection
                  lineup={{
                    id: '',
                    match: match.id,
                    club: match.home_club,
                    formation: '4-3-3',
                    status: 'draft',
                    submitted_at: '',
                    starters: [],
                    substitutes: [],
                    lineup_players: [],
                  } as unknown as LineupSubmission}
                  isHome
                  match={match}
              editable={allowEditing && match.status !== 'live' && match.status !== 'finished'}
                  onSave={saveLineup}
                  onConfirm={(clubId) => confirmLineup.mutate(clubId)}
                  onConfirmPending={confirmLineup.isPending}
                />
              )}
            </Card>

            {/* Away Team Lineup */}
            <Card variant="flat" padding="lg">
              {awayLineup && ((awayLineup.starters?.length ?? 0) > 0 || (awayLineup.substitutes?.length ?? 0) > 0 || ((awayLineup as any).lineup_players?.length ?? 0) > 0) ? (
                <LineupSection lineup={awayLineup} isHome={false} match={match} editable={allowEditing && match.status !== 'live' && match.status !== 'finished'} onSave={saveLineup} onConfirm={(clubId) => confirmLineup.mutate(clubId)} onConfirmPending={confirmLineup.isPending} />
              ) : awayLineupSubmitted && !allowEditing ? (
                <Card variant="flat" padding="lg">
                  <div className="flex flex-col items-center gap-sm py-lg text-center">
                    <Users className="h-10 w-10 text-on-surface-variant/30" />
                    <p className="font-medium text-on-surface-variant">Escalação submetida</p>
                    <p className="text-sm text-on-surface-variant/70">A escalação foi submetida pelo clube e aguarda aprovação da Organização.</p>
                  </div>
                </Card>
              ) : (
                <LineupSection
                  lineup={{
                    id: '',
                    match: match.id,
                    club: match.away_club,
                    formation: '4-3-3',
                    status: 'draft',
                    submitted_at: '',
                    starters: [],
                    substitutes: [],
                    lineup_players: [],
                  } as unknown as LineupSubmission}
                  isHome={false}
                  match={match}
                  editable={allowEditing && match.status !== 'live' && match.status !== 'finished'}
                  onSave={saveLineup}
                  onConfirm={(clubId) => confirmLineup.mutate(clubId)}
                  onConfirmPending={confirmLineup.isPending}
                />
              )}
            </Card>

            {/* Admin Actions */}
            {isAdmin && lineups.length > 0 && (
              <div className="flex justify-center gap-md">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    // Confirmar cada lineup individualmente com o respectivo club_id
                    const lineupList = lineups as LineupSubmission[]
                    lineupList.forEach((l) => {
                      if (l.club) confirmLineup.mutate(l.club)
                    })
                  }}
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
    </>
  )

  if (isDashboard) {
    return (
      <DashboardLayout
        title="Escalações"
        subtitle={`${match.home_club_name} vs ${match.away_club_name}`}
        dashboardType="competition"
        sidebarLinks={sidebarLinks}
      >
        {pageContent}
      </DashboardLayout>
    )
  }

  return <div className="min-h-screen bg-background">{pageContent}</div>
}
