import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  HelpCircle,
  Info,
  Scale,
  Search,
  Shield,
  Sparkles,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { ROUTES } from '@/constants/routes'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  Input,
  NativeSelect,
  ServerError,
  Skeleton,
} from '@/components/ui'
import { FormField } from '@/components/ui/form-field'
import { useClubMe, useClubSquad } from '@/modules/clubs/hooks/useClubs'
import { getClubSidebarSections } from '@/modules/clubs/constants/navigation'
import {
  useClubCompetitions,
  useClubPlayerRegistrationRequests,
  usePlayers,
  useRegisterPlayer,
} from '../hooks'
import { playerRegisterSchema, type PlayerRegisterFormData } from '../schemas'
import { POSITION_COLOR } from '../constants'
import type { Player } from '../types'

type SectorFilter = 'all' | 'gk' | 'def' | 'mid' | 'att'

function getPlayerSector(pos?: string | null): 'gk' | 'def' | 'mid' | 'att' | 'other' {
  const p = (pos || '').toLowerCase()
  if (['gk'].includes(p)) return 'gk'
  if (['cb', 'lb', 'rb', 'lwb', 'rwb'].includes(p)) return 'def'
  if (['cdm', 'cm', 'cam', 'lm', 'rm'].includes(p)) return 'mid'
  if (['cf', 'st', 'lw', 'rw'].includes(p)) return 'att'
  return 'other'
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-AO')
}

export function ClubPlayerRegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [playerSearch, setPlayerSearch] = useState('')
  const [sectorFilter, setSectorFilter] = useState<SectorFilter>('all')
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)

  const { data: club, isLoading: clubLoading, isError: clubError, refetch: refetchClub } = useClubMe()
  const { data: squad = [] } = useClubSquad(club?.slug)
  const { data: playersData, isLoading: playersLoading, isError: playersError, refetch: refetchPlayers } = usePlayers({
    page_size: 100,
    without_club: true,
  })
  const { data: competitions = [], isLoading: competitionsLoading, isError: competitionsError, refetch: refetchCompetitions } = useClubCompetitions(club?.id)
  const { data: playerRequests = [] } = useClubPlayerRegistrationRequests(club?.id)

  const registerMutation = useRegisterPlayer(selectedPlayer?.slug ?? '')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PlayerRegisterFormData>({
    resolver: zodResolver(playerRegisterSchema),
    defaultValues: {
      club_id: '',
      joined_date: new Date().toISOString().split('T')[0],
      shirt_number: '',
      competition_id: '',
    },
  })

  useEffect(() => {
    if (club?.id) {
      setValue('club_id', club.id)
    }
  }, [club?.id, setValue])

  const pendingRequestsCount = useMemo(
    () => playerRequests.filter((r) => r.status?.toLowerCase() === 'pending').length,
    [playerRequests],
  )

  const sidebarSections = useMemo(
    () => getClubSidebarSections({ pendingRequests: pendingRequestsCount }),
    [pendingRequestsCount],
  )

  // Filter players by query and tactical sector
  const filteredPlayers = useMemo(() => {
    const players = playersData?.results ?? []
    return players.filter((player) => {
      const matchesQuery = !playerSearch.trim() || player.full_name.toLowerCase().includes(playerSearch.toLowerCase())
      const matchesSector =
        sectorFilter === 'all' || getPlayerSector(player.primary_position) === sectorFilter
      return matchesQuery && matchesSector
    })
  }, [playersData, playerSearch, sectorFilter])

  // Shirt number validation check
  const watchedShirtNumber = watch('shirt_number')
  const isShirtNumberTaken = useMemo(() => {
    if (!watchedShirtNumber) return false
    const num = Number(watchedShirtNumber)
    return squad.some((s) => s.jersey_number === num)
  }, [watchedShirtNumber, squad])

  const selectedCompetition = useMemo(() => {
    const compId = watch('competition_id')
    return competitions.find((c) => c.id === compId)
  }, [competitions, watch('competition_id')])

  const onSubmit = (data: PlayerRegisterFormData) => {
    if (!selectedPlayer || !club) return

    registerMutation.mutate(
      {
        playerSlug: selectedPlayer.slug,
        club_id: club.id,
        joined_date: data.joined_date,
        shirt_number: data.shirt_number ? Number(data.shirt_number) : undefined,
        competition_id: data.competition_id || undefined,
      },
      {
        onSuccess: () => navigate(ROUTES.DASHBOARD_CLUB),
      },
    )
  }

  if (clubLoading) {
    return (
      <DashboardLayout
        title="Registo de Jogador"
        subtitle="A carregar formulário..."
        dashboardType="club"
        sidebarSections={sidebarSections}
      >
        <div className="space-y-lg">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </DashboardLayout>
    )
  }

  if (clubError) {
    return (
      <DashboardLayout
        title="Registo de Jogador"
        subtitle="Consola do clube"
        dashboardType="club"
        sidebarSections={sidebarSections}
      >
        <ServerError
          title="Erro ao carregar dados do clube"
          message="Não foi possível obter as credenciais do clube para o registo."
          onRetry={() => refetchClub()}
        />
      </DashboardLayout>
    )
  }

  if (!club) {
    return (
      <DashboardLayout
        title="Registo de Jogador"
        subtitle="Consola do clube"
        dashboardType="club"
        sidebarSections={sidebarSections}
      >
        <EmptyState
          icon={Building2}
          title="Clube não encontrado"
          description="É necessário estar associado a um clube desportivo para efetuar o registo de atletas."
          action={{
            label: 'Voltar ao Painel',
            onClick: () => navigate(ROUTES.DASHBOARD),
            variant: 'secondary',
          }}
        />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Registo & Inscrição de Jogador"
      subtitle={`Inscrição oficial e integração de atleta no plantel do ${club.name}`}
      dashboardType="club"
      sidebarSections={sidebarSections}
      headerActions={
        <Button variant="secondary" size="sm" onClick={() => navigate(ROUTES.DASHBOARD_CLUB)} className="gap-xs">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao Painel
        </Button>
      }
    >
      <div className="space-y-lg">
        {/* ─── 1. PAGE HEADER / HERO BAR ─────────────────────────────────── */}
        <div className="flex flex-col gap-md rounded-2xl border border-outline-variant/30 bg-surface-container/40 p-lg shadow-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-md">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <UserPlus className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-on-surface">Registo de Atleta no Plantel</h1>
              <p className="text-xs text-on-surface-variant">
                Selecione um atleta livre e emita um convite oficial de inscrição no <strong>{club.name}</strong>.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-xs">
            <Button asChild variant="outline" size="sm" className="gap-xs text-xs">
              <Link to={ROUTES.DASHBOARD_CLUB_SQUAD}>
                <Users className="h-3.5 w-3.5" />
                Ver Plantel ({squad.length})
              </Link>
            </Button>
          </div>
        </div>

        {/* ─── 2. MINI KPI ROW (CONTEXTUAL INFORMATION) ─────────────────── */}
        <div className="grid grid-cols-1 gap-sm sm:grid-cols-3">
          {/* Atletas no Plantel */}
          <div className="rounded-xl border border-outline-variant/30 bg-surface p-md shadow-xs">
            <div className="mb-1 flex items-center gap-xs text-xs text-on-surface-variant">
              <Users className="h-3.5 w-3.5 text-[#185fa5]" />
              <span className="font-medium">Plantel Atual</span>
            </div>
            <div className="text-2xl font-bold text-on-surface">{squad.length}</div>
            <p className="text-[11px] text-on-surface-variant">Atletas já registados</p>
          </div>

          {/* Atletas Livres Disponíveis */}
          <div className="rounded-xl border border-outline-variant/30 bg-surface p-md shadow-xs">
            <div className="mb-1 flex items-center gap-xs text-xs text-on-surface-variant">
              <Search className="h-3.5 w-3.5 text-[#0f6e56]" />
              <span className="font-medium">Atletas Disponíveis</span>
            </div>
            <div className="text-2xl font-bold text-on-surface">{filteredPlayers.length}</div>
            <p className="text-[11px] text-emerald-600 font-medium">Sem clube / Passe livre</p>
          </div>

          {/* Pedidos em Análise */}
          <div className="rounded-xl border border-outline-variant/30 bg-surface p-md shadow-xs">
            <div className="mb-1 flex items-center gap-xs text-xs text-on-surface-variant">
              <Clock className="h-3.5 w-3.5 text-[#854f0b]" />
              <span className="font-medium">Pedidos Pendentes</span>
            </div>
            <div className="text-2xl font-bold text-on-surface">{pendingRequestsCount}</div>
            <p className="text-[11px] text-on-surface-variant">Aguardam validação</p>
          </div>
        </div>

        {/* ─── 3. BODY 65/35 (COLUNA PRINCIPAL + COLUNA LATERAL) ───────── */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-lg lg:grid-cols-3">
            {/* Coluna Principal (65%) */}
            <div className="space-y-lg lg:col-span-2">
              {/* Card 1: Selecionar Atleta Livre */}
              <Card variant="flat" padding="none" className="border-outline-variant/30 bg-surface shadow-xs">
                <CardHeader className="border-b border-outline-variant/20 pb-md">
                  <div className="flex flex-col gap-sm sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle className="flex items-center gap-xs text-sm font-semibold text-on-surface">
                      <Search className="h-4 w-4 text-primary" />
                      1. Selecionar Jogador
                    </CardTitle>
                    {selectedPlayer && (
                      <Badge variant="success" className="text-xs">
                        {selectedPlayer.full_name} selecionado
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-lg space-y-md">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-md top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
                    <Input
                      variant="search"
                      value={playerSearch}
                      onChange={(event) => setPlayerSearch(event.target.value)}
                      placeholder="Pesquisar por nome do jogador..."
                      className="pl-10"
                    />
                  </div>

                  {/* Filtros rápidos por setor tático */}
                  <div className="flex flex-wrap gap-xs">
                    {(
                      [
                        { key: 'all', label: 'Todos' },
                        { key: 'gk', label: 'Guarda-Redes' },
                        { key: 'def', label: 'Defesas' },
                        { key: 'mid', label: 'Médios' },
                        { key: 'att', label: 'Avançados' },
                      ] as const
                    ).map((filter) => (
                      <button
                        key={filter.key}
                        type="button"
                        onClick={() => setSectorFilter(filter.key)}
                        className={`rounded-full px-md py-1 text-xs font-medium transition-colors ${
                          sectorFilter === filter.key
                            ? 'bg-primary text-on-primary shadow-xs'
                            : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>

                  {/* Lista de Atletas Disponíveis */}
                  {playersError ? (
                    <ServerError
                      title="Erro ao carregar jogadores"
                      message="Não foi possível consultar os atletas disponíveis."
                      onRetry={() => refetchPlayers()}
                    />
                  ) : playersLoading ? (
                    <Skeleton className="h-40 w-full rounded-2xl" />
                  ) : filteredPlayers.length === 0 ? (
                    <EmptyState
                      icon={Users}
                      title="Nenhum jogador encontrado"
                      description="Tente ajustar a sua pesquisa ou alterar o filtro de posição."
                    />
                  ) : (
                    <div className="grid max-h-72 gap-xs overflow-y-auto pr-1 sm:grid-cols-2">
                      {filteredPlayers.map((player) => {
                        const isSelected = selectedPlayer?.id === player.id
                        const hasCurrentClub = !!player.current_club
                        const isCurrentClub = player.current_club?.id === club.id
                        const posColor = POSITION_COLOR[player.primary_position] || '#185fa5'
                        const initials = `${player.first_name?.[0] || ''}${player.last_name?.[0] || ''}`.toUpperCase() || '?'

                        return (
                          <button
                            key={player.id}
                            type="button"
                            onClick={() => !hasCurrentClub && setSelectedPlayer(player)}
                            disabled={hasCurrentClub}
                            aria-pressed={isSelected}
                            className={`flex items-center gap-sm rounded-xl border p-sm text-left transition-all ${
                              isSelected
                                ? 'border-primary bg-primary/10 ring-1 ring-primary shadow-xs'
                                : hasCurrentClub
                                ? 'border-outline-variant/15 bg-surface-container/30 opacity-60 cursor-not-allowed'
                                : 'border-outline-variant/20 bg-surface-container/40 hover:border-primary/40 hover:bg-surface-container'
                            }`}
                          >
                            <div
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-xs"
                              style={{ background: posColor }}
                            >
                              {initials}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-semibold text-on-surface">{player.full_name}</p>
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className="text-[10px] text-on-surface-variant">
                                  {player.position_label || player.primary_position}
                                </span>
                                <span>•</span>
                                <span className="text-[10px] text-on-surface-variant">
                                  {player.nationality || 'Angola'}
                                </span>
                              </div>
                            </div>

                            <div className="shrink-0">
                              {isSelected ? (
                                <Check className="h-4 w-4 text-primary" />
                              ) : hasCurrentClub ? (
                                <Badge variant={isCurrentClub ? 'success' : 'warning'} className="text-[10px] py-0">
                                  {isCurrentClub ? 'Já no clube' : 'Vinculado'}
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-[10px] py-0 text-emerald-700 bg-emerald-50">
                                  Livre
                                </Badge>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Card 2: Termos do Vínculo Desportivo */}
              <Card variant="flat" padding="none" className="border-outline-variant/30 bg-surface shadow-xs">
                <CardHeader className="border-b border-outline-variant/20 pb-md">
                  <CardTitle className="flex items-center gap-xs text-sm font-semibold text-on-surface">
                    <Shield className="h-4 w-4 text-primary" />
                    2. Termos do Vínculo Federativo
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-md p-lg sm:grid-cols-3">
                  <FormField
                    label="Data de Entrada"
                    htmlFor="joined-date"
                    error={errors.joined_date?.message}
                    required
                  >
                    <Input id="joined-date" type="date" {...register('joined_date')} />
                  </FormField>

                  <FormField
                    label="N.º de Camisola Proposto"
                    htmlFor="shirt-number"
                    error={errors.shirt_number?.message}
                  >
                    <Input
                      id="shirt-number"
                      type="number"
                      min={1}
                      max={99}
                      placeholder="Ex: 9"
                      {...register('shirt_number')}
                    />
                    {isShirtNumberTaken && (
                      <p className="mt-1 text-[11px] text-amber-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Camisola #{watchedShirtNumber} já está atribuída a outro jogador.
                      </p>
                    )}
                  </FormField>

                  <FormField
                    label="Competição Associada"
                    htmlFor="competition-id"
                    error={errors.competition_id?.message}
                  >
                    <NativeSelect
                      id="competition-id"
                      {...register('competition_id')}
                      disabled={competitionsLoading || competitionsError}
                    >
                      <option value="">
                        {competitionsLoading
                          ? 'A carregar competições...'
                          : 'Sem competição específica'}
                      </option>
                      {competitions.map((competition) => (
                        <option key={competition.id} value={competition.id}>
                          {competition.name} ({competition.season})
                        </option>
                      ))}
                    </NativeSelect>
                  </FormField>
                </CardContent>
              </Card>

              {/* Card 3: Resumo Pré-Submissão */}
              {selectedPlayer && (
                <div className="rounded-xl border border-primary/25 bg-primary/5 p-md shadow-xs">
                  <div className="flex items-start gap-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div className="space-y-xs text-xs">
                      <p className="font-semibold text-on-surface">Resumo da Inscrição</p>
                      <p className="text-on-surface-variant">
                        Será enviado um convite oficial de integração para o atleta{' '}
                        <strong className="text-on-surface">{selectedPlayer.full_name}</strong> ({selectedPlayer.position_label || selectedPlayer.primary_position})
                        para o clube <strong>{club.name}</strong> a partir de{' '}
                        <strong>{formatDate(watch('joined_date'))}</strong>.
                        {watch('shirt_number') ? ` Camisola pretendida: #${watch('shirt_number')}.` : ''}
                        {selectedCompetition ? ` Competição: ${selectedCompetition.name}.` : ''}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Barra de Ação */}
              <div className="flex items-center justify-end gap-xs pt-xs">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(ROUTES.DASHBOARD_CLUB)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={registerMutation.isPending}
                  disabled={!selectedPlayer || !club}
                  className="gap-xs"
                >
                  <UserPlus className="h-4 w-4" />
                  Submeter Inscrição do Jogador
                </Button>
              </div>
            </div>

            {/* Coluna Lateral (35%) */}
            <div className="space-y-md lg:col-span-1">
              {/* Regulamento & Normas Federativas */}
              <Card variant="flat" padding="none" className="border-outline-variant/30 bg-surface shadow-xs">
                <CardHeader className="border-b border-outline-variant/20 pb-xs">
                  <CardTitle className="flex items-center gap-xs text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    <Scale className="h-3.5 w-3.5 text-primary" />
                    Normas de Inscrição
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-sm p-md text-xs text-on-surface-variant">
                  <div className="rounded-lg bg-surface-container/50 p-sm">
                    <p className="font-semibold text-on-surface">Prazos de Validação</p>
                    <p className="mt-0.5 text-[11px]">
                      A associação provincial homologa a inscrição federativa em até 72 horas após o consentimento formal do atleta.
                    </p>
                  </div>
                  <div className="rounded-lg bg-surface-container/50 p-sm">
                    <p className="font-semibold text-on-surface">Documentação do Atleta</p>
                    <p className="mt-0.5 text-[11px]">
                      O atleta deve possuir Bilhete de Identidade ou Passaporte válido e exame médico homologado na época em vigor.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Consentimento do Jogador */}
              <Card variant="flat" padding="none" className="border-outline-variant/30 bg-surface shadow-xs">
                <CardHeader className="border-b border-outline-variant/20 pb-xs">
                  <CardTitle className="flex items-center gap-xs text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    <UserCheck className="h-3.5 w-3.5 text-primary" />
                    Consentimento do Atleta
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-sm p-md text-xs text-on-surface-variant">
                  <p>
                    De acordo com os regulamentos federativos, a submissão deste pedido gera um convite que o jogador deverá confirmar através do seu próprio painel de atleta.
                  </p>
                  <p className="text-[11px] text-on-surface-variant/80">
                    O atleta receberá uma notificação no sistema para aceitar ou recusar o convite do clube.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
