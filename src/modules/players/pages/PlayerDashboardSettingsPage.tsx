import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Award,
  ExternalLink,
  Folder,
  LayoutDashboard,
  Lock,
  Phone,
  Shield,
  ShieldCheck,
  Sparkles,
  User,
  Video,
} from 'lucide-react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge, Button } from '@/components/ui'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { resolveMediaUrl } from '@/lib/media'
import {
  PlayerAchievementsSection,
  PlayerDocumentsSection,
  PlayerIdentityDocumentsSection,
  PlayerVideosSection,
  PlayerContactSettingsPanel,
  PlayerPrivacySettingsPanel,
  PlayerComplianceSection,
  PlayerProfileSettingsForm,
} from '../components'
import { usePlayerMe } from '../hooks'
import { POSITION_COLOR, STATUS_COLOR } from '../constants'
import { playerRoutes } from '../routes'
import { getPlayerSidebarLinks } from '../constants/navigation'

export function PlayerDashboardSettingsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: player, isLoading, isError } = usePlayerMe()

  const sidebarLinks = getPlayerSidebarLinks(player?.slug)

  if (isLoading) {
    return (
      <DashboardLayout
        title="Configurações do Perfil"
        subtitle="A carregar preferências e dados..."
        dashboardType="player"
        sidebarLinks={sidebarLinks}
      >
        <PageSkeleton variant="detail" />
      </DashboardLayout>
    )
  }

  if (isError || !player) {
    return (
      <DashboardLayout
        title="Configurações do Perfil"
        subtitle="Gestão desportiva pessoal"
        dashboardType="player"
        sidebarLinks={sidebarLinks}
      >
        <EmptyState
          icon={Sparkles}
          title={t('players.dashboard.settingsNotFoundTitle') || 'Jogador não encontrado'}
          description={t('players.dashboard.settingsNotFoundDescription') || 'Não foi possível carregar os dados do perfil.'}
          action={{
            label: t('players.common.back') || 'Voltar ao Painel',
            onClick: () => navigate(playerRoutes.dashboard),
            variant: 'secondary',
          }}
        />
      </DashboardLayout>
    )
  }

  const positionColor = POSITION_COLOR[player.primary_position] ?? '#534ab7'
  const statusColor = STATUS_COLOR[player.status] ?? '#6b7280'
  const initials = `${player.first_name?.[0] ?? ''}${player.last_name?.[0] ?? ''}`.toUpperCase() || '?'
  const resolvedPhoto = resolveMediaUrl(player.avatar || player.profile_photo_url)

  return (
    <DashboardLayout
      title={player.full_name}
      subtitle="Definições do perfil, dados desportivos, documentos e privacidade"
      dashboardType="player"
      sidebarLinks={sidebarLinks}
    >
      <div className="space-y-lg">
        {/* ─── 1. PAGE HEADER / HERO BAR (EXECUTIVE DESIGN SYSTEM) ─────── */}
        <div className="flex flex-col gap-md rounded-2xl border border-outline-variant/30 bg-surface-container/40 p-lg shadow-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-md">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full text-lg font-bold text-white shadow-sm"
              style={{ background: positionColor }}
            >
              {resolvedPhoto ? (
                <img
                  src={resolvedPhoto}
                  alt={player.full_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-xs">
                <h1 className="text-xl font-bold text-on-surface">{player.full_name}</h1>
                <Badge
                  variant="outline"
                  className="text-xs"
                  style={{ borderColor: positionColor, color: positionColor }}
                >
                  {player.position_label || player.primary_position}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs"
                  style={{ borderColor: statusColor, color: statusColor, background: `${statusColor}15` }}
                >
                  {player.status_label || player.status}
                </Badge>
              </div>

              <p className="flex items-center gap-xs text-xs text-on-surface-variant">
                <span>{player.current_club?.name || 'Sem Clube Oficial'}</span>
                <span>•</span>
                <span>{player.nationality || 'Angola'}</span>
                {player.age ? (
                  <>
                    <span>•</span>
                    <span>{player.age} anos</span>
                  </>
                ) : null}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-xs">
            <Button asChild variant="outline" size="sm" className="gap-xs text-xs">
              <Link to={playerRoutes.detail(player.slug)}>
                <ExternalLink className="h-3.5 w-3.5" />
                Perfil Público
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(playerRoutes.dashboard)}
              className="gap-xs text-xs"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Painel
            </Button>
          </div>
        </div>

        {/* ─── 2. TABS NAVIGATION WITH ICONS ──────────────────────────── */}
        <Tabs defaultValue="profile" className="space-y-lg">
          <TabsList className="flex flex-wrap gap-xs rounded-2xl border border-outline-variant/30 bg-surface-container/60 p-1.5 shadow-xs">
            <TabsTrigger value="profile" className="gap-xs rounded-xl px-md py-sm text-xs font-medium">
              <User className="h-4 w-4" />
              Perfil & Biometria
            </TabsTrigger>
            <TabsTrigger value="identity" className="gap-xs rounded-xl px-md py-sm text-xs font-medium">
              <ShieldCheck className="h-4 w-4" />
              Identidade
            </TabsTrigger>
            <TabsTrigger value="contact" className="gap-xs rounded-xl px-md py-sm text-xs font-medium">
              <Phone className="h-4 w-4" />
              Contacto
            </TabsTrigger>
            <TabsTrigger value="privacy" className="gap-xs rounded-xl px-md py-sm text-xs font-medium">
              <Lock className="h-4 w-4" />
              Privacidade
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-xs rounded-xl px-md py-sm text-xs font-medium">
              <Folder className="h-4 w-4" />
              Documentos
            </TabsTrigger>
            <TabsTrigger value="videos" className="gap-xs rounded-xl px-md py-sm text-xs font-medium">
              <Video className="h-4 w-4" />
              Vídeos
            </TabsTrigger>
            <TabsTrigger value="achievements" className="gap-xs rounded-xl px-md py-sm text-xs font-medium">
              <Award className="h-4 w-4" />
              Conquistas
            </TabsTrigger>
            <TabsTrigger value="compliance" className="gap-xs rounded-xl px-md py-sm text-xs font-medium">
              <Shield className="h-4 w-4" />
              Conformidade
            </TabsTrigger>
          </TabsList>

          {/* ─── TAB: PERFIL & BIOMETRIA (65/35 LAYOUT) ───────────────── */}
          <TabsContent value="profile">
            <PlayerProfileSettingsForm player={player} />
          </TabsContent>

          {/* ─── TAB: IDENTIDADE ──────────────────────────────────────── */}
          <TabsContent value="identity">
            <PlayerIdentityDocumentsSection slug={player.slug} ownerId={player.id} />
          </TabsContent>

          {/* ─── TAB: CONTACTO ────────────────────────────────────────── */}
          <TabsContent value="contact">
            <PlayerContactSettingsPanel slug={player.slug} />
          </TabsContent>

          {/* ─── TAB: PRIVACIDADE ─────────────────────────────────────── */}
          <TabsContent value="privacy">
            <PlayerPrivacySettingsPanel slug={player.slug} />
          </TabsContent>

          {/* ─── TAB: DOCUMENTOS ──────────────────────────────────────── */}
          <TabsContent value="documents">
            <PlayerDocumentsSection slug={player.slug} ownerId={player.id} />
          </TabsContent>

          {/* ─── TAB: VÍDEOS ──────────────────────────────────────────── */}
          <TabsContent value="videos">
            <PlayerVideosSection slug={player.slug} ownerId={player.id} />
          </TabsContent>

          {/* ─── TAB: CONQUISTAS ──────────────────────────────────────── */}
          <TabsContent value="achievements">
            <PlayerAchievementsSection slug={player.slug} ownerId={player.id} />
          </TabsContent>

          {/* ─── TAB: CONFORMIDADE ────────────────────────────────────── */}
          <TabsContent value="compliance">
            <PlayerComplianceSection playerId={player.id} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
