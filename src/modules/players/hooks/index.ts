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
export * from './usePlayerFilters'
export * from './usePlayerComparison'
export * from './usePlayerContracts'
export * from './usePlayerAgents'
export * from './usePlayerTransfers'
export * from './usePlayerMedical'
export * from './usePlayerNationalTeam'
export * from './usePlayerPerformance'
export * from './usePlayerCompliance'

// Re-export with specific names to avoid ambiguity
export { usePlayerSearch as usePlayerSearchQuery } from './usePlayerQueries'
export { usePlayerSearch as usePlayerSearchFilter } from './usePlayerFilters'
