// Players module — Hooks barrel export

export * from './usePlayerQueries'
export * from './usePlayerMutations'
export * from './usePlayerRegistrationRequests'
export * from './useCurrentPlayer'
export * from './usePlayerOnboardingState'

// Compatibility aliases for older imports across the codebase/tests
import { usePlayers, usePlayers as usePlayerSearch } from './usePlayerQueries'
import {
  useCreatePlayer,
  useUpdatePlayerMe,
  useAddAchievement,
  useDeleteAchievement,
  useUploadPlayerDocument,
  useAddPlayerVideo,
  usePlayerVideos,
} from './usePlayerMutations'

export { usePlayerSearch }
export { useCreatePlayer }
export { useUpdatePlayerMe }

// Provide a simple grouped hook for legacy imports that expect usePlayerMutations
export function usePlayerMutations() {
  return {}
}

// Backwards-compat: common names
export { useCreatePlayer as useRegisterPlayer }

// Achievements/document/video compatibility
export { useAddAchievement as useCreatePlayerAchievement }
export { useDeleteAchievement as useDeletePlayerAchievement }
export { useUploadPlayerDocument as useCreatePlayerDocument }
export { useAddPlayerVideo as useCreatePlayerVideo }
export { usePlayerVideos as usePlayerVideos }
