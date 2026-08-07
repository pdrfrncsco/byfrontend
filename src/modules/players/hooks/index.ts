export * from './usePlayerQueries'
export * from './usePlayerMutations'
export * from './usePlayerRegistrationRequests'
export * from './useCurrentPlayer'
export * from './usePlayerOnboardingState'

// Compatibility aliases (names expected by legacy pages / tests)
import {
  useCreatePlayer,
  useAddAchievement,
  useDeleteAchievement,
  useUploadPlayerDocument,
  useAddPlayerVideo,
} from './usePlayerMutations'
import * as _mutations from './usePlayerMutations'

export { useCreatePlayer as useRegisterPlayerLegacy }
export { useAddAchievement as useCreatePlayerAchievement }
export { useDeleteAchievement as useDeletePlayerAchievement }
export { useUploadPlayerDocument as useCreatePlayerDocument }
export { useAddPlayerVideo as useCreatePlayerVideo }

/**
 * Namespace object used by tests that mock the entire hook set.
 * e.g. `vi.mock('@/modules/players/hooks', () => ({ usePlayerMutations: vi.fn(), ... }))`
 */
export const usePlayerMutations = _mutations
