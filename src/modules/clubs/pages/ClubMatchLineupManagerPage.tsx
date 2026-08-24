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
import { getClubSidebarLinks } from '@/modules/clubs/constants/navigation'
import { useClubMe, useClubMeMatches, useClubSquad } from '@/modules/clubs/hooks/useClubs'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { matchApi } from '@/modules/competitions/services/match.api'
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

// ─── Formation Field Display ─────────────────────────────────────────────────

const FORMATION_SCHEMAS: Record<string, number[]> = {
  '4-4-2': [4, 4, 2],
  '4-3-3': [4, 3, 3],
  '4-2-3-1': [4, 2, 3, 1],
  '3-5-2': [3, 5, 2],
  '5-3-2': [5, 3, 2],
  '3-4-3': [3, 4, 3],
}

function FormationField({ starters, formation = '4-3-3' }: { starters: CallupPlayer[]; formation?: string }) {
  const fieldRows = useMemo(() => {
    const gk = starters.find((p) => p.is_goalkeeper || (p.positionSpecific || p.position || '').toUpperCase().includes('GK'))
    const fieldPlayers = starters.filter((p) => p !== gk)

    const schema = FORMATION_SCHEMAS[formation] || [4, 3, 3]
    const rows: CallupPlayer[][] = []

    let currentIdx = 0
    schema.forEach((count) => {
      rows.push(fieldPlayers.slice(currentIdx, currentIdx + count))
      currentIdx += count
    })

    // Catch any remaining starters if array exceeds schema
    if (currentIdx < fieldPlayers.length) {
      rows[rows.length - 1] = [...(rows[rows.length - 1] || []), ...fieldPlayers.slice(currentIdx)]
    }

    return { gk, rows }
  }, [starters, formation])

  return (
    <div className="relative mx-auto max-w-md my-md">
      <div className="aspect-[3/4] rounded-2xl bg-gradient-to-b from-[#123b38] via-[#0f2f2c] to-[#092422] p-md shadow-[0_20px_45px_-24px_rgba(15,118,110,0.7)]">
        <div className="relative h-full rounded-xl border border-white/25">
          <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/25" />
          <div className="absolute left-0 right-0 top-1/2 h-px bg-white/20" />
          <div className="absolute left-1/2 top-0 h-12 w-28 -translate-x-1/2 border-b border-l border-r border-white/20" />
          <div className="absolute bottom-0 left-1/2 h-12 w-28 -translate-x-1/2 border-t border-l border-r border-white/20" />
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-between py-md">
          {/* Goalkeeper */}
          <div className="flex justify-center">
            {fieldRows.gk ? (
              <PlayerBadgeOnField player={fieldRows.gk} />
            ) : (
              <div className="h-9 w-9 rounded-full border-2 border-dashed border-primary/30 flex items-center justify-center text-[10px] text-on-surface-variant">
                GK
              </div>
            )}
          </div>

          {/* Formation Lines (Defenders -> Midfielders -> Forwards) */}
          {fieldRows.rows.map((rowPlayers, rowIndex) => (
            <div key={rowIndex} className="flex w-full justify-around px-md">
              {rowPlayers.map((player) => (
                <PlayerBadgeOnField key={player.playerId || player.id} player={player} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PlayerBadgeOnField({ player }: { player: CallupPlayer }) {
  return (
    <div className="relative flex flex-col items-center">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold shadow-lg border-2 ${
          player.is_goalkeeper ? 'bg-amber-100 text-amber-700 border-amber-300' : 'border-[#f4c430] bg-[#f4c430] text-[#093c6e] shadow-[#f4c430]/30'
        }`}
      >
        {player.playerNumber || player.shirt_number || '#'}
      </div>
      {player.is_captain && <Crown className="absolute -right-1 -top-1 h-4 w-4 text-amber-300 drop-shadow-[0_0_5px_rgba(252,211,77,0.9)]" />}
      <span className="mt-1 max-w-[70px] truncate text-center text-[10px] font-bold text-white/85">
        {player.playerName || player.player?.full_name?.split(' ').pop()}
      </span>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ClubMatchLineupManagerPage() {
  const { matchId } = useParams<{ matchId: string }>()
  const queryClient = useQueryClient()

  const { data: club, isLoading: clubLoading } = useClubMe()
  const sidebarLinks = getClubSidebarLinks()

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
      let pos: 'GK' | 'DF' | 'MF' | 'FW' = 'MF'
      const posUpper = (member.position || '').toUpperCase()
      if (posUpper.includes('GK') || posUpper.includes('GR')) pos = 'GK'
      else if (['CB', 'LB', 'RB', 'DF'].some((k) => posUpper.includes(k))) pos = 'DF'
      else if (['CM', 'CDM', 'CAM', 'MF'].some((k) => posUpper.includes(k))) pos = 'MF'
      else if (['ST', 'CF', 'LW', 'RW', 'FW'].some((k) => posUpper.includes(k))) pos = 'FW'

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
        is_goalkeeper: pos === 'GK',
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
      return {
        ...p,
        isCalledUp: custom.isCalledUp,
        isStarter: custom.isStarter,
        position: (custom.position as any) || p.position,
        playerNumber: custom.number,
        is_captain: custom.isCaptain,
      }
    })
  }, [initializedPlayers, callupState])

  const starters = useMemo(() => playersList.filter((p) => p.isCalledUp && p.isStarter), [playersList])
  const substitutes = useMemo(() => playersList.filter((p) => p.isCalledUp && !p.isStarter), [playersList])
  const uncalled = useMemo(() => playersList.filter((p) => !p.isCalledUp), [playersList])
  const hasGoalkeeper = starters.some((player) => player.position === 'GK' || player.is_goalkeeper)
  const hasCaptain = starters.some((player) => player.is_captain)
  const lineupChecks = [
    { label: `${starters.length}/${REQUIRED_STARTERS} titulares`, complete: starters.length === REQUIRED_STARTERS },
    { label: hasGoalkeeper ? 'Guarda-redes definido' : 'Guarda-redes em falta', complete: hasGoalkeeper },
    { label: `${substitutes.length}/${MAX_SUBSTITUTES} suplentes`, complete: substitutes.length <= MAX_SUBSTITUTES },
    { label: hasCaptain ? 'Capitão definido' : 'Capitão em falta', complete: hasCaptain },
  ]
  const rosterIsValid = lineupChecks.every((check) => check.complete)

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

      const hasGK = starters.some((p) => p.position === 'GK' || p.is_goalkeeper)
      if (!hasGK) {
        throw new Error('O onze inicial deve incluir um Guarda-redes (GK).')
      }

      if (!hasCaptain) {
        throw new Error('Defina um capitão no onze inicial antes de submeter a escalação.')
      }

      const payload = {
        formation,
        players: [
          ...starters.map((p) => ({
            player_id: p.playerId,
            status: 'starter' as const,
            position: p.positionSpecific || p.position,
            shirt_number: p.playerNumber,
            is_captain: p.is_captain,
            is_goalkeeper: p.position === 'GK' || p.is_goalkeeper,
          })),
          ...substitutes.map((p) => ({
            player_id: p.playerId,
            status: 'substitute' as const,
            position: p.positionSpecific || p.position,
            shirt_number: p.playerNumber,
            is_captain: p.is_captain,
            is_goalkeeper: p.position === 'GK' || p.is_goalkeeper,
          })),
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

  const toggleStarter = (pId: string) => {
    setCallupState((prev) => {
      const current = prev[pId]
      const defaultP = initializedPlayers.find((p) => p.playerId === pId)
      const currentStarter = current ? current.isStarter : defaultP?.isStarter ?? false
      return {
        ...prev,
        [pId]: {
          isCalledUp: true,
          isStarter: !currentStarter,
          position: current?.position || defaultP?.position || 'MF',
          number: current?.number || defaultP?.playerNumber || 0,
          isCaptain: current?.isCaptain || false,
        },
      }
    })
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
      <DashboardLayout title="Gestão de Escalação" subtitle="A carregar dados..." dashboardType="club" sidebarLinks={sidebarLinks}>
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  if (!currentMatch) {
    return (
      <DashboardLayout title="Jogo não encontrado" dashboardType="club" sidebarLinks={sidebarLinks}>
        <div className="flex flex-col items-center justify-center py-2xl text-center">
          <AlertCircle className="h-12 w-12 text-error mb-md" />
          <h2 className="text-xl font-bold text-on-surface">Jogo não encontrado ou não pertence a este clube</h2>
          <Button asChild variant="secondary" className="mt-lg">
            <Link to={ROUTES.DASHBOARD_CLUB_COMPETITIONS}>Voltar às Competições</Link>
          </Button>
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
      sidebarLinks={sidebarLinks}
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
                  <option value="4-3-3">4-3-3</option>
                  <option value="4-4-2">4-4-2</option>
                  <option value="3-5-2">3-5-2</option>
                  <option value="4-2-3-1">4-2-3-1</option>
                  <option value="5-3-2">5-3-2</option>
                </select>
              </CardHeader>

              <CardContent className="p-none">
                {/* Validação de Regras */}
                {starters.length !== 11 && (
                  <div className="mb-md flex items-center gap-xs rounded-xl bg-amber-500/10 border border-amber-500/30 p-sm text-xs text-amber-800">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    <span>Selecione exatamente 11 titulares (atualmente: {starters.length}).</span>
                  </div>
                )}

                <FormationField starters={starters} formation={formation} />

                <div className="mt-md space-y-xs text-xs text-on-surface-variant">
                  <div className="flex justify-between border-b border-outline-variant/10 py-1">
                    <span>Titulares Escolhidos:</span>
                    <span className="font-bold text-on-surface">{starters.length} / 11</span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/10 py-1">
                    <span>Guarda-Redes no 11:</span>
                    <span className={`font-bold ${starters.some((p) => p.position === 'GK') ? 'text-emerald-600' : 'text-error'}`}>
                      {starters.some((p) => p.position === 'GK') ? '✅ Sim' : '❌ Não'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Capitão de Equipa:</span>
                    <span className="font-bold text-amber-600">
                      {starters.find((p) => p.is_captain)?.playerName || 'Não definido'}
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
                <Badge variant={starters.length === 11 ? 'success' : 'warning'}>
                  {starters.length === 11 ? 'Completo' : 'Incompleto'}
                </Badge>
              </CardHeader>
              <CardContent className="p-none space-y-xs">
                {starters.length === 0 ? (
                  <p className="py-md text-center text-xs text-on-surface-variant italic">
                    Nenhum titular selecionado. Clique em &quot;+ Titular&quot; nos convocados abaixo.
                  </p>
                ) : (
                  starters.map((p) => (
                    <div key={p.playerId} className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary-container/10 p-sm text-xs">
                      <div className="flex items-center gap-sm">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary font-bold text-on-primary">
                          {p.playerNumber || '#'}
                        </span>
                        <div>
                          <p className="font-bold text-on-surface">{p.playerName}</p>
                          <span className="text-[10px] text-on-surface-variant">
                            {formatPositionLabel(p.positionSpecific || p.position, p.is_goalkeeper)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-xs">
                        <button
                          type="button"
                          onClick={() => setCaptain(p.playerId)}
                          className={`rounded-lg p-1 text-[11px] font-semibold transition-all ${
                            p.is_captain ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-surface-container-high text-on-surface-variant hover:bg-amber-500/20'
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
                  ))
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
                  substitutes.map((p) => (
                    <div key={p.playerId} className="flex items-center justify-between rounded-xl border border-outline-variant/15 bg-surface-container p-sm text-xs">
                      <div className="flex items-center gap-sm">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-container-highest font-semibold text-on-surface">
                          {p.playerNumber || '#'}
                        </span>
                        <div>
                          <p className="font-semibold text-on-surface">{p.playerName}</p>
                          <span className="text-[10px] text-on-surface-variant">
                            {formatPositionLabel(p.positionSpecific || p.position, p.is_goalkeeper)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-xs">
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
                  ))
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
                  uncalled.map((p) => (
                    <div key={p.playerId} className="flex items-center justify-between rounded-xl border border-outline-variant/10 bg-surface-container-low p-sm text-xs">
                      <div className="flex items-center gap-sm">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-container-highest font-medium text-on-surface-variant">
                          {p.playerNumber || '#'}
                        </span>
                        <div>
                          <p className={`font-medium ${p.eligible ? 'text-on-surface' : 'text-on-surface-variant line-through'}`}>
                            {p.playerName}
                          </p>
                          <span className="text-[10px] text-on-surface-variant">
                            {formatPositionLabel(p.positionSpecific || p.position, p.is_goalkeeper)}
                          </span>
                        </div>
                      </div>

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
                  ))
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
