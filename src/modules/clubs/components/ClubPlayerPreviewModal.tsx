import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  X,
  ExternalLink,
  Shield,
  Calendar,
  MapPin,
  Activity,
  Trophy,
  Target,
  User,
  Footprints,
  Maximize2,
} from 'lucide-react'
import { resolveMediaUrl } from '@/lib/media'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ClubMember, ClubSquadMember } from '@/modules/clubs/types'
import { usePlayer } from '@/modules/players/hooks/usePlayerQueries'
import { getPositionAccentColor, getStatusBadgeConfig } from './ClubSquadPlayerCard'

interface ClubPlayerPreviewModalProps {
  player: ClubSquadMember | ClubMember | null
  isOpen: boolean
  clubName?: string
  onClose: () => void
}

function calculateAge(dob?: string | null): number | null {
  if (!dob) return null
  const birthDate = new Date(dob)
  if (Number.isNaN(birthDate.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

function formatPreferredFoot(foot?: string | null): string {
  if (!foot) return 'Não especificado'
  const f = foot.toLowerCase()
  if (f === 'right' || f === 'direito') return 'Destro'
  if (f === 'left' || f === 'esquerdo') return 'Canhoto'
  if (f === 'both' || f === 'ambos') return 'Ambidestro'
  return foot
}

export function ClubPlayerPreviewModal({
  player,
  isOpen,
  clubName,
  onClose,
}: ClubPlayerPreviewModalProps) {
  const [imgError, setImgError] = useState(false)

  // Listen to Escape key to close
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Extract slug if available to optionally fetch richer player profile
  const playerSlug = useMemo(() => {
    if (!player) return ''
    if ('player_slug' in player && player.player_slug) return player.player_slug
    return ''
  }, [player])

  const { data: fullPlayerProfile } = usePlayer(playerSlug)

  if (!isOpen || !player) return null

  const name =
    fullPlayerProfile?.full_name ||
    ('display_name' in player && player.display_name) ||
    ('full_name' in player && player.full_name) ||
    'Sem Nome'

  const initials = (() => {
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  })()

  const jerseyNumber =
    player.jersey_number ??
    fullPlayerProfile?.shirt_number ??
    null

  const positionLabel =
    player.position_label ||
    player.position ||
    fullPlayerProfile?.position_label ||
    fullPlayerProfile?.primary_position ||
    'Posição Indefinida'

  const positionColor = getPositionAccentColor(player.position || player.position_label)

  const rawAvatar =
    fullPlayerProfile?.avatar ||
    fullPlayerProfile?.profile_photo_url ||
    player.avatar ||
    null
  const avatarUrl = resolveMediaUrl(rawAvatar)

  const rawStatus = 'status' in player ? player.status : undefined
  const isActive = 'is_active' in player ? player.is_active : true
  const statusConfig = getStatusBadgeConfig(rawStatus, isActive)
  const statusLabel =
    'status_label' in player && player.status_label
      ? player.status_label
      : statusConfig.label

  const joinedDateFormatted = (() => {
    if (!player.joined_at) return 'N/A'
    const d = new Date(player.joined_at)
    return Number.isNaN(d.getTime()) ? player.joined_at : d.toLocaleDateString('pt-AO')
  })()

  // Physical and personal traits
  const nationality =
    ('nationality' in player && player.nationality) ||
    fullPlayerProfile?.nationality ||
    'Não informada'

  const dob =
    ('date_of_birth' in player && player.date_of_birth) ||
    fullPlayerProfile?.date_of_birth ||
    null

  const age =
    fullPlayerProfile?.age ??
    calculateAge(dob)

  const heightCm =
    ('height_cm' in player && player.height_cm) ||
    fullPlayerProfile?.height_cm ||
    null

  const weightKg =
    ('weight_kg' in player && player.weight_kg) ||
    fullPlayerProfile?.weight_kg ||
    null

  const preferredFoot = formatPreferredFoot(
    ('foot' in player && player.foot) ||
    fullPlayerProfile?.foot
  )

  // Career / Club stats
  const matches =
    ('matches_played' in player && player.matches_played) ??
    fullPlayerProfile?.total_matches ??
    0

  const goals =
    ('goals' in player && player.goals) ??
    fullPlayerProfile?.total_goals ??
    0

  const assists =
    ('assists' in player && player.assists) ??
    fullPlayerProfile?.total_assists ??
    0

  const yellowCards =
    ('yellow_cards' in player && player.yellow_cards) ??
    0

  const redCards =
    ('red_cards' in player && player.red_cards) ??
    0

  const publicProfileSlug =
    playerSlug ||
    fullPlayerProfile?.slug ||
    ('player_id' in player && player.player_id ? player.player_id : null)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="player-preview-title"
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-w-xl max-h-[92vh] flex-col overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface shadow-2xl animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle tactical color bar */}
        <div
          className="h-1.5 w-full shrink-0"
          style={{
            background: `linear-gradient(90deg, ${positionColor}, ${positionColor}88 60%, transparent)`,
          }}
        />

        {/* Integrated Executive Header */}
        <div className="flex items-start justify-between gap-3 border-b border-outline-variant/20 p-4 sm:p-5 bg-surface-container/25">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Avatar Squircle */}
            <div
              className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-surface bg-surface-container-high shadow-md"
              style={{ backgroundColor: `${positionColor}18` }}
            >
              {avatarUrl && !imgError ? (
                <img
                  src={avatarUrl}
                  alt={name}
                  className="h-full w-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span
                  className="text-lg font-black select-none"
                  style={{ color: positionColor }}
                >
                  {initials}
                </span>
              )}
              {jerseyNumber !== null && (
                <span className="absolute bottom-0.5 right-0.5 rounded-md bg-black/80 px-1 py-0.2 text-[9px] font-black font-mono text-white">
                  #{jerseyNumber}
                </span>
              )}
            </div>

            {/* Info: Name, Badges, Dorsal */}
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge
                  variant="outline"
                  className="px-2 py-0 text-[11px] font-semibold capitalize"
                  style={{
                    borderColor: `${positionColor}60`,
                    color: positionColor,
                    backgroundColor: `${positionColor}15`,
                  }}
                >
                  {positionLabel}
                </Badge>

                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0 text-[11px] font-medium ${statusConfig.badgeClass}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotColor}`} />
                  {statusLabel}
                </span>

                {clubName && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-outline-variant/30 bg-surface-container px-2 py-0 text-[11px] font-medium text-on-surface">
                    <Shield className="h-3 w-3 text-primary" />
                    <span>{clubName}</span>
                  </span>
                )}
              </div>

              <h2
                id="player-preview-title"
                className="truncate text-lg font-bold tracking-tight text-on-surface sm:text-xl"
              >
                {name}
              </h2>

              <p className="text-[11px] text-on-surface-variant flex items-center gap-1.5">
                {jerseyNumber !== null ? (
                  <span className="font-mono font-bold text-on-surface">Dorsal #{jerseyNumber}</span>
                ) : (
                  <span>Sem dorsal atribuída</span>
                )}
                {age !== null && (
                  <>
                    <span>•</span>
                    <span>{age} anos</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
            aria-label="Fechar prévia"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Compact Performance Metrics Strip */}
        <div className="grid grid-cols-4 gap-2 px-4 pt-3.5 sm:px-5">
          <div className="rounded-xl border border-outline-variant/25 bg-surface-container-low p-2 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] text-on-surface-variant">
              <User className="h-3 w-3 text-blue-500" />
              <span>Partidas</span>
            </div>
            <p className="mt-0.5 text-base font-bold text-on-surface">{matches}</p>
          </div>

          <div className="rounded-xl border border-outline-variant/25 bg-surface-container-low p-2 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] text-on-surface-variant">
              <Trophy className="h-3 w-3 text-amber-500" />
              <span>Golos</span>
            </div>
            <p className="mt-0.5 text-base font-bold text-on-surface">{goals}</p>
          </div>

          <div className="rounded-xl border border-outline-variant/25 bg-surface-container-low p-2 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] text-on-surface-variant">
              <Target className="h-3 w-3 text-emerald-500" />
              <span>Assistências</span>
            </div>
            <p className="mt-0.5 text-base font-bold text-on-surface">{assists}</p>
          </div>

          <div className="rounded-xl border border-outline-variant/25 bg-surface-container-low p-2 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] text-on-surface-variant">
              <Activity className="h-3 w-3 text-rose-500" />
              <span>Cartões</span>
            </div>
            <p className="mt-0.5 text-[11px] font-semibold text-on-surface leading-normal">
              <span className="text-amber-600 font-bold">{yellowCards} Am.</span>
              <span className="mx-1 text-on-surface-variant/40">•</span>
              <span className="text-rose-600 font-bold">{redCards} Verm.</span>
            </p>
          </div>
        </div>

        {/* Modal Body: Ficha Técnica & Vínculo */}
        <div className="flex-1 overflow-y-auto px-4 py-3 sm:px-5 space-y-3">
          {/* Ficha Técnica: 2x2 Grid */}
          <div className="rounded-xl border border-outline-variant/25 bg-surface-container-low/60 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">
              Ficha Técnica & Biometria
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 rounded-lg bg-surface-container/60 p-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-on-surface-variant">Nacionalidade</p>
                  <p className="font-semibold text-on-surface truncate">{nationality}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-surface-container/60 p-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Calendar className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-on-surface-variant">Idade / Nascimento</p>
                  <p className="font-semibold text-on-surface truncate">
                    {age !== null ? `${age} anos` : 'Idade N/D'}
                    {dob && <span className="ml-1 text-[10px] font-normal text-on-surface-variant">({dob})</span>}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-surface-container/60 p-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Footprints className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-on-surface-variant">Pé Preferido</p>
                  <p className="font-semibold text-on-surface truncate">{preferredFoot}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-surface-container/60 p-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Maximize2 className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-on-surface-variant">Altura / Peso</p>
                  <p className="font-semibold text-on-surface truncate">
                    {heightCm ? `${heightCm} cm` : '—'} / {weightKg ? `${weightKg} kg` : '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Vínculo Federativo: 3 Colunas */}
          <div className="rounded-xl border border-outline-variant/25 bg-surface-container-low/60 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">
              Vínculo Federativo no Clube
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="rounded-lg bg-surface-container/60 p-2">
                <p className="text-[10px] text-on-surface-variant">Data de Entrada</p>
                <p className="font-semibold text-on-surface mt-0.5">{joinedDateFormatted}</p>
              </div>
              <div className="rounded-lg bg-surface-container/60 p-2">
                <p className="text-[10px] text-on-surface-variant">Dorsal Atribuída</p>
                <p className="font-semibold text-on-surface font-mono mt-0.5">
                  {jerseyNumber !== null ? `#${jerseyNumber}` : 'Sem número oficial'}
                </p>
              </div>
              <div className="rounded-lg bg-surface-container/60 p-2">
                <p className="text-[10px] text-on-surface-variant">Condição no Plantel</p>
                <p className="font-semibold text-on-surface mt-0.5">{statusLabel}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="flex items-center justify-between border-t border-outline-variant/20 bg-surface-container-low/80 px-4 py-2.5 sm:px-5">
          <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
            Fechar
          </Button>

          {publicProfileSlug ? (
            <Button asChild size="sm" variant="primary" className="h-8 text-xs">
              <Link to={`/players/${publicProfileSlug}`}>
                <span>Ver Perfil Completo</span>
                <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          ) : (
            <span className="text-[11px] text-on-surface-variant">Perfil público em processamento</span>
          )}
        </div>
      </div>
    </div>
  )
}
