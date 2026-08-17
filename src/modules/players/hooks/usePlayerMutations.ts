// Players module — React Query mutation hooks

import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  // Core
  createPlayer,
  updatePlayer,
  registerPlayer,
  updatePlayerMe,
  uploadPlayerAvatar,
  completeOnboardingStep,
  // Documents
  createPlayerDocument,
  updatePlayerDocument,
  deletePlayerDocument,
  verifyPlayerDocument,
  // Videos
  createPlayerVideo,
  updatePlayerVideo,
  deletePlayerVideo,
  publishPlayerVideo,
  // Achievements
  createPlayerAchievement,
  updatePlayerAchievement,
  deletePlayerAchievement,
  verifyPlayerAchievement,
  // Contact
  updatePlayerContact,
  updatePlayerPrivacySettings,
  createPlayerEmergencyContact,
  deletePlayerEmergencyContact,
  // Identity Documents
  createPlayerIdentityDocument,
  updatePlayerIdentityDocument,
  deletePlayerIdentityDocument,
  verifyPlayerIdentityDocument,
  // Football Profile
  updatePlayerFootballProfile,
  // Contracts
  createPlayerContract,
  updatePlayerContract,
  deletePlayerContract,
  signPlayerContract,
  renewPlayerContract,
  terminatePlayerContract,
  // Agents
  createAgentRelationship,
  updateAgentRelationship,
  deleteAgentRelationship,
  // Training History
  createPlayerTrainingEntry,
  updatePlayerTrainingEntry,
  deletePlayerTrainingEntry,
  verifyPlayerTrainingEntry,
  // Medical
  updatePlayerMedicalProfile,
  createPlayerMedicalDocument,
  verifyMedicalDocument,
  rejectMedicalDocument,
} from '../services'
import { playerKeys } from './usePlayerQueries'
import type {
  PlayerCreate,
  PlayerUpdate,
  PlayerRegisterPayload,
  PlayerDocumentCreate,
  PlayerDocumentUpdate,
  PlayerVideoCreate,
  PlayerVideoUpdate,
  PlayerAchievementCreate,
  PlayerAchievementUpdate,
  PlayerContactUpdate,
  PlayerPrivacySettingsUpdate,
  EmergencyContactCreate,
  PlayerIdentityDocumentCreate,
  PlayerIdentityDocumentUpdate,
  PlayerFootballProfile,
  PlayerContractCreate,
  PlayerContractUpdate,
  PlayerContractSign,
  PlayerContractRenew,
  PlayerContractTerminate,
  PlayerAgentRelationshipCreate,
  PlayerTrainingHistoryCreate,
  PlayerMedicalProfileUpdate,
  MedicalDocumentCreate,
  MedicalDocumentReject,
} from '../types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function invalidatePlayerDetail(queryClient: ReturnType<typeof useQueryClient>, slug: string) {
  queryClient.invalidateQueries({ queryKey: playerKeys.detail(slug) })
  queryClient.invalidateQueries({ queryKey: playerKeys.documents(slug) })
  queryClient.invalidateQueries({ queryKey: playerKeys.videos(slug) })
  queryClient.invalidateQueries({ queryKey: playerKeys.achievements(slug) })
}

// ─── Core Player Mutations ────────────────────────────────────────────────────

export function useCreatePlayer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PlayerCreate) => createPlayer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.lists() })
    },
  })
}

export function useUpdatePlayer(slug: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PlayerUpdate) => updatePlayer(slug, data),
    onSuccess: (response) => {
      queryClient.setQueryData(playerKeys.detail(slug), response)
      queryClient.invalidateQueries({ queryKey: playerKeys.lists() })
    },
  })
}

export function useRegisterPlayer(slug: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PlayerRegisterPayload) => registerPlayer(slug, data),
    onSuccess: () => {
      invalidatePlayerDetail(queryClient, slug)
      queryClient.invalidateQueries({ queryKey: playerKeys.lists() })
    },
  })
}

export function useUpdatePlayerMe() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PlayerUpdate) => updatePlayerMe(data),
    onSuccess: async (response) => {
      queryClient.invalidateQueries({ queryKey: playerKeys.me() })
      await queryClient.refetchQueries({ queryKey: playerKeys.onboardingStatus() })
      queryClient.invalidateQueries({ queryKey: playerKeys.detail(response.slug) })
    },
  })
}

export function useUploadPlayerAvatar(slug?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => uploadPlayerAvatar(file, slug),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: playerKeys.me() })
      queryClient.invalidateQueries({ queryKey: playerKeys.onboardingStatus() })
      queryClient.invalidateQueries({ queryKey: playerKeys.detail(response.slug) })
      queryClient.invalidateQueries({ queryKey: playerKeys.lists() })
    },
  })
}

export function useCompleteOnboardingStep() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (step: string) => completeOnboardingStep(step),
    onSuccess: async (data) => {
      if (data) {
        queryClient.setQueryData(playerKeys.onboardingStatus(), data)
      }
      await queryClient.refetchQueries({ queryKey: playerKeys.onboardingStatus() })
      queryClient.invalidateQueries({ queryKey: playerKeys.me() })
    },
  })
}

// ─── Document Mutations ───────────────────────────────────────────────────────

export function useCreatePlayerDocument(slug: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PlayerDocumentCreate) => createPlayerDocument(slug, data),
    onSuccess: () => { invalidatePlayerDetail(queryClient, slug) },
  })
}

export function useUpdatePlayerDocument(slug: string, documentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PlayerDocumentUpdate) => updatePlayerDocument(slug, documentId, data),
    onSuccess: () => { invalidatePlayerDetail(queryClient, slug) },
  })
}

export function useDeletePlayerDocument(slug: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (documentId: string) => deletePlayerDocument(slug, documentId),
    onSuccess: () => { invalidatePlayerDetail(queryClient, slug) },
  })
}

export function useVerifyPlayerDocument(slug: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (documentId: string) => verifyPlayerDocument(slug, documentId),
    onSuccess: () => { invalidatePlayerDetail(queryClient, slug) },
  })
}

// ─── Video Mutations ──────────────────────────────────────────────────────────

export function useCreatePlayerVideo(slug: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PlayerVideoCreate) => createPlayerVideo(slug, data),
    onSuccess: () => { invalidatePlayerDetail(queryClient, slug) },
  })
}

export function useUpdatePlayerVideo(slug: string, videoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PlayerVideoUpdate) => updatePlayerVideo(slug, videoId, data),
    onSuccess: () => { invalidatePlayerDetail(queryClient, slug) },
  })
}

export function useDeletePlayerVideo(slug: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (videoId: string) => deletePlayerVideo(slug, videoId),
    onSuccess: () => { invalidatePlayerDetail(queryClient, slug) },
  })
}

export function usePublishPlayerVideo(slug: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (videoId: string) => publishPlayerVideo(slug, videoId),
    onSuccess: () => { invalidatePlayerDetail(queryClient, slug) },
  })
}

// ─── Achievement Mutations ────────────────────────────────────────────────────

export function useCreatePlayerAchievement(slug: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PlayerAchievementCreate) => createPlayerAchievement(slug, data),
    onSuccess: () => { invalidatePlayerDetail(queryClient, slug) },
  })
}

export function useUpdatePlayerAchievement(slug: string, achievementId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PlayerAchievementUpdate) => updatePlayerAchievement(slug, achievementId, data),
    onSuccess: () => { invalidatePlayerDetail(queryClient, slug) },
  })
}

export function useDeletePlayerAchievement(slug: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (achievementId: string) => deletePlayerAchievement(slug, achievementId),
    onSuccess: () => { invalidatePlayerDetail(queryClient, slug) },
  })
}

export function useVerifyPlayerAchievement(slug: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (achievementId: string) => verifyPlayerAchievement(slug, achievementId),
    onSuccess: () => { invalidatePlayerDetail(queryClient, slug) },
  })
}

// ─── Contact Mutations ────────────────────────────────────────────────────────

export function useUpdatePlayerContact(slug: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PlayerContactUpdate) => updatePlayerContact(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.contact(slug) })
      queryClient.invalidateQueries({ queryKey: playerKeys.me() })
    },
  })
}

export function useUpdatePlayerPrivacySettings(slug: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PlayerPrivacySettingsUpdate) => updatePlayerPrivacySettings(slug, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: playerKeys.privacy(slug) }),
  })
}

export function useCreateEmergencyContact(slug: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: EmergencyContactCreate) => createPlayerEmergencyContact(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.emergencyContacts(slug) })
    },
  })
}

export function useDeleteEmergencyContact(slug: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (contactId: string) => deletePlayerEmergencyContact(slug, contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.emergencyContacts(slug) })
    },
  })
}

// ─── Identity Document Mutations ──────────────────────────────────────────────

export function useCreateIdentityDocument(slug: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PlayerIdentityDocumentCreate) =>
      createPlayerIdentityDocument(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.identityDocuments(slug) })
      queryClient.invalidateQueries({ queryKey: playerKeys.onboardingStatus() })
    },
  })
}

export function useUpdateIdentityDocument(slug: string, docId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PlayerIdentityDocumentUpdate) =>
      updatePlayerIdentityDocument(slug, docId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.identityDocuments(slug) })
    },
  })
}

export function useDeleteIdentityDocument(slug: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (docId: string) => deletePlayerIdentityDocument(slug, docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.identityDocuments(slug) })
    },
  })
}

export function useVerifyIdentityDocument(slug: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (docId: string) => verifyPlayerIdentityDocument(slug, docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.identityDocuments(slug) })
    },
  })
}

// ─── Football Profile Mutations ───────────────────────────────────────────────

export function useUpdateFootballProfile(slug: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<PlayerFootballProfile>) =>
      updatePlayerFootballProfile(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.footballProfile(slug) })
      queryClient.invalidateQueries({ queryKey: playerKeys.me() })
    },
  })
}

// ─── Contract Mutations (UUID-based) ──────────────────────────────────────────

export function useCreateContract(playerId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PlayerContractCreate) => createPlayerContract(playerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.contracts(playerId) })
    },
  })
}

export function useUpdateContractMutation(playerId: string, contractId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PlayerContractUpdate) =>
      updatePlayerContract(playerId, contractId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.contracts(playerId) })
      queryClient.invalidateQueries({ queryKey: playerKeys.contractDetail(playerId, contractId) })
    },
  })
}

export function useDeleteContractMutation(playerId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (contractId: string) => deletePlayerContract(playerId, contractId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.contracts(playerId) })
    },
  })
}

export function useSignContractMutation(playerId: string, contractId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PlayerContractSign) => signPlayerContract(playerId, contractId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.contracts(playerId) })
      queryClient.invalidateQueries({ queryKey: playerKeys.contractDetail(playerId, contractId) })
    },
  })
}

export function useRenewContractMutation(playerId: string, contractId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PlayerContractRenew) => renewPlayerContract(playerId, contractId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.contracts(playerId) })
      queryClient.invalidateQueries({ queryKey: playerKeys.contractDetail(playerId, contractId) })
    },
  })
}

export function useTerminateContractMutation(playerId: string, contractId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PlayerContractTerminate) =>
      terminatePlayerContract(playerId, contractId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.contracts(playerId) })
      queryClient.invalidateQueries({ queryKey: playerKeys.contractDetail(playerId, contractId) })
    },
  })
}

// ─── Agent Mutations (UUID-based) ─────────────────────────────────────────────

export function useCreateAgentRelationshipMutation(playerId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PlayerAgentRelationshipCreate) =>
      createAgentRelationship(playerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.agents(playerId) })
    },
  })
}

export function useUpdateAgentRelationshipMutation(playerId: string, relId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<PlayerAgentRelationshipCreate>) =>
      updateAgentRelationship(playerId, relId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.agents(playerId) })
    },
  })
}

export function useDeleteAgentRelationshipMutation(playerId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (relId: string) => deleteAgentRelationship(playerId, relId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.agents(playerId) })
    },
  })
}

// ─── Training History Mutations (UUID-based) ───────────────────────────────────

export function useCreateTrainingEntryMutation(playerId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PlayerTrainingHistoryCreate) =>
      createPlayerTrainingEntry(playerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.trainingHistory(playerId) })
      queryClient.invalidateQueries({ queryKey: playerKeys.trainingCompensation(playerId) })
    },
  })
}

export function useUpdateTrainingEntryMutation(playerId: string, entryId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<PlayerTrainingHistoryCreate>) =>
      updatePlayerTrainingEntry(playerId, entryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.trainingHistory(playerId) })
      queryClient.invalidateQueries({ queryKey: playerKeys.trainingCompensation(playerId) })
    },
  })
}

export function useDeleteTrainingEntryMutation(playerId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (entryId: string) => deletePlayerTrainingEntry(playerId, entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.trainingHistory(playerId) })
      queryClient.invalidateQueries({ queryKey: playerKeys.trainingCompensation(playerId) })
    },
  })
}

export function useVerifyTrainingEntryMutation(playerId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (entryId: string) => verifyPlayerTrainingEntry(playerId, entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.trainingHistory(playerId) })
    },
  })
}

// ─── Medical Mutations (UUID-based) ───────────────────────────────────────────

export function useUpdateMedicalProfileMutation(playerId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PlayerMedicalProfileUpdate) =>
      updatePlayerMedicalProfile(playerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.medical(playerId) })
      queryClient.invalidateQueries({ queryKey: playerKeys.medicalHistory(playerId) })
    },
  })
}

export function useCreateMedicalDocumentMutation(playerId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: MedicalDocumentCreate) =>
      createPlayerMedicalDocument(playerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.medicalDocuments(playerId) })
      queryClient.invalidateQueries({ queryKey: playerKeys.medicalHistory(playerId) })
    },
  })
}

export function useVerifyMedicalDocumentMutation(playerId: string, docId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => verifyMedicalDocument(playerId, docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.medicalDocuments(playerId) })
    },
  })
}

export function useRejectMedicalDocumentMutation(playerId: string, docId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: MedicalDocumentReject) => rejectMedicalDocument(playerId, docId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.medicalDocuments(playerId) })
    },
  })
}
