import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Handshake,
  HelpCircle,
  Info,
  Plus,
  Scale,
  Search,
  Shield,
  ShieldAlert,
  UserCheck,
  X,
} from 'lucide-react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  ErrorState,
  Input,
  NativeSelect,
  ServerError,
  Skeleton,
} from '@/components/ui'
import { FormField } from '@/components/ui/form-field'
import { resolveMediaUrl } from '@/lib/media'
import { useClubs } from '@/modules/clubs/hooks/useClubs'
import {
  useAcceptRegistrationRequest,
  useClubCompetitions,
  useDeclineRegistrationRequest,
  useMyRegistrationRequests,
  usePlayerMe,
  usePlayerMedicalProfile,
  useSubmitRegistrationRequest,
} from '../hooks'
import { playerLinkRequestSchema, type PlayerLinkRequestFormData } from '../schemas'
import { playerRoutes } from '../routes'
import { getPlayerSidebarLinks } from '../constants/navigation'
import type { PlayerRegistrationRequest } from '../types'

function RequestStatusBadge({ status, registration, t }: { status: string; registration?: unknown; t: (key: string) => string }) {
  const normalized = status?.toLowerCase()
  if (normalized === 'accepted' || registration) {
    return (
      <Badge variant="success" className="gap-1 text-xs">
        <CheckCircle2 className="h-3 w-3" />
        {t('players.linkRequest.status.accepted') || 'Aceito'}
      </Badge>
    )
  }
  if (normalized === 'approved') {
    return (
      <Badge variant="success" className="gap-1 text-xs">
        <CheckCircle2 className="h-3 w-3" />
        {t('players.linkRequest.status.approved') || 'Aprovado pelo Clube'}
      </Badge>
    )
  }
  if (normalized === 'invited') {
    return (
      <Badge variant="secondary" className="gap-1 text-xs text-primary border-primary/30 bg-primary/10">
        <Handshake className="h-3 w-3" />
        {t('players.linkRequest.status.invited') || 'Convite Recebido'}
      </Badge>
    )
  }
  if (normalized === 'rejected') {
    return (
      <Badge variant="danger" className="gap-1 text-xs">
        <X className="h-3 w-3" />
        {t('players.linkRequest.status.rejected') || 'Recusado'}
      </Badge>
    )
  }
  return (
    <Badge variant="warning" className="gap-1 text-xs">
      <Clock className="h-3 w-3" />
      {t('players.linkRequest.status.pending') || 'Pendente de Análise'}
    </Badge>
  )
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('pt-AO')
}

export function PlayerClubLinkRequestPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [clubSearch, setClubSearch] = useState('')

  const { data: player, isLoading: playerLoading, isError: isPlayerError, refetch: refetchPlayer } = usePlayerMe()
  const { data: medicalProfile } = usePlayerMedicalProfile(player?.id ?? '', !!player?.id)
  const isMedicalFit = medicalProfile?.medical_status === 'fit' || medicalProfile?.medical_clearance === true
  const { data: clubsData, isLoading: clubsLoading, isError: isClubsError, refetch: refetchClubs } = useClubs({ page_size: 100 })
  const { data: requests = [], isLoading: requestsLoading, isError: isRequestsError, refetch: refetchRequests } = useMyRegistrationRequests()
  const submitMutation = useSubmitRegistrationRequest()
  const acceptMutation = useAcceptRegistrationRequest()
  const declineMutation = useDeclineRegistrationRequest()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PlayerLinkRequestFormData>({
    resolver: zodResolver(playerLinkRequestSchema),
    defaultValues: {
      club_id: '',
      joined_date: new Date().toISOString().split('T')[0],
      shirt_number: '',
      competition_id: '',
    },
  })

  const selectedClubId = watch('club_id')

  const sidebarLinks = getPlayerSidebarLinks(player?.slug)

  const filteredClubs = useMemo(() => {
    const clubs = clubsData?.results ?? []
    if (!clubSearch.trim()) return clubs
    const query = clubSearch.toLowerCase()
    return clubs.filter((club) => club.name.toLowerCase().includes(query))
  }, [clubsData, clubSearch])

  const selectedClub = useMemo(
    () => filteredClubs.find((club) => club.id === selectedClubId),
    [filteredClubs, selectedClubId],
  )

  const onSubmit = (data: PlayerLinkRequestFormData) => {
    submitMutation.mutate(
      {
        club_id: data.club_id,
        joined_date: data.joined_date,
        shirt_number: data.shirt_number ? Number(data.shirt_number) : undefined,
        competition_id: data.competition_id || undefined,
      },
      {
        onSuccess: () => reset({ ...data, club_id: '', shirt_number: '', competition_id: '' }),
      },
    )
  }

  const {
    data: competitions = [],
    isLoading: competitionsLoading,
    isError: isCompetitionsError,
    refetch: refetchCompetitions,
  } = useClubCompetitions(selectedClubId)

  const selectedCompetition = useMemo(
    () => competitions.find((competition) => competition.id === watch('competition_id')),
    [competitions, watch('competition_id')],
  )

  // KPI Calculations
  const pendingRequestsCount = useMemo(
    () => requests.filter((r) => r.status?.toLowerCase() === 'pending').length,
    [requests],
  )
  const actionRequiredRequestsCount = useMemo(
    () => requests.filter((r) => ['approved', 'invited'].includes(r.status?.toLowerCase()) && !r.registration).length,
    [requests],
  )

  if (playerLoading) {
    return (
      <DashboardLayout
        title="Vínculos & Filiação a Clubes"
        subtitle="A carregar histórico e pedidos..."
        dashboardType="player"
        sidebarLinks={sidebarLinks}
      >
        <div className="space-y-lg">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <div className="grid gap-md sm:grid-cols-2 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </DashboardLayout>
    )
  }

  if (isPlayerError) {
    return (
      <DashboardLayout
        title="Vínculos & Filiação a Clubes"
        subtitle="Gestão de filiações federativas"
        dashboardType="player"
        sidebarLinks={sidebarLinks}
      >
        <ServerError
          title={t('players.linkRequest.loadErrorTitle') || 'Erro ao carregar dados'}
          message={t('players.linkRequest.loadErrorDescription') || 'Não foi possível obter as informações do atleta.'}
          onRetry={() => refetchPlayer()}
        />
      </DashboardLayout>
    )
  }

  if (!player) {
    return (
      <DashboardLayout
        title="Vínculos & Filiação a Clubes"
        subtitle="Gestão de filiações federativas"
        dashboardType="player"
        sidebarLinks={sidebarLinks}
      >
        <ErrorState
          title={t('players.linkRequest.loadErrorTitle') || 'Atleta não encontrado'}
          message={t('players.linkRequest.loadErrorDescription') || 'Não foi possível encontrar o perfil do atleta.'}
          onRetry={() => refetchPlayer()}
        />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Vínculos & Filiação a Clubes"
      subtitle="Filiações desportivas, pedidos de inscrição e convites oficiais"
      dashboardType="player"
      sidebarLinks={sidebarLinks}
      headerActions={
        <Button variant="secondary" size="sm" onClick={() => navigate(playerRoutes.dashboard)} className="gap-xs">
          <ArrowLeft className="h-4 w-4" />
          {t('players.common.back') || 'Voltar ao Painel'}
        </Button>
      }
    >
      <div className="space-y-lg">
        {/* ─── 1. PAGE HEADER / HERO BAR ─────────────────────────────────── */}
        <div className="flex flex-col gap-md rounded-2xl border border-outline-variant/30 bg-surface-container/40 p-lg shadow-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-md">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Handshake className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-on-surface">Vínculos & Filiação Desportiva</h1>
              <p className="text-xs text-on-surface-variant">
                Registe os seus pedidos de filiação a clubes ou responda a convites enviados por direções técnicas.
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
          </div>
        </div>

        {/* ─── 2. KPI ROW (4 CARDS UNIFIED PATTERN) ────────────────────── */}
        <div className="grid grid-cols-2 gap-sm sm:grid-cols-2 md:grid-cols-4">
          {/* Clube Atual */}
          <div className="rounded-xl border border-outline-variant/30 bg-surface p-md shadow-xs">
            <div className="mb-2 flex items-center gap-xs text-xs text-on-surface-variant">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#eeedfe] text-[#534ab7]">
                <Building2 className="h-3.5 w-3.5" />
              </div>
              <span className="font-medium">Clube Atual</span>
            </div>
            <div className="truncate text-lg font-bold text-on-surface">
              {player.current_club?.name || 'Sem Clube Oficial'}
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px]">
              {player.current_club ? (
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <CheckCircle2 className="h-3 w-3" />
                  Vínculo Ativo
                </span>
              ) : (
                <span className="text-amber-600 font-medium">Passe Livre / Disponível</span>
              )}
            </div>
          </div>

          {/* Pedidos Pendentes */}
          <div className="rounded-xl border border-outline-variant/30 bg-surface p-md shadow-xs">
            <div className="mb-2 flex items-center gap-xs text-xs text-on-surface-variant">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#faeeda] text-[#854f0b]">
                <Clock className="h-3.5 w-3.5" />
              </div>
              <span className="font-medium">Pedidos Pendentes</span>
            </div>
            <div className="text-2xl font-bold text-on-surface">{pendingRequestsCount}</div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-on-surface-variant">
              Aguardam revisão do clube
            </div>
          </div>

          {/* Convites / Aprovações */}
          <div className="rounded-xl border border-outline-variant/30 bg-surface p-md shadow-xs">
            <div className="mb-2 flex items-center gap-xs text-xs text-on-surface-variant">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#e1f5ee] text-[#0f6e56]">
                <Handshake className="h-3.5 w-3.5" />
              </div>
              <span className="font-medium">Convites & Aprovações</span>
            </div>
            <div className="text-2xl font-bold text-on-surface">{actionRequiredRequestsCount}</div>
            <div className="mt-1 flex items-center gap-1 text-[11px]">
              {actionRequiredRequestsCount > 0 ? (
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <AlertTriangle className="h-3 w-3" />
                  Ação requerida
                </span>
              ) : (
                <span className="text-on-surface-variant">Nenhuma ação pendente</span>
              )}
            </div>
          </div>

          {/* Histórico Total */}
          <div className="rounded-xl border border-outline-variant/30 bg-surface p-md shadow-xs">
            <div className="mb-2 flex items-center gap-xs text-xs text-on-surface-variant">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#e6f1fb] text-[#185fa5]">
                <FileText className="h-3.5 w-3.5" />
              </div>
              <span className="font-medium">Total de Vínculos</span>
            </div>
            <div className="text-2xl font-bold text-on-surface">{requests.length}</div>
            <div className="mt-1 flex items-center gap-1 text-[11px] text-on-surface-variant">
              Registos no sistema
            </div>
          </div>
        </div>

        {/* ─── 3. BODY 65/35 (COLUNA PRINCIPAL + COLUNA LATERAL) ───────── */}
        <div className="grid grid-cols-1 gap-lg lg:grid-cols-3">
          {/* Coluna Principal (65%) */}
          <div className="space-y-lg lg:col-span-2">
            {/* Se o atleta já possui clube ativo */}
            {player.current_club ? (
              <Card variant="flat" padding="none" className="border-emerald-500/30 bg-surface shadow-xs">
                <CardHeader className="border-b border-outline-variant/20 bg-emerald-500/5 pb-md">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-xs text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                      <Shield className="h-4 w-4 text-emerald-600" />
                      Vínculo Oficial em Vigor
                    </CardTitle>
                    <Badge variant="success" className="text-xs">Ativo</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-lg space-y-md">
                  <div className="flex items-center gap-md">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-600/10 text-xl font-bold text-emerald-700">
                      {player.current_club.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-on-surface">{player.current_club.name}</h3>
                      <p className="text-xs text-on-surface-variant">
                        {player.nationality || 'Angola'} • Inscrição homologada
                      </p>
                      <p className="mt-1 text-xs text-on-surface-variant">
                        Encontra-se atualmente associado como atleta deste clube.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-outline-variant/20 bg-surface-container/30 p-md text-xs text-on-surface-variant space-y-1">
                    <p className="font-semibold text-on-surface flex items-center gap-1">
                      <Info className="h-3.5 w-3.5 text-primary" />
                      Norma sobre Novas Filiações
                    </p>
                    <p>
                      Para transferir ou vincular-se a um novo clube, é necessário emitir uma carta de rescisão amigável ou formalizar um processo de transferência federativa através da secretaria do clube.
                    </p>
                  </div>

                  <div className="flex justify-end pt-xs">
                    <Button asChild variant="outline" size="sm" className="gap-xs text-xs">
                      <Link to={`/clubs/${player.current_club.slug || player.current_club.id}`}>
                        <ExternalLink className="h-3.5 w-3.5" />
                        Ver Perfil do Clube
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Formulário de Novo Pedido de Vínculo */
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-lg">
                <Card variant="flat" padding="none" className="border-outline-variant/30 bg-surface shadow-xs">
                  <CardHeader className="border-b border-outline-variant/20 pb-md">
                    <CardTitle className="flex items-center gap-xs text-sm font-semibold text-on-surface">
                      <Plus className="h-4 w-4 text-primary" />
                      Submeter Novo Pedido de Filiação
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-lg space-y-md">
                    {/* Pesquisa de Clubes */}
                    <div>
                      <label className="block text-xs font-semibold text-on-surface mb-1">
                        1. Selecionar Clube Desportivo
                      </label>
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-md top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
                        <Input
                          variant="search"
                          value={clubSearch}
                          onChange={(event) => setClubSearch(event.target.value)}
                          placeholder="Pesquisar clube por nome..."
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Catálogo de Clubes Selecionáveis */}
                    {clubsLoading ? (
                      <Skeleton className="h-40 w-full rounded-2xl" />
                    ) : isClubsError ? (
                      <ServerError
                        title="Erro ao carregar lista de clubes"
                        message="Não foi possível obter os clubes disponíveis para filiação."
                        onRetry={() => refetchClubs()}
                      />
                    ) : filteredClubs.length === 0 ? (
                      <EmptyState
                        icon={Building2}
                        title="Nenhum clube encontrado"
                        description="Tente ajustar a sua pesquisa pelo nome do clube."
                      />
                    ) : (
                      <div className="grid max-h-56 gap-xs overflow-y-auto pr-1 sm:grid-cols-2">
                        {filteredClubs.map((club) => {
                          const isSelected = selectedClubId === club.id
                          return (
                            <button
                              key={club.id}
                              type="button"
                              onClick={() => {
                                setValue('club_id', club.id, { shouldValidate: true })
                                setValue('competition_id', '')
                              }}
                              aria-pressed={isSelected}
                              className={`flex items-center gap-sm rounded-xl border p-sm text-left transition-all ${
                                isSelected
                                  ? 'border-primary bg-primary/10 shadow-xs ring-1 ring-primary'
                                  : 'border-outline-variant/20 bg-surface-container/40 hover:border-primary/40 hover:bg-surface-container'
                              }`}
                            >
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                                  isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'
                                }`}
                              >
                                {club.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-semibold text-on-surface">{club.name}</p>
                                <p className="truncate text-[11px] text-on-surface-variant">
                                  {club.city || club.country || 'Angola'}
                                </p>
                              </div>
                              {isSelected && <Check className="h-4 w-4 shrink-0 text-primary" />}
                            </button>
                          )
                        })}
                      </div>
                    )}
                    {errors.club_id && <p className="text-xs text-error">{errors.club_id.message}</p>}

                    {/* Detalhes do Vínculo */}
                    <div className="grid gap-md pt-sm sm:grid-cols-3">
                      <FormField
                        label="Data de Entrada"
                        htmlFor="joined-date"
                        error={errors.joined_date?.message}
                        required
                      >
                        <Input id="joined-date" type="date" {...register('joined_date')} />
                      </FormField>

                      <FormField
                        label="N.º de Camisola Pretendido"
                        htmlFor="shirt-number"
                        error={errors.shirt_number?.message}
                      >
                        <Input
                          id="shirt-number"
                          type="number"
                          min={1}
                          max={99}
                          placeholder="Ex: 10"
                          {...register('shirt_number')}
                        />
                      </FormField>

                      <FormField
                        label="Competição Associada"
                        htmlFor="competition-id"
                        error={errors.competition_id?.message}
                      >
                        <NativeSelect
                          id="competition-id"
                          {...register('competition_id')}
                          disabled={!selectedClubId || competitionsLoading || isCompetitionsError}
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
                    </div>

                    {/* Resumo do Pedido */}
                    {selectedClub && (
                      <div className="rounded-xl border border-primary/25 bg-primary/5 p-md">
                        <div className="flex items-start gap-sm">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <div className="space-y-xs text-xs">
                            <p className="font-semibold text-on-surface">Resumo da Solicitação</p>
                            <p className="text-on-surface-variant">
                              Será enviado um pedido oficial de inscrição para o clube{' '}
                              <strong className="text-on-surface">{selectedClub.name}</strong> a partir da data de{' '}
                              <strong>{formatDate(watch('joined_date'))}</strong>.
                              {watch('shirt_number') ? ` Camisola pretendida: #${watch('shirt_number')}.` : ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end pt-xs">
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        loading={submitMutation.isPending}
                        disabled={!selectedClubId}
                        className="gap-xs"
                      >
                        <Plus className="h-4 w-4" />
                        Submeter Pedido de Filiação
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </form>
            )}

            {/* Lista de Pedidos & Convites em Análise */}
            <Card variant="flat" padding="none" className="border-outline-variant/30 bg-surface shadow-xs">
              <CardHeader className="border-b border-outline-variant/20 pb-md">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-xs text-sm font-semibold text-on-surface">
                    <FileText className="h-4 w-4 text-primary" />
                    Histórico de Pedidos & Convites
                  </CardTitle>
                  <span className="text-xs text-on-surface-variant">
                    {requests.length} {requests.length === 1 ? 'registo' : 'registos'}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-lg">
                {requestsLoading ? (
                  <Skeleton className="h-32 w-full rounded-2xl" />
                ) : isRequestsError ? (
                  <ServerError
                    title="Erro ao carregar pedidos de filiação"
                    message="Não foi possível consultar o histórico de solicitações."
                    onRetry={() => refetchRequests()}
                  />
                ) : requests.length === 0 ? (
                  <EmptyState
                    icon={Handshake}
                    title="Nenhum pedido de vínculo registado"
                    description="Quando submeter uma filiação ou receber um convite de um clube desportivo, o estado aparecerá aqui."
                  />
                ) : (
                  <div className="space-y-sm">
                    {requests.map((request: PlayerRegistrationRequest) => {
                      const isActionable =
                        ['approved', 'invited'].includes(request.status?.toLowerCase()) && !request.registration

                      return (
                        <div
                          key={request.id}
                          className="flex flex-col gap-sm rounded-xl border border-outline-variant/25 bg-surface-container/30 p-md transition-colors hover:border-primary/30 md:flex-row md:items-center md:justify-between"
                        >
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-xs">
                              <span className="font-semibold text-sm text-on-surface">{request.club_name}</span>
                              <RequestStatusBadge status={request.status} registration={request.registration} t={t} />
                            </div>

                            <p className="flex flex-wrap items-center gap-x-2 text-xs text-on-surface-variant">
                              <span className="flex items-center gap-1">
                                <CalendarDays className="h-3 w-3" />
                                Data de entrada: {formatDate(request.joined_date)}
                              </span>
                              <span>•</span>
                              <span>Atualizado em: {formatDate(request.updated_at || request.created_at)}</span>
                              {request.shirt_number ? (
                                <>
                                  <span>•</span>
                                  <span className="font-semibold">Camisola #{request.shirt_number}</span>
                                </>
                              ) : null}
                              {request.competition_name ? (
                                <>
                                  <span>•</span>
                                  <span>{request.competition_name}</span>
                                </>
                              ) : null}
                            </p>

                            {request.review_notes && (
                              <div className="mt-1 rounded-lg bg-surface-container/60 p-xs text-xs text-on-surface-variant">
                                <strong>Nota do Clube:</strong> {request.review_notes}
                              </div>
                            )}
                          </div>

                          <div className="flex shrink-0 items-center gap-xs pt-xs md:pt-0">
                            {isActionable && (
                              <>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => acceptMutation.mutate(request.id)}
                                  loading={acceptMutation.isPending && acceptMutation.variables === request.id}
                                  className="gap-xs text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  Aceitar Vínculo
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => declineMutation.mutate({ requestId: request.id })}
                                  loading={declineMutation.isPending && declineMutation.variables?.requestId === request.id}
                                  className="gap-xs text-xs text-error hover:border-error"
                                >
                                  <X className="h-3.5 w-3.5" />
                                  Recusar
                                </Button>
                              </>
                            )}
                            <Button asChild variant="ghost" size="sm" className="gap-xs text-xs">
                              <Link to={`/clubs/${request.club_slug}`}>
                                <ExternalLink className="h-3.5 w-3.5" />
                                Ver Clube
                              </Link>
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Coluna Lateral (35%) */}
          <div className="space-y-md lg:col-span-1">
            {/* Regulamento & Prazos Federativos */}
            <Card variant="flat" padding="none" className="border-outline-variant/30 bg-surface shadow-xs">
              <CardHeader className="border-b border-outline-variant/20 pb-xs">
                <CardTitle className="flex items-center gap-xs text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  <Scale className="h-3.5 w-3.5 text-primary" />
                  Regulamento & Normas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-sm p-md text-xs text-on-surface-variant">
                <div className="rounded-lg bg-surface-container/50 p-sm">
                  <p className="font-semibold text-on-surface">Prazos de Homologação</p>
                  <p className="mt-0.5 text-[11px]">
                    Os pedidos de inscrição são processados pela secretaria do clube e homologados pela associação provincial em até 72 horas úteis.
                  </p>
                </div>
                <div className="rounded-lg bg-surface-container/50 p-sm">
                  <p className="font-semibold text-on-surface">Janelas de Transferência</p>
                  <p className="mt-0.5 text-[11px]">
                    As inscrições devem respeitar os períodos oficiais de abertura e fecho de transferências estipulados no calendário federativo.
                  </p>
                </div>
                <div className="rounded-lg bg-surface-container/50 p-sm">
                  <p className="font-semibold text-on-surface">Aceitação de Convite</p>
                  <p className="mt-0.5 text-[11px]">
                    Quando um clube envia um convite direto, o atleta deve aceitar formalmente nesta página para dar início à validação federativa.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Checklist de Elegibilidade Federativa */}
            <Card variant="flat" padding="none" className="border-outline-variant/30 bg-surface shadow-xs">
              <CardHeader className="border-b border-outline-variant/20 pb-xs">
                <CardTitle className="flex items-center gap-xs text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  <UserCheck className="h-3.5 w-3.5 text-primary" />
                  Elegibilidade do Atleta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-xs p-md text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-outline-variant/10">
                  <span className="text-on-surface-variant">Aptidão Médica:</span>
                  <Badge
                    variant={isMedicalFit ? 'success' : 'warning'}
                    className="text-[11px]"
                  >
                    {isMedicalFit ? 'Apto para Jogar' : 'Aguardar Exame'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-outline-variant/10">
                  <span className="text-on-surface-variant">Perfil Desportivo:</span>
                  <Badge variant="outline" className="text-[11px]">
                    {player.position_label || player.primary_position}
                  </Badge>
                </div>

                <div className="flex items-center justify-between py-1.5">
                  <span className="text-on-surface-variant">Visibilidade Pública:</span>
                  <Badge variant={player.is_public ? 'success' : 'secondary'} className="text-[11px]">
                    {player.is_public ? 'Ativa' : 'Privada'}
                  </Badge>
                </div>

                <div className="pt-xs">
                  <Button asChild variant="outline" size="sm" className="w-full gap-xs text-xs">
                    <Link to={playerRoutes.dashboardSettings}>
                      Atualizar Perfil & Documentos
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
