import { useState, useMemo } from 'react'
import { Calendar, ChevronRight, MapPin } from 'lucide-react'
import { resolveMediaUrl } from '@/lib/media'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ClubMember, ClubSquadMember } from '@/modules/clubs/types'
import { POSITION_COLOR } from '@/modules/players/constants'

export function getPositionAccentColor(pos?: string | null): string {
  if (!pos) return '#64748b'
  const p = pos.toLowerCase()
  if (p in POSITION_COLOR) return POSITION_COLOR[p]
  if (p === 'gk' || p.includes('guarda') || p.includes('redes') || p.includes('goleiro')) return '#f59e0b'
  if (p === 'df' || p.includes('defesa') || p.includes('lateral') || p.includes('zagueiro') || p.includes('central')) return '#3b82f6'
  if (p === 'mf' || p.includes('médio') || p.includes('medio') || p.includes('campo') || p.includes('volante')) return '#10b981'
  if (p === 'fw' || p.includes('avan') || p.includes('atac') || p.includes('ponta') || p.includes('extremo')) return '#ef4444'
  return '#64748b'
}

export function getStatusBadgeConfig(status?: string | null, isActive?: boolean) {
  const s = (status || (isActive === false ? 'inactive' : 'registered')).toLowerCase()
  
  if (s === 'registered' || s === 'active' || s === 'ativo' || s === 'registado') {
    return {
      label: 'Ativo',
      dotColor: 'bg-emerald-500',
      badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    }
  }
  if (s === 'loaned' || s === 'emprestado' || s === 'loan') {
    return {
      label: 'Emprestado',
      dotColor: 'bg-blue-500',
      badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    }
  }
  if (s === 'suspended' || s === 'suspenso') {
    return {
      label: 'Suspenso',
      dotColor: 'bg-rose-500',
      badgeClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    }
  }
  return {
    label: 'Inativo',
    dotColor: 'bg-slate-400',
    badgeClass: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  }
}

interface ClubSquadPlayerCardProps {
  player: ClubSquadMember | ClubMember
  onClick?: (player: ClubSquadMember | ClubMember) => void
}

export function ClubSquadPlayerCard({ player, onClick }: ClubSquadPlayerCardProps) {
  const [imgError, setImgError] = useState(false)

  const name = useMemo(() => {
    if ('display_name' in player && player.display_name) return player.display_name
    if ('full_name' in player && player.full_name) return player.full_name
    return 'Sem Nome'
  }, [player])

  const initials = useMemo(() => {
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }, [name])

  const jerseyNumber = player.jersey_number ?? null

  const positionLabel = useMemo(() => {
    return player.position_label || player.position || 'Posição Indefinida'
  }, [player])

  const positionColor = useMemo(() => {
    return getPositionAccentColor(player.position || player.position_label)
  }, [player])

  const rawAvatar = player.avatar || null
  const avatarUrl = resolveMediaUrl(rawAvatar)

  const rawStatus = 'status' in player ? player.status : undefined
  const isActive = 'is_active' in player ? player.is_active : true
  const statusConfig = getStatusBadgeConfig(rawStatus, isActive)
  const statusLabel = ('status_label' in player && player.status_label) ? player.status_label : statusConfig.label

  const joinedDateFormatted = useMemo(() => {
    if (!player.joined_at) return null
    const d = new Date(player.joined_at)
    return Number.isNaN(d.getTime()) ? player.joined_at : d.toLocaleDateString('pt-AO')
  }, [player.joined_at])

  const nationality = 'nationality' in player ? player.nationality : null

  return (
    <Card
      variant="flat"
      padding="none"
      className="group relative cursor-pointer overflow-hidden border border-outline-variant/30 bg-surface-container/60 shadow-[0_4px_20px_-10px_rgba(15,17,23,0.12)] backdrop-blur-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-surface-container hover:shadow-[0_18px_35px_-15px_rgba(15,17,23,0.22)] focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
      onClick={() => onClick?.(player)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.(player)
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Ver detalhes de ${name}, dorsal #${jerseyNumber ?? 'N/A'}, posição ${positionLabel}`}
    >
      {/* Top tactical color line */}
      <div
        className="h-1 w-full transition-all duration-300 group-hover:h-1.5"
        style={{
          background: `linear-gradient(90deg, ${positionColor}, ${positionColor}66)`,
        }}
      />

      <CardContent className="p-lg">
        <div className="flex items-start gap-md">
          {/* Avatar container with status dot */}
          <div className="relative shrink-0">
            <div
              className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-outline-variant/40 shadow-inner transition-transform duration-300 group-hover:scale-105"
              style={{
                backgroundColor: `${positionColor}18`,
              }}
            >
              {avatarUrl && !imgError ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  className="h-full w-full object-cover"
                  onError={() => setImgError(true)}
                  loading="lazy"
                />
              ) : (
                <span
                  className="text-base font-bold select-none"
                  style={{ color: positionColor }}
                >
                  {initials}
                </span>
              )}
            </div>

            {/* Status dot on avatar */}
            <span
              className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-surface ${statusConfig.dotColor} shadow-xs`}
              title={`Estado: ${statusLabel}`}
            />
          </div>

          {/* Main Info */}
          <div className="min-w-0 flex-1 space-y-xs">
            {/* Header: Name + Dorsal Badge */}
            <div className="flex items-start justify-between gap-sm">
              <h3 className="truncate text-base font-bold text-on-surface transition-colors duration-200 group-hover:text-primary">
                {name}
              </h3>

              {jerseyNumber !== null && jerseyNumber !== undefined ? (
                <span
                  className="inline-flex shrink-0 items-center justify-center rounded-lg border border-outline-variant/30 bg-surface-container-high px-2 py-0.5 text-xs font-black font-mono tracking-tight text-on-surface shadow-2xs group-hover:border-primary/30 group-hover:bg-primary/10 group-hover:text-primary transition-colors"
                  title={`Dorsal #${jerseyNumber}`}
                >
                  #{jerseyNumber}
                </span>
              ) : (
                <span className="text-[11px] font-medium text-on-surface-variant/60">
                  —
                </span>
              )}
            </div>

            {/* Position and Status Badges */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <Badge
                variant="outline"
                className="px-2 py-0 text-[11px] font-semibold tracking-wide capitalize"
                style={{
                  borderColor: `${positionColor}40`,
                  color: positionColor,
                  backgroundColor: `${positionColor}12`,
                }}
              >
                {positionLabel}
              </Badge>

              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0 text-[10px] font-medium ${statusConfig.badgeClass}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotColor}`} />
                {statusLabel}
              </span>
            </div>

            {/* Micro Details (Joined date / Nationality) */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-xs text-on-surface-variant">
              {joinedDateFormatted && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3 opacity-70" aria-hidden="true" />
                  <span>Entrada: {joinedDateFormatted}</span>
                </span>
              )}

              {nationality && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3 opacity-70" aria-hidden="true" />
                  <span>{nationality}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action footer link */}
        <div className="mt-md flex items-center justify-between border-t border-outline-variant/15 pt-sm text-xs font-medium text-on-surface-variant group-hover:text-primary transition-colors">
          <span>Ver ficha do atleta</span>
          <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </div>
      </CardContent>
    </Card>
  )
}
