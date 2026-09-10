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
  Weight,
} from 'lucide-react'
import { resolveMediaUrl } from '@/lib/media'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="player-preview-title"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-outline-variant/30 bg-surface shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top color header banner */}
        <div
          className="relative h-28 w-full shrink-0 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${positionColor}dd, ${positionColor}44), #0f172a`,
          }}
        >
          {/* Subtle dorsal watermark */}
          {jerseyNumber !== null && (
            <span className="absolute -right-2 -top-6 select-none font-mono text-8xl font-black text-white/10">
              #{jerseyNumber}
            </span>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white/90 backdrop-blur-md transition-colors hover:bg-black/60 hover:text-white"
            aria-label="Fechar prévia"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body with Scroll */}
        <div className="flex-1 overflow-y-auto px-lg pb-lg">
          {/* Hero Identity Section */}
          <div className="relative -mt-12 flex flex-col items-start gap-md sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-md">
              {/* Avatar container */}
              <div
                className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border-4 border-surface bg-surface-container-high shadow-lg"
                style={{
                  backgroundColor: `${positionColor}20`,
                }}
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
                    className="text-2xl font-black select-none"
                    style={{ color: positionColor }}
                  >
                    {initials}
                  </span>
                )}
                {jerseyNumber !== null && (
                  <span className="absolute bottom-1 right-1 rounded-md bg-black/75 px-1.5 py-0.5 text-[10px] font-black font-mono text-white shadow-xs">
                    #{jerseyNumber}
                  </span>
                )}
              </div>

              {/* Title & Roles */}
              <div className="space-y-1">
                <h2
                  id="player-preview-title"
                  className="text-xl font-bold tracking-tight text-on-surface sm:text-2xl"
                >
                  {name}
                </h2>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className="px-2.5 py-0.5 text-xs font-semibold capitalize"
                    style={{
                      borderColor: `${positionColor}60`,
                      color: positionColor,
                      backgroundColor: `${positionColor}15`,
                    }}
                  >
                    {positionLabel}
                  </Badge>

                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusConfig.badgeClass}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotColor}`} />
                    {statusLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Club Tag */}
            {clubName && (
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant/30 bg-surface-container px-3 py-1.5 text-xs font-medium text-on-surface">
                <Shield className="h-3.5 w-3.5 text-primary" />
                <span>{clubName}</span>
              </div>
            )}
          </div>

          {/* Quick Stats Grid */}
          <div className="mt-lg grid grid-cols-2 gap-sm sm:grid-cols-4">
            <Card variant="flat" padding="sm" className="text-center bg-surface-container/60 border-outline-variant/20">
              <div className="flex items-center justify-center gap-1 text-xs text-on-surface-variant">
                <User className="h-3.5 w-3.5 text-blue-500" />
                <span>Partidas</span>
              </div>
              <p className="mt-1 text-xl font-black text-on-surface">{matches}</p>
            </Card>

            <Card variant="flat" padding="sm" className="text-center bg-surface-container/60 border-outline-variant/20">
              <div className="flex items-center justify-center gap-1 text-xs text-on-surface-variant">
                <Trophy className="h-3.5 w-3.5 text-amber-500" />
                <span>Golos</span>
              </div>
              <p className="mt-1 text-xl font-black text-on-surface">{goals}</p>
            </Card>

            <Card variant="flat" padding="sm" className="text-center bg-surface-container/60 border-outline-variant/20">
              <div className="flex items-center justify-center gap-1 text-xs text-on-surface-variant">
                <Target className="h-3.5 w-3.5 text-emerald-500" />
                <span>Assistências</span>
              </div>
              <p className="mt-1 text-xl font-black text-on-surface">{assists}</p>
            </Card>

            <Card variant="flat" padding="sm" className="text-center bg-surface-container/60 border-outline-variant/20">
              <div className="flex items-center justify-center gap-1 text-xs text-on-surface-variant">
                <Activity className="h-3.5 w-3.5 text-rose-500" />
                <span>Cartões</span>
              </div>
              <p className="mt-1 text-xs font-semibold text-on-surface">
                <span className="text-amber-500 font-bold">{yellowCards} Am.</span>
                <span className="mx-1 text-on-surface-variant/40">•</span>
                <span className="text-rose-500 font-bold">{redCards} Verm.</span>
              </p>
            </Card>
          </div>

          {/* Section: Dados Pessoais & Físicos */}
          <div className="mt-lg space-y-md">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Ficha Técnica e Dados Pessoais
            </h3>

            <div className="grid gap-sm sm:grid-cols-2">
              <div className="flex items-center gap-md rounded-2xl border border-outline-variant/20 bg-surface-container-low p-md">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">Nacionalidade</p>
                  <p className="text-sm font-semibold text-on-surface">{nationality}</p>
                </div>
              </div>

              <div className="flex items-center gap-md rounded-2xl border border-outline-variant/20 bg-surface-container-low p-md">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">Idade / Nascimento</p>
                  <p className="text-sm font-semibold text-on-surface">
                    {age !== null ? `${age} anos` : 'Idade N/D'}
                    {dob && <span className="ml-1 text-xs font-normal text-on-surface-variant">({dob})</span>}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-md rounded-2xl border border-outline-variant/20 bg-surface-container-low p-md">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Footprints className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">Pé Preferido</p>
                  <p className="text-sm font-semibold text-on-surface">{preferredFoot}</p>
                </div>
              </div>

              <div className="flex items-center gap-md rounded-2xl border border-outline-variant/20 bg-surface-container-low p-md">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Maximize2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">Altura / Peso</p>
                  <p className="text-sm font-semibold text-on-surface">
                    {heightCm ? `${heightCm} cm` : '—'} / {weightKg ? `${weightKg} kg` : '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Vínculo com o Clube */}
          <div className="mt-lg space-y-md">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              Vínculo Federativo no Clube
            </h3>

            <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-md space-y-sm">
              <div className="flex items-center justify-between text-sm">
                <span className="text-on-surface-variant">Data de Entrada:</span>
                <span className="font-semibold text-on-surface">{joinedDateFormatted}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-on-surface-variant">Dorsal Atribuída:</span>
                <span className="font-semibold text-on-surface font-mono">
                  {jerseyNumber !== null ? `#${jerseyNumber}` : 'Sem número oficial'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-on-surface-variant">Condição no Plantel:</span>
                <span className="font-semibold text-on-surface">{statusLabel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="flex items-center justify-between border-t border-outline-variant/20 bg-surface-container-low/80 px-lg py-md">
          <Button variant="outline" size="sm" onClick={onClose}>
            Fechar
          </Button>

          {publicProfileSlug ? (
            <Button asChild size="sm" variant="primary">
              <Link to={`/players/${publicProfileSlug}`}>
                <span>Ver Perfil Completo</span>
                <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          ) : (
            <span className="text-xs text-on-surface-variant">Perfil público em processamento</span>
          )}
        </div>
      </div>
    </div>
  )
}
