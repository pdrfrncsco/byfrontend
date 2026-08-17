import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertCircle, Calendar, DollarSign, FileText, Plus, Shield } from 'lucide-react'
import {
  usePlayerContracts,
  getActiveContract,
  formatCurrency,
  getContractStatusInfo,
  getContractTypeLabel,
  getContractDuration,
  isContractExpiringSoon,
  isContractFullySigned,
  type PlayerContract,
} from '../../hooks/usePlayerContracts'

interface PlayerContractSectionProps {
  playerId: string
  onAddContract?: () => void
  onContractSelect?: (contract: PlayerContract) => void
  readOnly?: boolean
}

export function PlayerContractSection({
  playerId,
  onAddContract,
  onContractSelect,
  readOnly = false,
}: PlayerContractSectionProps) {
  const { t } = useTranslation()
  const { data, isLoading, error } = usePlayerContracts(playerId)

  const contracts = useMemo(() => (Array.isArray(data) ? data : (data as { results?: PlayerContract[] } | undefined)?.results ?? []), [data])
  const activeContract = useMemo(() => getActiveContract(contracts), [contracts])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contratos</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-lg">
          <div className="text-sm text-on-surface-variant">Carregando contratos...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-error/20">
        <CardHeader>
          <CardTitle className="text-error">Erro ao Carregar Contratos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-on-surface-variant">
            Não foi possível carregar os contratos. Tente novamente mais tarde.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-lg">
      {/* Active Contract Highlight */}
      {activeContract && (
        <Card className="border-primary/30 bg-primary-container/10">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-md">
                  Contrato Atual
                  {!isContractFullySigned(activeContract) && (
                    <Badge variant="outline" className="text-warning">
                      Pendente de Assinatura
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {typeof activeContract.club === 'string' ? activeContract.club_name : activeContract.club.name} • {getContractTypeLabel(activeContract.contract_type)}
                </CardDescription>
              </div>
              {isContractExpiringSoon(activeContract.end_date) && (
                <div className="flex items-center gap-sm rounded-lg bg-warning/10 px-md py-sm">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  <span className="text-xs font-medium text-warning">Expira em breve</span>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-md">
            {/* Contract Timeline */}
            <div className="grid gap-md sm:grid-cols-2">
              <div>
                <p className="text-xs text-on-surface-variant">Período</p>
                <p className="text-sm font-semibold text-on-surface">
                  {new Date(activeContract.start_date).toLocaleDateString('pt-PT')} →{' '}
                  {new Date(activeContract.end_date).toLocaleDateString('pt-PT')}
                </p>
                <p className="text-xs text-on-surface-variant">
                  {getContractDuration(activeContract.start_date, activeContract.end_date)} dias
                </p>
              </div>

              {activeContract.salary && (
                <div>
                  <p className="text-xs text-on-surface-variant">Salário</p>
                  <p className="text-sm font-semibold text-on-surface">
                    {formatCurrency(activeContract.salary, activeContract.currency)}
                  </p>
                  <p className="text-xs text-on-surface-variant">por ano</p>
                </div>
              )}
            </div>

            {/* Key Clauses */}
            {(activeContract.release_clause || activeContract.has_image_rights || activeContract.option_year) && (
              <div className="space-y-sm border-t border-outline pt-md">
                <p className="text-xs font-medium text-on-surface-variant">Cláusulas</p>
                <div className="flex flex-wrap gap-sm">
                  {activeContract.release_clause && (
                    <div className="inline-flex items-center gap-sm rounded-lg border border-outline/50 px-md py-sm">
                      <DollarSign className="h-3.5 w-3.5 text-amber-600" />
                      <span className="text-xs">
                        Rescisão: {formatCurrency(activeContract.release_clause, activeContract.currency)}
                      </span>
                    </div>
                  )}

                  {activeContract.has_image_rights && (
                    <div className="inline-flex items-center gap-sm rounded-lg border border-outline/50 px-md py-sm">
                      <Shield className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-xs">Direitos de Imagem</span>
                    </div>
                  )}

                  {activeContract.option_year && (
                    <div className="inline-flex items-center gap-sm rounded-lg border border-outline/50 px-md py-sm">
                      <Calendar className="h-3.5 w-3.5 text-blue-600" />
                      <span className="text-xs">Opção de Renovação</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Signature Status */}
            <div className="space-y-sm border-t border-outline pt-md">
              <p className="text-xs font-medium text-on-surface-variant">Estado de Assinatura</p>
              <div className="flex gap-md">
                <div className="flex-1">
                  <p className="text-xs text-on-surface-variant">Jogador</p>
                  <div
                    className={`mt-1 rounded-lg px-md py-sm text-center text-xs font-semibold ${
                      activeContract.signed_by_player
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {activeContract.signed_by_player ? '✓ Assinado' : 'Pendente'}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-on-surface-variant">Clube</p>
                  <div
                    className={`mt-1 rounded-lg px-md py-sm text-center text-xs font-semibold ${
                      activeContract.signed_by_club
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {activeContract.signed_by_club ? '✓ Assinado' : 'Pendente'}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            {!readOnly && (
              <div className="flex gap-sm pt-md">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onContractSelect?.(activeContract)}
                  className="flex-1"
                >
                  Ver Detalhes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* All Contracts List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Histórico de Contratos</CardTitle>
              <CardDescription>{contracts.length} contrato{contracts.length !== 1 ? 's' : ''}</CardDescription>
            </div>
            {!readOnly && (
              <Button onClick={onAddContract} size="sm">
                <Plus className="h-4 w-4" />
                Novo Contrato
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {contracts.length === 0 ? (
            <div className="rounded-lg border border-dashed border-outline p-lg text-center">
              <FileText className="mx-auto h-8 w-8 text-on-surface-variant/50" />
              <p className="mt-md text-sm text-on-surface-variant">Sem contratos registados</p>
            </div>
          ) : (
            <div className="space-y-md">
              {contracts.map((contract) => {
                const statusInfo = getContractStatusInfo(contract.status)
                const isExpiringSoon = isContractExpiringSoon(contract.end_date)

                return (
                  <div
                    key={contract.id}
                    className="rounded-lg border border-outline/50 p-md hover:border-outline transition-colors"
                  >
                    <div className="flex items-start justify-between gap-md">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-sm flex-wrap">
                          <h4 className="font-semibold text-on-surface">{typeof contract.club === 'string' ? contract.club_name : contract.club.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {getContractTypeLabel(contract.contract_type)}
                          </Badge>
                          <Badge className={`text-xs ${statusInfo.bgColor} ${statusInfo.color}`}>
                            {statusInfo.label}
                          </Badge>
                          {isExpiringSoon && (
                            <Badge variant="destructive" className="text-xs">
                              Expira em breve
                            </Badge>
                          )}
                        </div>

                        <div className="mt-md grid gap-sm text-xs sm:grid-cols-3">
                          <div>
                            <p className="text-on-surface-variant">Período</p>
                            <p className="font-medium text-on-surface">
                              {new Date(contract.start_date).toLocaleDateString('pt-PT')} →{' '}
                              {new Date(contract.end_date).toLocaleDateString('pt-PT')}
                            </p>
                          </div>

                          {contract.salary && (
                            <div>
                              <p className="text-on-surface-variant">Salário</p>
                              <p className="font-medium text-on-surface">
                                {formatCurrency(contract.salary, contract.currency)}
                              </p>
                            </div>
                          )}

                          <div>
                            <p className="text-on-surface-variant">Assinaturas</p>
                            <p className="font-medium text-on-surface">
                              {contract.signed_by_player ? '✓' : '○'} {contract.signed_by_club ? '✓' : '○'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {!readOnly && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onContractSelect?.(contract)}
                        >
                          Abrir
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
