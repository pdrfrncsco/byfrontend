import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar } from 'lucide-react'
import { MatchScoreWidget } from '@/modules/shared/components/sport'
import { EmptyState } from '@/components/ui/empty-state'

export interface ClubMatchesListProps {
  matches: any[]
  competitionName?: string
}

export function ClubMatchesList({ matches, competitionName }: ClubMatchesListProps) {
  const navigate = useNavigate()

  if (!matches || matches.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="Sem jogos"
        description="Não existem jogos disponíveis para mostrar."
      />
    )
  }

  // Sort matches by date (most recent first)
  const sortedMatches = [...matches].sort(
    (a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime()
  )

  // Group by round_name or round_label
  const groupedMatches = sortedMatches.reduce((acc, match) => {
    const round = match.round_name || match.round_label || 'Outros'
    if (!acc[round]) {
      acc[round] = []
    }
    acc[round].push(match)
    return acc
  }, {} as Record<string, any[]>)

  const handleMatchClick = (match: any) => {
    if (match.competition_id && match.id) {
      navigate(`/competitions/${match.competition_id}/matches/${match.id}`)
    }
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedMatches).map(([round, roundMatches]) => (
        <div key={round} className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant px-1 border-b border-outline-variant/10 pb-1">
            {round} {competitionName && <span className="font-normal normal-case ml-2 text-[11px]">- {competitionName}</span>}
          </h4>
          <div className="flex flex-col gap-2">
            {(roundMatches as any[]).map((match: any) => (
              <div 
                key={match.id} 
                className="cursor-pointer transition-transform hover:-translate-y-[1px]"
                onClick={() => handleMatchClick(match)}
              >
                <MatchScoreWidget 
                  match={match} 
                  variant="compact" 
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
