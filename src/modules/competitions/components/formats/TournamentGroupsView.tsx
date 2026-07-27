import { useTournamentBracket } from '../../hooks/useTournamentBracket'
import { Link } from 'react-router-dom'
import { Trophy } from 'lucide-react'

export function TournamentGroupsView({ competitionId }: { competitionId: string }) {
  const { groups = [], isLoading } = useTournamentBracket(competitionId)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-xl">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center gap-md py-xl text-on-surface-variant">
        <Trophy className="h-10 w-10 opacity-30" />
        <p className="text-sm">Grupos ainda não configurados.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-lg lg:grid-cols-2">
      {groups.map((group) => (
        <div
          key={group.name}
          className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-md"
        >
          <h3 className="mb-sm text-md font-bold text-on-surface flex items-center justify-between">
            <span>{group.name}</span>
            <span className="text-xs font-normal text-on-surface-variant">
              {group.teams.length} Equipas
            </span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px] border-collapse text-xs">
              <thead>
                <tr className="border-b border-outline-variant/25 pb-xs text-on-surface-variant font-semibold">
                  <th className="w-8 pb-xs text-center">#</th>
                  <th className="pb-xs text-left">Clube</th>
                  <th className="w-8 pb-xs text-center">J</th>
                  <th className="w-8 pb-xs text-center">V</th>
                  <th className="w-8 pb-xs text-center">E</th>
                  <th className="w-8 pb-xs text-center">D</th>
                  <th className="w-10 pb-xs text-center">DG</th>
                  <th className="w-10 pb-xs text-center font-bold text-on-surface">Pts</th>
                </tr>
              </thead>
              <tbody>
                {group.standings.map((s, idx) => {
                  const isQualifier = idx < 2
                  return (
                    <tr
                      key={s.id}
                      className={`border-b border-outline-variant/10 transition-colors last:border-0 hover:bg-surface-container-high/40 ${
                        isQualifier ? 'bg-emerald-500/5 border-l border-l-emerald-500' : ''
                      }`}
                    >
                      <td className="py-sm text-center">
                        <span className="font-semibold text-on-surface-variant">{s.position}</span>
                      </td>
                      <td className="py-sm px-xs">
                        <div className="flex items-center gap-xs">
                          {s.club_logo ? (
                            <img
                              src={s.club_logo}
                              alt={s.club_name}
                              className="h-5 w-5 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-container/20 text-[10px] font-bold text-primary">
                              {s.club_name.charAt(0)}
                            </div>
                          )}
                          <Link
                            to={`/clubs/${s.club}`}
                            className="font-medium text-on-surface hover:text-primary"
                          >
                            {s.club_name}
                          </Link>
                          {isQualifier && (
                            <span className="ml-xs rounded bg-emerald-500/10 px-1 py-0.2 text-[9px] font-bold text-emerald-500">
                              Q
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-sm text-center text-on-surface-variant">{s.played}</td>
                      <td className="py-sm text-center font-medium text-emerald-600">{s.won}</td>
                      <td className="py-sm text-center text-on-surface-variant">{s.drawn}</td>
                      <td className="py-sm text-center font-medium text-red-500">{s.lost}</td>
                      <td className="py-sm text-center font-medium text-on-surface-variant">
                        {s.goal_difference > 0 ? `+${s.goal_difference}` : s.goal_difference}
                      </td>
                      <td className="py-sm text-center">
                        <span className="rounded bg-primary/10 px-xs py-0.5 font-bold text-primary">
                          {s.points}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}
