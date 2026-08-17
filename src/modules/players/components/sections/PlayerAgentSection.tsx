import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertCircle, Globe, Mail, Phone, Plus, Trash2, User } from 'lucide-react'
import {
  usePlayerAgents,
  getActiveAgentRelationship,
  getAgentRelationshipStatusInfo,
  getAgencyTypeLabel,
  isRelationshipActive,
  getRelationshipDuration,
  type PlayerAgentRelationship,
} from '../../hooks/usePlayerAgents'

interface PlayerAgentSectionProps {
  playerId: string
  onAddAgent?: () => void
  onSelectAgent?: (agent: PlayerAgentRelationship) => void
  onDeleteAgent?: (relationshipId: string) => Promise<void>
  readOnly?: boolean
}

export function PlayerAgentSection({
  playerId,
  onAddAgent,
  onSelectAgent,
  onDeleteAgent,
  readOnly = false,
}: PlayerAgentSectionProps) {
  const { t } = useTranslation()
  const { data, isLoading, error } = usePlayerAgents(playerId)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const relationships = useMemo(() => Array.isArray(data) ? data : (data as { results?: PlayerAgentRelationship[] } | undefined)?.results ?? [], [data])
  const activeAgent = useMemo(() => getActiveAgentRelationship(relationships), [relationships])

  const handleDelete = async (relationshipId: string) => {
    if (!onDeleteAgent) return

    setDeletingId(relationshipId)
    try {
      await onDeleteAgent(relationshipId)
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Agentes</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-lg">
          <div className="text-sm text-on-surface-variant">Carregando agentes...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-error/20">
        <CardHeader>
          <CardTitle className="text-error">Erro ao Carregar Agentes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-on-surface-variant">
            Não foi possível carregar os agentes. Tente novamente mais tarde.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-lg">
      {/* Active Agent Highlight */}
      {activeAgent && (
        <Card className="border-primary/30 bg-primary-container/10">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-md">
                  Agente Ativo
                </CardTitle>
                <CardDescription>
                  {typeof activeAgent.agent === 'string' ? activeAgent.agent_name : activeAgent.agent.name} • {typeof activeAgent.agent === 'string' ? 'Agente' : getAgencyTypeLabel(activeAgent.agent.agency_type)}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-md">
            {/* Agent Info */}
            <div className="grid gap-md sm:grid-cols-2">
              <div>
                <p className="text-xs text-on-surface-variant">Período</p>
                <p className="text-sm font-semibold text-on-surface">
                  {new Date(activeAgent.start_date).toLocaleDateString('pt-PT')}
                  {activeAgent.end_date && ` → ${new Date(activeAgent.end_date).toLocaleDateString('pt-PT')}`}
                </p>
                <p className="text-xs text-on-surface-variant">
                  {getRelationshipDuration(activeAgent.start_date, activeAgent.end_date)}
                </p>
              </div>

              {activeAgent.commission_rate && (
                <div>
                  <p className="text-xs text-on-surface-variant">Taxa de Comissão</p>
                  <p className="text-sm font-semibold text-on-surface">
                    {activeAgent.commission_rate}%
                  </p>
                </div>
              )}
            </div>

            {/* Agent Contact */}
            <div className="space-y-sm border-t border-outline pt-md">
              <p className="text-xs font-medium text-on-surface-variant">Contacto</p>
              <div className="space-y-xs">
                {typeof activeAgent.agent !== 'string' && activeAgent.agent.email && (
                  <div className="flex items-center gap-sm text-sm text-on-surface">
                    <Mail className="h-4 w-4 text-on-surface-variant" />
                    <a href={`mailto:${activeAgent.agent.email}`} className="hover:text-primary">
                      {activeAgent.agent.email}
                    </a>
                  </div>
                )}

                {typeof activeAgent.agent !== 'string' && activeAgent.agent.phone && (
                  <div className="flex items-center gap-sm text-sm text-on-surface">
                    <Phone className="h-4 w-4 text-on-surface-variant" />
                    <a href={`tel:${activeAgent.agent.phone}`} className="hover:text-primary">
                      {activeAgent.agent.phone}
                    </a>
                  </div>
                )}

                {typeof activeAgent.agent !== 'string' && activeAgent.agent.website && (
                  <div className="flex items-center gap-sm text-sm text-on-surface">
                    <Globe className="h-4 w-4 text-on-surface-variant" />
                    <a
                      href={activeAgent.agent.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary"
                    >
                      {activeAgent.agent.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Agent Credentials */}
            {typeof activeAgent.agent !== 'string' && (activeAgent.agent.fifa_agent_id || activeAgent.agent.verified) && (
              <div className="space-y-sm border-t border-outline pt-md">
                <p className="text-xs font-medium text-on-surface-variant">Credenciais</p>
                <div className="flex flex-wrap gap-sm">
                  {activeAgent.agent.fifa_agent_id && (
                    <Badge variant="outline">FIFA: {activeAgent.agent.fifa_agent_id}</Badge>
                  )}
                  {activeAgent.agent.verified && (
                    <Badge className="bg-green-100 text-green-800">✓ Verificado</Badge>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            {!readOnly && (
              <div className="flex gap-sm pt-md">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSelectAgent?.(activeAgent)}
                  className="flex-1"
                >
                  Editar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* All Relationships List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Histórico de Agentes</CardTitle>
              <CardDescription>
                {relationships.length} relacionamento{relationships.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            {!readOnly && (
              <Button onClick={onAddAgent} size="sm">
                <Plus className="h-4 w-4" />
                Adicionar Agente
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {relationships.length === 0 ? (
            <div className="rounded-lg border border-dashed border-outline p-lg text-center">
              <User className="mx-auto h-8 w-8 text-on-surface-variant/50" />
              <p className="mt-md text-sm text-on-surface-variant">Sem agentes registados</p>
            </div>
          ) : (
            <div className="space-y-md">
              {relationships.map((relationship: PlayerAgentRelationship) => {
                const statusInfo = getAgentRelationshipStatusInfo(relationship.status)
                const isActive = isRelationshipActive(relationship)

                const relationshipAgent = typeof relationship.agent === 'string' ? null : relationship.agent
                return (
                  <div
                    key={relationship.id}
                    className="rounded-lg border border-outline/50 p-md hover:border-outline transition-colors"
                  >
                    <div className="flex items-start justify-between gap-md">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-sm flex-wrap">
                          <h4 className="font-semibold text-on-surface">{relationshipAgent?.name ?? relationship.agent_name}</h4>
                          {relationshipAgent && (
                            <Badge variant="outline" className="text-xs">
                              {getAgencyTypeLabel(relationshipAgent.agency_type)}
                            </Badge>
                          )}
                          <Badge className={`text-xs ${statusInfo.bgColor} ${statusInfo.color}`}>
                            {statusInfo.label}
                          </Badge>
                        </div>

                        <div className="mt-md space-y-xs text-xs text-on-surface-variant">
                          {relationshipAgent?.agency_name && (
                            <p>{relationshipAgent.agency_name}</p>
                          )}
                          {relationshipAgent?.country && (
                            <p>{relationshipAgent.country}</p>
                          )}
                        </div>

                        <div className="mt-md grid gap-sm text-xs sm:grid-cols-3">
                          <div>
                            <p className="text-on-surface-variant">Período</p>
                            <p className="font-medium text-on-surface">
                              {new Date(relationship.start_date).toLocaleDateString('pt-PT')}
                              {relationship.end_date && ` → ${new Date(relationship.end_date).toLocaleDateString('pt-PT')}`}
                            </p>
                          </div>

                          {relationship.commission_rate && (
                            <div>
                              <p className="text-on-surface-variant">Comissão</p>
                              <p className="font-medium text-on-surface">
                                {relationship.commission_rate}%
                              </p>
                            </div>
                          )}

                          <div>
                            <p className="text-on-surface-variant">Duração</p>
                            <p className="font-medium text-on-surface">
                              {getRelationshipDuration(relationship.start_date, relationship.end_date)}
                            </p>
                          </div>
                        </div>

                        {relationship.notes && (
                          <div className="mt-md rounded bg-surface/50 p-sm">
                            <p className="text-xs text-on-surface-variant">{relationship.notes}</p>
                          </div>
                        )}
                      </div>

                      {!readOnly && (
                        <div className="flex flex-col gap-sm">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onSelectAgent?.(relationship)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(relationship.id)}
                            disabled={deletingId === relationship.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
