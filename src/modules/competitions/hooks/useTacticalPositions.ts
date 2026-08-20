import { useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { competitionApi } from '../services/competition.api'
import { lineupApi } from '../services/lineup.api'
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

    // Try dedicated tactical positions endpoint first
    try {
      const res = await competitionApi.getTacticalPositions(matchId, clubId)
      if (res && Array.isArray(res.positions)) return res.positions as TacticalPlayer[]
    } catch (e) {
      // ignore network errors
    }

    // Fallback: Try to fetch submitted lineups for this match and look for a formation payload
    try {
      const lineups = await lineupApi.list(matchId)
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

  const savePositions = useCallback(async (players: TacticalPlayer[], options?: { force?: boolean }) => {
    setLoading(true)
    // Persist locally as fast path
    try {
      localStorage.setItem(LOCAL_KEY(matchId, clubId), JSON.stringify(players))
    } catch (e) {
      console.warn('Failed to persist tactical positions locally', e)
    }

    // Use dedicated endpoint if available
    const payload = {
      club: clubId,
      positions: players,
      updated_at: new Date().toISOString(),
    }

    try {
      await competitionApi.upsertTacticalPositions(matchId, payload, Boolean(options?.force))
      // invalidate lineup/tactical caches
      qc.invalidateQueries({ queryKey: ['lineups', matchId] })
      qc.invalidateQueries({ queryKey: ['tactical', matchId] })
      toast.success('Posições salvas com sucesso.')
      return { success: true }
    } catch (err: any) {
      // If server returns a 409 conflict, pass remote positions back to caller for resolution
      if (err?.response?.status === 409 && err?.response?.data) {
        const remote = err.response.data.data ?? err.response.data
        console.warn('Conflict saving tactical positions', remote)
        // Do NOT show generic toast; let caller decide
        return { success: false, conflict: true, remote }
      }

      console.error('Failed to save tactical positions', err)
      toast.error('Falha ao guardar posições no servidor; guardado localmente.')
      return { success: false }
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
