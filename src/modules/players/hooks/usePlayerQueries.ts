// Players module — React Query query hooks

import { useQuery, keepPreviousData } from '@tanstack/react-query'
import {
  listPlayers,
  getPlayer,
  searchPlayers,
  listPlayerDocuments,
  listPlayerVideos,
  listPlayerAchievements,
  getPlayerMe,
  getPlayerOnboardingStatus,
  getPlayerCareer,
  getPlayerSeasonStatistics,
  getPlayerFootballProfile,
  getPlayerContact,
  listPlayerEmergencyContacts,
  listPlayerIdentityDocuments,
  listPlayerContracts,
  getContractDetail,
  listPlayerAgentRelationships,
  listAgents,
  listPlayerTrainingHistory,
  getPlayerTrainingCompensation,
  getPlayerMedicalProfile,
  getPlayerMedicalHistory,
  listPlayerMedicalDocuments,
} from '../services'
import type { PlayerListParams } from '../types'

// ─── Query Key Factory ────────────────────────────────────────────────────────

export const playerKeys = {
  // Root
  all: ['players'] as const,

  // Lists
  lists: () => [...playerKeys.all, 'list'] as const,
  list: (params: PlayerListParams) => [...playerKeys.lists(), params] as const,

  // Detail
  details: () => [...playerKeys.all, 'detail'] as const,
  detail: (slug: string) => [...playerKeys.details(), slug] as const,

  // Search
  search: (q: string) => [...playerKeys.all, 'search', q] as const,

  // Sub-resources (slug-based — Phase 1/2)
  documents: (slug: string) => [...playerKeys.all, 'documents', slug] as const,
  videos: (slug: string) => [...playerKeys.all, 'videos', slug] as const,
  achievements: (slug: string) => [...playerKeys.all, 'achievements', slug] as const,
  career: (slug: string) => [...playerKeys.all, 'career', slug] as const,
  statistics: (slug: string, season?: string) =>
    [...playerKeys.all, 'statistics', slug, season ?? 'all'] as const,
  footballProfile: (slug: string) => [...playerKeys.all, 'football-profile', slug] as const,
  contact: (slug: string) => [...playerKeys.all, 'contact', slug] as const,
  emergencyContacts: (slug: string) => [...playerKeys.all, 'emergency-contacts', slug] as const,
  identityDocuments: (slug: string) => [...playerKeys.all, 'identity-documents', slug] as const,

  // Auth
  me: () => [...playerKeys.all, 'me'] as const,
  onboardingStatus: () => [...playerKeys.all, 'onboarding-status'] as const,

  // Phase 3 (UUID-based)
  contracts: (playerId: string) => [...playerKeys.all, 'contracts', playerId] as const,
  contractDetail: (playerId: string, contractId: string) =>
    [...playerKeys.all, 'contracts', playerId, contractId] as const,
  agents: (playerId: string) => [...playerKeys.all, 'agents', playerId] as const,
  agentsList: () => [...playerKeys.all, 'agents-list'] as const,
  trainingHistory: (playerId: string) => [...playerKeys.all, 'training-history', playerId] as const,
  trainingCompensation: (playerId: string) =>
    [...playerKeys.all, 'training-compensation', playerId] as const,

  // Phase 4 (UUID-based)
  medical: (playerId: string) => [...playerKeys.all, 'medical', playerId] as const,
  medicalHistory: (playerId: string) => [...playerKeys.all, 'medical-history', playerId] as const,
  medicalDocuments: (playerId: string) =>
    [...playerKeys.all, 'medical-documents', playerId] as const,
  performance: (playerId: string, metricType?: string) =>
    [...playerKeys.all, 'performance', playerId, metricType ?? 'all'] as const,
  performanceSummary: (playerId: string) =>
    [...playerKeys.all, 'performance-summary', playerId] as const,
  performanceTrends: (playerId: string, days: number) =>
    [...playerKeys.all, 'performance-trends', playerId, days] as const,
  compliance: (playerId: string) =>
    [...playerKeys.all, 'compliance', playerId] as const,
  complianceSummary: (playerId: string) =>
    [...playerKeys.all, 'compliance-summary', playerId] as const,
  overdueCompliance: (playerId: string) =>
    [...playerKeys.all, 'overdue-compliance', playerId] as const,
}

// ─── Core Queries (Phase 1 / slug-based) ─────────────────────────────────────

export function usePlayers(params: PlayerListParams = {}) {
  return useQuery({
    queryKey: playerKeys.list(params),
    queryFn: () => listPlayers(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })
}

export function usePlayer(slug: string) {
  return useQuery({
    queryKey: playerKeys.detail(slug),
    queryFn: () => getPlayer(slug),
    enabled: Boolean(slug),
    staleTime: 60_000,
  })
}

export function usePlayerSearch(q: string) {
  return useQuery({
    queryKey: playerKeys.search(q),
    queryFn: () => searchPlayers(q),
    enabled: q.length >= 2,
    staleTime: 15_000,
  })
}

export function usePlayerDocuments(slug: string) {
  return useQuery({
    queryKey: playerKeys.documents(slug),
    queryFn: () => listPlayerDocuments(slug),
    enabled: Boolean(slug),
    staleTime: 60_000,
  })
}

export function usePlayerVideos(slug: string) {
  return useQuery({
    queryKey: playerKeys.videos(slug),
    queryFn: () => listPlayerVideos(slug),
    enabled: Boolean(slug),
    staleTime: 60_000,
  })
}

export function usePlayerAchievements(slug: string) {
  return useQuery({
    queryKey: playerKeys.achievements(slug),
    queryFn: () => listPlayerAchievements(slug),
    enabled: Boolean(slug),
    staleTime: 60_000,
  })
}

// ─── Auth Queries ─────────────────────────────────────────────────────────────

export function usePlayerMe() {
  return useQuery({
    queryKey: playerKeys.me(),
    queryFn: () => getPlayerMe(),
    staleTime: 60_000,
  })
}

export function usePlayerOnboardingStatus(enabled = true) {
  return useQuery({
    queryKey: playerKeys.onboardingStatus(),
    queryFn: () => getPlayerOnboardingStatus(),
    enabled,
    staleTime: 30_000,
  })
}

// ─── Phase 2: Career & Statistics (slug-based) ───────────────────────────────

export function usePlayerCareer(slug: string) {
  return useQuery({
    queryKey: playerKeys.career(slug),
    queryFn: () => getPlayerCareer(slug),
    enabled: Boolean(slug),
    staleTime: 60_000,
  })
}

export function usePlayerStatistics(slug: string, season?: string) {
  return useQuery({
    queryKey: playerKeys.statistics(slug, season),
    queryFn: () => getPlayerSeasonStatistics(slug, season),
    enabled: Boolean(slug),
    staleTime: 60_000,
  })
}

export function usePlayerFootballProfile(slug: string) {
  return useQuery({
    queryKey: playerKeys.footballProfile(slug),
    queryFn: () => getPlayerFootballProfile(slug),
    enabled: Boolean(slug),
    staleTime: 60_000,
  })
}

// ─── Phase 1: Contact & Identity (slug-based) ─────────────────────────────────

export function usePlayerContact(slug: string) {
  return useQuery({
    queryKey: playerKeys.contact(slug),
    queryFn: () => getPlayerContact(slug),
    enabled: Boolean(slug),
    staleTime: 60_000,
  })
}

export function usePlayerEmergencyContacts(slug: string) {
  return useQuery({
    queryKey: playerKeys.emergencyContacts(slug),
    queryFn: () => listPlayerEmergencyContacts(slug),
    enabled: Boolean(slug),
    staleTime: 60_000,
  })
}

export function usePlayerIdentityDocuments(slug: string) {
  return useQuery({
    queryKey: playerKeys.identityDocuments(slug),
    queryFn: () => listPlayerIdentityDocuments(slug),
    enabled: Boolean(slug),
    staleTime: 60_000,
  })
}

// ─── Phase 3: Contracts (UUID-based) ──────────────────────────────────────────

export function usePlayerContractsQuery(playerId: string) {
  return useQuery({
    queryKey: playerKeys.contracts(playerId),
    queryFn: () => listPlayerContracts(playerId),
    enabled: Boolean(playerId),
    staleTime: 5 * 60_000,
  })
}

export function useContractDetailQuery(playerId: string, contractId: string) {
  return useQuery({
    queryKey: playerKeys.contractDetail(playerId, contractId),
    queryFn: () => getContractDetail(playerId, contractId),
    enabled: Boolean(playerId) && Boolean(contractId),
    staleTime: 5 * 60_000,
  })
}

// ─── Phase 3: Agents (UUID-based) ─────────────────────────────────────────────

export function usePlayerAgentsQuery(playerId: string) {
  return useQuery({
    queryKey: playerKeys.agents(playerId),
    queryFn: () => listPlayerAgentRelationships(playerId),
    enabled: Boolean(playerId),
    staleTime: 10 * 60_000,
  })
}

export function useAgentsListQuery() {
  return useQuery({
    queryKey: playerKeys.agentsList(),
    queryFn: () => listAgents(),
    staleTime: 10 * 60_000,
  })
}

// ─── Phase 3: Training History (UUID-based) ───────────────────────────────────

export function usePlayerTrainingHistoryQuery(playerId: string) {
  return useQuery({
    queryKey: playerKeys.trainingHistory(playerId),
    queryFn: () => listPlayerTrainingHistory(playerId),
    enabled: Boolean(playerId),
    staleTime: 10 * 60_000,
  })
}

export function usePlayerTrainingCompensationQuery(playerId: string) {
  return useQuery({
    queryKey: playerKeys.trainingCompensation(playerId),
    queryFn: () => getPlayerTrainingCompensation(playerId),
    enabled: Boolean(playerId),
    staleTime: 15 * 60_000,
  })
}

// ─── Phase 4: Medical (UUID-based) ────────────────────────────────────────────

export function usePlayerMedicalQuery(playerId: string) {
  return useQuery({
    queryKey: playerKeys.medical(playerId),
    queryFn: () => getPlayerMedicalProfile(playerId),
    enabled: Boolean(playerId),
    staleTime: 5 * 60_000,
  })
}

export function usePlayerMedicalHistoryQuery(playerId: string) {
  return useQuery({
    queryKey: playerKeys.medicalHistory(playerId),
    queryFn: () => getPlayerMedicalHistory(playerId),
    enabled: Boolean(playerId),
    staleTime: 5 * 60_000,
  })
}

export function usePlayerMedicalDocumentsQuery(playerId: string) {
  return useQuery({
    queryKey: playerKeys.medicalDocuments(playerId),
    queryFn: () => listPlayerMedicalDocuments(playerId),
    enabled: Boolean(playerId),
    staleTime: 5 * 60_000,
  })
}
