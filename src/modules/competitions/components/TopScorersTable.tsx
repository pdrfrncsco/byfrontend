import { Target, User as UserIcon } from 'lucide-react'
import type { TopScorer } from '../types'

interface TopScorersTableProps {
  scorers: TopScorer[]
  limit?: number
  isLoading?: boolean
}

/**
 * TopScorersTable — displays the top goal scorers for a competition.
 *
 * @example
 * <TopScorersTable scorers={topScorers} limit={10} />
 */
export function TopScorersTable({ scorers, limit = 10, isLoading = false }: TopScorersTableProps) {
  const visible = scorers.slice(0, limit)

  if (isLoading) {
    return (
      <div className="space-y-sm">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex animate-pulse items-center gap-md rounded-lg bg-surface-container-high/50 p-md">
            <div className="h-8 w-8 rounded-full bg-surface-container-highest" />
            <div className="flex-1 space-y-xs">
              <div className="h-3 w-32 rounded bg-surface-container-highest" />
              <div className="h-2 w-24 rounded bg-surface-container-highest" />
            </div>
            <div className="h-6 w-10 rounded bg-surface-container-highest" />
          </div>
        ))}
      </div>
    )
  }

  if (visible.length === 0) {
    return (
      <div className="flex flex-col items-center gap-md py-xl text-on-surface-variant">
        <Target className="h-10 w-10 opacity-30" />
        <p className="text-sm">Nenhum marcador registado.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant/20">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-outline-variant/20 bg-surface-container-high">
            <th className="w-10 px-md py-sm text-center font-semibold text-on-surface-variant">#</th>
            <th className="px-md py-sm text-left font-semibold text-on-surface-variant">Jogador</th>
            <th className="px-md py-sm text-left font-semibold text-on-surface-variant">Clube</th>
            <th className="w-16 px-sm py-sm text-center font-bold text-on-surface" title="Golos">Golos</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((scorer, idx) => (
            <tr
              key={scorer.player_id}
              className="border-b border-outline-variant/10 transition-colors last:border-0 hover:bg-surface-container-high/50"
            >
              <td className="px-md py-sm text-center font-semibold text-on-surface-variant">
                {idx + 1}
              </td>
              <td className="px-md py-sm">
                <div className="flex items-center gap-sm">
                  {scorer.player_avatar ? (
                    <img
                      src={scorer.player_avatar}
                      alt={scorer.player_name}
                      className="h-7 w-7 flex-shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-container/20">
                      <UserIcon className="h-3.5 w-3.5 text-primary" />
                    </div>
                  )}
                  <span className="font-medium text-on-surface">{scorer.player_name}</span>
                </div>
              </td>
              <td className="px-md py-sm">
                <div className="flex items-center gap-sm">
                  {scorer.club_logo && (
                    <img
                      src={scorer.club_logo}
                      alt={scorer.club_name}
                      className="h-5 w-5 rounded-full object-cover"
                    />
                  )}
                  <span className="text-on-surface-variant">{scorer.club_name}</span>
                </div>
              </td>
              <td className="px-sm py-sm text-center">
                <div className="flex items-center justify-center gap-xs">
                  <Target className="h-3.5 w-3.5 text-primary" />
                  <span className="font-bold text-primary tabular-nums">{scorer.goals}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
