// Players module — Hooks barrel export

export * from './usePlayerQueries'
export * from './usePlayerMutations'
export * from './usePlayerRegistrationRequests'
export * from './useCurrentPlayer'
export * from './usePlayerOnboardingState'
// Keep the legacy career hooks available without re-exporting its duplicate
// usePlayerStatistics name. The canonical implementation lives in
// usePlayerQueries and supports optional season filtering.
export { usePlayerCareerStats, usePlayerRegistrations } from './usePlayerCareerStats'
export {
  usePlayerFilters,
  useFilteredPlayers,
  usePlayerSearch as usePlayerSearchFilter,
  usePositionFilter,
} from './usePlayerFilters'
export * from './usePlayerComparison'
export { usePlayerContracts, useContractDetails, useCreateContract, useUpdateContract, useDeleteContract, useSignContract, useRenewContract, useTerminateContract, getActiveContract, formatCurrency, getContractStatusInfo, getContractTypeLabel, getContractDuration, isContractExpiringSoon, isContractFullySigned } from './usePlayerContracts'
export { usePlayerAgents, useAgentDetails, useAgentSearch, useCreateAgentRelationship, useUpdateAgentRelationship, useDeleteAgentRelationship, getActiveAgentRelationship, getAgentRelationshipStatusInfo, getAgencyTypeLabel, isRelationshipActive, getRelationshipDuration } from './usePlayerAgents'
export { usePlayerTransfers, useTransferDetails, useCreateTransfer, useUpdateTransfer, useCancelTransfer, getTransferStatusInfo, getTransferTypeLabel, formatTransferFee, isTransferPendingApproval, canCancelTransfer, getTransferTimelineSteps, getDaysUntilEffective } from './usePlayerTransfers'
export * from './usePlayerMedical'
export * from './usePlayerNationalTeam'
export * from './usePlayerPerformance'
export * from './usePlayerCompliance'

// Re-export with specific names to avoid ambiguity
export { usePlayerSearch as usePlayerSearchQuery } from './usePlayerQueries'
