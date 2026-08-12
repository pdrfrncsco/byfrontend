import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface Agent {
  id: string
  name: string
  agency_name?: string
  agency_type: 'individual' | 'agency' | 'firm'
  license_number?: string
  fifa_agent_id?: string
  country: string
  email: string
  phone: string
  website?: string
  address?: string
  city?: string
  postal_code?: string
  is_active: boolean
  verified: boolean
  verified_at?: string
  created_at: string
  updated_at: string
}

export interface PlayerAgentRelationship {
  id: string
  player: string
  agent: Agent
  start_date: string
  end_date?: string
  status: 'active' | 'expired' | 'terminated' | 'suspended'
  commission_rate?: number
  representation_agreement?: {
    id: string
    url: string
    name: string
  }
  notes?: string
  created_at: string
  updated_at: string
}

export interface CreateAgentInput {
  name: string
  agency_name?: string
  agency_type?: string
  license_number?: string
  fifa_agent_id?: string
  country: string
  email: string
  phone: string
  website?: string
  address?: string
  city?: string
  postal_code?: string
}

export interface CreateRelationshipInput {
  agent: string
  start_date: string
  end_date?: string
  status?: string
  commission_rate?: number
  notes?: string
}

export interface UpdateRelationshipInput extends Partial<CreateRelationshipInput> {}

/**
 * Hook to fetch player's agent relationships
 */
export function usePlayerAgents(playerId: string, enabled = true) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

  return useQuery({
    queryKey: ['player-agents', playerId],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/players/${playerId}/agents/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch agents: ${response.statusText}`)
      }

      return response.json()
    },
    enabled: enabled && !!playerId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  })
}

/**
 * Hook to fetch agent details
 */
export function useAgentDetails(agentId: string, enabled = true) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

  return useQuery({
    queryKey: ['agent', agentId],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/agents/${agentId}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch agent: ${response.statusText}`)
      }

      return response.json()
    },
    enabled: enabled && !!agentId,
    staleTime: 1000 * 60 * 10,
  })
}

/**
 * Hook to search agents
 */
export function useAgentSearch(query: string, enabled = true) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

  return useQuery({
    queryKey: ['agents-search', query],
    queryFn: async () => {
      if (!query.trim()) {
        return { results: [] }
      }

      const params = new URLSearchParams()
      params.append('search', query)
      params.append('limit', '10')

      const response = await fetch(`${apiUrl}/agents/?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to search agents: ${response.statusText}`)
      }

      return response.json()
    },
    enabled: enabled && query.length > 0,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Hook to create agent relationship
 */
export function useCreateAgentRelationship(playerId: string) {
  const queryClient = useQueryClient()
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

  return useMutation({
    mutationFn: async (data: CreateRelationshipInput) => {
      const response = await fetch(`${apiUrl}/players/${playerId}/agents/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`Failed to create relationship: ${response.statusText}`)
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-agents', playerId] })
    },
  })
}

/**
 * Hook to update agent relationship
 */
export function useUpdateAgentRelationship(playerId: string, relationshipId: string) {
  const queryClient = useQueryClient()
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

  return useMutation({
    mutationFn: async (data: UpdateRelationshipInput) => {
      const response = await fetch(
        `${apiUrl}/players/${playerId}/agents/${relationshipId}/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
          body: JSON.stringify(data),
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to update relationship: ${response.statusText}`)
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-agents', playerId] })
    },
  })
}

/**
 * Hook to delete agent relationship
 */
export function useDeleteAgentRelationship(playerId: string) {
  const queryClient = useQueryClient()
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

  return useMutation({
    mutationFn: async (relationshipId: string) => {
      const response = await fetch(
        `${apiUrl}/players/${playerId}/agents/${relationshipId}/`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to delete relationship: ${response.statusText}`)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-agents', playerId] })
    },
  })
}

/**
 * Get active agent relationship
 */
export function getActiveAgentRelationship(
  relationships: PlayerAgentRelationship[]
): PlayerAgentRelationship | null {
  return relationships.find((r) => r.status === 'active') || null
}

/**
 * Get agent relationship status info
 */
export function getAgentRelationshipStatusInfo(status: string): {
  label: string
  color: string
  bgColor: string
} {
  const statusMap: Record<string, any> = {
    active: {
      label: 'Ativo',
      color: 'text-green-700',
      bgColor: 'bg-green-100',
    },
    expired: {
      label: 'Expirado',
      color: 'text-orange-700',
      bgColor: 'bg-orange-100',
    },
    terminated: {
      label: 'Terminado',
      color: 'text-red-700',
      bgColor: 'bg-red-100',
    },
    suspended: {
      label: 'Suspenso',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100',
    },
  }

  return statusMap[status] || statusMap['expired']
}

/**
 * Get agency type label
 */
export function getAgencyTypeLabel(type: string): string {
  const typeMap: Record<string, string> = {
    individual: 'Agente Individual',
    agency: 'Agência de Desportos',
    firm: 'Firma Jurídica',
  }

  return typeMap[type] || type
}

/**
 * Check if relationship is active
 */
export function isRelationshipActive(relationship: PlayerAgentRelationship): boolean {
  if (relationship.status !== 'active') return false

  const today = new Date()
  const startDate = new Date(relationship.start_date)
  if (startDate > today) return false

  if (relationship.end_date) {
    const endDate = new Date(relationship.end_date)
    if (endDate < today) return false
  }

  return true
}

/**
 * Calculate relationship duration
 */
export function getRelationshipDuration(startDate: string, endDate?: string): string {
  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : new Date()
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
  const days = end.getDate() - start.getDate()

  if (months === 0 && days >= 0) {
    return `${days} dias`
  }
  if (months === 0) {
    return `${Math.abs(days)} dias`
  }
  if (days < 0) {
    return `${months - 1} mês${months - 1 !== 1 ? 'es' : ''}`
  }
  return `${months} mês${months !== 1 ? 'es' : ''}`
}
