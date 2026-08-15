import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Search, X } from 'lucide-react'
import { useAgentSearch, type Agent, type PlayerAgentRelationship } from '../../hooks/usePlayerAgents'

interface PlayerAgentFormProps {
  playerId: string
  initialData?: Partial<PlayerAgentRelationship>
  onSubmit: (data: {
    agent: string
    start_date: string
    end_date?: string
    commission_rate?: number
    notes?: string
  }) => Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
}

export function PlayerAgentForm({
  playerId,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: PlayerAgentFormProps) {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(
    initialData?.agent || null
  )
  const { data: searchResults, isLoading: isSearching } = useAgentSearch(searchQuery)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      agent: initialData?.agent?.id || '',
      start_date: initialData?.start_date || '',
      end_date: initialData?.end_date || '',
      commission_rate: initialData?.commission_rate || undefined,
      notes: initialData?.notes || '',
    },
  })

  const commission = watch('commission_rate')

  const handleSelectAgent = (agent: Agent) => {
    setSelectedAgent(agent)
    setValue('agent', agent.id)
    setSearchQuery('')
  }

  const handleClearAgent = () => {
    setSelectedAgent(null)
    setValue('agent', '')
  }

  const agents = searchResults?.results || []

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-lg">
      {/* Agent Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Selecionar Agente</CardTitle>
          <CardDescription>Procure ou selecione um agente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-md">
          {selectedAgent ? (
            <div className="rounded-lg border border-primary/30 bg-primary-container/10 p-md">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-on-surface">{selectedAgent.name}</h4>
                  {selectedAgent.agency_name && (
                    <p className="text-sm text-on-surface-variant">{selectedAgent.agency_name}</p>
                  )}
                  <div className="mt-md space-y-xs text-xs text-on-surface-variant">
                    <p>📧 {selectedAgent.email}</p>
                    <p>📱 {selectedAgent.phone}</p>
                    {selectedAgent.fifa_agent_id && (
                      <p>🎖️ FIFA: {selectedAgent.fifa_agent_id}</p>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAgent}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                <Input
                  placeholder="Procurar agente por nome, email ou ID FIFA..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {isSearching && (
                <div className="flex items-center justify-center py-md">
                  <p className="text-sm text-on-surface-variant">Procurando...</p>
                </div>
              )}

              {agents.length > 0 && (
                <div className="space-y-sm max-h-64 overflow-y-auto">
                  {agents.map((agent) => (
                    <button
                      key={agent.id}
                      type="button"
                      onClick={() => handleSelectAgent(agent)}
                      className="w-full rounded-lg border border-outline/50 p-md text-left hover:border-primary hover:bg-primary-container/10 transition-all"
                    >
                      <div className="font-semibold text-on-surface">{agent.name}</div>
                      {agent.agency_name && (
                        <p className="text-xs text-on-surface-variant">{agent.agency_name}</p>
                      )}
                      <p className="text-xs text-on-surface-variant">{agent.email}</p>
                      {agent.fifa_agent_id && (
                        <p className="mt-1 text-xs font-medium text-primary">FIFA: {agent.fifa_agent_id}</p>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {searchQuery && agents.length === 0 && !isSearching && (
                <div className="rounded-lg bg-surface-container/50 p-md text-center">
                  <p className="text-sm text-on-surface-variant">
                    Nenhum agente encontrado para "{searchQuery}"
                  </p>
                </div>
              )}
            </div>
          )}

          {errors.agent && <p className="text-xs text-error">Agente é obrigatório</p>}
        </CardContent>
      </Card>

      {/* Relationship Details */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Representação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-md">
          {/* Dates */}
          <div className="grid gap-md sm:grid-cols-2">
            <div>
              <Label htmlFor="start_date">Data de Início*</Label>
              <Input
                id="start_date"
                type="date"
                {...register('start_date', { required: 'Data de início é obrigatória' })}
                className={errors.start_date ? 'border-error' : ''}
              />
              {errors.start_date && (
                <p className="mt-1 text-xs text-error">{errors.start_date.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="end_date">Data de Término</Label>
              <Input
                id="end_date"
                type="date"
                {...register('end_date')}
              />
            </div>
          </div>

          {/* Commission */}
          <div>
            <Label htmlFor="commission_rate">Taxa de Comissão (%)</Label>
            <div className="relative">
              <Input
                id="commission_rate"
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0"
                max="100"
                {...register('commission_rate', {
                  valueAsNumber: true,
                  min: { value: 0, message: 'Comissão não pode ser negativa' },
                  max: { value: 100, message: 'Comissão não pode exceder 100%' },
                })}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">%</span>
            </div>
            {commission && (
              <p className="mt-1 text-xs text-on-surface-variant">
                Exemplo: Em um contrato de €500.000, a comissão seria €{(500000 * commission / 100).toLocaleString()}
              </p>
            )}
            {errors.commission_rate && (
              <p className="mt-1 text-xs text-error">{errors.commission_rate.message}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              placeholder="Informações adicionais sobre esta representação..."
              {...register('notes')}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-md justify-end">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || !selectedAgent}>
          {isSubmitting ? 'Guardando...' : 'Guardar Representação'}
        </Button>
      </div>
    </form>
  )
}
