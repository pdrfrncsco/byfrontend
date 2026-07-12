import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Activity,
  ArrowLeft,
  Calendar,
  MapPin,
  Ruler,
  Settings,
  Star,
  Target,
  Trophy,
  User,
  Weight,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { NotFound, ServerError } from '@/components/ui/error-states'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  PlayerAchievementsTab,
  PlayerCareerTimeline,
  PlayerDetailSkeleton,
  PlayerDocumentsTab,
  PlayerVideosTab,
} from '../components'
import { usePlayer } from '../hooks'
import { POSITION_COLOR, STATUS_COLOR } from '../constants'
import { playerRoutes } from '../routes'
import { ROUTES } from '@/constants/routes'

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

export function PlayerDetailPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { data: player, isLoading, isError, refetch } = usePlayer(slug)

  if (isLoading) {
    return (
      <div className="container py-xl">
        <PlayerDetailSkeleton />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container py-xl">
        <ServerError onRetry={() => refetch()} />
      </div>
    )
  }

  if (!player) {
    return (
      <div className="container py-xl">
        <NotFound resourceName="jogador" onAction={() => navigate(playerRoutes.list)} />
      </div>
    )
  }

  const positionColor = POSITION_COLOR[player.primary_position] ?? '#6b7280'
  const statusColor = STATUS_COLOR[player.status] ?? '#6b7280'
  const initials = `${player.first_name?.[0] ?? ''}${player.last_name?.[0] ?? ''}`.toUpperCase() || '?'

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[24rem] bg-[radial-gradient(circle_at_top_left,rgba(148,211,193,0.16),transparent_36%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.14),transparent_34%),linear-gradient(180deg,rgba(7,16,29,0.88),rgba(7,16,29,0.04))]" />
      <div className="container py-xl space-y-xl">
        <Link
          to={playerRoutes.list}
          className="inline-flex items-center gap-sm text-sm text-on-surface-variant transition-colors hover:text-primary"
          id="player-back-link"
        >
          <ArrowLeft className="h-4 w-4" />
          Todos os jogadores
        </Link>

        <section className="rounded-[2rem] border border-outline-variant/20 bg-surface-container/75 p-xl shadow-[0_24px_80px_-40px_rgba(0,0,0,0.7)] backdrop-blur">
          <div className="grid gap-xl lg:grid-cols-[auto_1fr_auto] lg:items-start">
            <div className="space-y-md">
              <div
                className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl border-2 text-3xl font-bold text-on-primary shadow-lg"
                style={{ borderColor: positionColor, background: positionColor }}
              >
                {player.avatar ? (
                  <img src={player.avatar} alt={player.full_name} className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <Badge
                variant="outline"
                style={{
                  borderColor: positionColor,
                  color: positionColor,
                  background: `${positionColor}15`,
                }}
              >
                {player.position_label}
              </Badge>
            </div>

            <div className="space-y-md">
              <div className="flex flex-wrap items-center gap-sm">
                <h1 className="font-title-lg text-3xl text-on-surface md:text-4xl" id="player-detail-name">
                  {player.full_name}
                </h1>
                <Badge
                  variant="outline"
                  style={{
                    borderColor: statusColor,
                    color: statusColor,
                    background: `${statusColor}15`,
                  }}
                >
                  {player.status_label}
                </Badge>
              </div>

              {player.current_club && (
                <Link
                  to={`/clubs/${player.current_club.slug}`}
                  className="inline-flex items-center gap-sm rounded-full border border-outline-variant/20 bg-surface-container-high px-md py-1.5 text-sm font-medium text-on-surface transition-colors hover:text-primary"
                  id="player-current-club-link"
                >
                  <Star className="h-4 w-4 text-amber-400" />
                  {player.current_club.name}
                  {player.current_club.shirt_number && (
                    <span className="rounded-full bg-primary-container/20 px-sm py-0.5 text-xs text-primary">
                      #{player.current_club.shirt_number}
                    </span>
                  )}
                </Link>
              )}

              <div className="flex flex-wrap gap-sm text-sm text-on-surface-variant">
                {player.nationality && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-outline-variant/20 bg-surface-container-high px-md py-1.5">
                    <MapPin className="h-4 w-4" />
                    {player.nationality}
                  </span>
                )}
                {player.age && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-outline-variant/20 bg-surface-container-high px-md py-1.5">
                    <Calendar className="h-4 w-4" />
                    {player.age} anos
                  </span>
                )}
                {player.height_cm && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-outline-variant/20 bg-surface-container-high px-md py-1.5">
                    <Ruler className="h-4 w-4" />
                    {player.height_cm} cm
                  </span>
                )}
                {player.weight_kg && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-outline-variant/20 bg-surface-container-high px-md py-1.5">
                    <Weight className="h-4 w-4" />
                    {player.weight_kg} kg
                  </span>
                )}
                {player.foot && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-outline-variant/20 bg-surface-container-high px-md py-1.5">
                    <Activity className="h-4 w-4" />
                    Pé {player.foot === 'left' ? 'esquerdo' : player.foot === 'right' ? 'direito' : 'ambos'}
                  </span>
                )}
              </div>

              {player.bio && (
                <p className="max-w-3xl text-base leading-7 text-on-surface-variant">{player.bio}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-sm">
              <Button asChild variant="secondary">
                <Link to={ROUTES.PLAYER_EDIT(slug)}>
                  <Settings className="h-4 w-4" />
                  Editar perfil
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <div className="grid gap-lg sm:grid-cols-2 xl:grid-cols-4">
          <DetailStat icon={Activity} label="Jogos" value={player.total_matches} />
          <DetailStat icon={Trophy} label="Golos" value={player.total_goals} color="#f59e0b" />
          <DetailStat icon={Target} label="Assistências" value={player.total_assists} color="#10b981" />
          <DetailStat icon={User} label="Posição" value={player.position_label} color={positionColor} />
        </div>

        <Tabs defaultValue="career">
          <TabsList className="flex flex-wrap gap-sm rounded-2xl border border-outline-variant/20 bg-surface-container/70 p-sm">
            <TabsTrigger value="career">Carreira</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
            <TabsTrigger value="videos">Vídeos</TabsTrigger>
            <TabsTrigger value="achievements">Conquistas</TabsTrigger>
          </TabsList>

          <TabsContent value="career">
            <Card variant="flat" padding="none">
              <CardHeader>
                <CardTitle>Histórico de carreira</CardTitle>
              </CardHeader>
              <CardContent>
                <PlayerCareerTimeline career={player.career_history ?? []} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <PlayerDocumentsTab slug={slug} fallbackDocuments={player.documents ?? []} />
          </TabsContent>

          <TabsContent value="videos">
            <PlayerVideosTab slug={slug} fallbackVideos={player.videos ?? []} />
          </TabsContent>

          <TabsContent value="achievements">
            <PlayerAchievementsTab slug={slug} fallbackAchievements={player.achievements ?? []} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
