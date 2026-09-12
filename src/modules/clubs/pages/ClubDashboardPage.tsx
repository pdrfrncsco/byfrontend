import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  ArrowRightLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Flame,
  ListChecks,
  Plus,
  Settings,
  Sparkles,
  Trophy,
  UserCheck,
  UserCircle,
  UserPlus,
  Users,
} from 'lucide-react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { ROUTES } from '@/constants/routes'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui'
import { EmptyState } from '@/components/ui/empty-state'
import { ClubLogo } from '@/modules/clubs/components/ClubLogo'
import { getClubSidebarSections } from '@/modules/clubs/constants/navigation'
import {
  useClubMe,
  useClubMeCompetitions,
  useClubMeMatches,
  useClubMembers,
  useClubSquad,
  useTransfers,
} from '@/modules/clubs/hooks/useClubs'
import { useClubPlayerRegistrationRequests } from '@/modules/players/hooks'
import { POSITION_COLOR } from '@/modules/players/constants'

function formatRelativeTime(dateString?: string | null): string {
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

  const { data: squad = [], isLoading: squadLoading } = useClubSquad(slug)
  const { data: members = [], isLoading: membersLoading } = useClubMembers(slug)
  const { data: competitions = [], isLoading: competitionsLoading } = useClubMeCompetitions()
  const { data: matches = [], isLoading: matchesLoading } = useClubMeMatches()
  const { data: transfersData, isLoading: transfersLoading } = useTransfers({ page_size: 5 })
  const { data: playerRequests = [] } = useClubPlayerRegistrationRequests(club?.id)

  const pendingTransfers = useMemo(() => {
    return (transfersData?.results ?? []).filter((t: any) =>
      ['pending', 'in_progress', 'draft'].includes(t.status?.toLowerCase())
    )
  }, [transfersData])

  const pendingRequests = useMemo(() => {
    return playerRequests.filter((r) => r.status?.toLowerCase() === 'pending')
  }, [playerRequests])

  const sidebarSections = useMemo(
    () =>
      getClubSidebarSections({
        pendingTransfers: pendingTransfers.length,
        pendingRequests: pendingRequests.length,
      }),
    [pendingTransfers.length, pendingRequests.length],
  )

  // Next scheduled match
  const nextMatch = useMemo(() => {
    const upcoming = matches
      .filter((m: any) => m.status === 'scheduled' || !m.status)
      .sort((a: any, b: any) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime())
    return upcoming[0] || null
  }, [matches])

  if (clubLoading) {
    return (
      <DashboardLayout
        title="Portal do Clube"
        subtitle="A carregar painel operacional..."
        dashboardType="club"
        sidebarSections={sidebarSections}
      >
        <div className="space-y-lg">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <div className="grid gap-lg lg:grid-cols-3">
            <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!club) {
    return (
      <DashboardLayout
        title="Portal do Clube"
        subtitle="Ainda não possui um clube associado"
        dashboardType="club"
        sidebarSections={sidebarSections}
      >
        <EmptyState
          icon={Building2}
          title="Nenhum clube encontrado"
          description="Complete o processo de onboarding ou solicite a vinculação a uma organização desportiva."
          action={{
            label: 'Solicitar Vinculação / Onboarding',
            onClick: () => navigate(ROUTES.CLUB_ONBOARDING),
          }}
        />
      </DashboardLayout>
    )
  }

  const isHome = nextMatch?.home_club === club.id
  const nextOpponent = nextMatch ? (isHome ? nextMatch.away_club_name : nextMatch.home_club_name) : null

  return (
    <DashboardLayout
      title={club.name}
      subtitle="Dashboard operacional · plantel, competições e transferências"
      dashboardType="club"
      sidebarSections={sidebarSections}
    >
      <div className="space-y-lg">
        {/* ─── 1. PAGE HEADER (PROTOTYPE DESIGN SYSTEM) ────────────────── */}
        <div className="flex flex-col gap-md rounded-2xl border border-outline-variant/30 bg-surface-container/40 p-lg shadow-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-md">
            <ClubLogo
              name={club.name}
              logoUrl={club.logo_url}
              shortName={club.short_name}
              primaryColor={club.primary_color || '#185fa5'}
              size="lg"
              shape="squircle"
              className="shadow-sm"
            />

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-xs">
                <h1 className="text-xl font-bold text-on-surface">{club.name}</h1>
                <Badge
                  variant={club.status === 'active' ? 'success' : club.status === 'suspended' ? 'danger' : 'warning'}
                  className="text-xs"
                >
                  {club.status_label || club.status || 'Ativo'}
                </Badge>
                {club.is_verified && (
                  <Badge variant="secondary" className="text-xs">
                    Verificado
                  </Badge>
                )}
              </div>

              <p className="flex items-center gap-xs text-xs text-on-surface-variant">
                <span>{[club.city, club.country].filter(Boolean).join(' • ') || 'Angola'}</span>
                <span>•</span>
                <span>{squad.length} atletas inscritos</span>
                <span>•</span>
                <span>{competitions.length} competições ativas</span>
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-xs">
            <Button asChild variant="outline" size="sm" className="gap-xs text-xs">
              <Link to={ROUTES.DASHBOARD_CLUB_REGISTER_PLAYER}>
                <UserPlus className="h-3.5 w-3.5" />
                Registar Jogador
              </Link>
            </Button>
            <Button asChild variant="primary" size="sm" className="gap-xs text-xs">
              <Link to={ROUTES.DASHBOARD_CLUB_TRANSFERS_CREATE}>
                <Plus className="h-3.5 w-3.5" />
                Nova Transferência
              </Link>
            </Button>
          </div>
        </div>

        {/* ─── 2. KPI ROW (5 CARDS UNIFIED PATTERN) ────────────────────── */}
        <div className="grid grid-cols-2 gap-sm sm:grid-cols-3 lg:grid-cols-5">
          {/* Plantel */}
          <div className="rounded-xl border border-outline-variant/30 bg-surface p-md shadow-xs">
            <div className="mb-2 flex items-center gap-xs text-xs text-on-surface-variant">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#e6f1fb] text-[#185fa5]">
                <Users className="h-3.5 w-3.5" />
              </div>
              <span className="font-medium">Plantel</span>
            </div>
            <div className="text-2xl font-bold text-on-surface">{squad.length}</div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
              <Flame className="h-3 w-3" />
              Inscritos na época
            </div>
          </div>

          {/* Competições */}
          <div className="rounded-xl border border-outline-variant/30 bg-surface p-md shadow-xs">
            <div className="mb-2 flex items-center gap-xs text-xs text-on-surface-variant">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#faeeda] text-[#854f0b]">
                <Trophy className="h-3.5 w-3.5" />
              </div>
              <span className="font-medium">Competições</span>
            </div>
            <div className="text-2xl font-bold text-on-surface">{competitions.length}</div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
              <CheckCircle2 className="h-3 w-3" />
              Ativas no calendário
            </div>
          </div>

          {/* Próximo Jogo */}
          <div className="rounded-xl border border-outline-variant/30 bg-surface p-md shadow-xs">
            <div className="mb-2 flex items-center gap-xs text-xs text-on-surface-variant">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#e1f5ee] text-[#0f6e56]">
                <Calendar className="h-3.5 w-3.5" />
              </div>
              <span className="font-medium">Próximo Jogo</span>
            </div>
            <div className="truncate text-base font-bold text-on-surface">
              {nextMatch
                ? new Date(nextMatch.match_date).toLocaleDateString('pt-AO', { day: '2-digit', month: 'short' })
                : 'A definir'}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-on-surface-variant truncate">
              {nextOpponent ? `vs ${nextOpponent}` : 'Sem jogos marcados'}
            </div>
          </div>

          {/* Transferências Pendentes */}
          <div className="rounded-xl border border-outline-variant/30 bg-surface p-md shadow-xs">
            <div className="mb-2 flex items-center gap-xs text-xs text-on-surface-variant">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#fcebeb] text-[#a32d2d]">
                <ArrowRightLeft className="h-3.5 w-3.5" />
              </div>
              <span className="font-medium">Transf. Pendentes</span>
            </div>
            <div className="text-2xl font-bold text-on-surface">{pendingTransfers.length}</div>
            <div className="mt-1 flex items-center gap-1 text-[11px]">
              {pendingTransfers.length > 0 ? (
                <span className="text-amber-600 font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Aguardam aprovação
                </span>
              ) : (
                <span className="text-on-surface-variant">Tudo regularizado</span>
              )}
            </div>
          </div>

          {/* Membros & Staff */}
          <div className="rounded-xl border border-outline-variant/30 bg-surface p-md shadow-xs col-span-2 sm:col-span-1">
            <div className="mb-2 flex items-center gap-xs text-xs text-on-surface-variant">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#eeedfe] text-[#534ab7]">
                <UserCircle className="h-3.5 w-3.5" />
              </div>
              <span className="font-medium">Membros & Staff</span>
            </div>
            <div className="text-2xl font-bold text-on-surface">{members.length}</div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-on-surface-variant">
              Equipa registada
            </div>
          </div>
        </div>

        {/* ─── 3. BODY 65/35 (COLUNA PRINCIPAL + COLUNA LATERAL) ───────── */}
        <div className="grid grid-cols-1 gap-lg lg:grid-cols-3">
          {/* Coluna Principal (65%) */}
          <div className="space-y-lg lg:col-span-2">
            {/* Card: Plantel Recente */}
            <Card variant="flat" padding="none" className="border-outline-variant/30 bg-surface shadow-xs">
              <CardHeader className="border-b border-outline-variant/20 pb-md">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-xs text-sm font-semibold text-on-surface">
                    <Users className="h-4 w-4 text-primary" />
                    Plantel de Atletas
                  </CardTitle>
                  <Button asChild variant="ghost" size="sm" className="gap-1 text-xs text-primary">
                    <Link to={ROUTES.DASHBOARD_CLUB_SQUAD}>
                      Ver todos <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-lg">
                {squadLoading ? (
                  <div className="space-y-sm">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full rounded-xl" />
                    ))}
                  </div>
                ) : squad.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="Nenhum jogador inscrito no plantel"
                    description="Comece por registar os atletas do clube para participar nas competições oficiais."
                    action={{
                      label: 'Registar Jogador',
                      onClick: () => navigate(ROUTES.DASHBOARD_CLUB_REGISTER_PLAYER),
                    }}
                  />
                ) : (
                  <div className="space-y-xs divide-y divide-outline-variant/15">
                    {squad.slice(0, 5).map((player) => {
                      const posKey = (player.position || '').toLowerCase()
                      const posColor = POSITION_COLOR[posKey] || '#185fa5'
                      const initials = (player.display_name || '?').slice(0, 2).toUpperCase()

                      return (
                        <div
                          key={player.id}
                          className="flex items-center justify-between py-2 transition-colors hover:bg-surface-container/30 px-xs rounded-lg"
                        >
                          <div className="flex items-center gap-sm">
                            <div
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-xs"
                              style={{ background: posColor }}
                            >
                              {initials}
                            </div>
                            <div>
                              <p className="font-semibold text-xs text-on-surface">{player.display_name}</p>
                              <p className="text-[11px] text-on-surface-variant">
                                {player.position_label || player.position || 'Atleta'}
                                {player.jersey_number ? ` · #${player.jersey_number}` : ''}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-xs">
                            <Badge
                              variant={player.status === 'suspended' ? 'danger' : 'success'}
                              className="text-[11px]"
                            >
                              {player.status_label || (player.status === 'suspended' ? 'Suspenso' : 'Ativo')}
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card: Competições Ativas */}
            <Card variant="flat" padding="none" className="border-outline-variant/30 bg-surface shadow-xs">
              <CardHeader className="border-b border-outline-variant/20 pb-md">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-xs text-sm font-semibold text-on-surface">
                    <Trophy className="h-4 w-4 text-primary" />
                    Competições em Disputa
                  </CardTitle>
                  <Button asChild variant="ghost" size="sm" className="gap-1 text-xs text-primary">
                    <Link to={ROUTES.DASHBOARD_CLUB_COMPETITIONS}>
                      Ver todas <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-lg">
                {competitionsLoading ? (
                  <div className="space-y-sm">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full rounded-xl" />
                    ))}
                  </div>
                ) : competitions.length === 0 ? (
                  <EmptyState
                    icon={Trophy}
                    title="Nenhuma competição ativa"
                    description="O clube ainda não está inscrito em nenhuma competição na presente temporada."
                  />
                ) : (
                  <div className="space-y-xs divide-y divide-outline-variant/15">
                    {competitions.slice(0, 4).map((comp: any) => (
                      <div
                        key={comp.id}
                        className="flex items-center justify-between py-2 transition-colors hover:bg-surface-container/30 px-xs rounded-lg"
                      >
                        <div className="space-y-0.5">
                          <p className="font-semibold text-xs text-on-surface">{comp.name}</p>
                          <p className="text-[11px] text-on-surface-variant">
                            {comp.season ? `Época ${comp.season}` : 'Temporada oficial'}
                            {comp.format ? ` · ${comp.format}` : ''}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {comp.status_label || comp.status || 'Ativa'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card: Transferências Recentes */}
            <Card variant="flat" padding="none" className="border-outline-variant/30 bg-surface shadow-xs">
              <CardHeader className="border-b border-outline-variant/20 pb-md">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-xs text-sm font-semibold text-on-surface">
                    <ArrowRightLeft className="h-4 w-4 text-primary" />
                    Movimentações & Transferências
                  </CardTitle>
                  <Button asChild variant="ghost" size="sm" className="gap-1 text-xs text-primary">
                    <Link to={ROUTES.DASHBOARD_CLUB_TRANSFERS}>
                      Ver todas <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-lg">
                {transfersLoading ? (
                  <Skeleton className="h-16 rounded-xl" />
                ) : (transfersData?.results ?? []).length === 0 ? (
                  <p className="text-xs text-on-surface-variant py-sm text-center">
                    Sem movimentos de transferência registados nesta época.
                  </p>
                ) : (
                  <div className="space-y-xs divide-y divide-outline-variant/15">
                    {(transfersData?.results ?? []).slice(0, 3).map((transfer: any) => (
                      <div key={transfer.id} className="flex items-center justify-between py-2 text-xs">
                        <div>
                          <p className="font-semibold text-on-surface">
                            {transfer.player_name || 'Jogador'}
                          </p>
                          <p className="text-[11px] text-on-surface-variant">
                            {transfer.from_club_name || 'Clube'} → {transfer.to_club_name || 'Clube'}
                          </p>
                        </div>
                        <Badge variant={transfer.status === 'completed' ? 'success' : 'warning'} className="text-[11px]">
                          {transfer.status_label || transfer.status || 'Pendente'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Coluna Lateral (35%) */}
          <div className="space-y-md lg:col-span-1">
            {/* Card: Ações Rápidas (Grid 2x2 com ícones coloridos) */}
            <Card variant="flat" padding="none" className="border-outline-variant/30 bg-surface shadow-xs">
              <CardHeader className="border-b border-outline-variant/20 pb-xs">
                <CardTitle className="flex items-center gap-xs text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-xs p-md">
                {/* 1. Registar jogador */}
                <Link
                  to={ROUTES.DASHBOARD_CLUB_REGISTER_PLAYER}
                  className="flex items-center gap-sm rounded-xl border border-outline-variant/20 bg-surface-container/30 p-sm transition-all hover:bg-surface-container/80 hover:border-primary/30"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e6f1fb] text-[#185fa5]">
                    <UserPlus className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-on-surface">Registar</p>
                    <p className="truncate text-[10px] text-on-surface-variant">Novo atleta</p>
                  </div>
                </Link>

                {/* 2. Transferência */}
                <Link
                  to={ROUTES.DASHBOARD_CLUB_TRANSFERS_CREATE}
                  className="flex items-center gap-sm rounded-xl border border-outline-variant/20 bg-surface-container/30 p-sm transition-all hover:bg-surface-container/80 hover:border-primary/30"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#faeeda] text-[#854f0b]">
                    <ArrowRightLeft className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-on-surface">Transferência</p>
                    <p className="truncate text-[10px] text-on-surface-variant">Iniciar pedido</p>
                  </div>
                </Link>

                {/* 3. Lineup */}
                <Link
                  to={ROUTES.DASHBOARD_CLUB_LINEUP}
                  className="flex items-center gap-sm rounded-xl border border-outline-variant/20 bg-surface-container/30 p-sm transition-all hover:bg-surface-container/80 hover:border-primary/30"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e1f5ee] text-[#0f6e56]">
                    <ListChecks className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-on-surface">Lineup</p>
                    <p className="truncate text-[10px] text-on-surface-variant">Escalação tática</p>
                  </div>
                </Link>

                {/* 4. Convidar membro */}
                <Link
                  to={ROUTES.DASHBOARD_CLUB_MEMBERS}
                  className="flex items-center gap-sm rounded-xl border border-outline-variant/20 bg-surface-container/30 p-sm transition-all hover:bg-surface-container/80 hover:border-primary/30"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eeedfe] text-[#534ab7]">
                    <UserCircle className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-on-surface">Membros</p>
                    <p className="truncate text-[10px] text-on-surface-variant">Gerir equipa</p>
                  </div>
                </Link>
              </CardContent>
            </Card>

            {/* Card: Atividade Recente (Activity Feed com dots coloridos) */}
            <Card variant="flat" padding="none" className="border-outline-variant/30 bg-surface shadow-xs">
              <CardHeader className="border-b border-outline-variant/20 pb-xs">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-sm p-md text-xs">
                {squad.length > 0 && (
                  <div className="flex items-start gap-sm border-b border-outline-variant/10 pb-sm">
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#185fa5]" />
                    <div>
                      <p className="font-semibold text-on-surface">
                        {squad[0]?.display_name} no plantel
                      </p>
                      <p className="text-[11px] text-on-surface-variant">
                        Atleta inscrito com camisola #{squad[0]?.jersey_number || '—'}
                      </p>
                      <span className="text-[10px] text-on-surface-variant/70">
                        {formatRelativeTime(squad[0]?.joined_at)}
                      </span>
                    </div>
                  </div>
                )}

                {pendingRequests.length > 0 && (
                  <div className="flex items-start gap-sm border-b border-outline-variant/10 pb-sm">
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#a32d2d]" />
                    <div>
                      <p className="font-semibold text-on-surface">Pedido de vínculo pendente</p>
                      <p className="text-[11px] text-on-surface-variant">
                        {pendingRequests[0]?.player_name} aguarda revisão da secretaria
                      </p>
                      <span className="text-[10px] text-on-surface-variant/70">Ação requerida</span>
                    </div>
                  </div>
                )}

                {nextMatch && (
                  <div className="flex items-start gap-sm border-b border-outline-variant/10 pb-sm">
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#0f6e56]" />
                    <div>
                      <p className="font-semibold text-on-surface">Partida agendada</p>
                      <p className="text-[11px] text-on-surface-variant">
                        vs {nextOpponent} na {nextMatch.competition_name || nextMatch.competition || 'Competição'}
                      </p>
                      <span className="text-[10px] text-on-surface-variant/70">
                        {new Date(nextMatch.match_date).toLocaleDateString('pt-AO', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-sm">
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#534ab7]" />
                  <div>
                    <p className="font-semibold text-on-surface">Painel institucional atualizado</p>
                    <p className="text-[11px] text-on-surface-variant">
                      Registos e documentação desportiva sincronizados
                    </p>
                    <span className="text-[10px] text-on-surface-variant/70">Hoje</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card: Atalhos Rápidos para Ativos */}
            <Card variant="flat" padding="none" className="border-outline-variant/30 bg-surface shadow-xs">
              <CardContent className="space-y-xs p-md">
                <Button asChild variant="outline" size="sm" className="w-full justify-between text-xs">
                  <Link to={ROUTES.DASHBOARD_CLUB_DOCUMENTS}>
                    <span className="flex items-center gap-xs">
                      <FileText className="h-3.5 w-3.5 text-primary" />
                      Documentos Oficiais
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-on-surface-variant" />
                  </Link>
                </Button>

                <Button asChild variant="outline" size="sm" className="w-full justify-between text-xs">
                  <Link to={ROUTES.DASHBOARD_CLUB_PLAYER_REQUESTS}>
                    <span className="flex items-center gap-xs">
                      <UserCheck className="h-3.5 w-3.5 text-primary" />
                      Pedidos de Vínculo
                    </span>
                    {pendingRequests.length > 0 && (
                      <Badge variant="warning" className="text-[10px] py-0 px-1.5">
                        {pendingRequests.length}
                      </Badge>
                    )}
                  </Link>
                </Button>

                <Button asChild variant="outline" size="sm" className="w-full justify-between text-xs">
                  <Link to={`/clubs/${club.slug}`}>
                    <span className="flex items-center gap-xs">
                      <ExternalLink className="h-3.5 w-3.5 text-primary" />
                      Ver Perfil Público
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-on-surface-variant" />
                  </Link>
                </Button>

                <Button asChild variant="outline" size="sm" className="w-full justify-between text-xs">
                  <Link to={ROUTES.DASHBOARD_CLUB_SETTINGS}>
                    <span className="flex items-center gap-xs">
                      <Settings className="h-3.5 w-3.5 text-primary" />
                      Definições do Clube
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-on-surface-variant" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
