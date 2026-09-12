import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  Users,
  Search,
  LayoutGrid,
  List,
  UserPlus,
  Shield,
  Calendar,
  X,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { ROUTES } from '@/constants/routes'
import { resolveMediaUrl } from '@/lib/media'
import { getClubSidebarSections } from '@/modules/clubs/constants/navigation'
import {
  useClubMe,
  useClubKpis,
  useClubMembers,
  useClubSquad,
  useClubStaff,
} from '@/modules/clubs/hooks/useClubs'
import type { ClubMember, ClubSquadMember, ClubStaffMember } from '@/modules/clubs/types'
import {
  ClubSquadPlayerCard,
  getPositionAccentColor,
  getStatusBadgeConfig,
} from '@/modules/clubs/components/ClubSquadPlayerCard'
import { ClubPlayerPreviewModal } from '@/modules/clubs/components/ClubPlayerPreviewModal'
import { ClubLogo } from '@/modules/clubs/components/ClubLogo'

type SectorType = 'all' | 'gk' | 'def' | 'mid' | 'att'
type StatusFilterType = 'all' | 'active' | 'loaned' | 'suspended'
type ViewMode = 'grid' | 'table'

function formatDate(value?: string | null) {
  if (!value) return 'N/A'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-AO')
}

function roleLabel(role?: string | null) {
  switch (role) {
    case 'coach':
      return 'Treinador Principal'
    case 'assistant_coach':
      return 'Treinador Adjunto'
    case 'manager':
      return 'Gestor Desportivo'
    case 'physio':
      return 'Fisioterapeuta'
    case 'staff':
      return 'Staff Técnico'
    case 'president':
      return 'Presidente'
    default:
      return 'Membro'
  }
}

function getPlayerSector(player: ClubSquadMember | ClubMember): 'gk' | 'def' | 'mid' | 'att' | 'other' {
  const p = (player.position || player.position_label || '').toLowerCase()
  if (p === 'gk' || p.includes('guarda') || p.includes('redes') || p.includes('goleiro')) return 'gk'
  if (
    p === 'df' ||
    p.includes('defesa') ||
    p.includes('lateral') ||
    p.includes('zagueiro') ||
    p.includes('central') ||
    p.includes('cb') ||
    p.includes('lb') ||
    p.includes('rb')
  ) {
    return 'def'
  }
  if (
    p === 'mf' ||
    p.includes('médio') ||
    p.includes('medio') ||
    p.includes('campo') ||
    p.includes('volante') ||
    p.includes('cm') ||
    p.includes('cdm') ||
    p.includes('cam')
  ) {
    return 'mid'
  }
  if (
    p === 'fw' ||
    p.includes('avan') ||
    p.includes('atac') ||
    p.includes('ponta') ||
    p.includes('extremo') ||
    p.includes('st') ||
    p.includes('cf') ||
    p.includes('lw') ||
    p.includes('rw')
  ) {
    return 'att'
  }
  return 'other'
}

function getPlayerStatusGroup(player: ClubSquadMember | ClubMember): 'active' | 'loaned' | 'suspended' | 'inactive' {
  const raw = 'status' in player && player.status ? player.status.toLowerCase() : ''
  const isActive = 'is_active' in player ? player.is_active : true
  if (raw === 'loaned' || raw === 'emprestado' || raw === 'loan') return 'loaned'
  if (raw === 'suspended' || raw === 'suspenso') return 'suspended'
  if (raw === 'inactive' || isActive === false) return 'inactive'
  return 'active'
}

export default function ClubSquadPage() {
  const navigate = useNavigate()
  const { data: club, isLoading: clubLoading } = useClubMe()
  const slug = club?.slug
  const { data: kpis, isLoading: kpisLoading } = useClubKpis(slug)
  const { data: members, isLoading: membersLoading } = useClubMembers(slug)
  const { data: publicSquad, isLoading: publicSquadLoading } = useClubSquad(slug)
  const { data: publicStaff, isLoading: publicStaffLoading } = useClubStaff(slug)

  // Interactive filtering states
  const [searchQuery, setSearchQuery] = useState('')
  const [sectorFilter, setSectorFilter] = useState<SectorType>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectedPlayer, setSelectedPlayer] = useState<ClubSquadMember | ClubMember | null>(null)

  const { players, staff } = useMemo(() => {
    const memberList = Array.isArray(members) ? members : []
    const fromMembersPlayers = memberList.filter((member) => member.is_active !== false && member.role === 'player')
    const fromMembersStaff = memberList.filter((member) => member.is_active !== false && member.role !== 'player')

    // If we have members, use that; otherwise use public data
    const finalPlayers = fromMembersPlayers.length > 0 ? fromMembersPlayers : publicSquad || []
    const finalStaff = fromMembersStaff.length > 0 ? fromMembersStaff : publicStaff || []

    return {
      players: finalPlayers,
      staff: finalStaff,
    }
  }, [members, publicSquad, publicStaff])

  // Sector breakdown count for KPIs
  const sectorCounts = useMemo(() => {
    const counts = { gk: 0, def: 0, mid: 0, att: 0, other: 0 }
    players.forEach((p) => {
      const sector = getPlayerSector(p)
      counts[sector]++
    })
    return counts
  }, [players])

  // Active players count
  const activePlayersCount = useMemo(() => {
    return players.filter((p) => getPlayerStatusGroup(p) === 'active').length
  }, [players])

  // Squad average age
  const averageAge = useMemo(() => {
    const ages: number[] = []
    players.forEach((p) => {
      const dob = ('date_of_birth' in p && p.date_of_birth) || null
      if (dob) {
        const birthDate = new Date(dob)
        if (!Number.isNaN(birthDate.getTime())) {
          const today = new Date()
          let age = today.getFullYear() - birthDate.getFullYear()
          const m = today.getMonth() - birthDate.getMonth()
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--
          }
          if (age > 12 && age < 55) {
            ages.push(age)
          }
        }
      }
    })
    if (ages.length === 0) return null
    const sum = ages.reduce((acc, a) => acc + a, 0)
    return (sum / ages.length).toFixed(1)
  }, [players])

  // Filtered players list
  const filteredPlayers = useMemo(() => {
    return players.filter((player) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const name = (
          ('display_name' in player && player.display_name) ||
          ('full_name' in player && player.full_name) ||
          ''
        ).toLowerCase()
        const jersey = player.jersey_number !== null && player.jersey_number !== undefined ? `#${player.jersey_number}` : ''
        const jerseyPlain = player.jersey_number !== null && player.jersey_number !== undefined ? `${player.jersey_number}` : ''
        const pos = (player.position_label || player.position || '').toLowerCase()

        const matchesQuery =
          name.includes(query) ||
          jersey.includes(query) ||
          jerseyPlain === query ||
          pos.includes(query)

        if (!matchesQuery) return false
      }

      // 2. Sector Filter
      if (sectorFilter !== 'all') {
        const playerSector = getPlayerSector(player)
        if (playerSector !== sectorFilter) return false
      }

      // 3. Status Filter
      if (statusFilter !== 'all') {
        const playerStatus = getPlayerStatusGroup(player)
        if (playerStatus !== statusFilter) return false
      }

      return true
    })
  }, [players, searchQuery, sectorFilter, statusFilter])

  const sidebarSections = useMemo(() => getClubSidebarSections(), [])

  if (clubLoading || !club) {
    return (
      <DashboardLayout
        title="Plantel"
        subtitle="Carregando plantel do clube..."
        dashboardType="club"
        sidebarSections={sidebarSections}
      >
        <div className="space-y-lg">
          <Skeleton className="h-36 w-full rounded-[2rem]" />
          <Skeleton className="h-96 w-full rounded-[2rem]" />
        </div>
      </DashboardLayout>
    )
  }

  const hasActiveFilters = searchQuery.trim() !== '' || sectorFilter !== 'all' || statusFilter !== 'all'

  const handleClearFilters = () => {
    setSearchQuery('')
    setSectorFilter('all')
    setStatusFilter('all')
  }

  return (
    <DashboardLayout
      title={`Plantel & Equipa Técnica • ${club.name}`}
      subtitle="Consulte atletas federados por setor tático, equipa técnica e histórico desportivo."
      dashboardType="club"
      sidebarSections={sidebarSections}
      headerActions={
        <div className="flex items-center gap-sm">
          <Button asChild variant="secondary" size="sm">
            <Link to={ROUTES.DASHBOARD_CLUB}>
              <ArrowLeft className="mr-xs h-4 w-4" />
              <span>Voltar ao Painel</span>
            </Link>
          </Button>
          <Button asChild variant="primary" size="sm">
            <Link to={ROUTES.DASHBOARD_CLUB_REGISTER_PLAYER}>
              <UserPlus className="mr-xs h-4 w-4" />
              <span>Registar Jogador</span>
            </Link>
          </Button>
        </div>
      }
    >
      <div className="space-y-xl">
        {/* Executive Page Header */}
        <div className="rounded-2xl border border-outline-variant/30 bg-surface p-lg shadow-xs">
          <div className="flex flex-col gap-md md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-md">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container/50 p-1 flex items-center justify-center">
                <ClubLogo logoUrl={club.logo_url} name={club.name} size="lg" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-xs">
                  <Badge variant="secondary" className="border-primary/20 bg-primary/10 text-primary font-semibold text-[11px]">
                    <Users className="mr-1 h-3 w-3" />
                    Gestão de Plantel & Elenco
                  </Badge>
                  {(club.tenant_name || (club as any).association_name) && (
                    <Badge variant="outline" className="text-[11px] text-on-surface-variant">
                      {club.tenant_name || (club as any).association_name}
                    </Badge>
                  )}
                </div>
                <h1 className="mt-1 text-2xl font-bold text-on-surface tracking-tight">
                  Plantel & Equipa Técnica • {club.name}
                </h1>
                <p className="text-xs text-on-surface-variant">
                  Consulte os atletas federados por setor tático, equipa técnica e condições desportivas.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-xs">
              <Button asChild variant="secondary" size="sm">
                <Link to={ROUTES.DASHBOARD_CLUB_LINEUP}>
                  Convocatórias & Onze
                </Link>
              </Button>
              <Button asChild variant="secondary" size="sm">
                <Link to={ROUTES.DASHBOARD_CLUB_PLAYER_REQUESTS}>
                  Pedidos de Vínculo
                </Link>
              </Button>
              <Button asChild variant="primary" size="sm">
                <Link to={ROUTES.DASHBOARD_CLUB_REGISTER_PLAYER}>
                  <UserPlus className="mr-xs h-4 w-4" />
                  <span>Novo Jogador</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* 4 KPIs Row */}
        <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-4">
          <Card variant="flat" padding="none" className="border-outline-variant/30 bg-surface shadow-xs transition-all hover:border-primary/30">
            <CardContent className="p-md">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">Plantel Principal</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-on-surface">{players.length}</p>
              <div className="mt-1 flex flex-wrap gap-1 text-[10px]">
                <span className="rounded bg-amber-500/10 px-1 py-0.5 font-semibold text-amber-600 dark:text-amber-400">{sectorCounts.gk} GR</span>
                <span className="rounded bg-blue-500/10 px-1 py-0.5 font-semibold text-blue-600 dark:text-blue-400">{sectorCounts.def} DEF</span>
                <span className="rounded bg-emerald-500/10 px-1 py-0.5 font-semibold text-emerald-600 dark:text-emerald-400">{sectorCounts.mid} MED</span>
                <span className="rounded bg-rose-500/10 px-1 py-0.5 font-semibold text-rose-600 dark:text-rose-400">{sectorCounts.att} AVA</span>
              </div>
            </CardContent>
          </Card>

          <Card variant="flat" padding="none" className="border-outline-variant/30 bg-surface shadow-xs transition-all hover:border-primary/30">
            <CardContent className="p-md">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">Equipa Técnica</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Building2 className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-on-surface">{staff.length}</p>
              <p className="mt-0.5 text-[11px] text-on-surface-variant">Treinadores e comissão técnica</p>
            </CardContent>
          </Card>

          <Card variant="flat" padding="none" className="border-outline-variant/30 bg-surface shadow-xs transition-all hover:border-primary/30">
            <CardContent className="p-md">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">Atletas Ativos</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Shield className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-on-surface">{activePlayersCount}</p>
              <p className="mt-0.5 text-[11px] text-on-surface-variant">Elegíveis para convocatórias</p>
            </CardContent>
          </Card>

          <Card variant="flat" padding="none" className="border-outline-variant/30 bg-surface shadow-xs transition-all hover:border-primary/30">
            <CardContent className="p-md">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">Média Etária</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Calendar className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-on-surface">
                {averageAge ? `${averageAge} anos` : 'Em apuramento'}
              </p>
              <p className="mt-0.5 text-[11px] text-on-surface-variant">Perfil etário do plantel</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs: Plantel / Staff */}
        <Tabs defaultValue="squad" className="space-y-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-md border-b border-outline-variant/20 pb-md">
            <TabsList className="h-auto flex flex-wrap gap-xs rounded-full border border-outline-variant/20 bg-surface-container p-1">
              <TabsTrigger
                value="squad"
                className="rounded-full px-lg py-sm text-xs font-semibold data-[state=active]:bg-primary-container data-[state=active]:text-primary shadow-xs transition-all"
              >
                Plantel ({players.length})
              </TabsTrigger>
              <TabsTrigger
                value="staff"
                className="rounded-full px-lg py-sm text-xs font-semibold data-[state=active]:bg-primary-container data-[state=active]:text-primary shadow-xs transition-all"
              >
                Staff ({staff.length})
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content: Squad */}
          <TabsContent value="squad" className="space-y-lg animate-in fade-in duration-300">
            {/* Dynamic Controls Bar: Search + Sectors + Status + ViewMode */}
            <div className="flex flex-col gap-md rounded-2xl border border-outline-variant/30 bg-surface p-md shadow-xs lg:flex-row lg:items-center lg:justify-between">
              {/* Search & Sector Filters */}
              <div className="flex flex-1 flex-col gap-sm sm:flex-row sm:items-center">
                {/* Search input */}
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant opacity-60" />
                  <Input
                    type="text"
                    placeholder="Buscar por nome ou dorsal..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-8 text-xs rounded-xl"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                      aria-label="Limpar busca"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Sector Chips */}
                <div className="flex flex-wrap items-center gap-1">
                  <button
                    onClick={() => setSectorFilter('all')}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      sectorFilter === 'all'
                        ? 'bg-primary text-on-primary shadow-2xs font-semibold'
                        : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface'
                    }`}
                  >
                    Todos ({players.length})
                  </button>
                  <button
                    onClick={() => setSectorFilter('gk')}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      sectorFilter === 'gk'
                        ? 'bg-amber-600 text-white shadow-2xs font-semibold'
                        : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface'
                    }`}
                  >
                    GR ({sectorCounts.gk})
                  </button>
                  <button
                    onClick={() => setSectorFilter('def')}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      sectorFilter === 'def'
                        ? 'bg-blue-600 text-white shadow-2xs font-semibold'
                        : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface'
                    }`}
                  >
                    DEF ({sectorCounts.def})
                  </button>
                  <button
                    onClick={() => setSectorFilter('mid')}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      sectorFilter === 'mid'
                        ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                        : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface'
                    }`}
                  >
                    MED ({sectorCounts.mid})
                  </button>
                  <button
                    onClick={() => setSectorFilter('att')}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      sectorFilter === 'att'
                        ? 'bg-rose-600 text-white shadow-2xs font-semibold'
                        : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface'
                    }`}
                  >
                    AVA ({sectorCounts.att})
                  </button>
                </div>
              </div>

              {/* Status Filter & View Toggle */}
              <div className="flex items-center justify-between sm:justify-end gap-sm border-t border-outline-variant/15 pt-sm lg:border-t-0 lg:pt-0">
                {/* Status selector */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilterType)}
                  className="rounded-xl border border-outline-variant/30 bg-surface-container px-2.5 py-1.5 text-xs font-medium text-on-surface shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-primary"
                  aria-label="Filtrar por estado"
                >
                  <option value="all">Todos os estados</option>
                  <option value="active">Ativos / Registados</option>
                  <option value="loaned">Emprestados</option>
                  <option value="suspended">Suspensos</option>
                </select>

                {/* View Mode Toggle: Grid vs Table */}
                <div className="flex items-center rounded-xl border border-outline-variant/30 bg-surface-container p-0.5">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-surface text-primary shadow-xs'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    title="Visualização em Grelha"
                    aria-label="Visualização em Grelha"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                      viewMode === 'table'
                        ? 'bg-surface text-primary shadow-xs'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    title="Visualização em Lista"
                    aria-label="Visualização em Lista"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content Display: Loading, Empty, Grid, or Table */}
            {membersLoading || publicSquadLoading ? (
              <div className="grid gap-md md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-36 rounded-2xl" />
                ))}
              </div>
            ) : players.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Plantel indisponível"
                description="Ainda não há jogadores registados no plantel deste clube."
                action={{
                  label: 'Registar Primeiro Jogador',
                  onClick: () => navigate(ROUTES.DASHBOARD_CLUB_REGISTER_PLAYER),
                  variant: 'primary',
                }}
              />
            ) : filteredPlayers.length === 0 ? (
              <Card variant="flat" padding="lg" className="text-center bg-surface-container-low border-dashed border-outline-variant/40 py-xl">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-sm">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-on-surface">Nenhum jogador encontrado</h3>
                <p className="mt-1 text-xs text-on-surface-variant">
                  Não foram encontrados atletas correspondentes aos filtros aplicados.
                </p>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-md"
                    onClick={handleClearFilters}
                  >
                    Limpar todos os filtros
                  </Button>
                )}
              </Card>
            ) : viewMode === 'grid' ? (
              <div className="grid gap-md md:grid-cols-2 xl:grid-cols-3">
                {filteredPlayers.map((player: ClubMember | ClubSquadMember) => (
                  <ClubSquadPlayerCard
                    key={player.id}
                    player={player}
                    onClick={(p) => setSelectedPlayer(p)}
                  />
                ))}
              </div>
            ) : (
              /* Table / List View */
              <div className="overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-outline-variant/20 bg-surface-container-high/60 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                      <tr>
                        <th className="px-lg py-md">Dorsal</th>
                        <th className="px-lg py-md">Atleta</th>
                        <th className="px-lg py-md">Posição</th>
                        <th className="px-lg py-md">Estado</th>
                        <th className="px-lg py-md">Entrada</th>
                        <th className="px-lg py-md text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/15">
                      {filteredPlayers.map((player: ClubMember | ClubSquadMember) => {
                        const name =
                          ('display_name' in player && player.display_name) ||
                          ('full_name' in player && player.full_name) ||
                          'Sem nome'
                        const jersey = player.jersey_number ?? null
                        const position = player.position_label || player.position || '—'
                        const posColor = getPositionAccentColor(player.position || player.position_label)
                        const rawStatus = 'status' in player ? player.status : undefined
                        const isActive = 'is_active' in player ? player.is_active : true
                        const statusConf = getStatusBadgeConfig(rawStatus, isActive)
                        const avatar = resolveMediaUrl(player.avatar)

                        return (
                          <tr
                            key={player.id}
                            className="cursor-pointer transition-colors hover:bg-surface-container-high/70"
                            onClick={() => setSelectedPlayer(player)}
                          >
                            <td className="px-lg py-md font-mono font-bold text-on-surface">
                              {jersey !== null ? (
                                <span className="inline-flex rounded-md bg-surface-container-high px-2 py-0.5 text-xs font-black">
                                  #{jersey}
                                </span>
                              ) : (
                                <span className="text-on-surface-variant/40">—</span>
                              )}
                            </td>
                            <td className="px-lg py-md">
                              <div className="flex items-center gap-sm">
                                <div
                                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl overflow-hidden text-xs font-bold"
                                  style={{ backgroundColor: `${posColor}20`, color: posColor }}
                                >
                                  {avatar ? (
                                    <img src={avatar} alt={name} className="h-full w-full object-cover" />
                                  ) : (
                                    name.slice(0, 2).toUpperCase()
                                  )}
                                </div>
                                <div>
                                  <p className="font-semibold text-on-surface hover:text-primary transition-colors">
                                    {name}
                                  </p>
                                  {'nationality' in player && player.nationality && (
                                    <p className="text-[11px] text-on-surface-variant">{player.nationality}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-lg py-md">
                              <Badge
                                variant="outline"
                                className="text-[11px] capitalize font-medium"
                                style={{
                                  borderColor: `${posColor}40`,
                                  color: posColor,
                                  backgroundColor: `${posColor}10`,
                                }}
                              >
                                {position}
                              </Badge>
                            </td>
                            <td className="px-lg py-md">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusConf.badgeClass}`}
                              >
                                <span className={`h-1.5 w-1.5 rounded-full ${statusConf.dotColor}`} />
                                {statusConf.label}
                              </span>
                            </td>
                            <td className="px-lg py-md text-xs text-on-surface-variant">
                              {formatDate(player.joined_at)}
                            </td>
                            <td className="px-lg py-md text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-primary hover:bg-primary/10"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedPlayer(player)
                                }}
                              >
                                Ver ficha
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Tab Content: Staff */}
          <TabsContent value="staff" className="space-y-lg animate-in fade-in duration-300">
            {membersLoading || publicStaffLoading ? (
              <div className="grid gap-md md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 rounded-2xl" />
                ))}
              </div>
            ) : staff.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="Staff indisponível"
                description="Ainda não há membros da equipa técnica registados no clube."
              />
            ) : (
              <div className="grid gap-md md:grid-cols-2 xl:grid-cols-3">
                {staff.map((member: ClubMember | ClubStaffMember) => {
                  const staffName =
                    ('display_name' in member && member.display_name) ||
                    ('full_name' in member && member.full_name) ||
                    'Sem nome'
                  const staffRole =
                    'role_label' in member && member.role_label
                      ? member.role_label
                      : 'role' in member
                      ? roleLabel(member.role)
                      : 'Staff'
                  const avatar = resolveMediaUrl(member.avatar)

                  return (
                    <Card
                      key={member.id}
                      variant="flat"
                      padding="none"
                      className="border border-outline-variant/30 bg-surface-container/60 shadow-xs hover:border-primary/30 hover:bg-surface-container transition-all"
                    >
                      <CardContent className="p-lg">
                        <div className="flex items-center gap-md">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold overflow-hidden">
                            {avatar ? (
                              <img src={avatar} alt={staffName} className="h-full w-full object-cover" />
                            ) : (
                              staffName.slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0 flex-1 space-y-xs">
                            <p className="truncate font-bold text-on-surface">{staffName}</p>
                            <Badge variant="secondary" className="text-xs">
                              {staffRole}
                            </Badge>
                            <p className="text-xs text-on-surface-variant flex items-center gap-1 pt-1">
                              <Calendar className="h-3 w-3 opacity-70" />
                              <span>Entrada: {formatDate(member.joined_at)}</span>
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Interactive Player Preview Modal */}
      <ClubPlayerPreviewModal
        isOpen={Boolean(selectedPlayer)}
        player={selectedPlayer}
        clubName={club.name}
        onClose={() => setSelectedPlayer(null)}
      />
    </DashboardLayout>
  )
}
