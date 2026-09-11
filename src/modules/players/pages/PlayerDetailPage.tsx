import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Calendar, MapPin } from 'lucide-react'
import { resolveMediaUrl } from '@/lib/media'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { NotFound, ServerError } from '@/components/ui/error-states'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import {
  SportDetailLayout,
  SportEntityHeader,
  SportTabs,
  SportTabsList,
  SportTabsTrigger,
  SportTabsContent,
} from '@/modules/shared/components/sport'
import {
  PlayerAchievementsTab,
  PlayerCareerTimeline,
  PlayerDocumentsTab,
  PlayerInfoSidebar,
  PlayerMatchesTab,
  PlayerStatisticsTab,
  PlayerVideosTab,
} from '../components'
import { MediaGalleryTab } from '@/modules/media_manager/components'
import { usePlayer } from '../hooks'
import { useSeo } from '@/hooks/useSeo'
import { POSITION_COLOR, STATUS_COLOR } from '../constants'
import { playerRoutes } from '../routes'

function PlayerBreadcrumb({ current = 'Detalhe' }: { current?: string }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-xs text-sm text-on-surface-variant">
      <Link to={playerRoutes.list} className="hover:text-primary">Jogadores</Link>
      <span aria-hidden="true">/</span>
      <span aria-current="page" className="truncate text-on-surface">{current}</span>
    </nav>
  )
}

export function PlayerDetailPage() {
  const { t } = useTranslation()
  const { slug = '' } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    setImgError(false)
  }, [slug])

  const { data: player, isLoading, isError, refetch } = usePlayer(slug)
  useSeo({
    title: player?.full_name ? `${player.full_name} — Jogador` : 'Perfil do jogador',
    description: player?.bio || 'Consulte o perfil, carreira, desempenho e conquistas deste jogador.',
    path: `/players/${slug}`,
  })

  // --- Loading state ---
  if (isLoading) {
    return (
      <SportDetailLayout
        breadcrumb={<PlayerBreadcrumb current="A carregar..." />}
        header={<PageSkeleton variant="detail" />}
        main={<div />}
        sidebar={<div />}
      />
    )
  }

  // --- Error state ---
  if (isError) {
    return (
      <SportDetailLayout
        breadcrumb={<PlayerBreadcrumb />}
        header={<ServerError onRetry={() => refetch()} />}
        main={<div />}
        sidebar={<div />}
      />
    )
  }

  if (!player) {
    return (
      <SportDetailLayout
        breadcrumb={<PlayerBreadcrumb />}
        header={<NotFound resourceName="jogador" onAction={() => navigate(playerRoutes.list)} />}
        main={<div />}
        sidebar={<div />}
      />
    )
  }

  const positionColor = POSITION_COLOR[player.primary_position] ?? '#6b7280'
  const initials = `${player.first_name?.[0] ?? ''}${player.last_name?.[0] ?? ''}`.toUpperCase() || '?'
  const avatarUrl = resolveMediaUrl(player.avatar || player.profile_photo_url)

  return (
    <SportDetailLayout
      breadcrumb={<PlayerBreadcrumb current={player.full_name} />}
      header={
        <SportEntityHeader
          visual={
            <div
              className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 text-xl font-bold text-white shadow-md"
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
          }
          title={player.full_name}
          subtitle={player.bio || 'Perfil público do jogador.'}
          chips={[
            { label: player.position_label },
            { label: player.status_label },
            ...(player.nationality ? [{ icon: MapPin, label: player.nationality }] : []),
            ...(player.current_club ? [{ label: player.current_club.name }] : []),
            ...(player.age ? [{ icon: Calendar, label: t('players.common.years', { count: player.age }) }] : []),
          ]}
          actions={
            <div className="flex flex-wrap gap-sm">
              <button
                className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant/20 bg-surface-container px-3 py-1.5 text-xs font-medium text-on-surface-variant hover:bg-surface-container-high transition-colors"
                onClick={() => navigator.clipboard?.writeText(window.location.href)}
              >
                Partilhar
              </button>
            </div>
          }
        />
      }
      main={
        <SportTabs defaultValue="matches">
          <SportTabsList>
            <SportTabsTrigger value="matches">Jogos</SportTabsTrigger>
            <SportTabsTrigger value="career">{t('players.detail.tabs.career')}</SportTabsTrigger>
            <SportTabsTrigger value="statistics">Desempenho</SportTabsTrigger>
            <SportTabsTrigger value="achievements">{t('players.detail.tabs.achievements')}</SportTabsTrigger>
            <SportTabsTrigger value="videos">{t('players.detail.tabs.videos')}</SportTabsTrigger>
            <SportTabsTrigger value="gallery">Galeria</SportTabsTrigger>
          </SportTabsList>

          <SportTabsContent value="matches">
            <PlayerMatchesTab
              playerSlug={slug}
              currentClubSlug={player.current_club?.slug}
            />
          </SportTabsContent>

          <SportTabsContent value="career">
            <Card variant="flat" padding="none">
              <CardHeader>
                <CardTitle>{t('players.detail.careerHistory')}</CardTitle>
              </CardHeader>
              <CardContent>
                <PlayerCareerTimeline career={player.career_history ?? []} />
              </CardContent>
            </Card>
          </SportTabsContent>

          <SportTabsContent value="statistics">
            <PlayerStatisticsTab slug={slug} />
          </SportTabsContent>

          <SportTabsContent value="achievements">
            <PlayerAchievementsTab slug={slug} fallbackAchievements={player.achievements ?? []} />
          </SportTabsContent>

          <SportTabsContent value="videos">
            <PlayerVideosTab slug={slug} fallbackVideos={player.videos ?? []} />
          </SportTabsContent>

          <SportTabsContent value="gallery">
            <MediaGalleryTab
              ownerType="player"
              ownerId={player.id}
              title={`Galeria de Fotos • ${player.full_name}`}
              emptyTitle="Sem fotos na galeria"
              emptyDescription="Este jogador ainda não adicionou fotos públicas à sua galeria."
            />
          </SportTabsContent>
        </SportTabs>
      }
      sidebar={
        <PlayerInfoSidebar player={player} />
      }
    />
  )
}
