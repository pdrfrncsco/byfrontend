import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, CheckCircle2, Clock, AlertTriangle, Loader2 } from 'lucide-react'
import {
  usePlayerComplianceRecords,
  usePlayerComplianceSummary,
  getRuleTypeLabel,
  getPriorityInfo,
  getComplianceStatusInfo,
  requiresAction,
  isRecordOverdue,
  getDaysUntilDeadline,
  getCompliancePercentage,
  getComplianceHealthStatus,
  type ComplianceRecord,
} from '../../hooks/usePlayerCompliance'

interface PlayerComplianceSectionProps {
  playerId: string
  readOnly?: boolean
}

export function PlayerComplianceSection({
  playerId,
  readOnly = false,
}: PlayerComplianceSectionProps) {
  const { t } = useTranslation()

  const {
    data: recordsData,
    isLoading: recordsLoading,
    error: recordsError,
  } = usePlayerComplianceRecords(playerId)

  const {
    data: summaryData,
    isLoading: summaryLoading,
    error: summaryError,
  } = usePlayerComplianceSummary(playerId)

  const records = useMemo(
    () => ((recordsData?.results || []) as ComplianceRecord[]) || [],
    [recordsData]
  )

  const summary = useMemo(() => summaryData as any, [summaryData])

  const actionRequired = useMemo(
    () => records.filter((r) => requiresAction(r)),
    [records]
  )

  const overdueRecords = useMemo(
    () => records.filter((r) => isRecordOverdue(r)),
    [records]
  )

  const criticalRecords = useMemo(
    () => records.filter((r) => r.priority === 'critical'),
    [records]
  )

  const compliantPercentage = useMemo(() => {
    if (!summary) return 0
    return getCompliancePercentage(summary.compliant || 0, summary.total || 1)
  }, [summary])

  const healthStatus = getComplianceHealthStatus(compliantPercentage)

  if (recordsLoading || summaryLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-lg">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (recordsError || summaryError) {
    return (
      <Card className="border-error/20">
        <CardHeader>
          <CardTitle className="text-error">Erro ao Carregar Conformidade</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-on-surface-variant">
            Não foi possível carregar os dados de conformidade.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-lg">
      {/* Compliance Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Status de Conformidade</CardTitle>
              <CardDescription>Visão geral da conformidade regulatória</CardDescription>
            </div>
            <span className={`text-3xl ${healthStatus.icon}`}></span>
          </div>
        </CardHeader>

        <CardContent className="space-y-md">
          {/* Health Status */}
          <div className="p-md bg-surface/50 rounded-lg">
            <p className={`font-semibold ${healthStatus.color}`}>{healthStatus.label}</p>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-sm">
              <p className="text-sm text-on-surface-variant">Conformidade</p>
              <p className="text-sm font-semibold text-on-surface">
                {compliantPercentage}%
              </p>
            </div>
            <Progress value={compliantPercentage} className="h-2" />
          </div>

          {/* Stats Grid */}
          {summary && (
            <div className="grid gap-md sm:grid-cols-2 md:grid-cols-4 pt-md border-t border-outline">
              <div className="text-center">
                <p className="text-xs text-on-surface-variant">Total</p>
                <p className="text-lg font-semibold text-on-surface">{summary.total}</p>
              </div>

              <div className="text-center">
                <p className="text-xs text-on-surface-variant">Conforme</p>
                <p className="text-lg font-semibold text-primary">{summary.compliant}</p>
              </div>

              <div className="text-center">
                <p className="text-xs text-on-surface-variant">Não Conforme</p>
                <p className="text-lg font-semibold text-error">{summary.non_compliant}</p>
              </div>

              <div className="text-center">
                <p className="text-xs text-on-surface-variant">Atrasados</p>
                <p className="text-lg font-semibold text-secondary">{summary.overdue}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Critical Issues Alert */}
      {criticalRecords.length > 0 && (
        <div className="rounded-lg border border-error/40 bg-error-container/10 p-md">
          <div className="flex gap-md">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-error" />
            <div className="text-sm text-on-error-container">
              <p className="font-medium">🚨 Problemas Críticos</p>
              <p className="mt-sm">
                Há {criticalRecords.length} problema{criticalRecords.length !== 1 ? 's' : ''} crítico{criticalRecords.length !== 1 ? 's' : ''} que requerem atenção imediata.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Required */}
      {actionRequired.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-md">
              <AlertTriangle className="h-5 w-5 text-orange-700" />
              Ações Necessárias ({actionRequired.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-md">
            {actionRequired.map((record) => (
              <ComplianceRecordCard key={record.id} record={record} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* All Records */}
      {records.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Todos os Registos ({records.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-md">
            {records.map((record) => (
              <ComplianceRecordCard key={record.id} record={record} />
            ))}
          </CardContent>
        </Card>
      )}

      {records.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-lg gap-md">
            <CheckCircle2 className="h-8 w-8 text-green-700" />
            <p className="text-sm text-on-surface-variant">
              Sem registos de conformidade encontrados
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ComplianceRecordCard({ record }: { record: ComplianceRecord }) {
  const priorityInfo = getPriorityInfo(record.priority)
  const statusInfo = getComplianceStatusInfo(record.status)
  const daysUntil = record.deadline ? getDaysUntilDeadline(record.deadline) : null
  const isOverdue = isRecordOverdue(record)

  return (
    <div className="rounded-lg border border-outline p-md space-y-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-md">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-md flex-wrap">
            <h4 className="font-semibold text-on-surface">
              {getRuleTypeLabel(record.rule_type)}
            </h4>
            <Badge className={`${priorityInfo.bgColor} ${priorityInfo.color} border` }>
              {priorityInfo.label}
            </Badge>
            <Badge className={`${statusInfo.bgColor} ${statusInfo.color} border`}>
              {statusInfo.label}
            </Badge>
          </div>

          <p className="text-sm text-on-surface-variant mt-md">
            {record.description}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-sm text-sm">
        {record.rule_reference && (
          <div>
            <p className="text-xs text-on-surface-variant">Referência</p>
            <p className="text-on-surface">{record.rule_reference}</p>
          </div>
        )}

        {record.deadline && (
          <div className="flex items-center gap-md">
            <Calendar className="h-4 w-4 text-on-surface-variant" />
            <div>
              <p className="text-xs text-on-surface-variant">Prazo</p>
              <p className={`text-on-surface ${isOverdue ? 'text-error font-semibold' : ''}`}>
                {new Date(record.deadline).toLocaleDateString('pt-PT')}
              </p>
              {daysUntil !== null && (
                <p className={`text-xs ${daysUntil < 0 ? 'text-error' : 'text-on-surface-variant'}`}>
                  {daysUntil < 0 ? `${Math.abs(daysUntil)} dias atrasado` : `${daysUntil} dias até prazo`}
                </p>
              )}
            </div>
          </div>
        )}

        {record.notes && (
          <div className="p-sm bg-surface/50 rounded">
            <p className="text-xs text-on-surface-variant">Observações</p>
            <p className="text-xs text-on-surface">{record.notes}</p>
          </div>
        )}

        {record.resolution_notes && (
          <div className="rounded bg-primary-container/15 p-sm">
            <p className="text-xs font-medium text-primary">✓ Resolvido</p>
            <p className="text-xs text-on-surface">{record.resolution_notes}</p>
          </div>
        )}

        {record.exemption_reason && (
          <div className="rounded bg-secondary-container/15 p-sm">
            <p className="text-xs font-medium text-secondary">📄 Isenção Concedida</p>
            <p className="text-xs text-on-surface">{record.exemption_reason}</p>
          </div>
        )}
      </div>
    </div>
  )
}

import { Calendar } from 'lucide-react'
