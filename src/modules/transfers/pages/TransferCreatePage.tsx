import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Search,
  User,
  Trophy,
  Shield,
  ArrowRightLeft,
  Calendar,
  Sparkles,
  AlertCircle,
  Banknote,
  Shirt,
  Building2,
} from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { ROUTES } from '@/constants/routes'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  FormField,
  Input,
  NativeSelect,
  Skeleton,
  EmptyState,
  Textarea,
} from '@/components/ui'
import { getClubSidebarSections } from '@/modules/clubs/constants/navigation'
import { useClubMe, useClubs } from '@/modules/clubs/hooks/useClubs'
import { usePlayers } from '@/modules/players/hooks'
import type { Player } from '@/modules/players/types'
import { ClubLogo } from '@/modules/clubs/components/ClubLogo'
import { getPositionAccentColor } from '@/modules/clubs/components/ClubSquadPlayerCard'
import { useCreateTransfer } from '../hooks'
import { transferRoutes } from '../routes'
import type { CreateTransferPayload } from '../types'

const transferSchema = z
  .object({
    player_id: z.string().min(1, 'Selecione um jogador'),
    from_club_id: z.string().optional().nullable(),
    to_club_id: z.string().min(1, 'Selecione o clube de destino'),
    transfer_type: z.enum(['permanent', 'loan', 'free_agent']),
    transfer_date: z.string().min(1, 'Data de transferência é obrigatória'),
    loan_end_date: z.string().optional().nullable(),
    shirt_number: z.preprocess(
      (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
      z.number().int().min(1, 'Dorsal mínima: 1').max(99, 'Dorsal máxima: 99').optional().nullable(),
    ),
    fee: z.preprocess(
      (v) => (v === '' || v === null || v === undefined ? null : Number(v)),
      z.number().min(0, 'O valor não pode ser negativo').optional().nullable(),
    ),
    salary_contribution: z.boolean().default(false),
    notes: z.string().max(500, 'Máximo de 500 caracteres').optional(),
  })
  .refine((data) => !(data.transfer_type === 'loan' && !data.loan_end_date), {
    message: 'Empréstimos precisam de data de fim do vínculo temporário',
    path: ['loan_end_date'],
  })
  .refine((data) => !(data.transfer_type === 'free_agent' && data.from_club_id), {
    message: 'Jogadores livres não podem ter clube de origem associado',
    path: ['from_club_id'],
  })
  .refine(
    (data) => data.transfer_type === 'free_agent' || !!data.from_club_id,
    {
      message: 'Transferências permanentes e empréstimos precisam de clube de origem',
      path: ['from_club_id'],
    },
  )

type TransferFormData = z.infer<typeof transferSchema>

const STEPS = [
  { id: 1, title: 'Atleta', description: 'Pesquisa e seleção' },
  { id: 2, title: 'Condições', description: 'Clubes e termos' },
  { id: 3, title: 'Revisão', description: 'Homologação federativa' },
]

function formatCurrency(val?: number | string | null) {
  if (val == null || val === '' || Number.isNaN(Number(val))) return 'AOA 0,00 (Sem custos)'
  return Number(val).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })
}

interface TransferCreatePageProps {
  scope?: 'club' | 'organization'
}

export function TransferCreatePage({ scope }: TransferCreatePageProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const isClubScope =
    scope === 'club' || (scope !== 'organization' && location.pathname.startsWith('/dashboard/club'))

  const [currentStep, setCurrentStep] = useState(1)
  const [playerSearch, setPlayerSearch] = useState('')

  const { data: club, isLoading: clubLoading } = useClubMe()
  const { data: clubsResponse, isLoading: clubsLoading } = useClubs({ page_size: 100 })
  const createTransfer = useCreateTransfer()
  const { data: playersData, isLoading: playersLoading } = usePlayers({ page_size: 100 })

  const allClubs = useMemo(() => {
    if (Array.isArray(clubsResponse)) return clubsResponse
    return clubsResponse?.results || []
  }, [clubsResponse])

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      transfer_type: 'permanent',
      transfer_date: new Date().toISOString().split('T')[0],
      salary_contribution: false,
      to_club_id: isClubScope && club?.id ? club.id : '',
      from_club_id: '',
      fee: null,
      shirt_number: null,
      notes: '',
    },
  })

  // Ensure to_club_id is set to user's club once loaded
  useEffect(() => {
    if (isClubScope && club?.id) {
      setValue('to_club_id', club.id)
    }
  }, [isClubScope, club?.id, setValue])

  const selectedTransferType = watch('transfer_type')
  const selectedPlayerId = watch('player_id')
  const listPath = isClubScope ? transferRoutes.clubList : transferRoutes.list

  const selectedPlayer = useMemo(() => {
    if (!selectedPlayerId || !playersData?.results) return null
    return playersData.results.find((p: Player) => p.id === selectedPlayerId) || null
  }, [selectedPlayerId, playersData])

  const originClub = useMemo(() => {
    const fromId = watch('from_club_id')
    if (!fromId) return null
    return allClubs.find((c) => c.id === fromId) || null
  }, [watch('from_club_id'), allClubs])

  const destinationClub = useMemo(() => {
    const toId = watch('to_club_id')
    if (isClubScope && club) return club
    if (!toId) return null
    return allClubs.find((c) => c.id === toId) || null
  }, [isClubScope, club, watch('to_club_id'), allClubs])

  const filteredPlayers = useMemo(() => {
    const query = playerSearch.toLowerCase().trim()
    const results = playersData?.results || []
    if (!query) return results
    return results.filter((player: Player) =>
      player.full_name.toLowerCase().includes(query) ||
      player.global_id?.toLowerCase().includes(query) ||
      (player.position_label || player.primary_position || '').toLowerCase().includes(query)
    )
  }, [playersData, playerSearch])

  const sidebarSections = isClubScope ? getClubSidebarSections() : undefined
  const sidebarLinks = isClubScope
    ? undefined
    : [
        { label: 'Visão Geral', href: ROUTES.DASHBOARD_ORGANIZATION, icon: <Trophy className="h-4 w-4" /> },
        { label: 'Transferências', href: transferRoutes.list, icon: <Shield className="h-4 w-4" /> },
      ]

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!selectedPlayerId
      case 2:
        if (selectedTransferType === 'free_agent') {
          return !!watch('to_club_id') && !!watch('transfer_date')
        }
        if (selectedTransferType === 'loan') {
          return !!watch('to_club_id') && !!watch('from_club_id') && !!watch('transfer_date') && !!watch('loan_end_date')
        }
        return !!watch('to_club_id') && !!watch('from_club_id') && !!watch('transfer_date')
      default:
        return true
    }
  }

  const handlePlayerSelect = (player: Player) => {
    setValue('player_id', player.id)
    if (isClubScope && club?.id) {
      setValue('to_club_id', club.id)
    }

    if (player.current_club?.id) {
      setValue('from_club_id', player.current_club.id)
      setValue('transfer_type', 'permanent')
    } else {
      setValue('from_club_id', '')
      setValue('transfer_type', 'free_agent')
    }

    if (player.shirt_number) {
      setValue('shirt_number', player.shirt_number)
    }
  }

  const handleTransferTypeChange = (newType: 'permanent' | 'loan' | 'free_agent') => {
    setValue('transfer_type', newType)
    if (newType === 'free_agent') {
      setValue('from_club_id', '')
      setValue('loan_end_date', null)
    } else if (newType === 'permanent') {
      setValue('loan_end_date', null)
      if (selectedPlayer?.current_club?.id) {
        setValue('from_club_id', selectedPlayer.current_club.id)
      }
    } else if (newType === 'loan') {
      if (selectedPlayer?.current_club?.id) {
        setValue('from_club_id', selectedPlayer.current_club.id)
      }
    }
  }

  const onSubmit = async (data: TransferFormData) => {
    const payload: CreateTransferPayload = {
      player_id: data.player_id,
      to_club_id: data.to_club_id,
      from_club_id: data.transfer_type === 'free_agent' ? null : data.from_club_id || null,
      transfer_type: data.transfer_type,
      transfer_date: data.transfer_date,
      joined_date: data.transfer_date,
      loan_end_date: data.transfer_type === 'loan' ? data.loan_end_date : null,
      shirt_number: data.shirt_number ? Number(data.shirt_number) : null,
      fee: data.fee != null && !Number.isNaN(data.fee) ? data.fee : null,
      salary_contribution: data.salary_contribution,
      notes: data.notes || undefined,
    }

    try {
      const created = await createTransfer.mutateAsync(payload)
      navigate(isClubScope ? transferRoutes.clubDetail(created.id) : transferRoutes.detail(created.id))
    } catch {
      // Toast handled by mutation hook
    }
  }

  if (isClubScope && (clubLoading || !club)) {
    return (
      <DashboardLayout
        title="Nova Transferência"
        subtitle="Carregando dados institucionais..."
        dashboardType="club"
        sidebarLinks={sidebarLinks}
        sidebarSections={sidebarSections}
      >
        <div className="space-y-lg">
          <Skeleton className="h-36 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title={isClubScope ? `Nova Transferência • ${club?.name || 'Clube'}` : 'Nova Transferência'}
      subtitle={
        isClubScope
          ? 'Submeta uma proposta de transferência federativa, empréstimo temporário ou contratação de atleta livre.'
          : 'Registo e homologação de transferências de atletas entre clubes federados.'
      }
      dashboardType={isClubScope ? 'club' : 'organization'}
      sidebarLinks={sidebarLinks}
      sidebarSections={sidebarSections}
      headerActions={
        <Button asChild variant="secondary" size="sm">
          <Link to={listPath}>
            <ArrowLeft className="mr-xs h-4 w-4" />
            <span>Voltar ao Mercado</span>
          </Link>
        </Button>
      }
    >
      <div className="space-y-xl">
        {/* Executive Page Header */}
        <div className="rounded-2xl border border-outline-variant/30 bg-surface p-lg shadow-xs">
          <div className="flex flex-col gap-md md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-md">
              {isClubScope && club ? (
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container/50 p-1 flex items-center justify-center">
                  <ClubLogo logoUrl={club.logo_url} name={club.name} size="lg" />
                </div>
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ArrowRightLeft className="h-7 w-7" />
                </div>
              )}
              <div>
                <div className="flex flex-wrap items-center gap-xs">
                  <Badge variant="secondary" className="border-primary/20 bg-primary/10 text-primary font-semibold text-[11px]">
                    <ArrowRightLeft className="mr-1 h-3 w-3" />
                    Mercado & Transferências
                  </Badge>
                  {isClubScope && (club?.tenant_name || (club as any)?.association_name) && (
                    <Badge variant="outline" className="text-[11px] text-on-surface-variant">
                      {club?.tenant_name || (club as any)?.association_name}
                    </Badge>
                  )}
                </div>
                <h1 className="mt-1 text-2xl font-bold text-on-surface tracking-tight">
                  Registo de Transferência Federativa
                </h1>
                <p className="text-xs text-on-surface-variant">
                  Formalize a contratação do atleta, defina condições financeiras e submeta para homologação.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-xs">
              <Button asChild variant="secondary" size="sm">
                <Link to={listPath}>
                  Ver Todas as Transferências
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Wizard Stepper */}
        <Card variant="flat" padding="none" className="border-outline-variant/30 bg-surface shadow-xs">
          <div className="p-md">
            <div className="grid grid-cols-3 gap-2">
              {STEPS.map((step) => {
                const isPassed = currentStep > step.id
                const isCurrent = currentStep === step.id

                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 rounded-xl p-2.5 transition-colors ${
                      isCurrent
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : isPassed
                        ? 'bg-surface-container/50 text-on-surface'
                        : 'text-on-surface-variant opacity-60'
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                        isCurrent
                          ? 'bg-primary text-on-primary'
                          : isPassed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-surface-container-high text-on-surface-variant'
                      }`}
                    >
                      {isPassed ? <Check className="h-4 w-4" /> : step.id}
                    </div>
                    <div className="min-w-0 hidden sm:block">
                      <p className="text-xs font-bold leading-tight truncate">{step.title}</p>
                      <p className="text-[10px] text-on-surface-variant truncate">{step.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* STEP 1: Selecionar Jogador */}
          {currentStep === 1 && (
            <Card variant="flat" padding="none" className="border-outline-variant/30 bg-surface shadow-xs">
              <CardHeader className="border-b border-outline-variant/20 pb-md">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      <span>Passo 1: Selecionar Atleta</span>
                    </CardTitle>
                    <p className="text-xs text-on-surface-variant">
                      Pesquise na base federativa o jogador que deseja contratar ou receber no clube.
                    </p>
                  </div>
                  {selectedPlayer && (
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">
                      1 Atleta Selecionado
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-lg space-y-md">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                  <Input
                    id="player-search"
                    value={playerSearch}
                    onChange={(e) => setPlayerSearch(e.target.value)}
                    className="pl-10 text-xs rounded-xl"
                    placeholder="Pesquise por nome, licença BY-PLY ou posição do atleta..."
                  />
                </div>

                {/* Selected Player Preview Banner if already chosen */}
                {selectedPlayer && (
                  <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-md">
                    <div className="flex items-center gap-md">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold text-sm shadow-xs"
                        style={{
                          backgroundColor: `${getPositionAccentColor(selectedPlayer.primary_position)}20`,
                          color: getPositionAccentColor(selectedPlayer.primary_position),
                        }}
                      >
                        {selectedPlayer.full_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-on-surface">{selectedPlayer.full_name}</p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          <Badge variant="outline" className="text-[10px] font-semibold">
                            {selectedPlayer.position_label || selectedPlayer.primary_position}
                          </Badge>
                          <span className="text-xs text-on-surface-variant">
                            {selectedPlayer.current_club?.name ? (
                              <span className="text-primary font-medium">Clube Atual: {selectedPlayer.current_club.name}</span>
                            ) : (
                              <span className="text-amber-600 dark:text-amber-400 font-medium">Jogador Livre (Sem Clube)</span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-primary text-on-primary text-xs">
                        Selecionado
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Player List */}
                {playersLoading ? (
                  <div className="space-y-sm">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-16 rounded-xl" />
                    ))}
                  </div>
                ) : filteredPlayers.length === 0 ? (
                  <EmptyState
                    title="Nenhum atleta encontrado"
                    description="Ajuste a pesquisa por nome ou certifique-se de que o jogador está registado no sistema."
                    icon={User}
                  />
                ) : (
                  <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
                    {filteredPlayers.map((player: Player) => {
                      const isSelected = selectedPlayerId === player.id
                      const posColor = getPositionAccentColor(player.primary_position)

                      return (
                        <button
                          key={player.id}
                          type="button"
                          onClick={() => handlePlayerSelect(player)}
                          className={`w-full rounded-xl border p-md text-left transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/5 shadow-xs ring-1 ring-primary'
                              : 'border-outline-variant/30 bg-surface hover:border-primary/40 hover:bg-surface-container-low'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-md">
                            <div className="flex items-center gap-md min-w-0">
                              <div
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-bold text-xs"
                                style={{
                                  backgroundColor: `${posColor}20`,
                                  color: posColor,
                                }}
                              >
                                {player.full_name.slice(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-sm text-on-surface truncate">
                                  {player.full_name}
                                </p>
                                <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] px-1.5 py-0 capitalize"
                                    style={{
                                      borderColor: `${posColor}40`,
                                      color: posColor,
                                    }}
                                  >
                                    {player.position_label || player.primary_position}
                                  </Badge>

                                  {player.current_club?.name ? (
                                    <span className="text-[11px] text-on-surface-variant flex items-center gap-1">
                                      <Building2 className="h-3 w-3 text-on-surface-variant/60" />
                                      {player.current_club.name}
                                    </span>
                                  ) : (
                                    <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                                      Agente Livre
                                    </span>
                                  )}

                                  {player.nationality && (
                                    <span className="text-[11px] text-on-surface-variant/60 hidden sm:inline">
                                      • {player.nationality}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="shrink-0">
                              {isSelected ? (
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-on-primary">
                                  <Check className="h-3.5 w-3.5" />
                                </div>
                              ) : (
                                <div className="h-5 w-5 rounded-full border border-outline-variant/60" />
                              )}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* STEP 2: Detalhes da Transferência */}
          {currentStep === 2 && (
            <Card variant="flat" padding="none" className="border-outline-variant/30 bg-surface shadow-xs">
              <CardHeader className="border-b border-outline-variant/20 pb-md">
                <CardTitle className="text-base flex items-center gap-2">
                  <ArrowRightLeft className="h-5 w-5 text-primary" />
                  <span>Passo 2: Condições & Clubes Envolvidos</span>
                </CardTitle>
                <p className="text-xs text-on-surface-variant">
                  Defina o enquadramento regulamentar, clubes intervenientes e contrapartidas da operação.
                </p>
              </CardHeader>
              <CardContent className="p-lg space-y-xl">
                {/* Tipo de Transferência */}
                <div className="space-y-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Modalidade da Operação
                  </p>
                  <div className="grid grid-cols-1 gap-sm sm:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => handleTransferTypeChange('permanent')}
                      className={`rounded-xl border p-md text-left transition-all ${
                        selectedTransferType === 'permanent'
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-outline-variant/30 bg-surface hover:border-outline-variant'
                      }`}
                    >
                      <p className="font-bold text-sm text-on-surface">Definitiva / Compra</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        Transferência permanente com desvinculação total do clube cedente.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTransferTypeChange('loan')}
                      className={`rounded-xl border p-md text-left transition-all ${
                        selectedTransferType === 'loan'
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-outline-variant/30 bg-surface hover:border-outline-variant'
                      }`}
                    >
                      <p className="font-bold text-sm text-on-surface">Empréstimo</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        Cedência temporária com data de retorno acordada entre os clubes.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTransferTypeChange('free_agent')}
                      className={`rounded-xl border p-md text-left transition-all ${
                        selectedTransferType === 'free_agent'
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-outline-variant/30 bg-surface hover:border-outline-variant'
                      }`}
                    >
                      <p className="font-bold text-sm text-on-surface">Jogador Livre</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        Atleta sem vínculo ativo federativo. Não exige aprovação de clube de origem.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Clubes: Origem e Destino */}
                <div className="grid gap-lg md:grid-cols-2">
                  {/* Clube de Origem */}
                  <FormField
                    label="Clube de Origem"
                    htmlFor="from_club_id"
                    error={errors.from_club_id?.message}
                    hint={
                      selectedTransferType === 'free_agent'
                        ? 'Não aplicável para jogadores sem clube.'
                        : 'Selecione o clube detentor do passe do atleta.'
                    }
                  >
                    {selectedTransferType === 'free_agent' ? (
                      <div className="flex items-center gap-2 rounded-xl border border-outline-variant/30 bg-surface-container-low p-3 text-xs text-on-surface-variant">
                        <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                        <span>Jogador Livre (Free Agent) — Dispensa clube de origem.</span>
                      </div>
                    ) : clubsLoading ? (
                      <Skeleton className="h-10 w-full rounded-xl" />
                    ) : (
                      <Controller
                        name="from_club_id"
                        control={control}
                        render={({ field }) => (
                          <NativeSelect
                            id="from_club_id"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="text-xs"
                          >
                            <option value="">Selecione o clube cedente...</option>
                            {allClubs
                              .filter((c) => c.id !== (isClubScope ? club?.id : watch('to_club_id')))
                              .map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.name} {c.short_name ? `(${c.short_name})` : ''}
                                </option>
                              ))}
                          </NativeSelect>
                        )}
                      />
                    )}
                  </FormField>

                  {/* Clube de Destino */}
                  <FormField
                    label="Clube de Destino"
                    htmlFor="to_club_id"
                    error={errors.to_club_id?.message}
                    hint="Clube que integrará o atleta no seu plantel federado."
                  >
                    {isClubScope && club ? (
                      <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-outline-variant/30 bg-surface flex items-center justify-center">
                            <ClubLogo logoUrl={club.logo_url} name={club.name} size="sm" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-on-surface">{club.name}</p>
                            <p className="text-[11px] text-primary font-medium">Clube Comprador / Recetor (Seu Clube)</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-[11px] bg-primary/10 text-primary border-primary/20">
                          Destino
                        </Badge>
                      </div>
                    ) : (
                      <Controller
                        name="to_club_id"
                        control={control}
                        render={({ field }) => (
                          <NativeSelect
                            id="to_club_id"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="text-xs"
                          >
                            <option value="">Selecione o clube de destino...</option>
                            {allClubs
                              .filter((c) => c.id !== watch('from_club_id'))
                              .map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.name} {c.short_name ? `(${c.short_name})` : ''}
                                </option>
                              ))}
                          </NativeSelect>
                        )}
                      />
                    )}
                  </FormField>
                </div>

                {/* Termos Contratuais: Datas, Dorsal, Valor */}
                <div className="grid gap-lg md:grid-cols-3">
                  <FormField
                    label="Data de Integração / Efeito"
                    htmlFor="transfer_date"
                    error={errors.transfer_date?.message}
                    hint="Data oficial de início do vínculo."
                  >
                    <Input id="transfer_date" type="date" {...register('transfer_date')} className="text-xs" />
                  </FormField>

                  <FormField
                    label="Dorsal Atribuída"
                    htmlFor="shirt_number"
                    error={errors.shirt_number?.message}
                    hint="Número de camisola no novo clube."
                  >
                    <div className="relative">
                      <Shirt className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant/60" />
                      <Input
                        id="shirt_number"
                        type="number"
                        min={1}
                        max={99}
                        placeholder="Ex: 10"
                        {...register('shirt_number')}
                        className="pl-9 text-xs"
                      />
                    </div>
                  </FormField>

                  <FormField
                    label="Valor da Operação (AOA)"
                    htmlFor="fee"
                    error={errors.fee?.message}
                    hint="Compensação financeira acordada."
                  >
                    <div className="relative">
                      <Banknote className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant/60" />
                      <Input
                        id="fee"
                        type="number"
                        step={1000}
                        min={0}
                        placeholder="0.00"
                        {...register('fee')}
                        className="pl-9 text-xs"
                      />
                    </div>
                  </FormField>
                </div>

                {/* Configurações de Empréstimo */}
                {selectedTransferType === 'loan' && (
                  <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-md space-y-md">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      Condições do Empréstimo
                    </p>
                    <div className="grid gap-md sm:grid-cols-2">
                      <FormField
                        label="Data de Fim do Empréstimo"
                        htmlFor="loan_end_date"
                        error={errors.loan_end_date?.message}
                        hint="Data em que o atleta regressa ao clube cedente."
                      >
                        <Input id="loan_end_date" type="date" {...register('loan_end_date')} className="text-xs bg-surface" />
                      </FormField>

                      <div className="flex flex-col justify-center">
                        <label className="flex items-center gap-2 cursor-pointer pt-4">
                          <input
                            type="checkbox"
                            {...register('salary_contribution')}
                            className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
                          />
                          <span className="text-xs text-on-surface font-medium">
                            Comparticipação salarial acordada entre os clubes
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Observações / Notas */}
                <FormField
                  label="Notas e Cláusulas Contratuais"
                  htmlFor="notes"
                  error={errors.notes?.message}
                  hint="Observações internas ou termos suplementares do acordo."
                >
                  <Textarea
                    id="notes"
                    {...register('notes')}
                    placeholder="Especifique termos do acordo, opções de compra ou notas de homologação..."
                    maxLength={500}
                    rows={3}
                    className="text-xs"
                  />
                </FormField>
              </CardContent>
            </Card>
          )}

          {/* STEP 3: Rever e Submeter */}
          {currentStep === 3 && (
            <div className="space-y-lg">
              <Card variant="flat" padding="none" className="border-outline-variant/30 bg-surface shadow-xs">
                <CardHeader className="border-b border-outline-variant/20 pb-md">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span>Passo 3: Homologação e Resumo da Transferência</span>
                  </CardTitle>
                  <p className="text-xs text-on-surface-variant">
                    Reveja os intervenientes e as cláusulas antes de submeter para o fluxo federativo.
                  </p>
                </CardHeader>
                <CardContent className="p-lg space-y-lg">
                  {/* Matchup Flow Visual */}
                  <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-lg">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-md">
                      {/* Origin Club */}
                      <div className="flex flex-col items-center text-center p-md rounded-xl bg-surface border border-outline-variant/20 w-full md:w-1/3 shadow-2xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                          Clube Cedente
                        </span>
                        <p className="font-bold text-sm text-on-surface">
                          {selectedTransferType === 'free_agent'
                            ? 'Jogador Livre'
                            : originClub?.name || 'Clube de Origem'}
                        </p>
                        <span className="text-[11px] text-on-surface-variant mt-0.5">
                          {selectedTransferType === 'free_agent' ? 'Sem Clube Anterior' : 'Origem'}
                        </span>
                      </div>

                      {/* Center: Player */}
                      <div className="flex flex-col items-center text-center px-md py-sm">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2 shadow-xs">
                          <ArrowRightLeft className="h-5 w-5" />
                        </div>
                        <p className="font-bold text-base text-on-surface">
                          {selectedPlayer?.full_name || 'Atleta'}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {selectedPlayer?.position_label || selectedPlayer?.primary_position || 'Atleta'}
                          </Badge>
                          {watch('shirt_number') && (
                            <Badge variant="outline" className="font-mono font-bold text-xs">
                              #{watch('shirt_number')}
                            </Badge>
                          )}
                        </div>
                        <Badge variant="outline" className="mt-2 text-[11px] font-semibold border-primary/30 text-primary bg-primary/5">
                          {selectedTransferType === 'permanent' && 'Transferência Definitiva'}
                          {selectedTransferType === 'loan' && 'Cedência por Empréstimo'}
                          {selectedTransferType === 'free_agent' && 'Contratação a Custo Zero'}
                        </Badge>
                      </div>

                      {/* Destination Club */}
                      <div className="flex flex-col items-center text-center p-md rounded-xl bg-surface border border-outline-variant/20 w-full md:w-1/3 shadow-2xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                          Clube Integrador
                        </span>
                        <p className="font-bold text-sm text-on-surface">
                          {destinationClub?.name || 'Clube de Destino'}
                        </p>
                        <span className="text-[11px] text-primary font-medium mt-0.5">
                          Destino Oficial
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Details Table */}
                  <div className="rounded-xl border border-outline-variant/25 bg-surface-container-low/60 p-md">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-sm">
                      Ficha da Operação
                    </h4>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-lg gap-y-sm text-sm">
                      <div className="flex justify-between py-1 border-b border-outline-variant/15">
                        <dt className="text-on-surface-variant text-xs">Modalidade:</dt>
                        <dd className="font-semibold text-on-surface text-xs">
                          {selectedTransferType === 'permanent' && 'Definitiva'}
                          {selectedTransferType === 'loan' && 'Empréstimo'}
                          {selectedTransferType === 'free_agent' && 'Livre de Contrato'}
                        </dd>
                      </div>

                      <div className="flex justify-between py-1 border-b border-outline-variant/15">
                        <dt className="text-on-surface-variant text-xs">Data de Integração:</dt>
                        <dd className="font-semibold text-on-surface text-xs">
                          {watch('transfer_date')
                            ? new Date(watch('transfer_date')).toLocaleDateString('pt-AO')
                            : '—'}
                        </dd>
                      </div>

                      {selectedTransferType === 'loan' && watch('loan_end_date') && (
                        <div className="flex justify-between py-1 border-b border-outline-variant/15">
                          <dt className="text-on-surface-variant text-xs">Fim do Empréstimo:</dt>
                          <dd className="font-semibold text-on-surface text-xs">
                            {new Date(watch('loan_end_date')!).toLocaleDateString('pt-AO')}
                          </dd>
                        </div>
                      )}

                      <div className="flex justify-between py-1 border-b border-outline-variant/15">
                        <dt className="text-on-surface-variant text-xs">Valor Acordado:</dt>
                        <dd className="font-semibold text-on-surface text-xs">
                          {formatCurrency(watch('fee'))}
                        </dd>
                      </div>

                      <div className="flex justify-between py-1 border-b border-outline-variant/15">
                        <dt className="text-on-surface-variant text-xs">Dorsal Atribuída:</dt>
                        <dd className="font-semibold text-on-surface text-xs font-mono">
                          {watch('shirt_number') ? `#${watch('shirt_number')}` : 'Sem dorsal definida'}
                        </dd>
                      </div>

                      {watch('notes') && (
                        <div className="col-span-full pt-2">
                          <dt className="text-on-surface-variant text-xs mb-0.5">Observações:</dt>
                          <dd className="text-xs text-on-surface bg-surface p-2 rounded-lg border border-outline-variant/20">
                            {watch('notes')}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  {/* Federation Notice */}
                  <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-md">
                    <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-on-surface leading-relaxed">
                      {selectedTransferType === 'free_agent'
                        ? 'Contratações de atletas livres são efetivadas imediatamente no sistema federativo assim que submetidas.'
                        : 'Transferências entre clubes serão registadas no estado Pendente até confirmação e aprovação pelo clube de origem.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-md pt-lg">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="mr-xs h-4 w-4" />
              <span>Anterior</span>
            </Button>

            {currentStep < 3 ? (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => canProceed() && setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
              >
                <span>Próximo</span>
                <ArrowRight className="ml-xs h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSubmitting || createTransfer.isPending}
              >
                {isSubmitting || createTransfer.isPending ? (
                  <>
                    <Loader2 className="mr-xs h-4 w-4 animate-spin" />
                    <span>A submeter transferência...</span>
                  </>
                ) : (
                  <>
                    <Check className="mr-xs h-4 w-4" />
                    <span>Submeter Transferência</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

export default TransferCreatePage
