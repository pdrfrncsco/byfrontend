import { Link, useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
  const { data: player, isLoading, isError } = usePlayerMe()

  const sidebarLinks = [
    { label: 'Geral', href: playerRoutes.dashboard, icon: <LayoutDashboard className="h-4 w-4" />, active: true },
    { label: 'Configurações', href: playerRoutes.dashboardSettings, icon: <Settings className="h-4 w-4" /> },
    { label: 'Perfil Público', href: player ? playerRoutes.detail(player.slug) : ROUTES.PLAYERS, icon: <ExternalLink className="h-4 w-4" /> },
  ]

  if (isLoading) {
    return (
      <DashboardLayout
        title="Portal do Jogador"
        subtitle="A carregar a sua consola profissional..."
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
        title="Portal do Jogador"
        subtitle="Consola profissional do atleta"
        dashboardType="player"
        sidebarLinks={sidebarLinks}
      >
        <EmptyState
          icon={Sparkles}
          title="Perfil de jogador não encontrado"
          description="Esta conta ainda não tem um perfil de jogador associado. Contacte o clube ou a organização para concluir o vínculo."
          action={{
            label: 'Explorar jogadores',
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
      title={`Portal do Jogador • ${player.full_name}`}
      subtitle="Acompanhe carreira, media, documentos e conquistas numa consola dedicada ao atleta."
      dashboardType="player"
      sidebarLinks={sidebarLinks}
      headerActions={
        <Button asChild variant="primary" size="sm">
          <Link to={playerRoutes.dashboardSettings}>
            <Settings className="h-4 w-4" />
            Editar perfil
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
                  Clube atual: <span className="font-semibold text-on-surface">{player.current_club.name}</span>
                </p>
              )}
              {player.bio && <p className="max-w-3xl text-sm leading-6 text-on-surface-variant">{player.bio}</p>}
            </div>
            <Button asChild variant="secondary">
              <Link to={playerRoutes.detail(player.slug)}>
                Ver perfil público
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-md sm:grid-cols-2 xl:grid-cols-4">
          <Card variant="flat" padding="none">
            <CardContent className="space-y-xs p-lg">
              <Activity className="h-5 w-5 text-primary" />
              <p className="text-xs uppercase tracking-wide text-on-surface-variant">Jogos</p>
              <p className="text-3xl font-bold text-on-surface">{player.total_matches}</p>
            </CardContent>
          </Card>
          <Card variant="flat" padding="none">
            <CardContent className="space-y-xs p-lg">
              <Trophy className="h-5 w-5 text-amber-400" />
              <p className="text-xs uppercase tracking-wide text-on-surface-variant">Golos</p>
              <p className="text-3xl font-bold text-on-surface">{player.total_goals}</p>
            </CardContent>
          </Card>
          <Card variant="flat" padding="none">
            <CardContent className="space-y-xs p-lg">
              <Target className="h-5 w-5 text-emerald-400" />
              <p className="text-xs uppercase tracking-wide text-on-surface-variant">Assistências</p>
              <p className="text-3xl font-bold text-on-surface">{player.total_assists}</p>
            </CardContent>
          </Card>
          <Card variant="flat" padding="none">
            <CardContent className="space-y-xs p-lg">
              <Award className="h-5 w-5 text-primary" />
              <p className="text-xs uppercase tracking-wide text-on-surface-variant">Conquistas</p>
              <p className="text-3xl font-bold text-on-surface">{player.achievements?.length ?? 0}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-lg xl:grid-cols-2">
          <Card variant="flat" padding="none">
            <CardHeader>
              <CardTitle>Carreira</CardTitle>
            </CardHeader>
            <CardContent>
              <PlayerCareerTimeline career={player.career_history ?? []} />
            </CardContent>
          </Card>

          <Card variant="flat" padding="none">
            <CardHeader>
              <CardTitle className="flex items-center gap-sm">
                <FileText className="h-5 w-5" />
                Documentos recentes
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
                Vídeos
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
                Conquistas
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
