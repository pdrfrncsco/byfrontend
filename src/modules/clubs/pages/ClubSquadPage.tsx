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
import { getClubSidebarLinks } from '@/modules/clubs/constants/navigation'
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

  const sidebarLinks = getClubSidebarLinks()

  if (clubLoading || !club) {
    return (
      <DashboardLayout
        title="Plantel"
        subtitle="Carregando plantel do clube..."
        dashboardType="club"
        sidebarLinks={sidebarLinks}
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
      title={`Plantel • ${club.name}`}
      subtitle="Veja o plantel e equipa técnica do clube, organizados e prontos para consultar."
      dashboardType="club"
      sidebarLinks={sidebarLinks}
      headerActions={
        <div className="flex items-center gap-sm">
          <Button asChild variant="secondary" size="sm">
            <Link to={ROUTES.DASHBOARD_CLUB}>
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Link>
          </Button>
          <Button asChild variant="primary" size="sm">
            <Link to={ROUTES.DASHBOARD_CLUB_REGISTER_PLAYER}>
              <UserPlus className="h-4 w-4" />
              <span>Registar Jogador</span>
            </Link>
          </Button>
        </div>
      }
    >
      <div className="space-y-xl">
        {/* Top Summary Banner */}
        <section className="grid gap-lg rounded-[2rem] border border-outline-variant/20 bg-surface-container p-xl shadow-[0_18px_40px_-30px_rgba(15,17,23,0.18)] lg:grid-cols-[1fr_1fr]">
          <div className="space-y-md">
            <div className="inline-flex items-center gap-sm rounded-full border border-primary/15 bg-primary-container/20 px-md py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <Users className="h-3.5 w-3.5" />
              Plantel Oficial
            </div>
            <div className="space-y-xs">
              <h1 className="text-3xl font-bold tracking-tight text-on-surface">Equipa Principal</h1>
              <p className="max-w-xl text-sm text-on-surface-variant leading-relaxed">
                Gestão dos atletas federados e equipa técnica do {club.name}. Clique em qualquer jogador para consultar a ficha detalhada.
              </p>
            </div>
          </div>

          {kpisLoading || !kpis ? (
            <div className="grid gap-sm sm:grid-cols-3">
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
            </div>
          ) : (
            <div className="grid gap-sm sm:grid-cols-3">
              <Card variant="flat" padding="md" className="flex flex-col justify-between bg-surface-container-high/60 border-outline-variant/20">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">Plantel</p>
                  <p className="mt-1 text-3xl font-black text-on-surface">{players.length}</p>
                </div>
                <div className="mt-2 flex flex-wrap gap-1 text-[10px] text-on-surface-variant">
                  <span className="rounded bg-amber-500/10 px-1 py-0.5 text-amber-600 font-semibold">{sectorCounts.gk} GR</span>
                  <span className="rounded bg-blue-500/10 px-1 py-0.5 text-blue-600 font-semibold">{sectorCounts.def} DEF</span>
                  <span className="rounded bg-emerald-500/10 px-1 py-0.5 text-emerald-600 font-semibold">{sectorCounts.mid} MED</span>
                  <span className="rounded bg-rose-500/10 px-1 py-0.5 text-rose-600 font-semibold">{sectorCounts.att} AVA</span>
                </div>
              </Card>

              <Card variant="flat" padding="md" className="flex flex-col justify-between bg-surface-container-high/60 border-outline-variant/20">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">Staff Técnico</p>
                  <p className="mt-1 text-3xl font-black text-on-surface">{staff.length}</p>
                </div>
                <p className="mt-2 text-[11px] text-on-surface-variant">Treinadores e apoio</p>
              </Card>

              <Card variant="flat" padding="md" className="flex flex-col justify-between bg-surface-container-high/60 border-outline-variant/20">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant">Total Clube</p>
                  <p className="mt-1 text-3xl font-black text-on-surface">{players.length + staff.length}</p>
                </div>
                <p className="mt-2 text-[11px] text-on-surface-variant">Membros inscritos</p>
              </Card>
            </div>
          )}
        </section>

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
            <div className="flex flex-col gap-md rounded-2xl border border-outline-variant/20 bg-surface-container-low p-md lg:flex-row lg:items-center lg:justify-between">
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
              <div className="overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container shadow-xs">
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
