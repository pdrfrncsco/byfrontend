import React from 'react'
import { MatchScoreWidget } from '@/modules/shared/components/sport'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface ClubOverviewTabProps {
  club: any
  matches: any[]
  standings: any[]
  competitions: any[]
  kpis: any
  isLoading?: boolean
}

export function ClubOverviewTab({
  club,
  matches,
  standings,
  competitions,
  kpis,
  isLoading
}: ClubOverviewTabProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="animate-pulse bg-surface-container-high rounded h-32" />
          <div className="animate-pulse bg-surface-container-high rounded h-32" />
        </div>
        <div className="animate-pulse bg-surface-container-high rounded h-48" />
        <div className="animate-pulse bg-surface-container-high rounded h-32" />
      </div>
    )
  }

  // Sort matches by date
  const sortedMatches = [...(matches || [])].sort(
    (a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime()
  )
  
  const finishedMatches = sortedMatches.filter(m => m.status === 'FINISHED' || m.status === 'PLAYED')
  const scheduledMatches = sortedMatches.filter(m => m.status === 'SCHEDULED' || m.status === 'FIXTURE')
  
  const lastMatch = finishedMatches[0]
  const nextMatch = scheduledMatches[scheduledMatches.length - 1] // nearest scheduled match

  return (
    <div className="space-y-6">
      {/* Matches Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lastMatch && (
          <div className="rounded-lg border border-outline-variant/15 bg-surface-container p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3">
              Último jogo
            </h3>
            <MatchScoreWidget
              homeTeam={{ name: lastMatch.home_club_name || lastMatch.home_team_name, logoUrl: lastMatch.home_club_logo || lastMatch.home_team_logo }}
              awayTeam={{ name: lastMatch.away_club_name || lastMatch.away_team_name, logoUrl: lastMatch.away_club_logo || lastMatch.away_team_logo }}
              homeScore={lastMatch.home_score}
              awayScore={lastMatch.away_score}
              status={lastMatch.status}
              statusLabel={lastMatch.status_label}
              matchDate={lastMatch.match_date ? new Date(lastMatch.match_date).toLocaleDateString('pt-AO') : undefined}
              venue={lastMatch.venue}
            />
          </div>
        )}
        {nextMatch && (
          <div className="rounded-lg border border-outline-variant/15 bg-surface-container p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3">
              Próximo jogo
            </h3>
            <MatchScoreWidget
              homeTeam={{ name: nextMatch.home_club_name || nextMatch.home_team_name, logoUrl: nextMatch.home_club_logo || nextMatch.home_team_logo }}
              awayTeam={{ name: nextMatch.away_club_name || nextMatch.away_team_name, logoUrl: nextMatch.away_club_logo || nextMatch.away_team_logo }}
              homeScore={nextMatch.home_score}
              awayScore={nextMatch.away_score}
              status={nextMatch.status}
              statusLabel={nextMatch.status_label}
              matchDate={nextMatch.match_date ? new Date(nextMatch.match_date).toLocaleDateString('pt-AO') : undefined}
              venue={nextMatch.venue}
            />
          </div>
        )}
      </div>

      {/* Standings Section */}
      {standings && standings.length > 0 && (
        <div className="rounded-lg border border-outline-variant/15 bg-surface-container p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3">
            Classificação
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/15 text-[11px] font-semibold uppercase text-on-surface-variant bg-surface-container-low">
                  <th className="px-3 py-2 text-center w-8">#</th>
                  <th className="px-3 py-2">Clube</th>
                  <th className="px-3 py-2 text-center w-10">J</th>
                  <th className="px-3 py-2 text-center w-10">V</th>
                  <th className="px-3 py-2 text-center w-10">E</th>
                  <th className="px-3 py-2 text-center w-10">D</th>
                  <th className="px-3 py-2 text-center w-12">Pts</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((row) => (
                  <tr 
                    key={row.id} 
                    className={cn(
                      "border-b border-outline-variant/8 text-sm hover:bg-surface-container-low/50",
                      row.club_id === club?.id && "bg-surface-container-high font-medium"
                    )}
                  >
                    <td className="px-3 py-2 text-center">{row.position}</td>
                    <td className="px-3 py-2 truncate max-w-[150px]">{row.club_name}</td>
                    <td className="px-3 py-2 text-center tabular-nums">{row.matches_played}</td>
                    <td className="px-3 py-2 text-center tabular-nums">{row.won}</td>
                    <td className="px-3 py-2 text-center tabular-nums">{row.drawn}</td>
                    <td className="px-3 py-2 text-center tabular-nums">{row.lost}</td>
                    <td className="px-3 py-2 text-center tabular-nums font-bold">{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Statistics Section */}
      {kpis && (
        <div className="rounded-lg border border-outline-variant/15 bg-surface-container p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3">
            Estatísticas da temporada
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <StatCard label="Jogos" value={kpis.total_matches} />
            <StatCard label="Vitórias" value={kpis.wins} />
            <StatCard label="Empates" value={kpis.draws} />
            <StatCard label="Derrotas" value={kpis.losses} />
            <StatCard label="Golos M." value={kpis.goals_for} />
            <StatCard label="Golos S." value={kpis.goals_against} />
            <StatCard label="Clean sheets" value={kpis.clean_sheets} />
          </div>
        </div>
      )}

      {/* Active Competitions */}
      {competitions && competitions.length > 0 && (
        <div className="rounded-lg border border-outline-variant/15 bg-surface-container p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3">
            Competições ativas
          </h3>
          <div className="flex flex-wrap gap-2">
            {competitions.map((comp) => (
              <div 
                key={comp.id} 
                className="flex items-center gap-2 rounded-md border border-outline-variant/20 bg-surface-container-low px-3 py-2"
              >
                <span className="text-sm font-medium text-on-surface">{comp.name}</span>
                {comp.type && (
                  <Badge variant="secondary" className="text-[10px] uppercase">
                    {comp.type}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md bg-surface-container-low p-3 border border-outline-variant/10">
      <span className="text-lg font-bold text-on-surface mb-1">{value ?? '-'}</span>
      <span className="text-[10px] uppercase tracking-wider text-on-surface-variant text-center leading-tight">
        {label}
      </span>
    </div>
  )
}
