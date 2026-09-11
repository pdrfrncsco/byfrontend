import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Shield } from 'lucide-react'
import { resolveMediaUrl } from '@/lib/media'
import { POSITION_COLOR } from '../constants'
import type { Player } from '../types'

export interface PlayerCardCompactProps {
  player: Player
}

export function PlayerCardCompact({ player }: PlayerCardCompactProps) {
  const [imgError, setImgError] = useState(false)
  const initials = `${player.first_name?.[0] ?? ''}${player.last_name?.[0] ?? ''}`.toUpperCase() || '?'
  const positionColor = POSITION_COLOR[player.primary_position] ?? '#6b7280'
  const avatarUrl = resolveMediaUrl(player.avatar || player.profile_photo_url)

  return (
    <Link
      to={`/players/${player.slug}`}
      className="group flex items-center justify-between gap-md rounded-xl border border-outline-variant/20 bg-surface-container p-md transition-all duration-200 hover:border-primary/40 hover:bg-surface-container-high hover:shadow-md"
    >
      <div className="flex items-center gap-md min-w-0">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 text-xs font-bold text-white shadow-sm"
          style={{ borderColor: positionColor, background: positionColor }}
        >
          {avatarUrl && !imgError ? (
            <img
              src={avatarUrl}
              alt={player.full_name}
              className="h-full w-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            initials
          )}
        </div>

        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-2">
            <h4 className="truncate font-semibold text-sm text-on-surface group-hover:text-primary transition-colors">
              {player.full_name}
            </h4>
            {player.shirt_number != null && (
              <span className="text-[11px] font-semibold text-on-surface-variant">
                #{player.shirt_number}
              </span>
            )}
          </div>

          <div className="flex items-center gap-xs text-xs text-on-surface-variant truncate">
            <span
              className="inline-flex items-center gap-1 font-medium"
              style={{ color: positionColor }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: positionColor }} />
              {player.position_label}
            </span>

            {player.current_club && (
              <>
                <span>•</span>
                <span className="flex items-center gap-0.5 truncate">
                  <Shield className="h-3 w-3 shrink-0" />
                  {player.current_club.name}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-sm shrink-0">
        {player.age != null && (
          <span className="text-xs text-on-surface-variant hidden sm:inline">
            {player.age} anos
          </span>
        )}
        {player.nationality && (
          <span className="text-xs font-medium text-on-surface-variant hidden md:inline">
            {player.nationality}
          </span>
        )}
        <ChevronRight className="h-4 w-4 text-on-surface-variant group-hover:text-primary transition-colors" />
      </div>
    </Link>
  )
}
