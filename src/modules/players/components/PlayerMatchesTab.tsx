import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { useClubPublicMatches } from '@/modules/clubs/hooks/useClubs'
import { MatchScoreWidget } from '@/modules/shared/components/sport'

/**
 * PlayerMatchesTab component displays recent matches for a player's current club.
 */
export interface PlayerMatchesTabProps {
  playerSlug: string
  currentClubSlug?: string
}

export function PlayerMatchesTab({ currentClubSlug }: PlayerMatchesTabProps) {
  const navigate = useNavigate()
  const { data: matches, isLoading } = useClubPublicMatches(currentClubSlug)

  const groupedMatches = useMemo(() => {
    if (!matches || !Array.isArray(matches)) return {}

    const getMatchDate = (m: any) => m.match_date || m.scheduled_at || m.date || 0
    const sorted = [...matches].sort(
      (a: any, b: any) => new Date(getMatchDate(b)).getTime() - new Date(getMatchDate(a)).getTime()
    )

    return sorted.reduce((acc: Record<string, any[]>, match: any) => {
      const round = match.round_name || match.round_label || 'Outros'
      if (!acc[round]) {
        acc[round] = []
      }
      acc[round].push(match)
      return acc
    }, {})
  }, [matches])

  if (!currentClubSlug) {
    return (
      <EmptyState
        icon={Calendar}
        title="Sem Clube Atual"
        description="Este jogador não está registado em nenhum clube atualmente."
      />
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-lg">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-surface-container rounded animate-pulse" />
        ))}
      </div>
    )
  }

  if (Object.keys(groupedMatches).length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="Sem Jogos"
        description="Nenhum jogo encontrado para o clube atual."
      />
    )
  }

  return (
    <div className="space-y-lg">
      {Object.entries(groupedMatches).map(([roundName, roundMatches]) => (
        <div key={roundName} className="space-y-md">
          <h3 className="text-body-md font-medium text-on-surface-variant px-1">
            {roundName}
          </h3>
          <div className="space-y-sm">
            {roundMatches.map((match: any) => {
              const compId = match.competition_id || match.competitionId || match.competition
              return (
                <div
                  key={match.id}
                  className="cursor-pointer"
                  onClick={() => compId && navigate(`/competitions/${compId}/matches/${match.id}`)}
                >
                  <MatchScoreWidget match={match} />
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
