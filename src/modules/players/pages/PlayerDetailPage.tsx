import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Activity, Calendar, MapPin, Ruler, Star, Target, Trophy, User, Weight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { NotFound, ServerError } from '@/components/ui/error-states'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import { DetailHeroCard } from '@/modules/shared/components/DetailHeroCard'
import {
  PlayerAchievementsTab,
  PlayerCareerTimeline,
  PlayerDocumentsTab,
  PlayerStatisticsTab,
  PlayerVideosTab,
} from '../components'
import { usePlayer } from '../hooks'
import { useSeo } from '@/hooks/useSeo'
import { POSITION_COLOR, STATUS_COLOR } from '../constants'
import { playerRoutes } from '../routes'

function DetailStat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  color?: string
}) {
  return (
    <div className="rounded-2xl border border-outline-variant/20 bg-surface-container p-md">
      <div
        className="mb-sm inline-flex rounded-xl p-sm"
        style={color ? { color, background: `${color}1a` } : undefined}
      >
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">{label}</p>
      <p className="mt-1 text-2xl font-bold text-on-surface">{value}</p>
    </div>
  )
}

function PlayerBreadcrumb({ current = 'Detalhe' }: { current?: string }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-xl flex items-center gap-xs text-sm text-on-surface-variant">
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
  const { data: player, isLoading, isError, refetch } = usePlayer(slug)
  useSeo({
    title: player?.full_name ? `${player.full_name} — Jogador` : 'Perfil do jogador',
    description: player?.bio || 'Consulte o perfil, carreira, desempenho e conquistas deste jogador.',
    path: `/players/${slug}`,
  })

  if (isLoading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-background text-on-surface">
        <div className="mx-auto max-w-6xl px-md py-xl sm:px-xl space-y-xl relative z-10">
          <PlayerBreadcrumb current="A carregar..." />
          <PageSkeleton variant="detail" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-background text-on-surface">
        <div className="mx-auto max-w-6xl px-md py-xl sm:px-xl space-y-xl relative z-10">
          <PlayerBreadcrumb />
          <ServerError onRetry={() => refetch()} />
        </div>
      </div>
    )
  }

  if (!player) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-background text-on-surface">
        <div className="mx-auto max-w-6xl px-md py-xl sm:px-xl space-y-xl relative z-10">
          <PlayerBreadcrumb />
          <NotFound resourceName="jogador" onAction={() => navigate(playerRoutes.list)} />
        </div>
      </div>
    )
  }

  const positionColor = POSITION_COLOR[player.primary_position] ?? '#6b7280'
  const statusColor = STATUS_COLOR[player.status] ?? '#6b7280'
  const initials = `${player.first_name?.[0] ?? ''}${player.last_name?.[0] ?? ''}`.toUpperCase() || '?'

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-on-surface">
      <div className="pointer-events-none absolute -top-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-600/20 blur-3xl" />

      <div className="mx-auto max-w-6xl px-md py-xl sm:px-xl space-y-xl relative z-10">
        <PlayerBreadcrumb current={player.full_name} />

        <DetailHeroCard
          eyebrow="Jogador público"
          title={player.full_name}
          description={player.bio || 'Perfil público do jogador com estatísticas, posição, clube atual e evolução na carreira.'}
          visual={
            <div
              className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[1.5rem] border-2 text-2xl font-bold text-on-primary shadow-[0_16px_28px_rgba(15,23,42,0.12)]"
              style={{ borderColor: positionColor, background: positionColor }}
            >
              {player.avatar ? (
                <img src={player.avatar} alt={player.full_name} className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>
          }
          chips={[
            { label: player.position_label },
            { label: player.status_label },
            ...(player.nationality ? [{ icon: MapPin, label: player.nationality }] : []),
            ...(player.current_club ? [{ label: player.current_club.name }] : []),
            ...(player.age ? [{ icon: Calendar, label: t('players.common.years', { count: player.age }) }] : []),
          ]}
          backgroundClassName="bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_32%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.10),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(240,246,245,0.84))]"
          actions={
            <div className="flex flex-wrap gap-sm">
              <Button variant="secondary" onClick={() => navigator.clipboard?.writeText(window.location.href)}>
                Partilhar perfil
              </Button>
            </div>
          }
        />

        <section aria-label="Resumo estatístico do jogador" className="grid gap-lg sm:grid-cols-2 xl:grid-cols-4">
          <DetailStat icon={Activity} label={t('players.detail.stats.matches')} value={player.total_matches} />
          <DetailStat icon={Trophy} label={t('players.detail.stats.goals')} value={player.total_goals} color="#f59e0b" />
          <DetailStat icon={Target} label={t('players.detail.stats.assists')} value={player.total_assists} color="#10b981" />
          <DetailStat icon={User} label={t('players.detail.stats.position')} value={player.position_label} color={positionColor} />
        </section>

        <main aria-label="Conteúdo público do jogador">
          <Tabs defaultValue="career" className="space-y-lg">
          <TabsList className="h-auto flex flex-wrap gap-sm rounded-full border border-outline-variant/20 bg-surface-container/50 p-sm">
            <TabsTrigger 
              value="career" 
              className="rounded-full px-lg py-md data-[state=active]:bg-primary-container data-[state=active]:text-primary shadow-sm transition-all duration-300"
            >
              {t('players.detail.tabs.career')}
            </TabsTrigger>
            <TabsTrigger 
              value="statistics"
              className="rounded-full px-lg py-md data-[state=active]:bg-primary-container data-[state=active]:text-primary shadow-sm transition-all duration-300"
            >
              Desempenho
            </TabsTrigger>
            <TabsTrigger 
              value="documents" 
              className="rounded-full px-lg py-md data-[state=active]:bg-primary-container data-[state=active]:text-primary shadow-sm transition-all duration-300"
            >
              {t('players.detail.tabs.documents')}
            </TabsTrigger>
            <TabsTrigger 
              value="videos" 
              className="rounded-full px-lg py-md data-[state=active]:bg-primary-container data-[state=active]:text-primary shadow-sm transition-all duration-300"
            >
              {t('players.detail.tabs.videos')}
            </TabsTrigger>
            <TabsTrigger 
              value="achievements" 
              className="rounded-full px-lg py-md data-[state=active]:bg-primary-container data-[state=active]:text-primary shadow-sm transition-all duration-300"
            >
              {t('players.detail.tabs.achievements')}
            </TabsTrigger>
          </TabsList>

          <TabsContent 
            value="career" 
            className="animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            <Card variant="flat" padding="none" className="shadow-[0_18px_40px_-30px_rgba(15,17,23,0.18)]">
              <CardHeader>
                <CardTitle>{t('players.detail.careerHistory')}</CardTitle>
              </CardHeader>
              <CardContent>
                <PlayerCareerTimeline career={player.career_history ?? []} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent 
            value="statistics"
            className="animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            <PlayerStatisticsTab slug={slug} />
          </TabsContent>

          <TabsContent 
            value="documents" 
            className="animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            <PlayerDocumentsTab slug={slug} fallbackDocuments={player.documents ?? []} />
          </TabsContent>

          <TabsContent 
            value="videos" 
            className="animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            <PlayerVideosTab slug={slug} fallbackVideos={player.videos ?? []} />
          </TabsContent>

          <TabsContent 
            value="achievements" 
            className="animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            <PlayerAchievementsTab slug={slug} fallbackAchievements={player.achievements ?? []} />
          </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
