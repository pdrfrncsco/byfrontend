import { Link } from 'react-router-dom'
import { Trophy, Award, Minus, TrendingDown, TrendingUp } from 'lucide-react'
import type { Standing } from '../types'

interface StandingsTableProps {
  standings: Standing[]
  /** Number of qualifying positions highlighted (default: 3) */
  qualifyingSpots?: number
  /** Number of relegation positions highlighted */
  relegationSpots?: number
  /** Competition ID for club links */
  competitionId?: string
}

const POSITION_COLORS = [
  'text-amber-500', // 1st — gold
  'text-slate-400',  // 2nd — silver
  'text-amber-700',  // 3rd — bronze
]

/**
 * StandingsTable — interactive league table with position highlights and trend indicators.
 *
 * @example
 * <StandingsTable standings={standings} qualifyingSpots={3} />
 */
export function StandingsTable({
  standings,
  qualifyingSpots = 3,
  relegationSpots = 0,
}: StandingsTableProps) {
  if (standings.length === 0) {
    return (
      <div className="flex flex-col items-center gap-md py-xl text-on-surface-variant">
        <Trophy className="h-10 w-10 opacity-30" />
        <p className="text-sm">Classificação ainda não disponível.</p>
        <p className="text-xs opacity-60">Os clubs precisam de ser registados e os jogos realizados.</p>
      </div>
    )
  }

  const totalTeams = standings.length
  const relegationStart = totalTeams - relegationSpots + 1

  const getRowClass = (position: number): string => {
    if (position <= qualifyingSpots) return 'bg-emerald-500/5 border-l-2 border-l-emerald-500'
    if (relegationSpots > 0 && position >= relegationStart) return 'bg-red-500/5 border-l-2 border-l-red-500'
    return ''
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-outline-variant/20">
      <table className="w-full min-w-[600px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-outline-variant/20 bg-surface-container-high">
            <th className="w-10 px-md py-sm text-center font-semibold text-on-surface-variant">#</th>
            <th className="px-md py-sm text-left font-semibold text-on-surface-variant">Clube</th>
            <th className="w-12 px-sm py-sm text-center font-semibold text-on-surface-variant" title="Jogos">J</th>
            <th className="w-12 px-sm py-sm text-center font-semibold text-on-surface-variant" title="Vitórias">V</th>
            <th className="w-12 px-sm py-sm text-center font-semibold text-on-surface-variant" title="Empates">E</th>
            <th className="w-12 px-sm py-sm text-center font-semibold text-on-surface-variant" title="Derrotas">D</th>
            <th className="w-14 px-sm py-sm text-center font-semibold text-on-surface-variant" title="Golos Marcados">GM</th>
            <th className="w-14 px-sm py-sm text-center font-semibold text-on-surface-variant" title="Golos Sofridos">GS</th>
            <th className="w-14 px-sm py-sm text-center font-semibold text-on-surface-variant" title="Diferença de Golos">DG</th>
            <th className="w-14 px-sm py-sm text-center font-bold text-on-surface" title="Pontos">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s, idx) => {
            const positionColor = POSITION_COLORS[idx] ?? 'text-on-surface-variant'
            const isTopThree = idx < 3

            return (
              <tr
                key={s.id}
                className={`border-b border-outline-variant/10 transition-colors last:border-0 hover:bg-surface-container-high/50 ${getRowClass(s.position)}`}
              >
                {/* Position */}
                <td className="px-md py-md text-center">
                  <div className="flex items-center justify-center">
                    {isTopThree ? (
                      <Award className={`h-4 w-4 ${positionColor}`} />
                    ) : (
                      <span className="font-semibold text-on-surface-variant">{s.position}</span>
                    )}
                  </div>
                </td>

                {/* Club */}
                <td className="px-md py-md">
                  <div className="flex items-center gap-sm">
                    {s.club_logo ? (
                      <img
                        src={s.club_logo}
                        alt={s.club_name}
                        className="h-7 w-7 flex-shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-container/20 text-xs font-bold text-primary">
                        {s.club_name.charAt(0)}
                      </div>
                    )}
                    <Link
                      to={`/clubs/${s.club}`}
                      className="font-medium text-on-surface transition-colors hover:text-primary"
                    >
                      {s.club_name}
                    </Link>
                  </div>
                </td>

                {/* Stats */}
                <td className="px-sm py-md text-center text-on-surface-variant">{s.played}</td>
                <td className="px-sm py-md text-center font-medium text-emerald-600">{s.won}</td>
                <td className="px-sm py-md text-center text-on-surface-variant">{s.drawn}</td>
                <td className="px-sm py-md text-center font-medium text-red-500">{s.lost}</td>
                <td className="px-sm py-md text-center text-on-surface-variant">{s.goals_for}</td>
                <td className="px-sm py-md text-center text-on-surface-variant">{s.goals_against}</td>
                <td className="px-sm py-md text-center">
                  <div className="flex items-center justify-center gap-xs">
                    {s.goal_difference > 0 ? (
                      <TrendingUp className="h-3 w-3 text-emerald-500" />
                    ) : s.goal_difference < 0 ? (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    ) : (
                      <Minus className="h-3 w-3 text-on-surface-variant" />
                    )}
                    <span
                      className={
                        s.goal_difference > 0
                          ? 'font-medium text-emerald-600'
                          : s.goal_difference < 0
                            ? 'font-medium text-red-500'
                            : 'text-on-surface-variant'
                      }
                    >
                      {s.goal_difference > 0 ? `+${s.goal_difference}` : s.goal_difference}
                    </span>
                  </div>
                </td>
                <td className="px-sm py-md text-center">
                  <span className="rounded-lg bg-primary/10 px-sm py-xs text-sm font-bold text-primary">
                    {s.points}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Legend */}
      {(qualifyingSpots > 0 || relegationSpots > 0) && (
        <div className="flex flex-wrap gap-md border-t border-outline-variant/20 bg-surface-container-high/50 px-md py-sm text-xs text-on-surface-variant">
          {qualifyingSpots > 0 && (
            <div className="flex items-center gap-xs">
              <div className="h-3 w-3 rounded-sm border-l-2 border-l-emerald-500 bg-emerald-500/20" />
              <span>Qualificação</span>
            </div>
          )}
          {relegationSpots > 0 && (
            <div className="flex items-center gap-xs">
              <div className="h-3 w-3 rounded-sm border-l-2 border-l-red-500 bg-red-500/20" />
              <span>Descida</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
