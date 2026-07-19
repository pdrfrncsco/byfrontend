import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Loader2, Search, User } from 'lucide-react'
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
  Select,
  Skeleton,
  EmptyState,
} from '@/components/ui'
import { getClubSidebarLinks } from '@/modules/clubs/constants/navigation'
import { useClubMe } from '@/modules/clubs/hooks/useClubs'
import { usePlayers } from '@/modules/players/hooks'
import type { Player } from '@/modules/players/types'
import { useCreateTransfer } from '../hooks'
import { transferRoutes } from '../routes'

const transferSchema = z
  .object({
    player_id: z.string().min(1, 'Selecione um jogador'),
    from_club_id: z.string().optional().nullable(),
    to_club_id: z.string().min(1, 'Selecione o clube de destino'),
    transfer_type: z.enum(['permanent', 'loan', 'free_agent']),
    transfer_date: z.string().min(1, 'Data de transferência é obrigatória'),
    loan_end_date: z.string().optional().nullable(),
    fee: z.number().optional().nullable(),
    salary_contribution: z.boolean().default(false),
    notes: z.string().max(500).optional(),
  })
  .refine((data) => !(data.transfer_type === 'loan' && !data.loan_end_date), {
    message: 'Empréstimos precisam de data de fim',
    path: ['loan_end_date'],
  })
  .refine((data) => !(data.transfer_type === 'free_agent' && data.from_club_id), {
    message: 'Jogadores livres não podem ter clube de origem',
    path: ['from_club_id'],
  })
  .refine(
    (data) =>
      data.transfer_type === 'free_agent' || !!data.from_club_id,
    {
      message: 'Transferências permanentes e empréstimos precisam de clube de origem',
      path: ['from_club_id'],
    },
  )

type TransferFormData = z.infer<typeof transferSchema>

const STEPS = [
  { id: 1, title: 'Jogador', description: 'Selecionar jogador' },
  { id: 2, title: 'Detalhes', description: 'Tipo e clubes' },
  { id: 3, title: 'Finalizar', description: 'Rever e submeter' },
]

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
  const createTransfer = useCreateTransfer()
  const { data: playersData, isLoading: playersLoading } = usePlayers({ page_size: 50 })

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
      to_club_id: '',
      from_club_id: '',
    },
  })

  const selectedTransferType = watch('transfer_type')
  const selectedPlayerId = watch('player_id')
  const listPath = isClubScope ? transferRoutes.clubList : transferRoutes.list

  const filteredPlayers =
    playersData?.results?.filter((player: Player) =>
      player.full_name.toLowerCase().includes(playerSearch.toLowerCase()),
    ) ?? []

  const sidebarLinks = isClubScope
    ? getClubSidebarLinks()
    : [
        { label: 'Visão Geral', href: ROUTES.DASHBOARD_ORGANIZATION },
        { label: 'Transferências', href: transferRoutes.list },
      ]

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!selectedPlayerId
      case 2:
        return !!watch('to_club_id') && !!watch('transfer_date')
      default:
        return true
    }
  }

  const onSubmit = async (data: TransferFormData) => {
    const payload = {
      ...data,
      from_club_id: data.transfer_type === 'free_agent' ? null : data.from_club_id,
      loan_end_date: data.transfer_type === 'loan' ? data.loan_end_date : null,
    }

    try {
      const created = await createTransfer.mutateAsync(payload)
      navigate(isClubScope ? transferRoutes.clubDetail(created.id) : transferRoutes.detail(created.id))
    } catch {
      // Toast handled by hook
    }
  }

  const handlePlayerSelect = (playerId: string) => {
    setValue('player_id', playerId)
    if (isClubScope && club?.id) {
      setValue('to_club_id', club.id)
    }
  }

  if (isClubScope && (clubLoading || !club)) {
    return (
      <DashboardLayout
        title="Nova Transferência"
        subtitle="Carregando..."
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

  return (
    <DashboardLayout
      title="Nova Transferência"
      subtitle="Registar movimento de jogador entre clubes"
      dashboardType={isClubScope ? 'club' : 'organization'}
      sidebarLinks={sidebarLinks}
      headerActions={
        <Button variant="secondary" size="sm" onClick={() => navigate(listPath)}>
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar</span>
        </Button>
      }
    >
      <div className="space-y-xl">
        <Card variant="flat" padding="lg">
          <div className="flex flex-wrap items-center justify-between gap-md">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      currentStep >= step.id
                        ? 'border-primary bg-primary text-on-primary'
                        : 'border-outline-variant text-outline'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-semibold">{step.id}</span>
                    )}
                  </div>
                  <div className="ml-3">
                    <p
                      className={`text-sm font-semibold ${
                        currentStep >= step.id ? 'text-on-surface' : 'text-on-surface-variant'
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-on-surface-variant">{step.description}</p>
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`mx-4 hidden h-0.5 w-12 sm:block ${
                      currentStep > step.id ? 'bg-primary' : 'bg-outline-variant'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </Card>

        <form onSubmit={handleSubmit(onSubmit)}>
          {currentStep === 1 && (
            <Card variant="flat" padding="none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Selecionar Jogador
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-md">
                  <FormField label="Pesquisar jogador" htmlFor="player-search">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
                      <Input
                        id="player-search"
                        value={playerSearch}
                        onChange={(e) => setPlayerSearch(e.target.value)}
                        className="pl-10"
                        placeholder="Nome do jogador..."
                      />
                    </div>
                  </FormField>

                  {playersLoading ? (
                    <div className="space-y-sm">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-16 rounded-xl" />
                      ))}
                    </div>
                  ) : filteredPlayers.length === 0 ? (
                    <EmptyState
                      title="Nenhum jogador encontrado"
                      description="Tente ajustar a pesquisa ou verifique se há jogadores registados."
                      icon={User}
                    />
                  ) : (
                    <div className="max-h-96 space-y-sm overflow-y-auto">
                      {filteredPlayers.map((player: Player) => (
                        <button
                          key={player.id}
                          type="button"
                          onClick={() => handlePlayerSelect(player.id)}
                          className={`w-full rounded-xl border-2 p-md text-left transition-all ${
                            selectedPlayerId === player.id
                              ? 'border-primary bg-primary-container/20'
                              : 'border-outline-variant/30 hover:border-outline-variant'
                          }`}
                        >
                          <div className="flex items-center gap-md">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-high">
                              <User className="h-6 w-6 text-on-surface-variant" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-on-surface">{player.full_name}</p>
                              <div className="flex items-center gap-sm">
                                {player.primary_position && (
                                  <Badge variant="secondary">{player.primary_position}</Badge>
                                )}
                                {player.nationality && (
                                  <span className="text-xs text-on-surface-variant">
                                    {player.nationality}
                                  </span>
                                )}
                              </div>
                            </div>
                            {selectedPlayerId === player.id && <Check className="h-5 w-5 text-primary" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card variant="flat" padding="none">
              <CardHeader>
                <CardTitle>Detalhes da Transferência</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-lg md:grid-cols-2">
                  <FormField
                    label="Tipo de Transferência"
                    htmlFor="transfer_type"
                    error={errors.transfer_type?.message}
                  >
                    <Controller
                      name="transfer_type"
                      control={control}
                      render={({ field }) => (
                        <Select
                          id="transfer_type"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value)}
                        >
                          <option value="permanent">Permanente</option>
                          <option value="loan">Empréstimo</option>
                          <option value="free_agent">Livre</option>
                        </Select>
                      )}
                    />
                  </FormField>

                  <FormField
                    label="Data da Transferência"
                    htmlFor="transfer_date"
                    error={errors.transfer_date?.message}
                  >
                    <Input id="transfer_date" type="date" {...register('transfer_date')} />
                  </FormField>

                  {selectedTransferType !== 'free_agent' && (
                    <FormField
                      label="Clube de Origem (ID)"
                      htmlFor="from_club_id"
                      error={errors.from_club_id?.message}
                    >
                      <Input
                        id="from_club_id"
                        {...register('from_club_id')}
                        placeholder="UUID do clube de origem"
                      />
                    </FormField>
                  )}

                  <FormField
                    label="Clube de Destino (ID)"
                    htmlFor="to_club_id"
                    error={errors.to_club_id?.message}
                  >
                    <Input
                      id="to_club_id"
                      {...register('to_club_id')}
                      placeholder={club?.name || 'UUID do clube de destino'}
                    />
                  </FormField>

                  {selectedTransferType === 'loan' && (
                    <FormField
                      label="Data de Fim do Empréstimo"
                      htmlFor="loan_end_date"
                      error={errors.loan_end_date?.message}
                    >
                      <Input id="loan_end_date" type="date" {...register('loan_end_date')} />
                    </FormField>
                  )}

                  <FormField label="Valor da Transferência (AOA)" htmlFor="fee" error={errors.fee?.message}>
                    <Input
                      id="fee"
                      type="number"
                      {...register('fee', { valueAsNumber: true })}
                      placeholder="0.00"
                    />
                  </FormField>

                  <FormField label="Notas" htmlFor="notes" error={errors.notes?.message}>
                    <Input
                      id="notes"
                      {...register('notes')}
                      placeholder="Observações adicionais..."
                      maxLength={500}
                    />
                  </FormField>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card variant="flat" padding="none">
              <CardHeader>
                <CardTitle>Rever Transferência</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-lg">
                  <div className="rounded-xl bg-surface-container-high p-md">
                    <h4 className="mb-sm text-sm font-semibold text-on-surface-variant">Resumo</h4>
                    <dl className="space-y-sm">
                      <div className="flex justify-between">
                        <dt className="text-sm text-on-surface-variant">Tipo:</dt>
                        <dd className="text-sm font-semibold text-on-surface">
                          {watch('transfer_type') === 'permanent' && 'Permanente'}
                          {watch('transfer_type') === 'loan' && 'Empréstimo'}
                          {watch('transfer_type') === 'free_agent' && 'Livre'}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-on-surface-variant">Data:</dt>
                        <dd className="text-sm font-semibold text-on-surface">
                          {watch('transfer_date')
                            ? new Date(watch('transfer_date')).toLocaleDateString('pt-AO')
                            : '—'}
                        </dd>
                      </div>
                      {watch('loan_end_date') && (
                        <div className="flex justify-between">
                          <dt className="text-sm text-on-surface-variant">Fim do Empréstimo:</dt>
                          <dd className="text-sm font-semibold text-on-surface">
                            {new Date(watch('loan_end_date')!).toLocaleDateString('pt-AO')}
                          </dd>
                        </div>
                      )}
                      {watch('fee') != null && !Number.isNaN(watch('fee')) && (
                        <div className="flex justify-between">
                          <dt className="text-sm text-on-surface-variant">Valor:</dt>
                          <dd className="text-sm font-semibold text-on-surface">
                            {Number(watch('fee')).toLocaleString('pt-AO', {
                              style: 'currency',
                              currency: 'AOA',
                            })}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  <div className="rounded-xl border border-warning/20 bg-warning-container/20 p-md">
                    <p className="text-sm text-on-surface">
                      Ao submeter, a transferência entra no fluxo de aprovação. Transferências
                      permanentes clube-a-clube ficam pendentes até o clube de origem aprovar.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between gap-md pt-lg">
            <Button
              type="button"
              variant="secondary"
              onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4" />
              Anterior
            </Button>

            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={() => canProceed() && setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
              >
                Próximo
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting || createTransfer.isPending}>
                {isSubmitting || createTransfer.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    A submeter...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Submeter Transferência
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
