import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface ComplianceRecord {
  id: string
  player: string
  transfer?: string
  rule_type: string
  rule_reference?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'compliant' | 'non_compliant' | 'pending_review' | 'exemption_granted' | 'requires_approval'
  description: string
  notes?: string
  resolution_notes?: string
  exemption_reason?: string
  deadline?: string
  reviewed_at?: string
  reviewed_by?: string
  supporting_documents?: Array<{
    id: string
    url: string
    name: string
  }>
  created_at: string
  updated_at: string
}

export interface ComplianceSummary {
  total: number
  compliant: number
  non_compliant: number
  pending_review: number
  overdue: number
  critical_issues: number
}

/**
 * Fetch compliance records for a player
 */
export function usePlayerComplianceRecords(playerId: string, enabled = true) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

  return useQuery({
    queryKey: ['player-compliance-records', playerId],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/players/${playerId}/compliance/`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch compliance records: ${response.statusText}`)
      }

      return response.json()
    },
    enabled: enabled && !!playerId,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Fetch compliance summary/dashboard
 */
export function usePlayerComplianceSummary(playerId: string, enabled = true) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

  return useQuery({
    queryKey: ['player-compliance-summary', playerId],
    queryFn: async () => {
      const response = await fetch(
        `${apiUrl}/players/${playerId}/compliance/status/`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch compliance summary: ${response.statusText}`)
      }

      return response.json()
    },
    enabled: enabled && !!playerId,
    staleTime: 1000 * 60 * 10,
  })
}

/**
 * Fetch overdue compliance issues
 */
export function usePlayerOverdueCompliance(playerId: string, enabled = true) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

  return useQuery({
    queryKey: ['player-compliance-overdue', playerId],
    queryFn: async () => {
      const response = await fetch(
        `${apiUrl}/players/${playerId}/compliance/overdue/`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch overdue compliance: ${response.statusText}`)
      }

      return response.json()
    },
    enabled: enabled && !!playerId,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Get rule type label
 */
export function getRuleTypeLabel(ruleType: string): string {
  const ruleMap: Record<string, string> = {
    // Transfer rules
    minor_transfer: 'Transferência de Menores',
    international_transfer: 'Transferência Internacional',
    first_registration: 'Primeiro Registo',

    // Work permit
    work_permit: 'Autorização de Trabalho',
    visa: 'Visto',
    passport_validity: 'Validade do Passaporte',

    // Training
    training_compensation: 'Compensação de Formação (EPP)',
    solidarity_contribution: 'Contribuição de Solidariedade',

    // Contract
    contract_length: 'Duração do Contrato',
    contract_stability: 'Estabilidade Contratual',

    // Registration
    registration_window: 'Janela de Transferências',

    other: 'Outro',
  }

  return ruleMap[ruleType] || ruleType
}

/**
 * Get priority info
 */
export function getPriorityInfo(priority: string): {
  label: string
  color: string
  bgColor: string
  icon: string
} {
  const priorityMap: Record<string, any> = {
    low: {
      label: 'Baixa',
      color: 'text-blue-700',
      bgColor: 'bg-blue-100',
      icon: '📋',
    },
    medium: {
      label: 'Média',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100',
      icon: '⚠️',
    },
    high: {
      label: 'Alta',
      color: 'text-orange-700',
      bgColor: 'bg-orange-100',
      icon: '🔶',
    },
    critical: {
      label: 'Crítica',
      color: 'text-red-700',
      bgColor: 'bg-red-100',
      icon: '🚨',
    },
  }

  return priorityMap[priority] || priorityMap['low']
}

/**
 * Get compliance status info
 */
export function getComplianceStatusInfo(status: string): {
  label: string
  color: string
  bgColor: string
  icon: string
} {
  const statusMap: Record<string, any> = {
    compliant: {
      label: 'Conforme',
      color: 'text-green-700',
      bgColor: 'bg-green-100',
      icon: '✅',
    },
    non_compliant: {
      label: 'Não Conforme',
      color: 'text-red-700',
      bgColor: 'bg-red-100',
      icon: '❌',
    },
    pending_review: {
      label: 'Pendente de Revisão',
      color: 'text-blue-700',
      bgColor: 'bg-blue-100',
      icon: '⏳',
    },
    exemption_granted: {
      label: 'Isenção Concedida',
      color: 'text-purple-700',
      bgColor: 'bg-purple-100',
      icon: '📄',
    },
    requires_approval: {
      label: 'Requer Aprovação',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100',
      icon: '👤',
    },
  }

  return statusMap[status] || statusMap['pending_review']
}

/**
 * Check if record requires action
 */
export function requiresAction(record: ComplianceRecord): boolean {
  return (
    record.status === 'non_compliant' ||
    record.status === 'pending_review' ||
    record.status === 'requires_approval' ||
    (record.deadline && new Date(record.deadline) < new Date())
  )
}

/**
 * Check if record is overdue
 */
export function isRecordOverdue(record: ComplianceRecord): boolean {
  if (!record.deadline) return false
  return new Date(record.deadline) < new Date() && record.status !== 'compliant'
}

/**
 * Get days until deadline
 */
export function getDaysUntilDeadline(deadline: string | undefined): number | null {
  if (!deadline) return null

  const deadlineDate = new Date(deadline)
  const today = new Date()
  const diffTime = deadlineDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

/**
 * Calculate compliance percentage
 */
export function getCompliancePercentage(
  compliant: number,
  total: number
): number {
  if (total === 0) return 100
  return Math.round((compliant / total) * 100)
}

/**
 * Get compliance health status
 */
export function getComplianceHealthStatus(percentage: number): {
  label: string
  color: string
  icon: string
} {
  if (percentage === 100) {
    return { label: '✅ Totalmente Conforme', color: 'text-green-700', icon: '🟢' }
  }
  if (percentage >= 80) {
    return { label: '⚠️ Maioria Conforme', color: 'text-yellow-700', icon: '🟡' }
  }
  if (percentage >= 50) {
    return { label: '🔶 Parcialmente Conforme', color: 'text-orange-700', icon: '🟠' }
  }
  return { label: '❌ Não Conforme', color: 'text-red-700', icon: '🔴' }
}
