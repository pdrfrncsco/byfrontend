// src/modules/competitions/hooks/useMatchLineup.ts
import { useState, useCallback, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { matchApi } from '../services/match.api'
import { getClubSquad } from '@/modules/clubs/services'
import { MATCH_QUERY_KEYS } from './useMatchCenter'
import type { MatchLineup, LineupPlayer } from '../types'
import { toast } from 'sonner'

// ─── Validation ──────────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

function validateLineup(lineup: Partial<MatchLineup>): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  const starters = lineup.startingXI ?? []
  const substitutes = lineup.substitutes ?? []

  if (starters.length !== 11) {
    errors.push(`O onze inicial deve ter exactamente 11 jogadores (tem ${starters.length}).`)
  }

  const hasGK = starters.some(
    (p) => p.position === 'GK' || p.is_goalkeeper === true
  )
  if (!hasGK) {
    errors.push('O onze inicial deve incluir um guarda-redes.')
  }

  if (substitutes.length > 7) {
    errors.push(`A escalação pode ter no máximo 7 suplentes (tem ${substitutes.length}).`)
  }

  const suspendedPlayers = starters.filter((p) => !p.eligible)
  for (const player of suspendedPlayers) {
    errors.push(
      `${player.playerName || player.player?.full_name || 'Jogador'} não é elegível: ${
        player.eligibilityWarning ?? 'Suspenso ou não inscrito'
      }`
    )
  }

  const suspendedSubs = substitutes.filter((p) => !p.eligible)
  for (const player of suspendedSubs) {
    errors.push(
      `Suplente ${player.playerName || player.player?.full_name || 'Jogador'} não é elegível: ${
        player.eligibilityWarning ?? 'Suspenso ou não inscrito'
      }`
    )
  }

  return { valid: errors.length === 0, errors, warnings }
}

// ─── Interface ──────────────────────────────────────────────────────────────

export interface UseMatchLineupReturn {
  homeLineup: MatchLineup | null
  awayLineup: MatchLineup | null
  homeLineupDraft: Partial<MatchLineup>
  awayLineupDraft: Partial<MatchLineup>
  eligiblePlayers: LineupPlayer[]
  homeSquad: LineupPlayer[]
  awaySquad: LineupPlayer[]
  setLineup: (teamId: string, lineup: Partial<MatchLineup>) => void
  submitLineup: (teamId: string) => Promise<void>
  lockLineup: (teamId: string) => Promise<void>
  validateLineup: (lineup: Partial<MatchLineup>) => ValidationResult
  homeValidation: ValidationResult
  awayValidation: ValidationResult
  isSubmitting: boolean
  isLocking: boolean
  isLoading: boolean
  isSquadLoading: boolean
  error: Error | null
}

// ─── Helper to map squad player to lineup player ─────────────────────────────

function mapSquadPlayerToLineupPlayer(player: any): LineupPlayer {
  // Map position from backend to frontend format
  let position: 'GK' | 'DF' | 'MF' | 'FW' = 'MF'
  const posUpper = (player.position || '').toUpperCase()
  
  if (posUpper.includes('GK') || posUpper.includes('GR') || posUpper === 'GOALKEEPER') {
    position = 'GK'
  } else if (['CB', 'LB', 'RB', 'LWB', 'RWB', 'DF', 'DEF'].some(p => posUpper.includes(p))) {
    position = 'DF'
  } else if (['CM', 'CDM', 'CAM', 'LM', 'RM', 'MF', 'MID'].some(p => posUpper.includes(p))) {
    position = 'MF'
  } else if (['ST', 'CF', 'LW', 'RW', 'FW', 'ATT', 'FWD'].some(p => posUpper.includes(p))) {
    position = 'FW'
  }

  return {
    id: player.id,
    playerId: player.id,
    playerName: player.full_name || player.display_name || '',
    playerNumber: player.jersey_number || player.shirt_number || 0,
    position,
    positionSpecific: player.position,
    eligible: !player.is_suspended && !player.has_pending_transfer,
    eligibilityWarning: player.is_suspended
      ? `Suspenso${player.suspension_ends ? ` até ${new Date(player.suspension_ends).toLocaleDateString('pt-PT')}` : ''}`
      : player.has_pending_transfer
      ? 'Transferência pendente'
      : undefined,
    avatarUrl: player.avatar_url || player.avatar,
    // Legacy fields
    player: {
      id: player.id,
      full_name: player.full_name || player.display_name || '',
      position: player.position,
      date_of_birth: player.date_of_birth,
      nationality: player.nationality,
    },
    player_id: player.id,
    shirt_number: player.jersey_number || player.shirt_number || 0,
    status: 'substitute' as const,
    is_captain: player.is_captain || false,
    is_goalkeeper: position === 'GK',
  }
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useMatchLineup({
  matchId,
  homeTeamId,
  awayTeamId,
  eligiblePlayers: externalEligiblePlayers = [],
}: {
  matchId: string
  homeTeamId: string
  awayTeamId: string
  eligiblePlayers?: LineupPlayer[]
}): UseMatchLineupReturn {
  const queryClient = useQueryClient()

  const [homeLineupDraft, setHomeLineupDraft] = useState<Partial<MatchLineup>>({})
  const [awayLineupDraft, setAwayLineupDraft] = useState<Partial<MatchLineup>>({})

  // ─── Fetch existing lineups ────────────────────────────────────────────
  const homeQuery = useQuery({
    queryKey: MATCH_QUERY_KEYS.lineup(matchId, homeTeamId),
    queryFn: () => matchApi.getLineup(matchId, homeTeamId),
    enabled: Boolean(matchId) && Boolean(homeTeamId),
    staleTime: 5 * 60_000,
  })

  const awayQuery = useQuery({
    queryKey: MATCH_QUERY_KEYS.lineup(matchId, awayTeamId),
    queryFn: () => matchApi.getLineup(matchId, awayTeamId),
    enabled: Boolean(matchId) && Boolean(awayTeamId),
    staleTime: 5 * 60_000,
  })

  // ─── Fetch squad for each team ────────────────────────────────────────────
  const homeSquadQuery = useQuery({
    queryKey: ['clubs', homeTeamId, 'squad'],
    queryFn: () => getClubSquad(homeTeamId),
    enabled: Boolean(homeTeamId),
    staleTime: 10 * 60_000,
  })

  const awaySquadQuery = useQuery({
    queryKey: ['clubs', awayTeamId, 'squad'],
    queryFn: () => getClubSquad(awayTeamId),
    enabled: Boolean(awayTeamId),
    staleTime: 10 * 60_000,
  })

  // ─── Map squad players to lineup players ──────────────────────────────────
  const homeSquad = useMemo(() => {
    const squad = homeSquadQuery.data ?? []
    return squad.map(mapSquadPlayerToLineupPlayer)
  }, [homeSquadQuery.data])

  const awaySquad = useMemo(() => {
    const squad = awaySquadQuery.data ?? []
    return squad.map(mapSquadPlayerToLineupPlayer)
  }, [awaySquadQuery.data])

  // Combine both squads for general eligible players list
  const eligiblePlayers = useMemo(() => {
    if (externalEligiblePlayers.length > 0) {
      return externalEligiblePlayers
    }
    return [...homeSquad, ...awaySquad]
  }, [externalEligiblePlayers, homeSquad, awaySquad])

  // ─── Sync drafts with fetched lineups ────────────────────────────────────
  useEffect(() => {
    if (homeQuery.data && Object.keys(homeLineupDraft).length === 0) {
      setHomeLineupDraft(homeQuery.data)
    }
  }, [homeQuery.data, homeLineupDraft])

  useEffect(() => {
    if (awayQuery.data && Object.keys(awayLineupDraft).length === 0) {
      setAwayLineupDraft(awayQuery.data)
    }
  }, [awayQuery.data, awayLineupDraft])

  // ─── Update draft lineup ──────────────────────────────────────────────
  const setLineup = useCallback(
    (teamId: string, lineup: Partial<MatchLineup>) => {
      if (teamId === homeTeamId) {
        setHomeLineupDraft((prev) => ({ ...prev, ...lineup }))
      } else {
        setAwayLineupDraft((prev) => ({ ...prev, ...lineup }))
      }
    },
    [homeTeamId]
  )

  // ─── Submit lineup mutation ───────────────────────────────────────────
  const submitMutation = useMutation({
    mutationFn: async (teamId: string) => {
      const draft = teamId === homeTeamId ? homeLineupDraft : awayLineupDraft
      const validation = validateLineup(draft)

      if (!validation.valid) {
        throw new Error(validation.errors[0] ?? 'Escalação inválida')
      }

      const allPlayers = [
        ...(draft.startingXI ?? []).map((p) => ({
          player_id: p.playerId || p.player_id || p.player?.id || '',
          status: 'starter' as const,
          position: p.positionSpecific || p.position,
          shirt_number: p.playerNumber || p.shirt_number || 0,
          is_captain: p.is_captain ?? false,
          is_goalkeeper: p.position === 'GK' || (p.is_goalkeeper ?? false),
          formation_position: p.formation_position,
        })),
        ...(draft.substitutes ?? []).map((p) => ({
          player_id: p.playerId || p.player_id || p.player?.id || '',
          status: 'substitute' as const,
          position: p.positionSpecific || p.position,
          shirt_number: p.playerNumber || p.shirt_number || 0,
          is_captain: false,
          is_goalkeeper: p.position === 'GK' || (p.is_goalkeeper ?? false),
          formation_position: undefined,
        })),
      ]

      await matchApi.submitLineup(matchId, teamId, {
        formation: draft.formation ?? '4-4-2',
        players: allPlayers,
      })
    },
    onSuccess: (_, teamId) => {
      queryClient.invalidateQueries({ queryKey: MATCH_QUERY_KEYS.lineup(matchId, teamId) })
      toast.success('Escalação submetida com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error?.message || error?.response?.data?.message || 'Erro ao submeter escalação.')
    },
  })

  // ─── Lock lineup mutation ─────────────────────────────────────────────
  const lockMutation = useMutation({
    mutationFn: (teamId: string) => matchApi.lockLineup(matchId, teamId),
    onSuccess: (_, teamId) => {
      queryClient.invalidateQueries({ queryKey: MATCH_QUERY_KEYS.lineup(matchId, teamId) })
      toast.success('Escalação bloqueada!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao bloquear escalação.')
    },
  })

  const homeValidation = validateLineup(homeLineupDraft)
  const awayValidation = validateLineup(awayLineupDraft)

  return {
    homeLineup: homeQuery.data ?? null,
    awayLineup: awayQuery.data ?? null,
    homeLineupDraft,
    awayLineupDraft,
    eligiblePlayers,
    homeSquad,
    awaySquad,
    setLineup,
    submitLineup: (teamId: string) => submitMutation.mutateAsync(teamId),
    lockLineup: (teamId: string) => lockMutation.mutateAsync(teamId),
    validateLineup,
    homeValidation,
    awayValidation,
    isSubmitting: submitMutation.isPending,
    isLocking: lockMutation.isPending,
    isLoading: homeQuery.isLoading || awayQuery.isLoading,
    isSquadLoading: homeSquadQuery.isLoading || awaySquadQuery.isLoading,
    error: (homeQuery.error || awayQuery.error) as Error | null,
  }
}
