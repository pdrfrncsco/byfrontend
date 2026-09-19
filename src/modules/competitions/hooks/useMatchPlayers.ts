import { useMemo } from 'react'
import { useLineups } from './useLineups'
import { useClubSquad } from '@/modules/clubs/hooks/useClubs'

export interface MatchSelectablePlayer {
  id: string
  name: string
  number?: number
  position?: string
  status: 'starter' | 'substitute' | 'squad'
  isGoalkeeper?: boolean
  isCaptain?: boolean
}

function resolvePlayerName(raw: any): string {
  if (!raw) return 'Jogador'
  if (typeof raw === 'string') return raw
  return (
    raw.player?.full_name ||
    (raw.player?.first_name ? `${raw.player.first_name} ${raw.player.last_name || ''}`.trim() : '') ||
    raw.display_name ||
    raw.player_name ||
    raw.playerName ||
    raw.full_name ||
    raw.name ||
    (raw.first_name ? `${raw.first_name} ${raw.last_name || ''}`.trim() : '') ||
    'Jogador'
  )
}

function resolvePlayerNumber(raw: any): number | undefined {
  if (!raw) return undefined
  const num = raw.shirt_number ?? raw.jersey_number ?? raw.playerNumber ?? raw.player?.shirt_number
  return typeof num === 'number' && !isNaN(num) ? num : undefined
}

function resolvePlayerPosition(raw: any): string | undefined {
  if (!raw) return undefined
  return raw.position_display || raw.position_label || raw.position || raw.player?.position || undefined
}

export function useMatchPlayers(matchId?: string, homeClubId?: string, awayClubId?: string) {
  const { data: lineups = [], isLoading: loadingLineups } = useLineups(matchId || '')
  const { data: homeSquad = [], isLoading: loadingHomeSquad } = useClubSquad(homeClubId || '')
  const { data: awaySquad = [], isLoading: loadingAwaySquad } = useClubSquad(awayClubId || '')

  const buildPlayersForClub = (clubId?: string, fallbackSquad: any[] = []): MatchSelectablePlayer[] => {
    if (!clubId) return []

    const lineup = (lineups as any[]).find(item => String(item.club ?? item.club_id) === String(clubId))
    const list: MatchSelectablePlayer[] = []
    const seen = new Set<string>()

    if (lineup) {
      const starters = lineup.starters ?? lineup.lineup_players?.filter((p: any) => String(p.status).toLowerCase() === 'starter') ?? []
      const subs = lineup.substitutes ?? lineup.lineup_players?.filter((p: any) => String(p.status).toLowerCase() === 'substitute') ?? []

      for (const p of starters) {
        const id = String(p.player_id ?? p.playerId ?? p.player?.id ?? p.id)
        if (id && id !== 'undefined' && !seen.has(id)) {
          seen.add(id)
          list.push({
            id,
            name: resolvePlayerName(p),
            number: resolvePlayerNumber(p),
            position: resolvePlayerPosition(p),
            status: 'starter',
            isGoalkeeper: Boolean(p.is_goalkeeper || p.position === 'gk'),
            isCaptain: Boolean(p.is_captain),
          })
        }
      }

      for (const p of subs) {
        const id = String(p.player_id ?? p.playerId ?? p.player?.id ?? p.id)
        if (id && id !== 'undefined' && !seen.has(id)) {
          seen.add(id)
          list.push({
            id,
            name: resolvePlayerName(p),
            number: resolvePlayerNumber(p),
            position: resolvePlayerPosition(p),
            status: 'substitute',
            isGoalkeeper: Boolean(p.is_goalkeeper || p.position === 'gk'),
            isCaptain: Boolean(p.is_captain),
          })
        }
      }
    }

    // Append any squad members not already in lineup
    for (const member of fallbackSquad) {
      const id = String(member.player_id ?? member.id)
      if (id && id !== 'undefined' && !seen.has(id)) {
        seen.add(id)
        list.push({
          id,
          name: resolvePlayerName(member),
          number: resolvePlayerNumber(member),
          position: resolvePlayerPosition(member),
          status: 'squad',
          isGoalkeeper: member.position === 'gk',
        })
      }
    }

    return list
  }

  const homePlayers = useMemo(() => buildPlayersForClub(homeClubId, homeSquad), [lineups, homeClubId, homeSquad])
  const awayPlayers = useMemo(() => buildPlayersForClub(awayClubId, awaySquad), [lineups, awayClubId, awaySquad])

  const getPlayersForClub = (clubId: string) => {
    if (String(clubId) === String(homeClubId)) return homePlayers
    if (String(clubId) === String(awayClubId)) return awayPlayers
    return buildPlayersForClub(clubId, [])
  }

  const getStartersForClub = (clubId: string) => {
    return getPlayersForClub(clubId).filter(p => p.status === 'starter')
  }

  const getSubstitutesForClub = (clubId: string) => {
    return getPlayersForClub(clubId).filter(p => p.status === 'substitute')
  }

  return {
    homePlayers,
    awayPlayers,
    getPlayersForClub,
    getStartersForClub,
    getSubstitutesForClub,
    isLoading: loadingLineups || loadingHomeSquad || loadingAwaySquad,
  }
}
