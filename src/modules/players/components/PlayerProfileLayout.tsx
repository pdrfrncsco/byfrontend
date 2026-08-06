import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { PlayerDetail } from '../types'
import { PlayerLinkStatusBadge } from './PlayerLinkStatusBadge'

interface PlayerProfileLayoutProps {
  player: PlayerDetail
  children?: ReactNode
  headerActions?: ReactNode
  isEditable?: boolean
}

export function PlayerProfileLayout({
  player,
  children,
  headerActions,
}: PlayerProfileLayoutProps) {
  const initials = `${player.first_name?.[0] ?? ''}${player.last_name?.[0] ?? ''}`.toUpperCase() || '?'

  return (
    <div className="space-y-lg">
      {/* Header Banner */}
      <Card variant="glass" padding="none" className="overflow-hidden border-outline-variant/25">
        <div className="h-24 w-full bg-gradient-to-r from-primary/20 via-primary-container/10 to-surface-container" />
        <CardContent className="px-lg pb-lg -mt-12">
          <div className="flex flex-col gap-md sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-md">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-4 border-background bg-primary text-2xl font-bold text-on-primary shadow-lg">
                {player.avatar ? (
                  <img src={player.avatar} alt={player.full_name} className="h-full w-full rounded-xl object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="space-y-xs pb-xs">
                <div className="flex flex-wrap items-center gap-xs">
                  <h1 className="text-2xl font-bold text-on-surface">{player.full_name}</h1>
                  <PlayerLinkStatusBadge status={player.current_club ? 'active' : 'none'} />
                </div>
                <div className="flex flex-wrap items-center gap-sm text-sm text-on-surface-variant">
                  <Badge variant="outline">{player.position_label}</Badge>
                  {player.current_club && (
                    <span className="font-semibold text-primary">
                      Clube: {player.current_club.name}
                    </span>
                  )}
                  {player.nationality && <span>• {player.nationality}</span>}
                </div>
              </div>
            </div>

            {headerActions && <div className="flex items-center gap-sm pb-xs">{headerActions}</div>}
          </div>

          {/* Quick Stats bar */}
          <div className="mt-lg grid grid-cols-3 gap-sm rounded-xl bg-surface-container-low p-sm text-center border border-outline-variant/15">
            <div>
              <p className="text-xs text-on-surface-variant">Partidas</p>
              <p className="text-lg font-bold text-on-surface">{player.total_matches}</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant">Gols</p>
              <p className="text-lg font-bold text-primary">{player.total_goals}</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant">Assistências</p>
              <p className="text-lg font-bold text-on-surface">{player.total_assists}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content / Tabs */}
      {children}
    </div>
  )
}
