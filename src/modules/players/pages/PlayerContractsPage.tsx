import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  AlertTriangle,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Plus,
  Shield,
  Sparkles,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { ROUTES } from '@/constants/routes'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@/components/ui'
import { EmptyState } from '@/components/ui/empty-state'
import {
  PlayerContractCard,
  PlayerContractForm,
  PlayerAgentForm,
} from '../components'
import { PlayerContractSection } from '../components/sections/PlayerContractSection'
import { PlayerAgentSection } from '../components/sections/PlayerAgentSection'
import {
  usePlayerMe,
  usePlayerContracts,
  useCreateContract,
  useSignContract,
  usePlayerAgents,
  useCreateAgentRelationship,
  getActiveContract,
  formatCurrency,
  getContractTypeLabel,
} from '../hooks'
import { getPlayerSidebarLinks } from '../constants/navigation'
import type { PlayerContract } from '../types'
import type { PlayerContractFormData } from '../schemas/contract.schema'

export function PlayerContractsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: player, isLoading: loadingPlayer, isError } = usePlayerMe()

  const [showAddContractForm, setShowAddContractForm] = useState(false)
  const [showAddAgentForm, setShowAddAgentForm] = useState(false)
  const [selectedContract, setSelectedContract] = useState<PlayerContract | null>(null)

  const { data: contractsData, isLoading: loadingContracts } = usePlayerContracts(
    player?.id ?? '',
    !!player?.id
  )
  const createContractMutation = useCreateContract(player?.id ?? '')
  const signContractMutation = useSignContract(
    player?.id ?? '',
    selectedContract?.id ?? ''
  )
  const createAgentMutation = useCreateAgentRelationship(player?.id ?? '')

  const contracts = useMemo(() => {
    if (!contractsData) return []
    return Array.isArray(contractsData)
      ? contractsData
      : (contractsData as { results?: PlayerContract[] })?.results ?? []
  }, [contractsData])

  const activeContract = useMemo(() => getActiveContract(contracts), [contracts])

  const sidebarLinks = getPlayerSidebarLinks(player?.slug)

  if (loadingPlayer) {
    return (
      <DashboardLayout
        title="Contratos & Agenciamento"
        subtitle="A carregar dossiê contratual..."
        dashboardType="player"
        sidebarLinks={sidebarLinks}
      >
        <div className="space-y-lg">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
      </DashboardLayout>
    )
  }

  if (isError || !player) {
    return (
      <DashboardLayout
        title="Contratos & Agenciamento"
        subtitle="Dossiê jurídico e representação do atleta"
        dashboardType="player"
        sidebarLinks={sidebarLinks}
      >
        <EmptyState
          icon={Sparkles}
          title="Jogador não encontrado"
          description="Não foi possível carregar o dossiê contratual."
          action={{
            label: "Voltar para o Painel",
            onClick: () => navigate(ROUTES.DASHBOARD_PLAYER),
            variant: "secondary",
          }}
        />
      </DashboardLayout>
    )
  }

  const handleCreateContract = async (data: PlayerContractFormData) => {
    try {
      await createContractMutation.mutateAsync({
        club: data.club,
        contract_type: data.contract_type,
        status: data.status,
        start_date: data.start_date,
        end_date: data.end_date,
        salary: data.salary ?? undefined,
        currency: data.currency,
        bonuses: data.bonuses,
        release_clause: data.release_clause ?? undefined,
        has_image_rights: data.has_image_rights,
        option_year: data.option_year,
        termination_clause: data.termination_clause || undefined,
      })
      toast.success('Contrato desportivo criado com sucesso!')
      setShowAddContractForm(false)
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { contract?: string; error?: string } } })?.response?.data?.contract
        || (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        || 'Erro ao criar contrato desportivo.'
      toast.error(errorMsg)
    }
  }

  const handleSignContract = async () => {
    if (!selectedContract) return
    try {
      await signContractMutation.mutateAsync({
        signed_by_player: true,
      })
      toast.success('Contrato assinado pelo atleta com sucesso!')
      setSelectedContract((prev) => prev ? { ...prev, signed_by_player: true } : null)
    } catch (err) {
      toast.error('Erro ao assinar contrato.')
    }
  }

  const handleCreateAgent = async (data: {
    agent: string
    start_date: string
    end_date?: string
    commission_rate?: number
    notes?: string
  }) => {
    try {
      await createAgentMutation.mutateAsync({
        agent: data.agent,
        start_date: data.start_date,
        end_date: data.end_date,
        commission_rate: data.commission_rate,
        notes: data.notes,
      })
      toast.success('Agente vinculado com sucesso!')
      setShowAddAgentForm(false)
    } catch (err) {
      toast.error('Erro ao vincular agente.')
    }
  }

  return (
    <DashboardLayout
      title={`Contratos & Agentes — ${player.full_name}`}
      subtitle="Vínculos contratuais desportivos, remuneração, cláusulas e representação por agentes licenciados"
      dashboardType="player"
      sidebarLinks={sidebarLinks}
    >
      <div className="space-y-xl">
        {/* ─── 1. EXECUTIVE CONTRACT STATUS CARD (ONDE ENQUADRA O PlayerContractCard) ─── */}
        <div className="space-y-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Status Contratual Vigente
            </h2>
            {!showAddContractForm && (
              <Button
                size="sm"
                onClick={() => setShowAddContractForm(true)}
                className="gap-xs text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                Novo Contrato
              </Button>
            )}
          </div>

          <PlayerContractCard
            contract={activeContract}
            isLoading={loadingContracts}
            onViewDetails={activeContract ? () => setSelectedContract(activeContract) : undefined}
          />
        </div>

        {/* ─── 2. FORMULÁRIO DE NOVO CONTRATO (EXPANSÍVEL) ─────────────── */}
        {showAddContractForm && (
          <Card className="border-primary/40 bg-surface shadow-md">
            <CardHeader className="flex flex-row items-center justify-between border-b border-outline-variant/20 pb-md">
              <div>
                <CardTitle className="text-base font-bold text-on-surface">
                  Registar Novo Contrato Desportivo
                </CardTitle>
                <CardDescription>
                  Preencha os termos contratuais acordados com o clube empregador.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddContractForm(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-lg">
              <PlayerContractForm
                playerId={player.id}
                onSubmit={handleCreateContract}
                onCancel={() => setShowAddContractForm(false)}
                isSubmitting={createContractMutation.isPending}
              />
            </CardContent>
          </Card>
        )}

        {/* ─── 3. DETALHE DO CONTRATO SELECIONADO (MODAL/CARD) ─────────── */}
        {selectedContract && (
          <Card className="border-primary/40 bg-surface shadow-md">
            <CardHeader className="flex flex-row items-center justify-between border-b border-outline-variant/20 pb-md">
              <div>
                <CardTitle className="text-base font-bold text-on-surface">
                  Detalhes do Contrato: {typeof selectedContract.club === 'object' && selectedContract.club ? selectedContract.club.name : selectedContract.club_name}
                </CardTitle>
                <CardDescription>
                  Modalidade: {getContractTypeLabel(selectedContract.contract_type)} • Estado: {selectedContract.status}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedContract(null)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-lg p-lg text-xs">
              <div className="grid gap-md sm:grid-cols-3">
                <div className="rounded-xl border border-outline-variant/20 bg-surface-container/30 p-md">
                  <span className="text-on-surface-variant">Período de Vigência:</span>
                  <p className="mt-1 font-semibold text-on-surface">
                    {new Date(selectedContract.start_date).toLocaleDateString('pt-PT')} → {new Date(selectedContract.end_date).toLocaleDateString('pt-PT')}
                  </p>
                </div>

                <div className="rounded-xl border border-outline-variant/20 bg-surface-container/30 p-md">
                  <span className="text-on-surface-variant">Vencimento Base:</span>
                  <p className="mt-1 font-semibold text-on-surface">
                    {selectedContract.salary ? formatCurrency(selectedContract.salary, selectedContract.currency) : 'Confidencial / Não declarado'}
                  </p>
                </div>

                <div className="rounded-xl border border-outline-variant/20 bg-surface-container/30 p-md">
                  <span className="text-on-surface-variant">Cláusula de Rescisão:</span>
                  <p className="mt-1 font-semibold text-on-surface">
                    {selectedContract.release_clause ? formatCurrency(selectedContract.release_clause, selectedContract.currency) : 'Sem cláusula fixada'}
                  </p>
                </div>
              </div>

              {/* Status de Assinatura */}
              <div className="flex flex-wrap items-center justify-between gap-md rounded-xl border border-outline-variant/20 bg-surface-container/30 p-md">
                <div className="space-y-1">
                  <p className="font-semibold text-on-surface">Assinatura do Atleta:</p>
                  <p className="text-on-surface-variant">
                    {selectedContract.signed_by_player
                      ? '✓ Assinado digitalmente pelo jogador'
                      : '○ Pendente de assinatura do jogador'}
                  </p>
                </div>
                {!selectedContract.signed_by_player && (
                  <Button
                    size="sm"
                    onClick={handleSignContract}
                    loading={signContractMutation.isPending}
                    className="gap-xs text-xs"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Assinar como Jogador
                  </Button>
                )}
              </div>

              {selectedContract.termination_clause && (
                <div className="rounded-xl border border-outline-variant/20 bg-surface-container/30 p-md">
                  <span className="font-semibold text-on-surface">Cláusula de Rescisão e Condições Especiais:</span>
                  <p className="mt-1 text-on-surface-variant">{selectedContract.termination_clause}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ─── 4. FORMULÁRIO DE NOVO AGENTE (EXPANSÍVEL) ────────────────── */}
        {showAddAgentForm && (
          <Card className="border-primary/40 bg-surface shadow-md">
            <CardHeader className="flex flex-row items-center justify-between border-b border-outline-variant/20 pb-md">
              <div>
                <CardTitle className="text-base font-bold text-on-surface">
                  Vincular Agente Licenciado
                </CardTitle>
                <CardDescription>
                  Registe um agente ou agência de intermediação desportiva.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddAgentForm(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-lg">
              <PlayerAgentForm
                playerId={player.id}
                onSubmit={handleCreateAgent}
                onCancel={() => setShowAddAgentForm(false)}
                isSubmitting={createAgentMutation.isPending}
              />
            </CardContent>
          </Card>
        )}

        {/* ─── 5. HISTÓRICO DE CONTRATOS ─────────────────────────────────── */}
        <PlayerContractSection
          playerId={player.id}
          onAddContract={() => setShowAddContractForm(true)}
          onContractSelect={(c) => setSelectedContract(c)}
        />

        {/* ─── 6. AGENTES E REPRESENTAÇÃO JURÍDICA ───────────────────────── */}
        <PlayerAgentSection
          playerId={player.id}
          onAddAgent={() => setShowAddAgentForm(true)}
        />
      </div>
    </DashboardLayout>
  )
}
