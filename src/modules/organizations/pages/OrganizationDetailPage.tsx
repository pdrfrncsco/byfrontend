import { useState, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Building2,
  CheckCircle2,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Phone,
  Trophy,
  Users,
  Shield,
  Calendar,
  LayoutDashboard,
  History,
  Zap,
  ChevronRight,
  User,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  PageSkeleton,
} from '@/components/ui'
import { EmptyState, ErrorState } from '@/components/ui/empty-state'
import { Badge } from '@/components/ui/badge'
import { ClubLogo } from '@/modules/clubs/components/ClubLogo'
import {
  SportDetailLayout,
  SportEntityHeader,
  SportSidebar,
  SportSidebarCard,
  SportStatRow,
  SportTabs,
  SportTabsList,
  SportTabsTrigger,
  SportTabsContent,
} from '@/modules/shared/components/sport'
import {
  usePublicOrganizationDetail,
  useOrganizationKpis,
  useOrganizationHistory,
  useOrganizationClubs,
  useOrganizationTournaments,
  useOrganizationPlayers,
  useSubscribeOrganization,
  useUnsubscribeOrganization,
} from '../hooks'
import {
  OrganizationHistoryTable,
  AffiliationRequestModal,
} from '../components'
import { organizationRoutes } from '../routes'
import { useSeo } from '@/hooks/useSeo'
import { resolveMediaUrl } from '@/lib/media'
import { POSITION_COLOR } from '@/modules/players/constants'

export function OrganizationDetailPage() {
  const { slug } = useParams<{ slug: string }>()

  const {
    data: organization,
    isLoading: isLoadingOrg,
    isError: isErrorOrg,
    refetch: refetchOrg,
  } = usePublicOrganizationDetail(slug)

  useSeo({
    title: organization?.name ? `${organization.name} — Organização` : 'Detalhe da organização',
    description: organization?.description || 'Consulte o perfil público, competições, clubes filiados e atividade desta organização.',
    path: `/organizations/${slug ?? ''}`,
  })

  const { data: kpis, isLoading: isLoadingKpis } = useOrganizationKpis(slug)
  const { data: history = [] } = useOrganizationHistory(slug)
  const { data: clubs = [], isLoading: isLoadingClubs } = useOrganizationClubs(slug)
  const { data: tournaments = [], isLoading: isLoadingTournaments } = useOrganizationTournaments(slug)
  const { data: players = [], isLoading: isLoadingPlayers } = useOrganizationPlayers(slug)

  const [isAffiliationModalOpen, setIsAffiliationModalOpen] = useState(false)

  const subscribeMutation = useSubscribeOrganization()
  const unsubscribeMutation = useUnsubscribeOrganization()

  const handleSubscribe = () => {
    if (!slug) return
    subscribeMutation.mutate(slug)
  }

  const handleUnsubscribe = () => {
    if (!slug) return
    unsubscribeMutation.mutate(slug)
  }

  if (isLoadingOrg) {
    return (
      <SportDetailLayout
        breadcrumb={
          <div className="flex items-center gap-xs text-sm text-on-surface-variant">
            <Link to={organizationRoutes.list} className="hover:text-primary">Organizações</Link>
            <span aria-hidden="true">/</span>
            <span className="text-on-surface">A carregar...</span>
          </div>
        }
        header={<PageSkeleton variant="detail" />}
        main={<div />}
        sidebar={<div />}
      />
    )
  }

  if (isErrorOrg || !organization) {
    return (
      <SportDetailLayout
        breadcrumb={
          <div className="flex items-center gap-xs text-sm text-on-surface-variant">
            <Link to={organizationRoutes.list} className="hover:text-primary">Organizações</Link>
            <span aria-hidden="true">/</span>
            <span className="text-on-surface">Erro</span>
          </div>
        }
        header={
          <ErrorState
            title="Organização não encontrada"
            message="Não foi possível obter os detalhes desta organização. Verifique se o endereço está correto."
            onRetry={refetchOrg}
          />
        }
        main={<div />}
        sidebar={<div />}
      />
    )
  }

  const primaryColor = organization.primary_color || '#1B4D3E'
  const firstLetter = organization.name?.charAt(0) || '?'
  const isSubscribed = organization.is_subscribed ?? false
  const verifiedLabel = organization.verified || organization.is_verified ? 'Verificada' : 'Pública'
  const statusLabel = organization.status_label || (organization.status === 'active' ? 'Ativa' : 'Pendente')
  const locationLabel = organization.location || [organization.city, organization.country].filter(Boolean).join(' • ') || 'Angola'
  const typeLabel = organization.type_label || organization.type || 'Organização'

  const activeTournaments = (tournaments as any[]).filter(t => t.status === 'active' || t.status === 'ongoing')
  const featuredTournaments = (tournaments as any[]).slice(0, 4)
  const featuredClubs = clubs.slice(0, 6)

  return (
    <SportDetailLayout
      breadcrumb={
        <div className="flex items-center gap-xs text-sm text-on-surface-variant">
          <Link to={organizationRoutes.list} className="hover:text-primary">Organizações</Link>
          <span aria-hidden="true">/</span>
          <span className="truncate text-on-surface font-medium">{organization.name}</span>
        </div>
      }
      header={
        <SportEntityHeader
          visual={
            organization.logo_url ? (
              <img
                src={organization.logo_url}
                alt={organization.name}
                className="h-16 w-16 rounded-2xl border border-outline-variant/20 object-cover shadow-md"
              />
            ) : (
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl border border-outline-variant/20 font-bold text-2xl text-white shadow-md"
                style={{ backgroundColor: primaryColor }}
              >
                {firstLetter}
              </div>
            )
          }
          title={organization.name}
          subtitle={organization.description || `Perfil público oficial da ${organization.name} no ecossistema BolaYetu.`}
          chips={[
            { label: typeLabel },
            { icon: MapPin, label: locationLabel },
            { icon: CheckCircle2, label: verifiedLabel },
            { label: statusLabel },
            { icon: Users, label: `${organization.active_subscribers || 0} subscritores` },
          ]}
          actions={
            <div className="flex flex-wrap items-center gap-sm">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsAffiliationModalOpen(true)}
              >
                <Building2 className="h-4 w-4 mr-1.5" />
                <span>Filiação de Clube</span>
              </Button>

              {isSubscribed ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUnsubscribe}
                  loading={unsubscribeMutation.isPending}
                  className="hover:border-error/20 hover:bg-error/10 hover:text-error"
                >
                  <span>Cancelar subscrição</span>
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSubscribe}
                  loading={subscribeMutation.isPending}
                >
                  <span>Subscrever</span>
                </Button>
              )}

              {organization.website && (
                <Button asChild variant="outline" size="sm">
                  <a
                    href={organization.website.startsWith('http') ? organization.website : `https://${organization.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1" />
                    <span>Website</span>
                  </a>
                </Button>
              )}
            </div>
          }
        />
      }
      main={
        <SportTabs defaultValue="overview">
          <SportTabsList>
            <SportTabsTrigger value="overview" icon={LayoutDashboard}>
              Visão Geral
            </SportTabsTrigger>
            <SportTabsTrigger value="tournaments" icon={Trophy}>
              Competições ({(tournaments as any[]).length})
            </SportTabsTrigger>
            <SportTabsTrigger value="clubs" icon={Shield}>
              Clubes Filiados ({clubs.length})
            </SportTabsTrigger>
            <SportTabsTrigger value="players" icon={Users}>
              Jogadores ({(players as any[]).length})
            </SportTabsTrigger>
            <SportTabsTrigger value="history" icon={History}>
              Palmarés ({history.length})
            </SportTabsTrigger>
          </SportTabsList>

          {/* TAB 1: VISÃO GERAL */}
          <SportTabsContent value="overview">
            <div className="space-y-lg">
              {/* Sobre Card */}
              <div className="rounded-xl border border-outline-variant/15 bg-surface-container p-lg space-y-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span>Apresentação Institucional</span>
                </h3>
                <p className="whitespace-pre-line text-sm leading-relaxed text-on-surface">
                  {organization.description || 'Esta organização ainda não forneceu uma descrição oficial detalhada de apresentação.'}
                </p>
              </div>

              {/* Métricas Rápidas */}
              <div className="rounded-xl border border-outline-variant/15 bg-surface-container p-lg space-y-md">
                <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Estatísticas de Impacto
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="flex flex-col items-center justify-center rounded-lg bg-surface-container-low p-3 border border-outline-variant/10 text-center">
                    <span className="text-xl font-bold text-on-surface">{clubs.length}</span>
                    <span className="text-[10px] uppercase tracking-wider text-on-surface-variant mt-0.5">Clubes</span>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-lg bg-surface-container-low p-3 border border-outline-variant/10 text-center">
                    <span className="text-xl font-bold text-primary">{(tournaments as any[]).length}</span>
                    <span className="text-[10px] uppercase tracking-wider text-on-surface-variant mt-0.5">Torneios</span>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-lg bg-surface-container-low p-3 border border-outline-variant/10 text-center">
                    <span className="text-xl font-bold text-emerald-500">{kpis?.total_games ?? 0}</span>
                    <span className="text-[10px] uppercase tracking-wider text-on-surface-variant mt-0.5">Jogos</span>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-lg bg-surface-container-low p-3 border border-outline-variant/10 text-center">
                    <span className="text-xl font-bold text-amber-500">{kpis?.total_goals ?? 0}</span>
                    <span className="text-[10px] uppercase tracking-wider text-on-surface-variant mt-0.5">Golos</span>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-lg bg-surface-container-low p-3 border border-outline-variant/10 text-center">
                    <span className="text-xl font-bold text-on-surface">{(players as any[]).length}</span>
                    <span className="text-[10px] uppercase tracking-wider text-on-surface-variant mt-0.5">Atletas</span>
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-lg bg-surface-container-low p-3 border border-outline-variant/10 text-center">
                    <span className="text-xl font-bold text-primary">{organization.active_subscribers || 0}</span>
                    <span className="text-[10px] uppercase tracking-wider text-on-surface-variant mt-0.5">Subscritores</span>
                  </div>
                </div>
              </div>

              {/* Competições em Destaque */}
              {(tournaments as any[]).length > 0 && (
                <div className="rounded-xl border border-outline-variant/15 bg-surface-container p-lg space-y-md">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                      <Trophy className="h-4 w-4 text-amber-500" />
                      <span>Competições Recentes</span>
                    </h3>
                  </div>
                  <div className="grid gap-sm sm:grid-cols-2">
                    {featuredTournaments.map((t: any) => (
                      <Link
                        key={t.id}
                        to={`/competitions/${t.slug || t.id}`}
                        className="group flex items-center justify-between p-3 rounded-lg border border-outline-variant/15 bg-surface-container-low hover:border-primary/40 hover:bg-surface-container-high transition-colors"
                      >
                        <div className="min-w-0 space-y-0.5">
                          <h4 className="font-semibold text-sm text-on-surface group-hover:text-primary transition-colors truncate">
                            {t.name}
                          </h4>
                          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                            <span>Época {t.season}</span>
                            <span>•</span>
                            <span>{t.type_label || t.competition_type}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant={t.status === 'active' ? 'primary' : 'outline'} className="text-[10px]">
                            {t.status_label || t.status}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-on-surface-variant group-hover:text-primary transition-colors" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Clubes Filiados em Destaque */}
              {clubs.length > 0 && (
                <div className="rounded-xl border border-outline-variant/15 bg-surface-container p-lg space-y-md">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-primary" />
                    <span>Clubes Filiados</span>
                  </h3>
                  <div className="grid gap-sm sm:grid-cols-2 lg:grid-cols-3">
                    {featuredClubs.map((club) => (
                      <Link
                        key={club.id}
                        to={`/clubs/${club.slug}`}
                        className="group flex items-center gap-3 p-3 rounded-lg border border-outline-variant/15 bg-surface-container-low hover:border-primary/40 hover:bg-surface-container-high transition-colors"
                      >
                        <ClubLogo
                          name={club.name}
                          logoUrl={club.logo_url}
                          shortName={club.short_name}
                          primaryColor={club.primary_color}
                          size="sm"
                          shape="squircle"
                          className="shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-xs text-on-surface group-hover:text-primary transition-colors truncate">
                            {club.name}
                          </h4>
                          <p className="text-[11px] text-on-surface-variant truncate">
                            {club.city || 'Angola'}
                          </p>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-on-surface-variant group-hover:text-primary transition-colors shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </SportTabsContent>

          {/* TAB 2: COMPETIÇÕES */}
          <SportTabsContent value="tournaments">
            {isLoadingTournaments ? (
              <div className="space-y-sm">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 rounded-xl bg-surface-container animate-pulse" />
                ))}
              </div>
            ) : (tournaments as any[]).length === 0 ? (
              <EmptyState
                icon={Trophy}
                title="Sem competições ativas"
                description="Esta organização ainda não publicou campeonatos ou taças no portal."
              />
            ) : (
              <div className="grid gap-md sm:grid-cols-2">
                {(tournaments as any[]).map((tournament: any) => (
                  <div
                    key={tournament.id}
                    className="flex flex-col justify-between rounded-xl border border-outline-variant/15 bg-surface-container p-md hover:border-primary/40 transition-colors"
                  >
                    <div className="space-y-sm">
                      <div className="flex items-start justify-between gap-sm">
                        <h4 className="font-semibold text-base text-on-surface truncate">
                          {tournament.name}
                        </h4>
                        <Badge variant={tournament.status === 'active' ? 'primary' : 'outline'} className="text-[11px] shrink-0">
                          {tournament.status_label || tournament.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          Época {tournament.season}
                        </span>
                        <span>•</span>
                        <span>{tournament.type_label || tournament.competition_type}</span>
                      </div>
                    </div>

                    <div className="mt-md pt-sm border-t border-outline-variant/10 flex items-center justify-between gap-sm">
                      <Button asChild variant="secondary" size="sm" className="text-xs">
                        <Link to={`/competitions/${tournament.slug || tournament.id}/match-center`}>
                          <Zap className="mr-1 h-3.5 w-3.5" />
                          Match Center
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="text-xs">
                        <Link to={`/competitions/${tournament.slug || tournament.id}`}>
                          Ver Competição →
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SportTabsContent>

          {/* TAB 3: CLUBES FILIADOS */}
          <SportTabsContent value="clubs">
            {isLoadingClubs ? (
              <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-24 rounded-xl bg-surface-container animate-pulse" />
                ))}
              </div>
            ) : clubs.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="Sem clubes filiados registados"
                description="Nenhum clube está atualmente filiado publicamente a esta organização."
                action={{
                  label: 'Solicitar Filiação de Clube',
                  onClick: () => setIsAffiliationModalOpen(true),
                }}
              />
            ) : (
              <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-3">
                {clubs.map((club) => (
                  <Link
                    key={club.id}
                    to={`/clubs/${club.slug}`}
                    className="group flex items-center justify-between gap-md rounded-xl border border-outline-variant/15 bg-surface-container p-md hover:border-primary/40 hover:bg-surface-container-high transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-md min-w-0">
                      <ClubLogo
                        name={club.name}
                        logoUrl={club.logo_url}
                        shortName={club.short_name}
                        primaryColor={club.primary_color}
                        size="md"
                        shape="squircle"
                        className="shrink-0 shadow-sm"
                      />
                      <div className="min-w-0 space-y-0.5">
                        <h4 className="font-semibold text-sm text-on-surface group-hover:text-primary transition-colors truncate">
                          {club.name}
                        </h4>
                        <p className="text-xs text-on-surface-variant truncate">
                          {club.city || 'Angola'}
                          {club.stadium_name ? ` • ${club.stadium_name}` : ''}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-on-surface-variant group-hover:text-primary transition-colors shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </SportTabsContent>

          {/* TAB 4: JOGADORES */}
          <SportTabsContent value="players">
            {isLoadingPlayers ? (
              <div className="space-y-sm">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-16 rounded-xl bg-surface-container animate-pulse" />
                ))}
              </div>
            ) : (players as any[]).length === 0 ? (
              <EmptyState
                icon={Users}
                title="Sem atletas registados"
                description="Não existem jogadores associados aos clubes desta organização no momento."
              />
            ) : (
              <div className="grid gap-sm sm:grid-cols-2 lg:grid-cols-3">
                {(players as any[]).map((player: any) => {
                  const posColor = POSITION_COLOR[player.primary_position] ?? '#6b7280'
                  const initials = `${player.first_name?.[0] ?? ''}${player.last_name?.[0] ?? ''}`.toUpperCase() || '?'
                  const avatarUrl = resolveMediaUrl(player.avatar || player.profile_photo_url)

                  return (
                    <Link
                      key={player.id}
                      to={`/players/${player.slug}`}
                      className="group flex items-center justify-between gap-md rounded-xl border border-outline-variant/15 bg-surface-container p-3 hover:border-primary/40 hover:bg-surface-container-high transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 text-xs font-bold text-white shadow-sm"
                          style={{ borderColor: posColor, background: posColor }}
                        >
                          {avatarUrl ? (
                            <img src={avatarUrl} alt={player.full_name} className="h-full w-full object-cover" />
                          ) : (
                            initials
                          )}
                        </div>

                        <div className="min-w-0 space-y-0.5">
                          <h4 className="truncate font-semibold text-xs text-on-surface group-hover:text-primary transition-colors">
                            {player.full_name}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant truncate">
                            <span className="font-medium" style={{ color: posColor }}>
                              {player.position_label || player.primary_position}
                            </span>
                            {player.current_club && (
                              <>
                                <span>•</span>
                                <span className="truncate">{player.current_club.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <ChevronRight className="h-4 w-4 text-on-surface-variant group-hover:text-primary transition-colors shrink-0" />
                    </Link>
                  )
                })}
              </div>
            )}
          </SportTabsContent>

          {/* TAB 5: PALMARÉS & HISTÓRICO */}
          <SportTabsContent value="history">
            {history.length > 0 ? (
              <OrganizationHistoryTable history={history} />
            ) : (
              <EmptyState
                icon={Trophy}
                title="Sem histórico registado"
                description="Esta organização ainda não possui épocas concluídas ou campeões averbados no sistema."
              />
            )}
          </SportTabsContent>
        </SportTabs>
      }
      sidebar={
        <SportSidebar>
          {/* Informação Institucional */}
          <SportSidebarCard title="Informação Institucional" icon={Building2}>
            <SportStatRow label="Tipo" value={typeLabel} />
            <SportStatRow label="Localização" value={locationLabel} />
            {organization.email && (
              <SportStatRow
                label="Email"
                value={
                  <a href={`mailto:${organization.email}`} className="text-primary hover:underline truncate max-w-[160px] inline-block">
                    {organization.email}
                  </a>
                }
              />
            )}
            {organization.phone && (
              <SportStatRow
                label="Telefone"
                value={
                  <a href={`tel:${organization.phone}`} className="text-primary hover:underline">
                    {organization.phone}
                  </a>
                }
              />
            )}
            {organization.website && (
              <SportStatRow
                label="Website"
                value={
                  <a
                    href={organization.website.startsWith('http') ? organization.website : `https://${organization.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline truncate max-w-[160px] inline-block"
                  >
                    {organization.website.replace(/^https?:\/\//, '')}
                  </a>
                }
              />
            )}
            <SportStatRow label="Estado" value={statusLabel} />
          </SportSidebarCard>

          {/* Estatísticas de Impacto */}
          <SportSidebarCard title="Impacto Desportivo" icon={Trophy}>
            <SportStatRow label="Clubes Afiliados" value={kpis?.total_clubs ?? clubs.length} />
            <SportStatRow label="Torneios Totais" value={kpis?.total_tournaments ?? (tournaments as any[]).length} />
            <SportStatRow label="Torneios Ativos" value={kpis?.active_tournaments ?? activeTournaments.length} />
            <SportStatRow label="Jogos Realizados" value={kpis?.total_games ?? 0} />
            <SportStatRow label="Golos Registados" value={kpis?.total_goals ?? 0} />
            <SportStatRow label="Subscritores" value={organization.active_subscribers || 0} />
          </SportSidebarCard>

          {/* Filiação Card */}
          <SportSidebarCard title="Filiação Oficial" icon={Users}>
            <div className="space-y-sm">
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Dirige uma agremiação desportiva? Associe o seu clube a esta organização para participar nas suas provas oficiais.
              </p>
              <Button
                variant="primary"
                size="sm"
                className="w-full text-xs"
                onClick={() => setIsAffiliationModalOpen(true)}
              >
                <Building2 className="h-3.5 w-3.5 mr-1.5" />
                Solicitar Filiação
              </Button>
            </div>
          </SportSidebarCard>
        </SportSidebar>
      }
    />
  )
}
