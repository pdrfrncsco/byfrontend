// Players module — Compliance hooks (migrated to apiClient)

import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'
import type {
  PlayerComplianceRecord,
  PlayerComplianceSummary,
  CompliancePriority,
  ComplianceStatus,
} from '../types'
import { playerKeys } from './usePlayerQueries'

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const complianceKeys = {
  all: playerKeys.all,
  records: playerKeys.compliance,
  summary: playerKeys.complianceSummary,
  overdue: playerKeys.overdueCompliance,
}

// ─── Query Hooks ──────────────────────────────────────────────────────────────

export function usePlayerComplianceRecords(playerId: string, enabled = true) {
  return useQuery({
    queryKey: complianceKeys.records(playerId),
    queryFn: async () => {
      const res = await apiClient.get<PlayerComplianceRecord[]>(
        `/players/${playerId}/compliance/`
      )
      const data = res.data
      return Array.isArray(data) ? data : (data as any)?.results ?? []
    },
    enabled: enabled && !!playerId,
    staleTime: 1000 * 60 * 5,
  })
}

export function usePlayerComplianceSummary(playerId: string, enabled = true) {
  return useQuery({
    queryKey: complianceKeys.summary(playerId),
    queryFn: async () => {
      const res = await apiClient.get<PlayerComplianceSummary>(
        `/players/${playerId}/compliance/status/`
      )
      return res.data
    },
    enabled: enabled && !!playerId,
    staleTime: 1000 * 60 * 10,
  })
}

export function usePlayerOverdueCompliance(playerId: string, enabled = true) {
  return useQuery({
    queryKey: complianceKeys.overdue(playerId),
    queryFn: async () => {
      const res = await apiClient.get<PlayerComplianceRecord[]>(
        `/players/${playerId}/compliance/overdue/`
      )
      const data = res.data
      return Array.isArray(data) ? data : (data as any)?.results ?? []
    },
    enabled: enabled && !!playerId,
    staleTime: 1000 * 60 * 5,
  })
}

// ─── Utility Functions ────────────────────────────────────────────────────────

export function getRuleTypeLabel(ruleType: string): string {
  const map: Record<string, string> = {
    minor_transfer:          'Transferência de Menores',
    international_transfer:  'Transferência Internacional',
    first_registration:      'Primeiro Registo',
    work_permit:             'Autorização de Trabalho',
    visa:                    'Visto',
    passport_validity:       'Validade do Passaporte',
    training_compensation:   'Compensação de Formação (EPP)',
    solidarity_contribution: 'Contribuição de Solidariedade',
    contract_length:         'Duração do Contrato',
    contract_stability:      'Estabilidade Contratual',
    registration_window:     'Janela de Transferências',
    other:                   'Outro',
  }
  return map[ruleType] ?? ruleType
}

export function getPriorityInfo(priority: CompliancePriority | string): {
  label: string; color: string; bgColor: string; icon: string
} {
  const map: Record<string, ReturnType<typeof getPriorityInfo>> = {
    low:      { label: 'Baixa',    color: 'text-blue-700',   bgColor: 'bg-blue-100',   icon: '📋' },
    medium:   { label: 'Média',    color: 'text-yellow-700', bgColor: 'bg-yellow-100', icon: '⚠️' },
    high:     { label: 'Alta',     color: 'text-orange-700', bgColor: 'bg-orange-100', icon: '🔶' },
    critical: { label: 'Crítica',  color: 'text-red-700',    bgColor: 'bg-red-100',    icon: '🚨' },
  }
  return map[priority] ?? map['low']
}

export function getComplianceStatusInfo(status: ComplianceStatus | string): {
  label: string; color: string; bgColor: string; icon: string
} {
  const map: Record<string, ReturnType<typeof getComplianceStatusInfo>> = {
    compliant:          { label: 'Conforme',              color: 'text-green-700',  bgColor: 'bg-green-100',  icon: '✅' },
    non_compliant:      { label: 'Não Conforme',          color: 'text-red-700',    bgColor: 'bg-red-100',    icon: '❌' },
    pending_review:     { label: 'Pendente de Revisão',   color: 'text-blue-700',   bgColor: 'bg-blue-100',   icon: '⏳' },
    exemption_granted:  { label: 'Isenção Concedida',     color: 'text-purple-700', bgColor: 'bg-purple-100', icon: '📄' },
    requires_approval:  { label: 'Requer Aprovação',      color: 'text-yellow-700', bgColor: 'bg-yellow-100', icon: '👤' },
  }
  return map[status] ?? map['pending_review']
}

export function requiresAction(record: PlayerComplianceRecord): boolean {
  return (
    record.status === 'non_compliant' ||
    record.status === 'pending_review' ||
    record.status === 'requires_approval' ||
    isRecordOverdue(record)
  )
}

export function isRecordOverdue(record: PlayerComplianceRecord): boolean {
  if (!record.deadline) return false
  return new Date(record.deadline) < new Date() && record.status !== 'compliant'
}

export function getDaysUntilDeadline(deadline: string | undefined | null): number | null {
  if (!deadline) return null
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

export function getCompliancePercentage(compliant: number, total: number): number {
  if (total === 0) return 100
  return Math.round((compliant / total) * 100)
}

export function getComplianceHealthStatus(percentage: number): {
  label: string; color: string; icon: string
} {
  if (percentage === 100) return { label: 'Totalmente Conforme',    color: 'text-green-700',  icon: '🟢' }
  if (percentage >= 80)   return { label: 'Maioria Conforme',       color: 'text-yellow-700', icon: '🟡' }
  if (percentage >= 50)   return { label: 'Parcialmente Conforme',  color: 'text-orange-700', icon: '🟠' }
  return                         { label: 'Não Conforme',           color: 'text-red-700',    icon: '🔴' }
}
