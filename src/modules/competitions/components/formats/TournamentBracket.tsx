import { useTournamentBracket } from '../../hooks/useTournamentBracket'
import { Trophy } from 'lucide-react'

export function TournamentBracket({ competitionId }: { competitionId: string }) {
  const { bracket = [], isLoading } = useTournamentBracket(competitionId)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-xl">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (bracket.length === 0) {
    return (
      <div className="flex flex-col items-center gap-md py-xl text-on-surface-variant">
        <Trophy className="h-10 w-10 opacity-30" />
        <p className="text-sm">Fase eliminatória ainda não gerada.</p>
        <p className="text-xs opacity-60">A fase eliminatória será iniciada após a conclusão da fase de grupos.</p>
      </div>
    )
  }

  return (
    <div className="flex gap-lg overflow-x-auto pb-md select-none">
      {bracket.map((round) => (
        <div key={round.name} className="flex min-w-[240px] flex-col gap-md">
          <h4 className="border-b border-outline-variant/20 pb-xs text-center text-sm font-semibold text-on-surface-variant">
            {round.name}
          </h4>
          <div className="flex flex-1 flex-col justify-around gap-lg py-md">
            {round.matches.map((match) => {
              const hasWinner = match.winner !== null
              const isTeam1Winner = match.winner === match.team1
              const isTeam2Winner = match.winner === match.team2

              return (
                <div
                  key={match.id}
                  className="relative rounded-lg border border-outline-variant/30 bg-surface-container-low p-sm shadow-sm transition-all hover:border-primary/40 hover:bg-surface-container-high"
                >
                  <div className="space-y-xs text-xs">
                    {/* Team 1 */}
                    <div className="flex items-center justify-between gap-md">
                      <span
                        className={`truncate font-medium ${
                          isTeam1Winner
                            ? 'text-primary font-bold'
                            : hasWinner
                            ? 'text-on-surface-variant opacity-75'
                            : 'text-on-surface'
                        }`}
                      >
                        {match.team1Name || 'A Definir'}
                      </span>
                      <span className="font-bold text-on-surface">
                        {match.score1 !== null ? match.score1 : '-'}
                      </span>
                    </div>

                    {/* Team 2 */}
                    <div className="flex items-center justify-between gap-md border-t border-outline-variant/10 pt-xs">
                      <span
                        className={`truncate font-medium ${
                          isTeam2Winner
                            ? 'text-primary font-bold'
                            : hasWinner
                            ? 'text-on-surface-variant opacity-75'
                            : 'text-on-surface'
                        }`}
                      >
                        {match.team2Name || 'A Definir'}
                      </span>
                      <span className="font-bold text-on-surface">
                        {match.score2 !== null ? match.score2 : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
