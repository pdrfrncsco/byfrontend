import { useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { competitionApi } from '../services/competition.api'
import type { TacticalPlayer } from '../components/tactical/TacticalField'
import { toast } from 'sonner'

const LOCAL_KEY = (matchId: string, clubId?: string) => `tactical:${matchId}:${clubId ?? 'any'}`

export function useTacticalPositions(matchId: string, clubId?: string) {
  const qc = useQueryClient()
  const [loading, setLoading] = useState(false)

  const loadPositions = useCallback(async (): Promise<TacticalPlayer[] | null> => {
    // Try localStorage first
    try {
      const raw = localStorage.getItem(LOCAL_KEY(matchId, clubId))
      if (raw) {
        const parsed = JSON.parse(raw) as TacticalPlayer[]
        return parsed
      }
    } catch (e) {
      // ignore
    }

    // Try to fetch submitted lineups for this match and look for a formation payload
    try {
      const lineups = await competitionApi.getLineups(matchId)
      if (Array.isArray(lineups) && lineups.length > 0) {
        // Prefer lineup for clubId if provided
        const candidate = (clubId ? lineups.find(l => l.club === clubId) : lineups[0]) ?? lineups[0]
        if (candidate?.formation) {
          try {
            const formation = JSON.parse(candidate.formation)
            if (formation && Array.isArray(formation.tactical_positions)) {
              return formation.tactical_positions as TacticalPlayer[]
            }
          } catch (e) {
            // formation not JSON
          }
        }
      }
    } catch (err) {
      // ignore network errors
    }

    return null
  }, [matchId, clubId])

  const savePositions = useCallback(async (players: TacticalPlayer[]) => {
    setLoading(true)
    // Persist locally as fast path
    try {
      localStorage.setItem(LOCAL_KEY(matchId, clubId), JSON.stringify(players))
    } catch (e) {
      console.warn('Failed to persist tactical positions locally', e)
    }

    // Try to submit to backend using submitLineup; pack positions into formation string
    try {
      const payload = {
        formation: JSON.stringify({ tactical_positions: players }),
        players: players.map(p => ({ player_id: p.id, status: 'starter', position: 'tactical', shirt_number: Number(p.number) || 0 })),
      }
      await competitionApi.submitLineup(matchId, payload as any)
      // invalidate lineup caches
      qc.invalidateQueries({ queryKey: ['lineups', matchId] })
      toast.success('Posições salvas com sucesso.')
    } catch (err: any) {
      console.error('Failed to save tactical positions', err)
      toast.error('Falha ao guardar posições no servidor; guardado localmente.')
    } finally {
      setLoading(false)
    }
  }, [matchId, clubId, qc])

  return {
    loading,
    loadPositions,
    savePositions,
  }
}
