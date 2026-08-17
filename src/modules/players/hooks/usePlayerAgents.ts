// Players module — Agent hooks (migrated to apiClient)

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'
import { API_ROUTES } from '@/constants/routes'
import type {
  Agent,
  PlayerAgentRelationship,
  PlayerAgentRelationshipCreate,
} from '../types'

export type { Agent, PlayerAgentRelationship, PlayerAgentRelationshipCreate }

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const agentKeys = {
  all: ['player-agents'] as const,
  list: (playerId: string) => [...agentKeys.all, playerId] as const,
  detail: (playerId: string, relId: string) => [...agentKeys.all, playerId, relId] as const,
  agents: ['agents'] as const,
  agentDetail: (agentId: string) => ['agents', agentId] as const,
  agentSearch: (query: string) => ['agents', 'search', query] as const,
}

// ─── Query Hooks ──────────────────────────────────────────────────────────────

export function usePlayerAgents(playerId: string, enabled = true) {
  return useQuery<PlayerAgentRelationship[]>({
    queryKey: agentKeys.list(playerId),
    queryFn: async () => {
      const res = await apiClient.get<PlayerAgentRelationship[]>(
        API_ROUTES.PLAYERS.AGENTS(playerId)
      )
      const data = res.data
      return Array.isArray(data) ? data : (data as any)?.results ?? []
    },
    enabled: enabled && !!playerId,
    staleTime: 1000 * 60 * 10,
  })
}

export function useAgentDetails(agentId: string, enabled = true) {
  return useQuery({
    queryKey: agentKeys.agentDetail(agentId),
    queryFn: async () => {
      const res = await apiClient.get<Agent>(
        API_ROUTES.PLAYERS.AGENT_ENTITY_DETAIL(agentId)
      )
      return res.data
    },
    enabled: enabled && !!agentId,
    staleTime: 1000 * 60 * 10,
  })
}

export function useAgentSearch(query: string, enabled = true) {
  return useQuery<Agent[]>({
    queryKey: agentKeys.agentSearch(query),
    queryFn: async () => {
      const res = await apiClient.get<{ results: Agent[] }>(
        API_ROUTES.PLAYERS.AGENTS_LIST,
        { params: { search: query, limit: 10 } }
      )
      const data = res.data
      return Array.isArray(data) ? data : (data as any)?.results ?? []
    },
    enabled: enabled && query.trim().length > 0,
    staleTime: 1000 * 60 * 5,
  })
}

// ─── Mutation Hooks ───────────────────────────────────────────────────────────

export function useCreateAgentRelationship(playerId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: PlayerAgentRelationshipCreate) => {
      const res = await apiClient.post<PlayerAgentRelationship>(
        API_ROUTES.PLAYERS.AGENTS(playerId),
        data
      )
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.list(playerId) })
    },
  })
}

export function useUpdateAgentRelationship(playerId: string, relationshipId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<PlayerAgentRelationshipCreate>) => {
      const res = await apiClient.patch<PlayerAgentRelationship>(
        API_ROUTES.PLAYERS.AGENT_DETAIL(playerId, relationshipId),
        data
      )
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.list(playerId) })
    },
  })
}

export function useDeleteAgentRelationship(playerId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (relationshipId: string) => {
      await apiClient.delete(API_ROUTES.PLAYERS.AGENT_DETAIL(playerId, relationshipId))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.list(playerId) })
    },
  })
}

// ─── Utility Functions ────────────────────────────────────────────────────────

export function getActiveAgentRelationship(
  relationships: PlayerAgentRelationship[]
): PlayerAgentRelationship | null {
  return relationships.find((r) => r.is_active) ?? null
}

export function getAgentRelationshipStatusInfo(status: string): {
  label: string; color: string; bgColor: string
} {
  const map: Record<string, ReturnType<typeof getAgentRelationshipStatusInfo>> = {
    active:     { label: 'Ativo',     color: 'text-green-700',  bgColor: 'bg-green-100' },
    expired:    { label: 'Expirado',  color: 'text-orange-700', bgColor: 'bg-orange-100' },
    terminated: { label: 'Terminado', color: 'text-red-700',    bgColor: 'bg-red-100' },
    suspended:  { label: 'Suspenso',  color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  }
  return map[status] ?? map['expired']
}

export function getAgencyTypeLabel(type: string): string {
  const map: Record<string, string> = {
    individual: 'Agente Individual',
    agency:     'Agência de Desportos',
    firm:       'Firma Jurídica',
  }
  return map[type] ?? type
}

export function isRelationshipActive(relationship: PlayerAgentRelationship): boolean {
  return relationship.is_active
}

export function getRelationshipDuration(startDate: string, endDate?: string | null): string {
  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : new Date()
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
  if (months === 0) {
    const days = Math.max(0, end.getDate() - start.getDate())
    return `${days} dia${days !== 1 ? 's' : ''}`
  }
  return `${months} mês${months !== 1 ? 'es' : ''}`
}
