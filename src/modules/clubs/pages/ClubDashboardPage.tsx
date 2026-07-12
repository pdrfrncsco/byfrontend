import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  FileText,
  LayoutDashboard,
  MessageCircleMore,
  Shield,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { ROUTES } from '@/constants/routes'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui'
import { EmptyState } from '@/components/ui/empty-state'
import { ClubKpisCard } from '@/modules/clubs/components/ClubKpisCard'
import { useClubDocuments, useClubKpis, useClubMe, useClubMembers, useClubSponsors, useTransfers } from '@/modules/clubs/hooks/useClubs'

function formatRelative(dateString?: string | null): string {
  if (!dateString) return 'Recentemente'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return 'Recentemente'
  const diff = Date.now() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 1) return 'Agora mesmo'
  if (hours < 24) return `Há ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `Há ${days} dias`
  return date.toLocaleDateString('pt-AO')
}

export default function ClubDashboardPage() {
  const navigate = useNavigate()
  const { data: club, isLoading: clubLoading } = useClubMe()
  const slug = club?.slug

  const { data: kpis, isLoading: kpisLoading } = useClubKpis(slug)
  const { data: members, isLoading: membersLoading } = useClubMembers(slug)
  const { data: documents } = useClubDocuments(slug)
  const { data: sponsors } = useClubSponsors(slug)
  const { data: transfers, isLoading: transfersLoading } = useTransfers({ page_size: 5 })

  const sidebarLinks = useMemo(
    () => [
      { label: 'Geral', href: ROUTES.DASHBOARD_CLUB, icon: <LayoutDashboard className="h-4 w-4" />, active: true },
      { label: 'Membros', href: ROUTES.DASHBOARD_CLUB_MEMBERS, icon: <Users className="h-4 w-4" /> },
      { label: 'Configurações', href: ROUTES.DASHBOARD_CLUB_SETTINGS, icon: <Shield className="h-4 w-4" /> },
      { label: 'Documentos', href: ROUTES.DASHBOARD_CLUB_DOCUMENTS, icon: <FileText className="h-4 w-4" /> },
      { label: 'Patrocinadores', href: ROUTES.DASHBOARD_CLUB_SPONSORS, icon: <Trophy className="h-4 w-4" /> },
    { label: 'Transferências', href: ROUTES.DASHBOARD_CLUB_TRANSFERS, icon: <MessageCircleMore className="h-4 w-4" /> },
    { label: 'Registar Jogador', href: ROUTES.DASHBOARD_CLUB_REGISTER_PLAYER, icon: <Users className="h-4 w-4" /> },
  ],
    [],
  )

  const headerActions = (
    <Button asChild variant="primary" size="sm" disabled={!club}>
      <Link to={ROUTES.DASHBOARD_CLUB_SETTINGS}>
        <Sparkles className="h-4 w-4" />
        <span>Personalizar Clube</span>
      </Link>
    </Button>
  )

  if (clubLoading || !club) {
    return (
      <DashboardLayout
        title="Portal do Clube"
        subtitle="Carregando consola de gestão..."
        dashboardType="club"
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

  const totalMembers = members?.length ?? 0
  const totalDocuments = documents?.length ?? 0
  const totalSponsors = sponsors?.length ?? 0
  const recentTransfers = transfers?.results ?? []
  const clubInitials = (club.short_name || club.name || '?').slice(0, 2).toUpperCase()

  return (
    <DashboardLayout
      title={`Portal do Clube • ${club.name}`}
      subtitle="Consola administrativa para gestão do perfil, membros e ativos públicos do clube."
      dashboardType="club"
      sidebarLinks={sidebarLinks}
      headerActions={headerActions}
    >
      <div className="space-y-xl">
        <section className="grid gap-lg rounded-[2rem] border border-outline-variant/20 bg-surface-container/80 p-xl shadow-[0_24px_80px_-48px_rgba(0,0,0,0.75)] backdrop-blur lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-md">
            <div className="inline-flex items-center gap-sm rounded-full border border-primary/20 bg-primary-container/20 px-md py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Gestão central do clube
            </div>
            <div className="flex items-start gap-md">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-primary text-2xl font-bold text-on-primary shadow-lg">
                {club.logo_url ? (
                  <img src={club.logo_url} alt={`${club.name} logo`} className="h-full w-full object-cover" />
                ) : (
                  clubInitials
                )}
              </div>
              <div className="space-y-sm">
                <div className="flex flex-wrap items-center gap-sm">
                  <h1 className="font-title-lg text-3xl text-on-surface">{club.name}</h1>
                  <Badge variant={club.status === 'active' ? 'primary' : club.status === 'suspended' ? 'danger' : 'warning'}>
                    {club.status_label || club.status || 'active'}
                  </Badge>
                  {club.is_verified && <Badge variant="secondary">Verificado</Badge>}
                </div>
                <p className="max-w-2xl text-on-surface-variant">
                  {club.description || 'Acompanhe os dados do clube, publique ativos e mantenha a presença pública sempre atualizada.'}
                </p>
                <div className="flex flex-wrap gap-sm text-sm text-on-surface-variant">
                  <span className="rounded-full border border-outline-variant/20 bg-surface-container-high px-md py-1.5">
                    {[club.city, club.country].filter(Boolean).join(' • ') || 'Localização indisponível'}
                  </span>
                  <span className="rounded-full border border-outline-variant/20 bg-surface-container-high px-md py-1.5">
                    Última atualização: {formatRelative(club.updated_at || club.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Card variant="flat" padding="none">
            <CardHeader>
              <CardTitle>Atalhos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-sm">
              <Button asChild variant="outline" className="w-full justify-between">
                <Link to={ROUTES.DASHBOARD_CLUB_SETTINGS}>
                  <span>Editar perfil</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-between">
                <Link to={ROUTES.DASHBOARD_CLUB_MEMBERS}>
                  <span>Gerir membros</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-between">
                <Link to={ROUTES.DASHBOARD_CLUB_REGISTER_PLAYER}>
                  <span>Registar jogador</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-between">
                <Link to={`/clubs/${club.slug}`}>
                  <span>Ver perfil público</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        {kpisLoading || !kpis ? (
          <div className="grid gap-md md:grid-cols-2 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-32 rounded-2xl" />
            ))}
          </div>
        ) : (
          <ClubKpisCard kpis={kpis} />
        )}

        <div className="grid gap-lg xl:grid-cols-[1.2fr_0.8fr]">
          <Card variant="flat" padding="none">
            <CardHeader>
              <CardTitle>Membros recentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-sm">
              {membersLoading ? (
                <div className="space-y-sm">
                  <Skeleton className="h-14 rounded-xl" />
                  <Skeleton className="h-14 rounded-xl" />
                  <Skeleton className="h-14 rounded-xl" />
                </div>
              ) : totalMembers === 0 ? (
                <EmptyState
                  title="Sem membros"
                  description="Adicione os primeiros membros para estruturar a gestão do clube."
                  icon={Users}
                  action={{
                    label: 'Gerir membros',
                    onClick: () => navigate(ROUTES.DASHBOARD_CLUB_MEMBERS),
                  }}
                />
              ) : (
                members?.slice(0, 5).map((member) => (
                  <div key={member.id} className="flex items-center justify-between rounded-2xl border border-outline-variant/20 bg-surface-container p-md">
                    <div>
                      <p className="font-semibold text-on-surface">{member.display_name || member.full_name || 'Membro'}</p>
                      <p className="text-sm text-on-surface-variant">{member.role_label || member.role || 'Membro'}</p>
                    </div>
                    <Badge variant={member.is_active ? 'primary' : 'outline'}>
                      {member.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card variant="flat" padding="none">
            <CardHeader>
              <CardTitle>Atividade recente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-md">
              <div className="grid grid-cols-2 gap-sm">
                <div className="rounded-2xl border border-outline-variant/20 bg-surface-container p-md">
                  <p className="text-xs uppercase tracking-wide text-on-surface-variant">Documentos</p>
                  <p className="mt-1 text-2xl font-bold text-on-surface">{totalDocuments}</p>
                </div>
                <div className="rounded-2xl border border-outline-variant/20 bg-surface-container p-md">
                  <p className="text-xs uppercase tracking-wide text-on-surface-variant">Patrocinadores</p>
                  <p className="mt-1 text-2xl font-bold text-on-surface">{totalSponsors}</p>
                </div>
              </div>

              <div className="space-y-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">Transferências recentes</p>
                {transfersLoading ? (
                  <div className="space-y-sm">
                    <Skeleton className="h-14 rounded-xl" />
                    <Skeleton className="h-14 rounded-xl" />
                  </div>
                ) : recentTransfers.length === 0 ? (
                  <EmptyState
                    title="Sem transferências"
                    description="Ainda não há movimentos registados para este clube."
                    icon={Trophy}
                    action={{
                      label: 'Ver transferências',
                      onClick: () => navigate(ROUTES.DASHBOARD_CLUB_TRANSFERS),
                    }}
                  />
                ) : (
                  recentTransfers.map((transfer) => (
                    <div key={transfer.id} className="rounded-2xl border border-outline-variant/20 bg-surface-container p-md">
                      <div className="flex items-center justify-between gap-sm">
                        <div>
                          <p className="font-semibold text-on-surface">{transfer.player?.full_name}</p>
                          <p className="text-sm text-on-surface-variant">
                            {transfer.from_club?.name || 'Sem clube'} → {transfer.to_club?.name}
                          </p>
                        </div>
                        <Badge variant="outline">{transfer.status_display || transfer.status}</Badge>
                      </div>
                      <p className="mt-sm text-xs text-on-surface-variant">{formatRelative(transfer.created_at)}</p>
                    </div>
                  ))
                )}
              </div>

              <Button asChild variant="secondary" className="w-full">
                <Link to={ROUTES.DASHBOARD_CLUB_MEMBERS}>
                  <span>Ir para gestão completa</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-lg md:grid-cols-3">
          <Card variant="flat" padding="none">
            <CardHeader>
              <CardTitle>Resumo público</CardTitle>
            </CardHeader>
            <CardContent className="space-y-sm">
              <p className="text-sm text-on-surface-variant">Perfil público</p>
              <Badge variant={club.is_public ? 'primary' : 'outline'}>{club.is_public ? 'Publicado' : 'Privado'}</Badge>
              <p className="text-sm text-on-surface-variant">
                Use as configurações para ajustar marca, contacto e visibilidade.
              </p>
            </CardContent>
          </Card>

          <Card variant="flat" padding="none">
            <CardHeader>
              <CardTitle>Documentos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-sm">
              {totalDocuments === 0 ? (
                <div className="space-y-sm rounded-2xl border border-dashed border-outline-variant/30 bg-surface-container/40 p-md">
                  <p className="font-semibold text-on-surface">Ainda sem documentos</p>
                  <p className="text-sm text-on-surface-variant">Carregue regulamentos, contratos ou licenças.</p>
                  <Button asChild variant="secondary" size="sm" className="w-full">
                    <Link to={ROUTES.DASHBOARD_CLUB_DOCUMENTS}>Gerir documentos</Link>
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-on-surface-variant">Total</p>
                  <p className="text-3xl font-bold text-on-surface">{totalDocuments}</p>
                  <Button asChild variant="secondary" size="sm" className="w-full">
                    <Link to={ROUTES.DASHBOARD_CLUB_DOCUMENTS}>Gerir documentos</Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card variant="flat" padding="none">
            <CardHeader>
              <CardTitle>Patrocinadores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-sm">
              {totalSponsors === 0 ? (
                <div className="space-y-sm rounded-2xl border border-dashed border-outline-variant/30 bg-surface-container/40 p-md">
                  <p className="font-semibold text-on-surface">Ainda sem patrocinadores</p>
                  <p className="text-sm text-on-surface-variant">Adicione parceiros para fortalecer a vitrine comercial.</p>
                  <Button asChild variant="secondary" size="sm" className="w-full">
                    <Link to={ROUTES.DASHBOARD_CLUB_SPONSORS}>Gerir patrocinadores</Link>
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-sm text-on-surface-variant">Total</p>
                  <p className="text-3xl font-bold text-on-surface">{totalSponsors}</p>
                  <Button asChild variant="secondary" size="sm" className="w-full">
                    <Link to={ROUTES.DASHBOARD_CLUB_SPONSORS}>Gerir patrocinadores</Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
