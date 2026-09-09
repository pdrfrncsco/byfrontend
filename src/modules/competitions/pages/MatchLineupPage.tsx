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
import { Badge, Button, Card, EmptyState } from '@/components/ui'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { competitionRoutes } from '../routes'
import { getCompetitionSidebarLinks } from '../constants'
import { useCompetition } from '../hooks/useCompetitions'
import { useCompetitionMatches } from '../hooks/useCompetitionMatches'
import {
  useLineups,
  useConfirmLineup,
  useLockLineup,
} from '../hooks/useLineups'
import { useCompetitionAccess } from '../hooks/useCompetitionAccess'
import { matchApi } from '../services/match.api'
import type { Match, LineupSubmission, LineupPlayer } from '../types'
import { MatchLineupGrid } from '../components'
import {
  SUPPORTED_FORMATIONS,
  validateTacticalFormation,
  categorizePlayerPosition,
  getFormationLayout,
} from '../utils/tactical.utils'

// ─── Status Badge ─────────────────────────────────────────────────────────────

const LINEUP_STATUS_CONFIG: Record<
  string,
  { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'secondary' }
> = {
  pending: { label: 'Pendente', variant: 'secondary' },
  draft: { label: 'Rascunho', variant: 'secondary' },
  submitted: { label: 'Submetida', variant: 'default' },
  confirmed: { label: 'Confirmada', variant: 'success' },
  locked: { label: 'Bloqueada', variant: 'warning' },
}

// ─── Formation Display ────────────────────────────────────────────────────────

interface FormationFieldProps {
  starters: LineupPlayer[]
  formation?: string
  activePlayerId?: string | null
  onPlayerHover?: (playerId: string | null) => void
}

function FormationField({ starters, formation = '4-3-3', activePlayerId, onPlayerHover }: FormationFieldProps) {
  const currentFormation = formation || '4-3-3'
  const validation = useMemo(() => validateTacticalFormation(starters, currentFormation), [starters, currentFormation])

  // Group by position with full categorizer
  const positionGroups = useMemo(() => {
    const groups: Record<'GK' | 'DEF' | 'MID' | 'FWD', LineupPlayer[]> = {
      GK: [],
      DEF: [],
      MID: [],
      FWD: [],
    }

    starters.forEach((player) => {
      if (player.is_goalkeeper || categorizePlayerPosition(player.position) === 'GK') {
        groups.GK.push(player)
      } else {
        const cat = categorizePlayerPosition(player.position)
        groups[cat].push(player)
      }
    })
    return groups
  }, [starters])

  const layout = getFormationLayout(currentFormation)
  let targetDef = 0
  let targetMid = 0
  let targetFwd = 0
  layout.lines.forEach((line) => {
    if (line.role === 'DEF') targetDef += line.count
    else if (line.role === 'MID') targetMid += line.count
    else if (line.role === 'FWD') targetFwd += line.count
  })

  const rowClass = (count: number) =>
    count >= 5 ? 'gap-xs sm:gap-1' : count === 4 ? 'gap-xs sm:gap-sm' : count === 3 ? 'gap-md sm:gap-xl' : 'gap-xl sm:gap-2xl'

  return (
    <div className="relative mx-auto max-w-xl">
      {/* Real-time Validation Banner */}
      {(!validation.isValid || validation.warnings.length > 0) && (
        <div className="mb-sm rounded-xl border border-amber-500/30 bg-amber-500/10 p-sm text-xs space-y-1">
          {validation.errors.map((err, i) => (
            <div key={`err-${i}`} className="flex items-center gap-xs font-semibold text-rose-400">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 text-rose-400" />
              <span>{err}</span>
            </div>
          ))}
          {validation.warnings.map((warn, i) => (
            <div key={`warn-${i}`} className="flex items-center gap-xs text-amber-300">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 text-amber-400" />
              <span>{warn}</span>
            </div>
          ))}
        </div>
      )}

      {/* Field background */}
      <div className="aspect-[3/4] rounded-2xl bg-gradient-to-b from-[#123b38] via-[#0f2f2c] to-[#092422] p-lg shadow-[0_20px_45px_-24px_rgba(15,118,110,0.7)]">
        {/* Field markings */}
        <div className="relative h-full overflow-hidden rounded-xl border border-white/25 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_58%),linear-gradient(90deg,rgba(255,255,255,0.025),transparent_50%,rgba(255,255,255,0.025))]">
          <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-white/20" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25" />
          <div className="pointer-events-none absolute left-1/2 top-0 h-20 w-36 -translate-x-1/2 border-b border-l border-r border-white/20" />
          <div className="pointer-events-none absolute left-1/2 top-0 h-8 w-16 -translate-x-1/2 border-b border-l border-r border-white/15" />
          <div className="pointer-events-none absolute bottom-0 left-1/2 h-20 w-36 -translate-x-1/2 border-l border-r border-t border-white/20" />
          <div className="pointer-events-none absolute bottom-0 left-1/2 h-8 w-16 -translate-x-1/2 border-l border-r border-t border-white/15" />
          {/* Center circle */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40" />
        </div>

        {/* Players on field */}
        <div className="absolute inset-0 flex flex-col items-center justify-between py-lg sm:py-xl">
          {/* Goalkeeper row */}
          <div className="flex justify-center gap-sm">
            {positionGroups.GK.length === 0 ? (
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-rose-400/80 bg-rose-500/20 text-xs font-bold text-rose-300">
                  !
                </div>
                <span className="mt-1 text-[10px] font-semibold text-rose-400">Sem GR</span>
              </div>
            ) : (
              positionGroups.GK.map((player, i) => (
                <PlayerMarker
                  key={player.id || i}
                  player={player}
                  activePlayerId={activePlayerId}
                  onPlayerHover={onPlayerHover}
                  isWarning={i > 0}
                  warningLabel={i > 0 ? 'GR extra' : undefined}
                />
              ))
            )}
          </div>

          {/* Defenders */}
          <div className={`flex w-full flex-wrap justify-center px-md sm:px-lg ${rowClass(positionGroups.DEF.length)}`}>
            {positionGroups.DEF.map((player, i) => (
              <PlayerMarker
                key={player.id || i}
                player={player}
                activePlayerId={activePlayerId}
                onPlayerHover={onPlayerHover}
                isWarning={targetDef > 0 && i >= targetDef}
                warningLabel={targetDef > 0 && i >= targetDef ? 'DEF+' : undefined}
              />
            ))}
          </div>

          {/* Midfielders */}
          <div className={`flex w-full flex-wrap justify-center px-md sm:px-lg ${rowClass(positionGroups.MID.length)}`}>
            {positionGroups.MID.map((player, i) => (
              <PlayerMarker
                key={player.id || i}
                player={player}
                activePlayerId={activePlayerId}
                onPlayerHover={onPlayerHover}
                isWarning={targetMid > 0 && i >= targetMid}
                warningLabel={targetMid > 0 && i >= targetMid ? 'MED+' : undefined}
              />
            ))}
          </div>

          {/* Forwards */}
          <div className={`flex flex-wrap justify-center ${rowClass(positionGroups.FWD.length)}`}>
            {positionGroups.FWD.map((player, i) => (
              <PlayerMarker
                key={player.id || i}
                player={player}
                activePlayerId={activePlayerId}
                onPlayerHover={onPlayerHover}
                isWarning={targetFwd > 0 && i >= targetFwd}
                warningLabel={targetFwd > 0 && i >= targetFwd ? 'AV+' : undefined}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Player Marker ────────────────────────────────────────────────────────────

function PlayerMarker({
  player,
  activePlayerId,
  onPlayerHover,
  isWarning = false,
  warningLabel,
}: {
  player?: LineupPlayer
  activePlayerId?: string | null
  onPlayerHover?: (playerId: string | null) => void
  isWarning?: boolean
  warningLabel?: string
}) {
  if (!player) {
    return <div className="h-10 w-10 rounded-full bg-white/10" />
  }

  const playerId = player.id || player.player_id || player.playerId
  const active = Boolean(playerId && playerId === activePlayerId)

  return (
    <div
      className={`group relative flex cursor-default flex-col items-center transition-transform duration-200 hover:z-10 hover:-translate-y-1 ${
        active ? '-translate-y-1' : ''
      }`}
      onMouseEnter={() => onPlayerHover?.(playerId)}
      onMouseLeave={() => onPlayerHover?.(null)}
    >
      <div
        className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold shadow-lg transition-shadow duration-200 ${
          isWarning
            ? 'border-rose-400 bg-rose-950/80 text-rose-200 ring-2 ring-rose-500/50'
            : player.is_goalkeeper
            ? 'border-amber-300 bg-amber-100 text-amber-700 shadow-amber-300/30'
            : 'border-[#f4c430] bg-[#f4c430] text-[#093c6e] shadow-[#f4c430]/30'
        }`}
      >
        {player.shirt_number}
        {isWarning && warningLabel && (
          <span className="absolute -top-2 -left-2 rounded-full bg-rose-600 px-1 py-0.2 text-[9px] font-bold text-white shadow">
            {warningLabel}
          </span>
        )}
      </div>
      {player.is_captain && (
        <Crown className="absolute -right-1 -top-1 h-4 w-4 text-amber-300 drop-shadow-[0_0_5px_rgba(252,211,77,0.9)]" />
      )}
      <span
        className={`mt-1 max-w-20 truncate rounded px-1 text-center text-xs font-medium transition-colors ${
          active ? 'bg-white/20 text-white' : 'text-white/85'
        }`}
      >
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
  active = false,
  onPlayerHover,
}: {
  player: LineupPlayer
  isStarter: boolean
  editable?: boolean
  onDragStart?: () => void
  onDrop?: () => void
  active?: boolean
  onPlayerHover?: (playerId: string | null) => void
}) {
  const playerId = player.id || player.player_id || player.playerId
  return (
    <div
      draggable={editable}
      onDragStart={onDragStart}
      onDragOver={(event) => editable && event.preventDefault()}
      onDrop={(event) => { event.preventDefault(); onDrop?.() }}
      onMouseEnter={() => onPlayerHover?.(playerId)}
      onMouseLeave={() => onPlayerHover?.(null)}
      className={`flex min-w-0 items-center gap-sm rounded-lg border px-sm py-xs transition-all hover:-translate-y-0.5 hover:shadow-sm ${
        isStarter
          ? active ? 'border-primary bg-primary-container/15 shadow-sm' : 'border-primary/20 bg-transparent'
          : active ? 'border-primary/50 bg-surface-container-low shadow-sm' : 'border-outline-variant/15 bg-transparent'
      }`}
    >
      {/* Shirt number */}
      <div
        className={`flex w-6 flex-shrink-0 items-center justify-center text-xs font-bold tabular-nums ${
          player.is_goalkeeper
            ? 'text-amber-700'
            : 'text-primary'
        }`}
      >
        {player.shirt_number}
      </div>

      {/* Player info */}
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-xs">
          <span className="min-w-0 truncate text-xs font-semibold text-on-surface sm:text-sm">
            {player.player?.full_name || 'Jogador'}
          </span>
          {player.is_captain && <Crown className="h-3 w-3 flex-shrink-0 text-amber-500 drop-shadow-[0_0_4px_rgba(245,158,11,0.8)]" />}
          {player.is_goalkeeper && <Goal className="h-3 w-3 flex-shrink-0 text-amber-600" />}
        </div>
        <span className="block truncate text-[11px] text-on-surface-variant">
          {player.position_display || player.position}
        </span>
      </div>
    </div>
  )
}

function TacticalBoardEmptyVisual() {
  return (
    <div className="relative mb-lg h-28 w-44 overflow-hidden rounded-xl border border-white/25 bg-[linear-gradient(135deg,rgba(14,56,52,0.96),rgba(10,39,36,0.9))] shadow-[0_16px_32px_-20px_rgba(15,118,110,0.75)]" aria-hidden="true">
      <div className="absolute inset-3 rounded-lg border border-white/20" />
      <div className="absolute inset-x-3 top-1/2 h-px bg-white/20" />
      <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />
      <div className="absolute left-1/2 top-3 h-6 w-12 -translate-x-1/2 border-b border-l border-r border-white/15" />
      <div className="absolute bottom-3 left-1/2 h-6 w-12 -translate-x-1/2 border-l border-r border-t border-white/15" />
      <span className="absolute left-8 top-7 h-3 w-3 rounded-full border-2 border-[#0b3d70] bg-[#f4c430] shadow-[0_0_10px_rgba(244,196,48,0.7)]" />
      <span className="absolute right-8 top-10 h-3 w-3 rounded-full border-2 border-[#0b3d70] bg-[#f4c430] shadow-[0_0_10px_rgba(244,196,48,0.7)]" />
      <span className="absolute bottom-8 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-[#0b3d70] bg-[#f4c430] shadow-[0_0_10px_rgba(244,196,48,0.7)]" />
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]" />
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
  const [selectedFormation, setSelectedFormation] = useState<string>(lineup.formation || '4-3-3')

  // Sync internal drag-and-drop state when backend data changes
  useEffect(() => {
    setStarterPlayers(derivedStarters)
    setSubstitutePlayers(derivedSubstitutes)
  }, [derivedStarters, derivedSubstitutes])

  const [draggedPlayer, setDraggedPlayer] = useState<{ id: string; source: 'starter' | 'substitute' } | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null)
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
    try { await onSave(lineup.club, selectedFormation, starterPlayers, substitutePlayers) }
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
          {/*<Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>*/}
        </div>
        <div className="flex items-center gap-sm">
          <div className="flex items-center gap-xs">
            <span className="text-xs text-on-surface-variant font-medium">Formação:</span>
            {editable ? (
              <select
                value={selectedFormation}
                onChange={(e) => {
                  const newF = e.target.value
                  setSelectedFormation(newF)
                  if (onSave) {
                    onSave(lineup.club, newF, starterPlayers, substitutePlayers)
                  }
                }}
                className="rounded-lg border border-outline-variant/30 bg-surface-container px-2 py-1 text-xs font-semibold text-on-surface"
              >
                {SUPPORTED_FORMATIONS.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            ) : (
              <span className="text-xs font-semibold text-primary">{selectedFormation}</span>
            )}
          </div>

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
        <FormationField starters={starterPlayers} formation={selectedFormation} activePlayerId={activePlayerId} onPlayerHover={setActivePlayerId} />
      )}

      {/* Starters List */}
      <div className="space-y-sm">
        <h4 className="flex items-center gap-xs text-sm font-semibold text-on-surface-variant">
          <Shield className="h-4 w-4" />
          Titulares ({starterPlayers.length})
        </h4>
        <div className="grid gap-sm sm:grid-cols-2">
            {starterPlayers.map((player) => (
            <PlayerCard key={playerId(player)} player={player} isStarter active={activePlayerId === playerId(player)} onPlayerHover={setActivePlayerId} editable={editable} onDragStart={() => setDraggedPlayer({ id: playerId(player), source: 'starter' })} onDrop={() => movePlayer('starter', playerId(player))} />
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
              <PlayerCard key={playerId(player)} player={player} isStarter={false} active={activePlayerId === playerId(player)} onPlayerHover={setActivePlayerId} editable={editable} onDragStart={() => setDraggedPlayer({ id: playerId(player), source: 'substitute' })} onDrop={() => movePlayer('substitute', playerId(player))} />
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
        <EmptyState
          visual={<TacticalBoardEmptyVisual />}
          title="Escalação não disponível"
          description="O quadro táctico será preenchido assim que a escalação for disponibilizada."
          className="max-w-none border-dashed border-white/30 bg-[linear-gradient(135deg,rgba(255,255,255,0.52),rgba(219,242,235,0.32))] py-12 shadow-[0_18px_42px_-30px_rgba(15,118,110,0.48)] backdrop-blur-md"
        />
      )}
    </MatchLineupGrid>
  )
}

// ─── MatchLineupPage ──────────────────────────────────────────────────────────

export function MatchLineupPage({ embedded = false }: { embedded?: boolean }) {
  const { compId, matchId } = useParams<{ compId: string; matchId: string }>()
  const competitionId = compId ?? ''
  const matchIdValue = matchId ?? ''
  const { isAdmin, isMatchOperator } = useCompetitionAccess()
  const location = useLocation()
  const isDashboard = location.pathname.startsWith('/dashboard')

  // Only allow editing when on dashboard routes (club/org admin flows happen in dashboard)
  const allowEditing = isMatchOperator && (isDashboard || embedded)

  const { isLoading: loadingComp } = useCompetition(competitionId)
  const { data: matches = [], isLoading: loadingMatches } = useCompetitionMatches(competitionId)
  const { data: lineups = [], isLoading: loadingLineups } = useLineups(matchIdValue)

  const confirmLineup = useConfirmLineup(matchIdValue)
  const lockLineup = useLockLineup(matchIdValue)

  // Find the specific match
  const match = (matches as Match[]).find((m) => m.id === matchIdValue)
  const canReviewLineups = isAdmin && match?.status === 'pre_match'

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
    if (isDashboard && !embedded) {
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
        <Link to={isDashboard ? competitionRoutes.adminMatchDetail(competitionId, matchIdValue) : competitionRoutes.matchDetail(competitionId, matchIdValue)}>
          <Button variant="secondary" size="sm">
            Voltar ao jogo
          </Button>
        </Link>
      </div>
    )
    if (isDashboard && !embedded) {
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
      {/* Main Content */}
      <div className={embedded ? 'py-md' : 'mx-auto max-w-4xl px-lg py-xl'}>
        {match.status === 'archived' && (
          <div className="mb-lg rounded-lg border border-outline-variant/20 bg-surface-container px-md py-sm text-sm text-on-surface-variant">
            Esta partida está arquivada. As escalações são exibidas apenas como histórico.
          </div>
        )}
        {loadingLineups ? (
          <div className="flex items-center justify-center py-xl">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-lg lg:grid-cols-2">
            {/* Home Team Lineup */}
            <Card variant="flat" padding="lg">
              {homeLineup && ((homeLineup.starters?.length ?? 0) > 0 || (homeLineup.substitutes?.length ?? 0) > 0 || ((homeLineup as any).lineup_players?.length ?? 0) > 0) ? (
                <LineupSection lineup={homeLineup} isHome match={match} editable={allowEditing && match.status === 'pre_match'} onSave={saveLineup} onConfirm={canReviewLineups ? (clubId) => confirmLineup.mutate(clubId) : undefined} onConfirmPending={confirmLineup.isPending} />
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
                    status: 'pending',
                    submitted_at: '',
                    starters: [],
                    substitutes: [],
                    lineup_players: [],
                  } as unknown as LineupSubmission}
                  isHome
                  match={match}
              editable={allowEditing && match.status === 'pre_match'}
                  onSave={saveLineup}
                  onConfirm={canReviewLineups ? (clubId) => confirmLineup.mutate(clubId) : undefined}
                  onConfirmPending={confirmLineup.isPending}
                />
              )}
            </Card>

            {/* Away Team Lineup */}
            <Card variant="flat" padding="lg">
              {awayLineup && ((awayLineup.starters?.length ?? 0) > 0 || (awayLineup.substitutes?.length ?? 0) > 0 || ((awayLineup as any).lineup_players?.length ?? 0) > 0) ? (
                <LineupSection lineup={awayLineup} isHome={false} match={match} editable={allowEditing && match.status === 'pre_match'} onSave={saveLineup} onConfirm={canReviewLineups ? (clubId) => confirmLineup.mutate(clubId) : undefined} onConfirmPending={confirmLineup.isPending} />
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
                    status: 'pending',
                    submitted_at: '',
                    starters: [],
                    substitutes: [],
                    lineup_players: [],
                  } as unknown as LineupSubmission}
                  isHome={false}
                  match={match}
                  editable={allowEditing && match.status === 'pre_match'}
                  onSave={saveLineup}
                  onConfirm={canReviewLineups ? (clubId) => confirmLineup.mutate(clubId) : undefined}
                  onConfirmPending={confirmLineup.isPending}
                />
              )}
            </Card>

            {/* Admin Actions */}
            {isAdmin && match.status === 'pre_match' && lineups.length > 0 && (
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
                  onClick={() => lockLineup.mutate(undefined)}
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

  if (isDashboard && !embedded) {
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

  return embedded ? pageContent : <div className="min-h-screen bg-background">{pageContent}</div>
}
