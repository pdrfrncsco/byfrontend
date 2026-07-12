import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Activity,
  Award,
  ExternalLink,
  FileText,
  LayoutDashboard,
  Settings,
  Sparkles,
  Target,
  Trophy,
  Video,
} from 'lucide-react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { ROUTES } from '@/constants/routes'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui'
import { EmptyState } from '@/components/ui/empty-state'
import {
  PlayerAchievementsTab,
  PlayerCareerTimeline,
  PlayerDocumentsTab,
  PlayerVideosTab,
} from '../components'
import { usePlayerMe } from '../hooks'
import { playerRoutes } from '../routes'
import { POSITION_COLOR } from '../constants'

export function PlayerDashboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: player, isLoading, isError } = usePlayerMe()

  const sidebarLinks = [
    { label: t('players.dashboard.sidebar.general'), href: playerRoutes.dashboard, icon: <LayoutDashboard className="h-4 w-4" />, active: true },
    { label: t('players.dashboard.sidebar.settings'), href: playerRoutes.dashboardSettings, icon: <Settings className="h-4 w-4" /> },
    { label: t('players.dashboard.sidebar.publicProfile'), href: player ? playerRoutes.detail(player.slug) : ROUTES.PLAYERS, icon: <ExternalLink className="h-4 w-4" /> },
  ]

  if (isLoading) {
    return (
      <DashboardLayout
        title={t('players.dashboard.title')}
        subtitle={t('players.dashboard.loading')}
        dashboardType="player"
        sidebarLinks={sidebarLinks}
      >
        <div className="space-y-lg">
          <Skeleton className="h-52 w-full rounded-[2rem]" />
          <div className="grid gap-md md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-28 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (isError || !player) {
    return (
      <DashboardLayout
        title={t('players.dashboard.title')}
        subtitle={t('players.dashboard.subtitle')}
        dashboardType="player"
        sidebarLinks={sidebarLinks}
      >
        <EmptyState
          icon={Sparkles}
          title={t('players.dashboard.notFoundTitle')}
          description={t('players.dashboard.notFoundDescription')}
          action={{
            label: t('players.dashboard.explorePlayers'),
            onClick: () => navigate(ROUTES.PLAYERS),
            variant: 'secondary',
          }}
        />
      </DashboardLayout>
    )
  }

  const positionColor = POSITION_COLOR[player.primary_position] ?? '#94d3c1'
  const initials = `${player.first_name?.[0] ?? ''}${player.last_name?.[0] ?? ''}`.toUpperCase() || '?'

  return (
    <DashboardLayout
      title={t('players.dashboard.titleWithName', { name: player.full_name })}
      subtitle={t('players.dashboard.subtitleActive')}
      dashboardType="player"
      sidebarLinks={sidebarLinks}
      headerActions={
        <Button asChild variant="primary" size="sm">
          <Link to={playerRoutes.dashboardSettings}>
            <Settings className="h-4 w-4" />
            {t('players.dashboard.editProfile')}
          </Link>
        </Button>
      }
    >
      <div className="space-y-xl">
        <Card variant="flat" padding="none">
          <CardContent className="grid gap-lg p-xl lg:grid-cols-[auto_1fr_auto] lg:items-center">
            <div
              className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl text-3xl font-bold text-on-primary shadow-lg"
              style={{ background: positionColor }}
            >
              {player.avatar ? (
                <img src={player.avatar} alt={player.full_name} className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="space-y-sm">
              <div className="flex flex-wrap items-center gap-sm">
                <h3 className="text-2xl font-bold text-on-surface">{player.full_name}</h3>
                <Badge variant="outline">{player.position_label}</Badge>
                <Badge variant="secondary">{player.status_label}</Badge>
              </div>
              {player.current_club && (
                <p className="text-sm text-on-surface-variant">
                  {t('players.dashboard.currentClub')}: <span className="font-semibold text-on-surface">{player.current_club.name}</span>
                </p>
              )}
              {player.bio && <p className="max-w-3xl text-sm leading-6 text-on-surface-variant">{player.bio}</p>}
            </div>
            <Button asChild variant="secondary">
              <Link to={playerRoutes.detail(player.slug)}>
                {t('players.dashboard.publicProfile')}
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-md sm:grid-cols-2 xl:grid-cols-4">
          <Card variant="flat" padding="none">
            <CardContent className="space-y-xs p-lg">
              <Activity className="h-5 w-5 text-primary" />
              <p className="text-xs uppercase tracking-wide text-on-surface-variant">{t('players.dashboard.stats.matches')}</p>
              <p className="text-3xl font-bold text-on-surface">{player.total_matches}</p>
            </CardContent>
          </Card>
          <Card variant="flat" padding="none">
            <CardContent className="space-y-xs p-lg">
              <Trophy className="h-5 w-5 text-amber-400" />
              <p className="text-xs uppercase tracking-wide text-on-surface-variant">{t('players.dashboard.stats.goals')}</p>
              <p className="text-3xl font-bold text-on-surface">{player.total_goals}</p>
            </CardContent>
          </Card>
          <Card variant="flat" padding="none">
            <CardContent className="space-y-xs p-lg">
              <Target className="h-5 w-5 text-emerald-400" />
              <p className="text-xs uppercase tracking-wide text-on-surface-variant">{t('players.dashboard.stats.assists')}</p>
              <p className="text-3xl font-bold text-on-surface">{player.total_assists}</p>
            </CardContent>
          </Card>
          <Card variant="flat" padding="none">
            <CardContent className="space-y-xs p-lg">
              <Award className="h-5 w-5 text-primary" />
              <p className="text-xs uppercase tracking-wide text-on-surface-variant">{t('players.dashboard.stats.achievements')}</p>
              <p className="text-3xl font-bold text-on-surface">{player.achievements?.length ?? 0}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-lg xl:grid-cols-2">
          <Card variant="flat" padding="none">
            <CardHeader>
              <CardTitle>{t('players.detail.tabs.career')}</CardTitle>
            </CardHeader>
            <CardContent>
              <PlayerCareerTimeline career={player.career_history ?? []} />
            </CardContent>
          </Card>

          <Card variant="flat" padding="none">
            <CardHeader>
              <CardTitle className="flex items-center gap-sm">
                <FileText className="h-5 w-5" />
                {t('players.dashboard.recentDocuments')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PlayerDocumentsTab slug={player.slug} fallbackDocuments={player.documents ?? []} />
            </CardContent>
          </Card>

          <Card variant="flat" padding="none">
            <CardHeader>
              <CardTitle className="flex items-center gap-sm">
                <Video className="h-5 w-5" />
                {t('players.detail.tabs.videos')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PlayerVideosTab slug={player.slug} fallbackVideos={player.videos ?? []} />
            </CardContent>
          </Card>

          <Card variant="flat" padding="none">
            <CardHeader>
              <CardTitle className="flex items-center gap-sm">
                <Trophy className="h-5 w-5" />
                {t('players.detail.tabs.achievements')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PlayerAchievementsTab slug={player.slug} fallbackAchievements={player.achievements ?? []} />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
