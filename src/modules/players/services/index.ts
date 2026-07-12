// Players module — API service

import apiClient from '@/lib/api-client'
import { API_ROUTES } from '@/constants/routes'
import type {
  Player,
  PlayerDetail,
  PlayerListParams,
  PlayerListResponse,
  PlayerCreate,
  PlayerUpdate,
  PlayerRegisterPayload,
  PlayerDocument,
  PlayerDocumentCreate,
  PlayerDocumentUpdate,
  PlayerVideo,
  PlayerVideoCreate,
  PlayerVideoUpdate,
  PlayerAchievement,
  PlayerAchievementCreate,
  PlayerAchievementUpdate,
} from '../types'

// ─── Player CRUD ─────────────────────────────────────────────────────────────

/**
 * List active players.
 * Supports filtering by position and nationality.
 */
export async function listPlayers(params?: PlayerListParams): Promise<{ success: boolean; data: PlayerListResponse }> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.LIST, { params })
  return res.data
}

/**
 * Get a player's full profile by slug, including career history.
 */
export async function getPlayer(slug: string): Promise<{ success: boolean; data: PlayerDetail }> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.GET(slug))
  return res.data
}

/**
 * Search players by name (min 2 chars).
 */
export async function searchPlayers(q: string): Promise<{ success: boolean; data: Player[] }> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.SEARCH, { params: { q } })
  return res.data
}

/**
 * Create a new player (staff only).
 */
export async function createPlayer(data: PlayerCreate): Promise<{ success: boolean; data: Player }> {
  const res = await apiClient.post(API_ROUTES.PLAYERS.CREATE, data)
  return res.data
}

/**
 * Update a player's profile (staff only).
 */
export async function updatePlayer(slug: string, data: PlayerUpdate): Promise<{ success: boolean; data: Player }> {
  const res = await apiClient.patch(API_ROUTES.PLAYERS.UPDATE(slug), data)
  return res.data
}

/**
 * Register a player at a club.
 */
export async function registerPlayer(slug: string, data: PlayerRegisterPayload): Promise<{ success: boolean; data: unknown }> {
  const res = await apiClient.post(API_ROUTES.PLAYERS.REGISTER(slug), data)
  return res.data
}

// ─── Player Documents ────────────────────────────────────────────────────────

/**
 * List player documents.
 */
export async function listPlayerDocuments(slug: string): Promise<{ success: boolean; data: PlayerDocument[] }> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.DOCUMENTS(slug))
  return res.data
}

/**
 * Get a single player document.
 */
export async function getPlayerDocument(slug: string, documentId: string): Promise<{ success: boolean; data: PlayerDocument }> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.DOCUMENT_DETAIL(slug, documentId))
  return res.data
}

/**
 * Upload a player document (staff only).
 */
export async function createPlayerDocument(slug: string, data: PlayerDocumentCreate): Promise<{ success: boolean; data: PlayerDocument }> {
  const res = await apiClient.post(API_ROUTES.PLAYERS.DOCUMENTS(slug), data)
  return res.data
}

/**
 * Update a player document (staff only).
 */
export async function updatePlayerDocument(slug: string, documentId: string, data: PlayerDocumentUpdate): Promise<{ success: boolean; data: PlayerDocument }> {
  const res = await apiClient.patch(API_ROUTES.PLAYERS.DOCUMENT_DETAIL(slug, documentId), data)
  return res.data
}

/**
 * Delete a player document (staff only).
 */
export async function deletePlayerDocument(slug: string, documentId: string): Promise<void> {
  await apiClient.delete(API_ROUTES.PLAYERS.DOCUMENT_DETAIL(slug, documentId))
}

/**
 * Verify a player document (admin only).
 */
export async function verifyPlayerDocument(slug: string, documentId: string): Promise<{ success: boolean; data: PlayerDocument }> {
  const res = await apiClient.post(API_ROUTES.PLAYERS.DOCUMENT_VERIFY(slug, documentId))
  return res.data
}

// ─── Player Videos ───────────────────────────────────────────────────────────

/**
 * List player videos.
 */
export async function listPlayerVideos(slug: string): Promise<{ success: boolean; data: PlayerVideo[] }> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.VIDEOS(slug))
  return res.data
}

/**
 * Get a single player video.
 */
export async function getPlayerVideo(slug: string, videoId: string): Promise<{ success: boolean; data: PlayerVideo }> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.VIDEO_DETAIL(slug, videoId))
  return res.data
}

/**
 * Create a player video (staff only).
 */
export async function createPlayerVideo(slug: string, data: PlayerVideoCreate): Promise<{ success: boolean; data: PlayerVideo }> {
  const res = await apiClient.post(API_ROUTES.PLAYERS.VIDEOS(slug), data)
  return res.data
}

/**
 * Update a player video (staff only).
 */
export async function updatePlayerVideo(slug: string, videoId: string, data: PlayerVideoUpdate): Promise<{ success: boolean; data: PlayerVideo }> {
  const res = await apiClient.patch(API_ROUTES.PLAYERS.VIDEO_DETAIL(slug, videoId), data)
  return res.data
}

/**
 * Delete a player video (staff only).
 */
export async function deletePlayerVideo(slug: string, videoId: string): Promise<void> {
  await apiClient.delete(API_ROUTES.PLAYERS.VIDEO_DETAIL(slug, videoId))
}

/**
 * Publish a player video (staff only).
 */
export async function publishPlayerVideo(slug: string, videoId: string): Promise<{ success: boolean; data: PlayerVideo }> {
  const res = await apiClient.post(API_ROUTES.PLAYERS.VIDEO_PUBLISH(slug, videoId))
  return res.data
}

// ─── Player Achievements ─────────────────────────────────────────────────────

/**
 * List player achievements.
 */
export async function listPlayerAchievements(slug: string): Promise<{ success: boolean; data: PlayerAchievement[] }> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.ACHIEVEMENTS(slug))
  return res.data
}

/**
 * Get a single player achievement.
 */
export async function getPlayerAchievement(slug: string, achievementId: string): Promise<{ success: boolean; data: PlayerAchievement }> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.ACHIEVEMENT_DETAIL(slug, achievementId))
  return res.data
}

/**
 * Create a player achievement (staff only).
 */
export async function createPlayerAchievement(slug: string, data: PlayerAchievementCreate): Promise<{ success: boolean; data: PlayerAchievement }> {
  const res = await apiClient.post(API_ROUTES.PLAYERS.ACHIEVEMENTS(slug), data)
  return res.data
}

/**
 * Update a player achievement (staff only).
 */
export async function updatePlayerAchievement(slug: string, achievementId: string, data: PlayerAchievementUpdate): Promise<{ success: boolean; data: PlayerAchievement }> {
  const res = await apiClient.patch(API_ROUTES.PLAYERS.ACHIEVEMENT_DETAIL(slug, achievementId), data)
  return res.data
}

/**
 * Delete a player achievement (staff only).
 */
export async function deletePlayerAchievement(slug: string, achievementId: string): Promise<void> {
  await apiClient.delete(API_ROUTES.PLAYERS.ACHIEVEMENT_DETAIL(slug, achievementId))
}

/**
 * Verify a player achievement (admin only).
 */
export async function verifyPlayerAchievement(slug: string, achievementId: string): Promise<{ success: boolean; data: PlayerAchievement }> {
  const res = await apiClient.post(API_ROUTES.PLAYERS.ACHIEVEMENT_VERIFY(slug, achievementId))
  return res.data
}
