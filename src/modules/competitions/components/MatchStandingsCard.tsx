import { forwardRef } from 'react'
import { Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Standing } from '../types'

export interface MatchStandingsCardProps {
  standings: Standing[]
  homeClubId: string
  awayClubId: string
  isLoading?: boolean
  className?: string
}

export const MatchStandingsCard = forwardRef<HTMLDivElement, MatchStandingsCardProps>(
  ({ standings, homeClubId, awayClubId, isLoading = false, className }, ref) => {
    if (isLoading) {
      return (
        <div ref={ref} className={cn('w-full space-y-2 animate-pulse', className)}>
          <div className="h-4 w-full rounded bg-surface-container-high/60 mb-2" />
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-1.5 border-b border-outline-variant/10 last:border-0"
            >
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-surface-container-high" />
                <div className="h-5 w-5 rounded-full bg-surface-container-high" />
                <div className="h-3 w-20 rounded bg-surface-container-high" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-3 w-4 rounded bg-surface-container-high" />
                <div className="h-3 w-6 rounded bg-surface-container-high" />
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (!standings || standings.length === 0) {
      return (
        <div
          ref={ref}
          className={cn(
            'flex flex-col items-center justify-center py-6 text-center text-on-surface-variant gap-2',
            className
          )}
        >
          <Trophy className="h-8 w-8 opacity-30" />
          <span className="text-xs">Classificação não disponível</span>
        </div>
      )
    }

    return (
      <div ref={ref} className={cn('w-full overflow-x-auto', className)}>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-outline-variant/10 text-on-surface-variant font-semibold uppercase tracking-wider">
              <th className="w-6 py-1.5 px-1 text-center">#</th>
              <th className="py-1.5 px-1 text-left">Clube</th>
              <th className="w-8 py-1.5 px-1 text-center" title="Jogos">J</th>
              <th className="w-8 py-1.5 px-1 text-right" title="Pontos">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s, idx) => {
              const isHighlighted =
                Boolean(homeClubId && s?.club === homeClubId) ||
                Boolean(awayClubId && s?.club === awayClubId)

              return (
                <tr
                  key={s?.id || `${s?.club ?? idx}-${s?.position ?? idx}`}
                  className={cn(
                    'border-b border-outline-variant/10 transition-colors last:border-0 hover:bg-surface-container-high/50',
                    isHighlighted && 'bg-primary/10 font-semibold'
                  )}
                >
                  <td className="w-6 py-1.5 px-1 text-center text-on-surface-variant">
                    {s?.position ?? idx + 1}
                  </td>
                  <td className="py-1.5 px-1">
                    <div className="flex items-center gap-2">
                      {s?.club_logo ? (
                        <img
                          src={s.club_logo}
                          alt={s?.club_name ?? 'Clube'}
                          className="h-5 w-5 flex-shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-surface-container-high text-[10px] font-bold text-on-surface-variant">
                          {s?.club_name ? s.club_name.charAt(0).toUpperCase() : '?'}
                        </div>
                      )}
                      <span className="max-w-[120px] truncate text-on-surface" title={s?.club_name}>
                        {s?.club_name ?? '—'}
                      </span>
                    </div>
                  </td>
                  <td className="w-8 py-1.5 px-1 text-center text-on-surface-variant">
                    {s?.played ?? 0}
                  </td>
                  <td className="w-8 py-1.5 px-1 text-right font-bold text-primary">
                    {s?.points ?? 0}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }
)

MatchStandingsCard.displayName = 'MatchStandingsCard'
