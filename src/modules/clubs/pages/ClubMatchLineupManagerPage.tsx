import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Users,
  Shield,
  Crown,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  UserCheck,
  Send,
  Trophy,
  ArrowDownToLine,
  ArrowUpToLine,
  UserMinus,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { getClubSidebarSections } from '@/modules/clubs/constants/navigation'
import { useClubMe, useClubMeMatches, useClubSquad } from '@/modules/clubs/hooks/useClubs'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { matchApi } from '@/modules/competitions/services/match.api'
import {
  categorizePlayerPosition,
  validateTacticalFormation,
  getFormationLayout,
  isPositionAllowedInSector,
  AVAILABLE_TACTICAL_POSITIONS,
  SUPPORTED_FORMATIONS,
} from '@/modules/competitions/utils/tactical.utils'
import type { LineupPlayer } from '@/modules/competitions/types'
import { toast } from 'sonner'
import { ROUTES } from '@/constants/routes'

// ─── Interfaces ─────────────────────────────────────────────────────────────

interface CallupPlayer extends LineupPlayer {
  isCalledUp: boolean
  isStarter: boolean
}

const REQUIRED_STARTERS = 11
const MAX_SUBSTITUTES = 7

// ─── Position Mapping Helper ──────────────────────────────────────────────────

const POSITION_LABELS: Record<string, string> = {
  // Main Categories
  GK: 'Guarda-Redes',
  GR: 'Guarda-Redes',
  GOLO: 'Guarda-Redes',
  GOALKEEPER: 'Guarda-Redes',
  DF: 'Defesa',
  DEF: 'Defesa',
  MF: 'Médio',
  MID: 'Médio',
  FW: 'Avançado',
  FWD: 'Avançado',
  ATT: 'Avançado',

  // Specific Positions
  CB: 'Defesa Central',
  DC: 'Defesa Central',
  LB: 'Lateral Esquerdo',
  LE: 'Lateral Esquerdo',
  RB: 'Lateral Direito',
  LD: 'Lateral Direito',
  LWB: 'Ala Esquerdo',
  RWB: 'Ala Direito',
  CDM: 'Médio Defensivo',
  MDF: 'Médio Defensivo',
  CM: 'Médio Centro',
  MC: 'Médio Centro',
  CAM: 'Médio Ofensivo',
  MCO: 'Médio Ofensivo',
  MO: 'Médio Ofensivo',
  LM: 'Médio Esquerdo',
  ME: 'Médio Esquerdo',
  RM: 'Médio Direito',
  MD: 'Médio Direito',
  LW: 'Extremo Esquerdo',
  EE: 'Extremo Esquerdo',
  RW: 'Extremo Direito',
  ED: 'Extremo Direito',
  ST: 'Ponta de Lança',
  PL: 'Ponta de Lança',
  CF: 'Avançado Centro',
  AC: 'Avançado Centro',
}

export function formatPositionLabel(pos?: string, isGoalkeeper?: boolean): string {
  if (isGoalkeeper) return 'Guarda-Redes'
  if (!pos) return 'Jogador'
  const upper = pos.trim().toUpperCase()
  return POSITION_LABELS[upper] || pos
}

// ─── Formation Field Display (Sector-Aware) ──────────────────────────────────

interface FormationFieldProps {
  starters: CallupPlayer[]
  formation?: string
  draggedPlayerId?: string | null
  onPromote?: (playerId: string, targetSector?: 'GK' | 'DEF' | 'MID' | 'FWD') => void
}

function FormationField({
  starters,
  formation = '4-3-3',
  draggedPlayerId,
  onPromote,
}: FormationFieldProps) {
  const layout = getFormationLayout(formation)

  const fieldSlices = useMemo(() => {
    const gks = starters.filter(
      (p) => p.is_goalkeeper || categorizePlayerPosition(p.positionSpecific || p.position) === 'GK'
    )
    const primaryGk = gks[0]
    const extraGks = gks.slice(1)

    const defPool = starters.filter(
      (p) => !p.is_goalkeeper && categorizePlayerPosition(p.positionSpecific || p.position) === 'DEF'
    )
    const midPool = starters.filter(
      (p) => !p.is_goalkeeper && categorizePlayerPosition(p.positionSpecific || p.position) === 'MID'
    )
    const fwdPool = starters.filter(
      (p) => !p.is_goalkeeper && categorizePlayerPosition(p.positionSpecific || p.position) === 'FWD'
    )

    const pools: Record<'DEF' | 'MID' | 'FWD', CallupPlayer[]> = {
      DEF: [...defPool],
      MID: [...midPool],
      FWD: [...fwdPool],
    }

    const lines = layout.lines.map((lineDef, idx) => {
      const role = lineDef.role || 'MID'
      const assigned = pools[role].splice(0, lineDef.count)
      const emptyCount = Math.max(0, lineDef.count - assigned.length)
      return {
        lineIdx: idx,
        role,
        count: lineDef.count,
        assigned,
        emptyCount,
      }
    })

    const overflow = {
      DEF: pools.DEF,
      MID: pools.MID,
      FWD: pools.FWD,
    }

    return { primaryGk, extraGks, lines, overflow }
  }, [starters, layout])

  const handleSectorDrop = (e: React.DragEvent, role: 'GK' | 'DEF' | 'MID' | 'FWD') => {
    e.preventDefault()
    e.stopPropagation()
    const playerId = e.dataTransfer.getData('application/x-bolayetu-substitute') || draggedPlayerId
    if (playerId) onPromote?.(playerId, role)
  }

  const handleGeneralDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const playerId = e.dataTransfer.getData('application/x-bolayetu-substitute') || draggedPlayerId
    if (playerId) onPromote?.(playerId)
  }

  const openSlots = Math.max(0, REQUIRED_STARTERS - starters.length)

  return (
    <div className="relative mx-auto max-w-md my-md">
      <div
        onDragOver={(event) => {
          if (openSlots > 0) event.preventDefault()
        }}
        onDrop={handleGeneralDrop}
        className={`aspect-[3/4] min-h-[480px] rounded-2xl bg-gradient-to-b from-[#123b38] via-[#0f2f2c] to-[#092422] p-md shadow-[0_20px_45px_-24px_rgba(15,118,110,0.7)] transition-all ${
          draggedPlayerId && openSlots > 0 ? 'ring-2 ring-[#f4c430]/70 ring-offset-2 ring-offset-surface' : ''
        }`}
      >
        {/* Tactical Pitch Markings */}
        <div className="relative h-full rounded-xl border border-white/25">
          <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25" />
          <div className="absolute left-0 right-0 top-1/2 h-px bg-white/20" />
          <div className="absolute left-1/2 top-0 h-12 w-28 -translate-x-1/2 border-b border-l border-r border-white/20" />
          <div className="absolute bottom-0 left-1/2 h-12 w-28 -translate-x-1/2 border-t border-l border-r border-white/20" />
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-between py-md px-xs">
          {/* Goalkeeper Line (Top) */}
          <div
            className="flex flex-col items-center justify-center gap-xs w-full"
            onDragOver={(e) => {
              e.preventDefault()
              e.dataTransfer.dropEffect = 'move'
            }}
            onDrop={(e) => handleSectorDrop(e, 'GK')}
          >
            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-300/70">Baliza (1)</span>
            <div className="flex justify-center gap-sm">
              {fieldSlices.primaryGk ? (
                <PlayerBadgeOnField player={fieldSlices.primaryGk} />
              ) : (
                <div
                  className="flex flex-col items-center cursor-pointer group"
                  onClick={() => {}}
                >
                  <div className="h-9 w-9 rounded-full border-2 border-dashed border-amber-400/60 bg-amber-500/10 flex items-center justify-center text-[10px] font-bold text-amber-300 group-hover:border-amber-300 group-hover:bg-amber-400/20 transition-all">
                    GK
                  </div>
                  <span className="mt-1 text-[8px] font-bold text-amber-300/80">Vaga GR</span>
                </div>
              )}
              {fieldSlices.extraGks.map((extraGk) => (
                <div key={extraGk.playerId || extraGk.id} className="relative">
                  <PlayerBadgeOnField player={extraGk} />
                  <span className="absolute -top-1 -left-1 rounded-full bg-rose-600 px-1 text-[8px] font-bold text-white shadow">
                    GR+
                  </span>
                </div>
              ))}
            </div>
            {fieldSlices.extraGks.length > 0 && (
              <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[9px] font-bold text-rose-300 border border-rose-500/30">
                Aviso: {fieldSlices.extraGks.length + 1} guarda-redes no onze
              </span>
            )}
          </div>

          {/* Formation Lines: DEF -> MID -> FWD */}
          {fieldSlices.lines.map((line) => {
            const roleLabel = line.role === 'DEF' ? 'Defesa' : line.role === 'MID' ? 'Meio-Campo' : 'Ataque'
            const roleBadgeClass = line.role === 'DEF' ? 'text-blue-300/70' : line.role === 'MID' ? 'text-emerald-300/70' : 'text-rose-300/70'
            const emptyBorderClass = line.role === 'DEF' ? 'border-blue-400/50 bg-blue-500/10 text-blue-300' : line.role === 'MID' ? 'border-emerald-400/50 bg-emerald-500/10 text-emerald-300' : 'border-rose-400/50 bg-rose-500/10 text-rose-300'

            return (
              <div
                key={line.lineIdx}
                className="flex flex-col items-center w-full px-xs"
                onDragOver={(e) => {
                  e.preventDefault()
                  e.dataTransfer.dropEffect = 'move'
                }}
                onDrop={(e) => handleSectorDrop(e, line.role)}
              >
                <span className={`text-[9px] font-bold uppercase tracking-wider ${roleBadgeClass} mb-0.5`}>
                  {roleLabel} ({line.count})
                </span>
                <div className="flex w-full justify-around items-center px-xs">
                  {/* Render Assigned Starters */}
                  {line.assigned.map((player) => (
                    <PlayerBadgeOnField key={player.playerId || player.id} player={player} />
                  ))}

                  {/* Render Empty Slots for this line */}
                  {Array.from({ length: line.emptyCount }).map((_, slotIdx) => (
                    <div
                      key={`empty-${line.lineIdx}-${slotIdx}`}
                      className="flex flex-col items-center group cursor-pointer"
                    >
                      <div className={`h-9 w-9 rounded-full border-2 border-dashed flex items-center justify-center text-[10px] font-bold transition-all group-hover:scale-105 ${emptyBorderClass}`}>
                        +
                      </div>
                      <span className="mt-1 text-[8px] font-medium text-white/70">
                        Vaga {line.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Overflow players if any sector exceeds formation */}
          {(fieldSlices.overflow.DEF.length > 0 || fieldSlices.overflow.MID.length > 0 || fieldSlices.overflow.FWD.length > 0) && (
            <div className="flex flex-wrap items-center justify-center gap-xs rounded-lg bg-rose-950/80 border border-rose-500/40 px-sm py-xs text-[10px] text-rose-200">
              <span className="font-bold">Excedentes no 11:</span>
              {[...fieldSlices.overflow.DEF, ...fieldSlices.overflow.MID, ...fieldSlices.overflow.FWD].map((p) => (
                <span key={p.playerId} className="rounded bg-rose-600/80 px-1 py-0.5 text-[9px] font-bold text-white">
                  {p.playerName} ({p.positionSpecific || p.position})
                </span>
              ))}
            </div>
          )}

          {openSlots > 0 && (
            <div className="flex justify-center pb-xs">
              <span className="rounded-full border border-dashed border-white/40 bg-white/10 px-sm py-xs text-[10px] font-semibold text-white/85">
                Arraste um suplente para o setor desejado ({openSlots} vagas)
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PlayerBadgeOnField({ player }: { player: CallupPlayer }) {
  const isGk = player.is_goalkeeper || categorizePlayerPosition(player.positionSpecific || player.position) === 'GK'
  const sector = isGk ? 'GK' : categorizePlayerPosition(player.positionSpecific || player.position)

  const sectorStyles = {
    GK: 'border-amber-300 bg-amber-100 text-amber-900 shadow-amber-300/30',
    DEF: 'border-blue-400 bg-blue-100 text-blue-950 shadow-blue-400/30',
    MID: 'border-emerald-400 bg-emerald-100 text-emerald-950 shadow-emerald-400/30',
    FWD: 'border-rose-400 bg-rose-100 text-rose-950 shadow-rose-400/30',
  }

  const badgeStyle = sectorStyles[sector] || sectorStyles.MID

  return (
    <div className="relative flex flex-col items-center group">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold shadow-lg border-2 transition-transform group-hover:scale-105 ${badgeStyle}`}
      >
        {player.playerNumber || player.shirt_number || '#'}
      </div>
      {player.is_captain && (
        <Crown className="absolute -right-1 -top-1 h-4 w-4 text-amber-400 drop-shadow-[0_0_5px_rgba(252,211,77,0.9)]" />
      )}
      <span className="mt-0.5 max-w-[65px] truncate text-center text-[10px] font-bold text-white/90">
        {player.playerName || player.player?.full_name?.split(' ').pop()}
      </span>
      <span className="text-[8px] font-semibold text-white/70 uppercase">
        {(player.positionSpecific || player.position || sector).toUpperCase()}
      </span>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ClubMatchLineupManagerPage() {
  const { matchId } = useParams<{ matchId: string }>()
  const queryClient = useQueryClient()

  const { data: club, isLoading: clubLoading } = useClubMe()
  const sidebarSections = useMemo(() => getClubSidebarSections(), [])

  // Fetch matches for current club
  const { data: matches = [], isLoading: matchesLoading } = useClubMeMatches()
  const currentMatch = matches.find((m) => m.id === matchId)

  // Fetch Squad for Club
  const { data: clubSquad = [], isLoading: squadLoading } = useClubSquad(club?.slug)

  // Fetch existing lineup submission for this match & club
  const { data: existingLineup, isLoading: lineupLoading } = useQuery({
    queryKey: ['lineups', matchId, club?.id],
    queryFn: () => (matchId && club?.id ? matchApi.getLineup(matchId, club.id) : Promise.resolve(null)),
    enabled: Boolean(matchId && club?.id),
  })

  // State management
  const [formation, setFormation] = useState<string>('4-3-3')
  const [callupState, setCallupState] = useState<Record<string, { isCalledUp: boolean; isStarter: boolean; position: string; number: number; isCaptain: boolean }>>({})
  const [draggedSubstituteId, setDraggedSubstituteId] = useState<string | null>(null)

  // Initialize draft from existing submission or club squad
  const initializedPlayers = useMemo(() => {
    if (!clubSquad || clubSquad.length === 0) return []

    const startersMap = new Map((existingLineup?.startingXI ?? []).map((p) => [p.playerId || p.player_id, p]))
    const subsMap = new Map((existingLineup?.substitutes ?? []).map((p) => [p.playerId || p.player_id, p]))

    return clubSquad.map((member: any) => {
      // member.id = ClubMember UUID (used as UI key)
      // member.player_id = Player UUID (must be sent to lineup API)
      const memberId = member.id
      const playerId = member.player_id || member.id  // fallback for legacy records
      const existingStarter = startersMap.get(playerId) || startersMap.get(memberId)
      const existingSub = subsMap.get(playerId) || subsMap.get(memberId)

      const isStarter = Boolean(existingStarter)
      const isCalledUp = isStarter || Boolean(existingSub)

      // Map position
      const posCat = categorizePlayerPosition(member.position)
      const isGK = posCat === 'GK' || Boolean(existingStarter?.is_goalkeeper) || Boolean(existingSub?.is_goalkeeper)
      const pos = isGK ? 'GK' : posCat

      return {
        id: memberId,          // ClubMember UUID — usado como chave de UI
        playerId: playerId,    // Player UUID — enviado para a API de lineup
        playerName: member.full_name || member.display_name || 'Jogador',
        playerNumber: existingStarter?.shirt_number || existingSub?.shirt_number || member.jersey_number || member.shirt_number || 0,
        position: pos,
        positionSpecific: member.position,
        eligible: !member.is_suspended,
        eligibilityWarning: member.is_suspended ? 'Jogador suspenso' : undefined,
        avatarUrl: member.avatar_url || member.avatar,
        is_goalkeeper: isGK,
        is_captain: existingStarter?.is_captain || existingSub?.is_captain || false,
        isCalledUp,
        isStarter,
      } as CallupPlayer
    })
  }, [clubSquad, existingLineup])

  // Local draft controls
  const playersList = useMemo(() => {
    return initializedPlayers.map((p) => {
      const custom = callupState[p.playerId]
      if (!custom) return p
      const posCode = custom.position || p.positionSpecific || p.position
      const isGK = posCode === 'GK' || categorizePlayerPosition(posCode) === 'GK'
      return {
        ...p,
        isCalledUp: custom.isCalledUp,
        isStarter: custom.isStarter,
        position: (posCode as any),
        positionSpecific: posCode,
        playerNumber: custom.number,
        is_captain: custom.isCaptain,
        is_goalkeeper: isGK,
      }
    })
  }, [initializedPlayers, callupState])

  const starters = useMemo(() => playersList.filter((p) => p.isCalledUp && p.isStarter), [playersList])
  const substitutes = useMemo(() => playersList.filter((p) => p.isCalledUp && !p.isStarter), [playersList])
  const uncalled = useMemo(() => playersList.filter((p) => !p.isCalledUp), [playersList])
  const gkCount = starters.filter(
    (player) => player.position === 'GK' || player.is_goalkeeper || categorizePlayerPosition(player.positionSpecific || player.position) === 'GK'
  ).length
  const hasCaptain = starters.some((player) => player.is_captain)

  const tacticalValidation = useMemo(
    () => validateTacticalFormation(starters, formation),
    [starters, formation]
  )

  const lineupChecks = [
    { label: `${starters.length}/${REQUIRED_STARTERS} titulares`, complete: starters.length === REQUIRED_STARTERS },
    {
      label:
        tacticalValidation.gkCount === 1
          ? '1 Guarda-redes'
          : tacticalValidation.gkCount === 0
          ? 'Guarda-redes em falta'
          : `${tacticalValidation.gkCount} guarda-redes (máx. 1)`,
      complete: tacticalValidation.gkCount === 1,
    },
    {
      label: `Defesas: ${tacticalValidation.defCount}/${tacticalValidation.targetDef}`,
      complete: tacticalValidation.defCount === tacticalValidation.targetDef,
    },
    {
      label: `Médios: ${tacticalValidation.midCount}/${tacticalValidation.targetMid}`,
      complete:
        tacticalValidation.midCount === tacticalValidation.targetMid &&
        Math.max(0, tacticalValidation.targetMid - tacticalValidation.midCount) +
          Math.max(0, tacticalValidation.targetFwd - tacticalValidation.fwdCount) ===
          tacticalValidation.flexCount,
    },
    {
      label: `Avançados: ${tacticalValidation.fwdCount}/${tacticalValidation.targetFwd}`,
      complete: tacticalValidation.fwdCount === tacticalValidation.targetFwd,
    },
    { label: `${substitutes.length}/${MAX_SUBSTITUTES} suplentes`, complete: substitutes.length <= MAX_SUBSTITUTES },
    { label: hasCaptain ? 'Capitão definido' : 'Capitão em falta', complete: hasCaptain },
  ]
  const rosterIsValid = tacticalValidation.isValid && hasCaptain && substitutes.length <= MAX_SUBSTITUTES

  // Submit Mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!matchId || !club?.id) throw new Error('Dados incompletos')

      if (starters.length !== REQUIRED_STARTERS) {
        throw new Error(`O onze inicial deve conter exatamente ${REQUIRED_STARTERS} titulares (atual: ${starters.length}).`)
      }

      if (substitutes.length > MAX_SUBSTITUTES) {
        throw new Error(`São permitidos no máximo ${MAX_SUBSTITUTES} suplentes no banco de reservas (atual: ${substitutes.length}).`)
      }

      const tacticalCheck = validateTacticalFormation(starters, formation)
      if (!tacticalCheck.isValid) {
        throw new Error(tacticalCheck.errors[0] || 'A distribuição dos titulares não é compatível com a formação.')
      }

      if (!hasCaptain) {
        throw new Error('Defina um capitão no onze inicial antes de submeter a escalação.')
      }

      const payload = {
        formation,
        players: [
          ...starters.map((p) => {
            const rawPos = p.positionSpecific || p.position
            const isGk = p.position === 'GK' || p.is_goalkeeper || categorizePlayerPosition(rawPos) === 'GK'
            return {
              player_id: p.playerId,
              status: 'starter' as const,
              position: rawPos,
              shirt_number: p.playerNumber,
              is_captain: p.is_captain,
              is_goalkeeper: isGk,
            }
          }),
          ...substitutes.map((p) => {
            const rawPos = p.positionSpecific || p.position
            const isGk = p.position === 'GK' || p.is_goalkeeper || categorizePlayerPosition(rawPos) === 'GK'
            return {
              player_id: p.playerId,
              status: 'substitute' as const,
              position: rawPos,
              shirt_number: p.playerNumber,
              is_captain: p.is_captain,
              is_goalkeeper: isGk,
            }
          }),
        ],
      }

      return matchApi.submitLineup(matchId, club.id, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lineups', matchId] })
      toast.success('Convocatória e Escalação submetidas com sucesso!')
    },
    onError: (err: any) => {
      const serverMessage = err?.response?.data?.error || err?.response?.data?.detail || err?.response?.data?.message || err?.message || 'Erro ao submeter escalação.'
      toast.error(serverMessage)
    },
  })

  // Handlers
  const handlePositionChange = (pId: string, newPosition: string) => {
    setCallupState((prev) => {
      const current = prev[pId]
      const defaultP = initializedPlayers.find((p) => p.playerId === pId)
      return {
        ...prev,
        [pId]: {
          isCalledUp: current ? current.isCalledUp : defaultP?.isCalledUp ?? true,
          isStarter: current ? current.isStarter : defaultP?.isStarter ?? false,
          position: newPosition,
          number: current?.number ?? defaultP?.playerNumber ?? 0,
          isCaptain: current?.isCaptain ?? defaultP?.is_captain ?? false,
        },
      }
    })
    toast.info(`Posição tática de jogo ajustada para ${newPosition}.`)
  }

  const toggleCallup = (pId: string) => {
    setCallupState((prev) => {
      const current = prev[pId]
      const defaultP = initializedPlayers.find((p) => p.playerId === pId)
      const currentCalled = current ? current.isCalledUp : defaultP?.isCalledUp ?? false
      return {
        ...prev,
        [pId]: {
          isCalledUp: !currentCalled,
          isStarter: false,
          position: defaultP?.position || 'MF',
          number: defaultP?.playerNumber || 0,
          isCaptain: false,
        },
      }
    })
  }

  const toggleStarter = (pId: string, targetSector?: 'GK' | 'DEF' | 'MID' | 'FWD') => {
    const player = playersList.find((item) => item.playerId === pId)
    if (!player) return
    const willBeStarter = !player.isStarter

    if (willBeStarter) {
      if (starters.length >= REQUIRED_STARTERS) {
        toast.error(`O onze inicial já tem ${REQUIRED_STARTERS} jogadores.`)
        return
      }

      const playerPos = (player.positionSpecific || player.position || '').trim()
      const isPlayerGk =
        player.is_goalkeeper ||
        player.position === 'GK' ||
        categorizePlayerPosition(playerPos) === 'GK'
      const playerSector = isPlayerGk ? 'GK' : categorizePlayerPosition(playerPos)

      // 1. If dropped directly onto a sector slot on the pitch
      if (targetSector) {
        if (targetSector === 'GK' && !isPlayerGk) {
          toast.error(`Apenas guarda-redes podem ocupar a baliza. Altere a posição de ${player.playerName} para GK se for guarda-redes.`)
          return
        }
        if (isPlayerGk && targetSector !== 'GK') {
          toast.error(`Um guarda-redes não pode ser escalado na linha de ${targetSector}.`)
          return
        }
        if (!isPositionAllowedInSector(playerPos, targetSector)) {
          toast.error(
            `Setor incompatível: ${player.playerName} está como ${formatPositionLabel(playerPos)} (${playerSector}) e não pode ocupar um slot de ${targetSector}. Altere a sua posição tática para ${targetSector} primeiro.`
          )
          return
        }
      }

      // 2. Check sector limits against active formation
      const layout = getFormationLayout(formation)
      let targetDef = 0
      let targetMid = 0
      let targetFwd = 0
      layout.lines.forEach((l) => {
        if (l.role === 'DEF') targetDef += l.count
        else if (l.role === 'MID') targetMid += l.count
        else if (l.role === 'FWD') targetFwd += l.count
      })

      const effectiveSector = targetSector || playerSector

      if (effectiveSector === 'GK') {
        const hasGk = starters.some((p) => p.playerId !== pId && (p.is_goalkeeper || categorizePlayerPosition(p.positionSpecific || p.position) === 'GK'))
        if (hasGk) {
          toast.error('Já existe um guarda-redes no onze titular. Remova o titular antes de adicionar outro.')
          return
        }
      } else if (effectiveSector === 'DEF') {
        const currentDefs = starters.filter((p) => p.playerId !== pId && !p.is_goalkeeper && categorizePlayerPosition(p.positionSpecific || p.position) === 'DEF')
        if (currentDefs.length >= targetDef) {
          toast.error(`A formação ${formation} requer ${targetDef} defesas e a linha defensiva já está preenchida.`)
          return
        }
      } else if (effectiveSector === 'MID') {
        const currentMids = starters.filter((p) => p.playerId !== pId && !p.is_goalkeeper && categorizePlayerPosition(p.positionSpecific || p.position) === 'MID')
        if (currentMids.length >= targetMid) {
          toast.error(`A formação ${formation} requer ${targetMid} médios e o meio-campo já está preenchido.`)
          return
        }
      } else if (effectiveSector === 'FWD') {
        const currentFwds = starters.filter((p) => p.playerId !== pId && !p.is_goalkeeper && categorizePlayerPosition(p.positionSpecific || p.position) === 'FWD')
        if (currentFwds.length >= targetFwd) {
          toast.error(`A formação ${formation} requer ${targetFwd} avançados e o ataque já está preenchido.`)
          return
        }
      }
    }

    setCallupState((prev) => {
      const current = prev[pId]
      return {
        ...prev,
        [pId]: {
          isCalledUp: true,
          isStarter: willBeStarter,
          position: current?.position || player.positionSpecific || player.position,
          number: current?.number || player.playerNumber || 0,
          isCaptain: current?.isCaptain || player.is_captain || false,
        },
      }
    })
  }

  const promoteSubstitute = (pId: string, targetSector?: 'GK' | 'DEF' | 'MID' | 'FWD') => {
    toggleStarter(pId, targetSector)
    setDraggedSubstituteId(null)
  }

  const setCaptain = (pId: string) => {
    setCallupState((prev) => {
      const next = { ...prev }
      // Reset all captains
      Object.keys(next).forEach((k) => {
        next[k] = { ...next[k], isCaptain: k === pId }
      })
      if (!next[pId]) {
        const defaultP = initializedPlayers.find((p) => p.playerId === pId)
        next[pId] = {
          isCalledUp: true,
          isStarter: true,
          position: defaultP?.position || 'MF',
          number: defaultP?.playerNumber || 0,
          isCaptain: true,
        }
      }
      return next
    })
  }

  if (clubLoading || matchesLoading || squadLoading || lineupLoading) {
    return (
      <DashboardLayout title="Gestão de Escalação" subtitle="A carregar dados..." dashboardType="club" sidebarSections={sidebarSections}>
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  if (!currentMatch) {
    return (
      <DashboardLayout
        title="Gestão de Escalações"
        subtitle="Selecione um jogo para convocar atletas, definir o onze titular e submeter a ficha oficial"
        dashboardType="club"
        sidebarSections={sidebarSections}
        headerActions={
          <Button asChild variant="secondary" size="sm">
            <Link to={ROUTES.DASHBOARD_CLUB}>
              <ArrowLeft className="mr-xs h-4 w-4" />
              Voltar ao Painel
            </Link>
          </Button>
        }
      >
        <div className="space-y-lg">
          <Card variant="flat" padding="none" className="border-outline-variant/30 bg-surface shadow-xs">
            <CardHeader className="border-b border-outline-variant/20 pb-md">
              <CardTitle className="flex items-center gap-xs text-sm font-semibold text-on-surface">
                <Trophy className="h-4 w-4 text-primary" />
                Jogos Agendados do Clube
              </CardTitle>
            </CardHeader>
            <CardContent className="p-lg">
              {matches.length === 0 ? (
                <EmptyState
                  icon={Calendar}
                  title="Nenhum jogo agendado"
                  description="Ainda não existem partidas agendadas para este clube no calendário das competições."
                  action={{
                    label: 'Ver Competições',
                    onClick: () => (window.location.href = ROUTES.DASHBOARD_CLUB_COMPETITIONS),
                    variant: 'secondary',
                  }}
                />
              ) : (
                <div className="space-y-sm">
                  {matches.map((m: any) => (
                    <div
                      key={m.id}
                      className="flex flex-col gap-sm rounded-xl border border-outline-variant/25 bg-surface-container/30 p-md transition-colors hover:border-primary/30 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-xs">
                          <Badge variant="outline" className="text-xs">
                            {m.competition_name || m.competition?.name || 'Competição'}
                          </Badge>
                          {m.round_number && (
                            <span className="text-xs text-on-surface-variant font-medium">
                              Jornada {m.round_number}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-bold text-on-surface">
                          {m.home_club_name || m.home_club?.name}{' '}
                          <span className="text-primary font-normal">vs</span>{' '}
                          {m.away_club_name || m.away_club?.name}
                        </p>
                        <p className="flex items-center gap-xs text-xs text-on-surface-variant">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          {m.match_date
                            ? new Date(m.match_date).toLocaleDateString('pt-AO', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Data a definir'}
                          {m.venue && <span>• 📍 {m.venue}</span>}
                        </p>
                      </div>

                      <div>
                        <Button asChild variant="primary" size="sm" className="gap-xs text-xs">
                          <Link to={ROUTES.DASHBOARD_CLUB_MATCH_LINEUP(m.id)}>
                            <Send className="h-3.5 w-3.5" />
                            Gerir Escalação
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  const isHome = currentMatch.home_club === club?.id
  const opponentName = isHome ? currentMatch.away_club_name : currentMatch.home_club_name
  const isLocked =
    (existingLineup as any)?.status === 'locked' ||
    (existingLineup as any)?.status === 'confirmed' ||
    currentMatch.status === 'live' ||
    currentMatch.status === 'finished'
  const canSubmit = rosterIsValid && !isLocked

  return (
    <DashboardLayout
      title={`Convocatória & Escalação • ${club?.name}`}
      subtitle={`Gestão táctica e envio da lista oficial para o jogo contra ${opponentName}`}
      dashboardType="club"
      sidebarSections={sidebarSections}
      headerActions={
        <Button asChild variant="secondary" size="sm">
          <Link to={ROUTES.DASHBOARD_CLUB_COMPETITIONS}>
            <ArrowLeft className="mr-xs h-4 w-4" />
            Voltar aos Jogos
          </Link>
        </Button>
      }
    >
      <TooltipProvider>
      <div className="space-y-xl">
        {/* Banner Informacional da Partida */}
        <section className="rounded-2xl border border-outline-variant/20 bg-surface-container p-lg shadow-[0_18px_40px_-30px_rgba(15,17,23,0.18)]">
          <div className="flex flex-wrap items-center justify-between gap-md">
            <div>
              <span className="inline-flex items-center gap-xs rounded-full bg-primary-container/30 px-md py-0.5 text-xs font-semibold text-primary uppercase tracking-wider">
                <Trophy className="h-3.5 w-3.5" /> Jornada {currentMatch.round_number}
              </span>
              <h1 className="mt-sm text-2xl font-bold text-on-surface">
                {currentMatch.home_club_name} <span className="text-primary font-normal">vs</span> {currentMatch.away_club_name}
              </h1>
              <p className="mt-xs text-xs text-on-surface-variant flex items-center gap-sm">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                {new Date(currentMatch.match_date).toLocaleDateString('pt-AO', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                {currentMatch.venue && <span>• 📍 {currentMatch.venue}</span>}
              </p>
            </div>

              <div className="flex items-center gap-md">
                <div className="text-right">
                  <p className="text-xs text-on-surface-variant">Convocados Totais</p>
                  <p className="text-xl font-bold text-on-surface">{starters.length + substitutes.length} / 18</p>
                </div>
                <Button
                  variant="primary"
                  onClick={() => submitMutation.mutate()}
                  disabled={submitMutation.isPending || !canSubmit}
                  title={
                    isLocked
                      ? 'A escalação está bloqueada e já não pode ser alterada.'
                      : !rosterIsValid
                      ? 'Corrija as regras de convocatória antes de submeter.'
                      : 'Submeter escalação oficial'
                  }
                >
                  {submitMutation.isPending ? (
                    <Loader2 className="mr-xs h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-xs h-4 w-4" />
                  )}
                  {isLocked ? 'Escalação Bloqueada' : 'Submeter Escalação'}
                </Button>
              </div>
            </div>

            {/* Aviso de bloqueio oficial */}
            {((existingLineup as any)?.status === 'locked' || (existingLineup as any)?.status === 'confirmed') && (
              <div className="mt-md flex items-center gap-sm rounded-xl bg-amber-500/10 border border-amber-500/30 p-sm text-xs font-medium text-amber-800">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-amber-600" />
                <span>Esta escalação foi confirmada/bloqueada pela organização da competição e já não permite alterações pelo clube.</span>
              </div>
            )}
          </section>

        <section className={`sticky top-md z-20 flex flex-wrap items-center justify-between gap-md rounded-xl border px-md py-sm backdrop-blur-md ${rosterIsValid ? 'border-emerald-500/25 bg-emerald-500/10' : 'border-amber-500/30 bg-amber-500/10'}`} aria-label="Estado da convocatória">
          <div className="flex flex-wrap items-center gap-sm">
            <span className="text-sm font-semibold text-on-surface">Prontidão da escalação</span>
            {lineupChecks.map((check) => (
              <span key={check.label} className={`inline-flex items-center gap-xs rounded-full px-sm py-1 text-xs font-medium ${check.complete ? 'bg-emerald-500/15 text-emerald-800' : 'bg-amber-500/15 text-amber-800'}`}>
                {check.complete ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                {check.label}
              </span>
            ))}
          </div>
          <span className={`text-xs font-semibold ${rosterIsValid ? 'text-emerald-700' : 'text-amber-800'}`}>
            {rosterIsValid ? 'Escalação pronta para submeter' : 'Corrija os itens assinalados para submeter'}
          </span>
        </section>

        {/* Layout de Gestão Táctica: Campo + Listas */}
        <div className="grid gap-xl lg:grid-cols-12">
          {/* Coluna Esquerda: Campo & Formação (5 cols) */}
          <div className="lg:col-span-5 space-y-lg">
            <Card variant="flat" padding="md">
              <CardHeader className="p-none mb-md flex flex-row items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-xs">
                  <Shield className="h-4 w-4 text-primary" /> Formação Táctica
                </CardTitle>
                <select
                  value={formation}
                  onChange={(e) => setFormation(e.target.value)}
                  className="rounded-lg border border-outline-variant/30 bg-surface-container-high px-sm py-1 text-xs font-semibold text-on-surface"
                >
                  {SUPPORTED_FORMATIONS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </CardHeader>

              <CardContent className="p-none">
                {/* Validação e Alertas Táticos */}
                {tacticalValidation.errors.length > 0 && (
                  <div className="mb-md space-y-1">
                    {tacticalValidation.errors.map((err, i) => (
                      <div key={i} className="flex items-center gap-xs rounded-xl bg-rose-500/10 border border-rose-500/30 p-sm text-xs text-rose-700 font-semibold">
                        <AlertTriangle className="h-4 w-4 flex-shrink-0 text-rose-600" />
                        <span>{err}</span>
                      </div>
                    ))}
                  </div>
                )}

                <FormationField
                  starters={starters}
                  formation={formation}
                  draggedPlayerId={draggedSubstituteId}
                  onPromote={promoteSubstitute}
                />

                <div className="mt-md space-y-xs text-xs text-on-surface-variant">
                  <div className="flex justify-between border-b border-outline-variant/10 py-1">
                    <span>Titulares Escolhidos:</span>
                    <span className={`font-bold ${starters.length === 11 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {starters.length} / 11
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/10 py-1">
                    <span>Guarda-Redes (GK):</span>
                    <span className={`font-bold ${tacticalValidation.gkCount === 1 ? 'text-emerald-600' : 'text-error'}`}>
                      {tacticalValidation.gkCount === 1 ? '✅ 1 (Correto)' : tacticalValidation.gkCount === 0 ? '❌ 0 (Em falta)' : `❌ ${tacticalValidation.gkCount} (Máximo 1)`}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/10 py-1">
                    <span>Defesas (DEF):</span>
                    <span className={`font-bold ${tacticalValidation.defCount === tacticalValidation.targetDef ? 'text-emerald-600' : 'text-error'}`}>
                      {tacticalValidation.defCount === tacticalValidation.targetDef
                        ? `✅ ${tacticalValidation.defCount} / ${tacticalValidation.targetDef} (Correto)`
                        : `❌ ${tacticalValidation.defCount} / ${tacticalValidation.targetDef} (Requer ${tacticalValidation.targetDef})`}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/10 py-1">
                    <span>Médios (MID):</span>
                    <span className={`font-bold ${tacticalValidation.midCount === tacticalValidation.targetMid ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {tacticalValidation.midCount === tacticalValidation.targetMid
                        ? `✅ ${tacticalValidation.midCount} / ${tacticalValidation.targetMid}`
                        : `${tacticalValidation.midCount} / ${tacticalValidation.targetMid}`}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/10 py-1">
                    <span>Avançados (FWD):</span>
                    <span className={`font-bold ${tacticalValidation.fwdCount === tacticalValidation.targetFwd ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {tacticalValidation.fwdCount === tacticalValidation.targetFwd
                        ? `✅ ${tacticalValidation.fwdCount} / ${tacticalValidation.targetFwd}`
                        : `${tacticalValidation.fwdCount} / ${tacticalValidation.targetFwd}`}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Capitão de Equipa:</span>
                    <span className="font-bold text-amber-600">
                      {starters.find((p) => p.is_captain)?.playerName || '❌ Não definido'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna Direita: Gestão do Plantel & Convocatória (7 cols) */}
          <div className="lg:col-span-7 space-y-lg">
            {/* Lista 1: Titulares (Onze Inicial) */}
            <Card variant="flat" padding="md">
              <CardHeader className="p-none mb-md flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-xs text-primary">
                  <UserCheck className="h-4 w-4" /> Onze Inicial ({starters.length}/11)
                </CardTitle>
                <Badge variant={starters.length === 11 && tacticalValidation.isValid ? 'success' : 'warning'}>
                  {starters.length === 11 && tacticalValidation.isValid ? 'Completo & Válido' : 'Incompleto ou Inválido'}
                </Badge>
              </CardHeader>
              <CardContent className="p-none space-y-xs">
                {starters.length === 0 ? (
                  <p className="py-md text-center text-xs text-on-surface-variant italic">
                    Nenhum titular selecionado. Clique em &quot;+ Titular&quot; nos convocados abaixo.
                  </p>
                ) : (
                  starters.map((p) => {
                    const isGk = p.is_goalkeeper || categorizePlayerPosition(p.positionSpecific || p.position) === 'GK'
                    const sec = isGk ? 'GK' : categorizePlayerPosition(p.positionSpecific || p.position)
                    const secBadgeClass =
                      sec === 'GK'
                        ? 'bg-amber-500/15 text-amber-800 border-amber-500/30'
                        : sec === 'DEF'
                        ? 'bg-blue-500/15 text-blue-800 border-blue-500/30'
                        : sec === 'MID'
                        ? 'bg-emerald-500/15 text-emerald-800 border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-800 border-rose-500/30'

                    return (
                      <div key={p.playerId} className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary-container/10 p-sm text-xs">
                        <div className="flex items-center gap-sm">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary font-bold text-on-primary">
                            {p.playerNumber || '#'}
                          </span>
                          <div>
                            <div className="flex items-center gap-xs">
                              <p className="font-bold text-on-surface">{p.playerName}</p>
                              <span className={`rounded px-1.5 py-0.2 text-[9px] font-bold border ${secBadgeClass}`}>
                                {sec}
                              </span>
                            </div>
                            <span className="text-[10px] text-on-surface-variant">
                              {formatPositionLabel(p.positionSpecific || p.position, p.is_goalkeeper)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-xs">
                          {/* Tactical Position Selector */}
                          <select
                            value={(p.positionSpecific || p.position || 'CM').toUpperCase()}
                            onChange={(e) => handlePositionChange(p.playerId, e.target.value)}
                            className="h-7 rounded border border-outline-variant/30 bg-surface-container px-1 text-[10px] font-semibold text-on-surface hover:border-primary/50 transition-colors"
                            title="Alterar posição tática de jogo"
                          >
                            {AVAILABLE_TACTICAL_POSITIONS.map((pos) => (
                              <option key={pos.code} value={pos.code}>
                                {pos.code} ({pos.sector})
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => setCaptain(p.playerId)}
                            className={`rounded-lg p-1.5 text-[11px] font-semibold transition-all ${
                              p.is_captain ? 'bg-amber-100 text-amber-700 border border-amber-300' : 'bg-surface-container-high text-on-surface-variant hover:bg-amber-500/20'
                            }`}
                            title="Definir Capitão"
                          >
                            <Crown className="h-3.5 w-3.5" />
                          </button>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" onClick={() => toggleStarter(p.playerId)} className="inline-flex h-7 w-7 items-center justify-center rounded-md text-amber-700 transition-colors hover:bg-amber-500/15" aria-label="Mover para suplentes">
                                <ArrowDownToLine className="h-3.5 w-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Mover para suplentes</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>

            {/* Lista 2: Suplentes */}
            <Card variant="flat" padding="md" className={substitutes.length > MAX_SUBSTITUTES ? 'border-error/50 bg-error/5' : ''}>
              <CardHeader className="p-none mb-md flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-xs text-on-surface">
                  <Users className="h-4 w-4" /> Suplentes ({substitutes.length}/{MAX_SUBSTITUTES})
                </CardTitle>
                {substitutes.length > MAX_SUBSTITUTES ? (
                  <Badge variant="danger">Excesso de suplentes</Badge>
                ) : (
                  <span className="text-xs text-on-surface-variant">Máx. {MAX_SUBSTITUTES} suplentes</span>
                )}
              </CardHeader>
              {substitutes.length > MAX_SUBSTITUTES && (
                <div className="mb-md flex items-center gap-xs rounded-lg border border-error/30 bg-error/10 px-sm py-xs text-xs font-medium text-error">
                  <AlertTriangle className="h-3.5 w-3.5" /> Remova {substitutes.length - MAX_SUBSTITUTES} suplente(s) antes de submeter.
                </div>
              )}
              <CardContent className="p-none space-y-xs">
                {substitutes.length === 0 ? (
                  <p className="py-md text-center text-xs text-on-surface-variant italic">
                    Nenhum suplente adicionado.
                  </p>
                ) : (
                  substitutes.map((p) => {
                    const isGk = p.is_goalkeeper || categorizePlayerPosition(p.positionSpecific || p.position) === 'GK'
                    const sec = isGk ? 'GK' : categorizePlayerPosition(p.positionSpecific || p.position)
                    const secBadgeClass =
                      sec === 'GK'
                        ? 'bg-amber-500/15 text-amber-800 border-amber-500/30'
                        : sec === 'DEF'
                        ? 'bg-blue-500/15 text-blue-800 border-blue-500/30'
                        : sec === 'MID'
                        ? 'bg-emerald-500/15 text-emerald-800 border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-800 border-rose-500/30'

                    return (
                      <div key={p.playerId} draggable onDragStart={(event) => { event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('application/x-bolayetu-substitute', p.playerId); setDraggedSubstituteId(p.playerId) }} onDragEnd={() => setDraggedSubstituteId(null)} className={`flex cursor-grab items-center justify-between rounded-xl border border-outline-variant/15 bg-surface-container p-sm text-xs transition-opacity active:cursor-grabbing ${draggedSubstituteId === p.playerId ? 'opacity-50' : ''}`}>
                        <div className="flex items-center gap-sm">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-container-highest font-semibold text-on-surface">
                            {p.playerNumber || '#'}
                          </span>
                          <div>
                            <div className="flex items-center gap-xs">
                              <p className="font-semibold text-on-surface">{p.playerName}</p>
                              <span className={`rounded px-1.5 py-0.2 text-[9px] font-bold border ${secBadgeClass}`}>
                                {sec}
                              </span>
                            </div>
                            <span className="text-[10px] text-on-surface-variant">
                              {formatPositionLabel(p.positionSpecific || p.position, p.is_goalkeeper)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-xs">
                          {/* Tactical Position Selector */}
                          <select
                            value={(p.positionSpecific || p.position || 'CM').toUpperCase()}
                            onChange={(e) => handlePositionChange(p.playerId, e.target.value)}
                            className="h-7 rounded border border-outline-variant/30 bg-surface-container-high px-1 text-[10px] font-semibold text-on-surface hover:border-primary/50 transition-colors"
                            title="Alterar posição tática de jogo"
                          >
                            {AVAILABLE_TACTICAL_POSITIONS.map((pos) => (
                              <option key={pos.code} value={pos.code}>
                                {pos.code} ({pos.sector})
                              </option>
                            ))}
                          </select>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" onClick={() => toggleStarter(p.playerId)} className="inline-flex h-7 w-7 items-center justify-center rounded-md text-primary transition-colors hover:bg-primary/10" aria-label="Promover a titular">
                                <ArrowUpToLine className="h-3.5 w-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Promover a titular</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" onClick={() => toggleCallup(p.playerId)} className="inline-flex h-7 w-7 items-center justify-center rounded-md text-error transition-colors hover:bg-error/10" aria-label="Desconvocar jogador">
                                <UserMinus className="h-3.5 w-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Desconvocar jogador</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>

            {/* Lista 3: Plantel Restante (Não Convocados) */}
            <Card variant="flat" padding="md">
              <CardHeader className="p-none mb-md flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-xs text-on-surface-variant">
                  <Users className="h-4 w-4" /> Plantel Disponível ({uncalled.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-none space-y-xs">
                {uncalled.length === 0 ? (
                  <EmptyState
                    icon={CheckCircle2}
                    iconClassName="text-emerald-600"
                    title="Plantel convocado"
                    description="Todos os jogadores disponíveis já fazem parte da convocatória."
                    className="max-w-none border-emerald-500/20 bg-emerald-500/5 py-lg"
                  />
                ) : (
                  uncalled.map((p) => {
                    const isGk = p.is_goalkeeper || categorizePlayerPosition(p.positionSpecific || p.position) === 'GK'
                    const sec = isGk ? 'GK' : categorizePlayerPosition(p.positionSpecific || p.position)
                    const secBadgeClass =
                      sec === 'GK'
                        ? 'bg-amber-500/15 text-amber-800 border-amber-500/30'
                        : sec === 'DEF'
                        ? 'bg-blue-500/15 text-blue-800 border-blue-500/30'
                        : sec === 'MID'
                        ? 'bg-emerald-500/15 text-emerald-800 border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-800 border-rose-500/30'

                    return (
                      <div key={p.playerId} className="flex items-center justify-between rounded-xl border border-outline-variant/10 bg-surface-container-low p-sm text-xs">
                        <div className="flex items-center gap-sm">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-container-highest font-medium text-on-surface-variant">
                            {p.playerNumber || '#'}
                          </span>
                          <div>
                            <div className="flex items-center gap-xs">
                              <p className={`font-medium ${p.eligible ? 'text-on-surface' : 'text-on-surface-variant line-through'}`}>
                                {p.playerName}
                              </p>
                              <span className={`rounded px-1.5 py-0.2 text-[9px] font-bold border ${secBadgeClass}`}>
                                {sec}
                              </span>
                            </div>
                            <span className="text-[10px] text-on-surface-variant">
                              {formatPositionLabel(p.positionSpecific || p.position, p.is_goalkeeper)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-xs">
                          {p.eligible && (
                            <select
                              value={(p.positionSpecific || p.position || 'CM').toUpperCase()}
                              onChange={(e) => handlePositionChange(p.playerId, e.target.value)}
                              className="h-7 rounded border border-outline-variant/30 bg-surface px-1 text-[10px] font-semibold text-on-surface hover:border-primary/50 transition-colors"
                              title="Ajustar posição tática"
                            >
                              {AVAILABLE_TACTICAL_POSITIONS.map((pos) => (
                                <option key={pos.code} value={pos.code}>
                                  {pos.code} ({pos.sector})
                                </option>
                              ))}
                            </select>
                          )}
                          {p.eligible ? (
                            <Button variant="outline" size="sm" onClick={() => toggleCallup(p.playerId)} className="h-7 text-xs">
                              + Convocar
                            </Button>
                          ) : (
                            <Badge variant="danger" className="text-[10px]">
                              {p.eligibilityWarning || 'Não elegível'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      </TooltipProvider>
    </DashboardLayout>
  )
}
