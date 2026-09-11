import { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  GraduationCap,
  Award,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Globe,
  Plus,
  Trash2,
  ShieldCheck,
  AlertCircle,
  Info,
  X,
} from "lucide-react"
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  NativeSelect,
  Textarea,
  EmptyState,
} from "@/components/ui"
import { FormField } from "@/components/ui/form-field"
import {
  usePlayerTrainingHistoryQuery,
  usePlayerTrainingCompensationQuery,
} from "../../hooks/usePlayerQueries"
import {
  useCreateTrainingEntryMutation,
  useDeleteTrainingEntryMutation,
  useVerifyTrainingEntryMutation,
} from "../../hooks/usePlayerMutations"
import type {
  PlayerTrainingHistory,
  PlayerTrainingHistoryCreate,
  TrainingCategory,
} from "../../types"

interface PlayerTrainingHistorySectionProps {
  playerId: string
  readOnly?: boolean
  canVerify?: boolean
}

const CATEGORY_LABELS: Record<TrainingCategory, string> = {
  amateur: "Amador",
  youth: "Formação / Juniores",
  academy: "Academia Certificada",
  professional: "Profissional",
}

export function PlayerTrainingHistorySection({
  playerId,
  readOnly = false,
  canVerify = false,
}: PlayerTrainingHistorySectionProps) {
  const { t } = useTranslation()
  const [showAddForm, setShowAddForm] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Queries
  const {
    data: historyData,
    isLoading: historyLoading,
    error: historyError,
  } = usePlayerTrainingHistoryQuery(playerId)
  const {
    data: compensationData,
    isLoading: compLoading,
  } = usePlayerTrainingCompensationQuery(playerId)

  // Mutations
  const createMutation = useCreateTrainingEntryMutation(playerId)
  const deleteMutation = useDeleteTrainingEntryMutation(playerId)
  const verifyMutation = useVerifyTrainingEntryMutation(playerId)

  // Form state
  const [academyName, setAcademyName] = useState("")
  const [country, setCountry] = useState("AO")
  const [category, setCategory] = useState<TrainingCategory>("youth")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [notes, setNotes] = useState("")

  const historyEntries: PlayerTrainingHistory[] = Array.isArray(historyData)
    ? historyData
    : (historyData as { results?: PlayerTrainingHistory[] } | undefined)?.results ?? []

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!academyName.trim() || !startDate) return

    const payload: PlayerTrainingHistoryCreate = {
      academy_name: academyName.trim(),
      country: country.trim().toUpperCase(),
      training_category: category,
      start_date: startDate,
      end_date: endDate ? endDate : undefined,
      notes: notes.trim() || undefined,
    }

    createMutation.mutate(payload, {
      onSuccess: () => {
        setAcademyName("")
        setStartDate("")
        setEndDate("")
        setNotes("")
        setShowAddForm(false)
      },
    })
  }

  const handleDelete = (id: string) => {
    setDeletingId(id)
    deleteMutation.mutate(id, {
      onSettled: () => setDeletingId(null),
    })
  }

  if (historyLoading) {
    return (
      <Card variant="flat">
        <CardHeader>
          <CardTitle>Histórico de Formação & Passaporte EPP</CardTitle>
        </CardHeader>
        <CardContent className="py-xl text-center text-sm text-on-surface-variant">
          Carregando dados de formação...
        </CardContent>
      </Card>
    )
  }

  if (historyError) {
    return (
      <Card variant="flat" className="border-error/30">
        <CardHeader>
          <CardTitle className="text-error">Erro ao carregar formação</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-on-surface-variant">
            Não foi possível carregar os registos de formação deste jogador.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-lg">
      {/* FIFA EPP Solidarity & Training Compensation Card */}
      <Card variant="flat" className="border-primary/20 bg-primary-container/5">
        <CardHeader>
          <div className="flex flex-col gap-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-xs">
              <CardTitle className="flex items-center gap-sm text-base sm:text-lg">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Passaporte Eletrónico de Jogador (FIFA EPP)
              </CardTitle>
              <CardDescription>
                Cálculo regulamentar de compensação por treino e mecanismo de solidariedade (FIFA RSTP).
              </CardDescription>
            </div>
            {compensationData && (
              <div className="flex items-center gap-sm rounded-xl bg-surface-container px-md py-sm border border-outline-variant/30">
                <GraduationCap className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-xs text-on-surface-variant">Total Formação</div>
                  <div className="text-sm font-bold text-on-surface">
                    {compensationData.total_years} {compensationData.total_years === 1 ? "ano" : "anos"}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-md">
          {compLoading ? (
            <p className="text-xs text-on-surface-variant">Calculando compensação regulamentar...</p>
          ) : compensationData && compensationData.clubs.length > 0 ? (
            <div className="space-y-sm">
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Clubes Formadores Beneficiários:
              </p>
              <div className="grid gap-sm sm:grid-cols-2 lg:grid-cols-3">
                {compensationData.clubs.map((c, idx) => (
                  <div
                    key={`${c.club_name}-${idx}`}
                    className="flex items-start justify-between rounded-xl border border-outline-variant/30 bg-surface p-md"
                  >
                    <div className="space-y-xs">
                      <div className="flex items-center gap-xs">
                        <Building2 className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-sm text-on-surface">{c.club_name}</span>
                      </div>
                      <div className="text-xs text-on-surface-variant">
                        {CATEGORY_LABELS[c.category] || c.category} • {c.country}
                      </div>
                      <div className="text-xs text-on-surface-variant">
                        {c.start_date ? new Date(c.start_date).getFullYear() : "?"} —{" "}
                        {c.end_date ? new Date(c.end_date).getFullYear() : "Presente"}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="primary" className="text-xs">
                        {c.years} {c.years === 1 ? "ano" : "anos"}
                      </Badge>
                      {c.verified && (
                        <div className="mt-xs text-[10px] text-primary flex items-center justify-end gap-0.5">
                          <CheckCircle2 className="h-3 w-3" /> Verificado
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-sm text-xs text-on-surface-variant">
              <Info className="h-4 w-4 text-primary shrink-0" />
              <span>
                Nenhum clube beneficiário de compensação de treino calculado até o momento.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* History Records List */}
      <Card variant="flat">
        <CardHeader>
          <div className="flex flex-col gap-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-sm">
                <GraduationCap className="h-5 w-5 text-primary" />
                Histórico de Períodos de Treino
              </CardTitle>
              <CardDescription>
                Registo de todos os clubes e academias em que o jogador cumpriu etapas de desenvolvimento.
              </CardDescription>
            </div>
            {!readOnly && (
              <Button
                variant={showAddForm ? "outline" : "primary"}
                size="sm"
                onClick={() => setShowAddForm((prev) => !prev)}
                className="gap-xs"
              >
                {showAddForm ? (
                  <>
                    <X className="h-4 w-4" /> Fechar
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" /> Adicionar Período
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-md">
          {/* Add form inline */}
          {showAddForm && !readOnly && (
            <form
              onSubmit={handleCreate}
              className="space-y-md rounded-2xl border border-primary/30 bg-surface-container p-md md:p-lg"
            >
              <h4 className="font-semibold text-sm text-on-surface">Novo Período de Formação</h4>
              <div className="grid gap-md sm:grid-cols-2">
                <FormField label="Clube ou Academia" required>
                  <Input
                    placeholder="Ex: Escola de Futebol Bola Criativa"
                    value={academyName}
                    onChange={(e) => setAcademyName(e.target.value)}
                    required
                  />
                </FormField>

                <FormField label="País (Código ISO)" required>
                  <Input
                    placeholder="Ex: AO, PT, BR"
                    value={country}
                    onChange={(e) => setCountry(e.target.value.toUpperCase())}
                    maxLength={3}
                    required
                  />
                </FormField>

                <FormField label="Categoria de Formação">
                  <NativeSelect
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TrainingCategory)}
                  >
                    <option value="youth">Formação / Juniores</option>
                    <option value="academy">Academia Certificada</option>
                    <option value="amateur">Amador</option>
                    <option value="professional">Profissional</option>
                  </NativeSelect>
                </FormField>

                <div className="grid grid-cols-2 gap-sm">
                  <FormField label="Data Início" required>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </FormField>
                  <FormField label="Data Fim">
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </FormField>
                </div>
              </div>

              <FormField label="Notas / Observações adicionais">
                <Textarea
                  placeholder="Detalhes adicionais sobre o escalão ou registo federativo..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </FormField>

              <div className="flex justify-end gap-sm">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={createMutation.isPending}
                  disabled={!academyName.trim() || !startDate}
                >
                  Guardar Período
                </Button>
              </div>
            </form>
          )}

          {/* List */}
          {historyEntries.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="Sem histórico de formação registado"
              description="Registe os clubes e academias formadoras para habilitar os cálculos do passaporte eletrónico FIFA (EPP)."
            />
          ) : (
            <div className="space-y-sm">
              {historyEntries.map((entry) => {
                const name = entry.academy_name || entry.club_name || "Clube não especificado"
                return (
                  <div
                    key={entry.id}
                    className="flex flex-col gap-sm rounded-xl border border-outline-variant/30 bg-surface p-md md:flex-row md:items-center md:justify-between"
                  >
                    <div className="space-y-xs flex-1">
                      <div className="flex flex-wrap items-center gap-sm">
                        <span className="font-semibold text-sm text-on-surface">{name}</span>
                        <Badge variant="outline" className="text-xs">
                          {CATEGORY_LABELS[entry.training_category] || entry.training_category_label || entry.training_category}
                        </Badge>
                        {entry.verified ? (
                          <Badge variant="success" className="gap-1 text-xs">
                            <CheckCircle2 className="h-3 w-3" /> Verificado
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1 text-xs">
                            <Clock className="h-3 w-3" /> Pendente de validação
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-md text-xs text-on-surface-variant">
                        <span className="flex items-center gap-xs">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(entry.start_date).toLocaleDateString("pt-AO")} —{" "}
                          {entry.end_date ? new Date(entry.end_date).toLocaleDateString("pt-AO") : "Presente"}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-xs">
                          <Globe className="h-3.5 w-3.5" /> {entry.country}
                        </span>
                        <span>•</span>
                        <span>
                          Duração: <strong>{entry.duration_years} {entry.duration_years === 1 ? "ano" : "anos"}</strong>
                        </span>
                      </div>

                      {entry.notes && (
                        <p className="text-xs text-on-surface-variant mt-xs italic bg-surface-container/50 p-xs rounded">
                          {entry.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-xs shrink-0 self-end md:self-center">
                      {canVerify && !entry.verified && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => verifyMutation.mutate(entry.id)}
                          loading={verifyMutation.isPending && verifyMutation.variables === entry.id}
                        >
                          Validar
                        </Button>
                      )}
                      {!readOnly && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-error hover:bg-error/10 hover:text-error"
                          onClick={() => handleDelete(entry.id)}
                          loading={deleteMutation.isPending && deletingId === entry.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
