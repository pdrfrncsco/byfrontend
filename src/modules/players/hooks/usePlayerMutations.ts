// Players module — React Query mutation hooks

import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createPlayer,
  updatePlayer,
  registerPlayer,
  createPlayerDocument,
  updatePlayerDocument,
  deletePlayerDocument,
  verifyPlayerDocument,
  createPlayerVideo,
  updatePlayerVideo,
  deletePlayerVideo,
  publishPlayerVideo,
  createPlayerAchievement,
  updatePlayerAchievement,
  deletePlayerAchievement,
  verifyPlayerAchievement,
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
} from '../types'

// ─── Player Mutations ────────────────────────────────────────────────────────

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
      queryClient.invalidateQueries({ queryKey: playerKeys.detail(slug) })
    },
  })
}

// ─── Player Document Mutations ───────────────────────────────────────────────

export function useCreatePlayerDocument(slug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PlayerDocumentCreate) => createPlayerDocument(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.detail(slug) })
    },
  })
}

export function useUpdatePlayerDocument(slug: string, documentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PlayerDocumentUpdate) => updatePlayerDocument(slug, documentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.detail(slug) })
    },
  })
}

export function useDeletePlayerDocument(slug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (documentId: string) => deletePlayerDocument(slug, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.detail(slug) })
    },
  })
}

export function useVerifyPlayerDocument(slug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (documentId: string) => verifyPlayerDocument(slug, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.detail(slug) })
    },
  })
}

// ─── Player Video Mutations ──────────────────────────────────────────────────

export function useCreatePlayerVideo(slug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PlayerVideoCreate) => createPlayerVideo(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.detail(slug) })
    },
  })
}

export function useUpdatePlayerVideo(slug: string, videoId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PlayerVideoUpdate) => updatePlayerVideo(slug, videoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.detail(slug) })
    },
  })
}

export function useDeletePlayerVideo(slug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (videoId: string) => deletePlayerVideo(slug, videoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.detail(slug) })
    },
  })
}

export function usePublishPlayerVideo(slug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (videoId: string) => publishPlayerVideo(slug, videoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.detail(slug) })
    },
  })
}

// ─── Player Achievement Mutations ────────────────────────────────────────────

export function useCreatePlayerAchievement(slug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PlayerAchievementCreate) => createPlayerAchievement(slug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.detail(slug) })
    },
  })
}

export function useUpdatePlayerAchievement(slug: string, achievementId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: PlayerAchievementUpdate) => updatePlayerAchievement(slug, achievementId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.detail(slug) })
    },
  })
}

export function useDeletePlayerAchievement(slug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (achievementId: string) => deletePlayerAchievement(slug, achievementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.detail(slug) })
    },
  })
}

export function useVerifyPlayerAchievement(slug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (achievementId: string) => verifyPlayerAchievement(slug, achievementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.detail(slug) })
    },
  })
}
