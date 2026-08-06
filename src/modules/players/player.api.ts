import apiClient from '@/lib/api-client';
import type {
  Player,
  PlayerListParams,
  PlayerListResponse,
  UpdatePlayerIdentityPayload,
  UpdatePlayerContactPayload,
  UpdatePlayerFootballPayload,
  UpdatePlayerAgentPayload,
  UpdatePlayerSocialPayload,
  UpdatePlayerAvailabilityPayload,
  UpdatePlayerPrivacyPayload,
  UpdatePlayerProfilePayload,
  CreateCareerEntryPayload,
  UpdateCareerEntryPayload,
  PlayerCareerEntry,
  CreateAchievementPayload,
  PlayerAchievement,
  PlayerDocument,
  PlayerVideo,
  PlayerRegistrationRequest,
  PlayerProfileCompletion,
} from "@/modules/players/types";

const BASE = "/players";

// ─── Core CRUD ────────────────────────────────────────────────────────────────

export const playerApi = {
  // List
  list(params?: PlayerListParams): Promise<PlayerListResponse> {
    return apiClient.get(BASE, { params });
  },

  // Single player
  getById(id: string): Promise<Player> {
    return apiClient.get(`${BASE}/${id}`);
  },

  // The authenticated user's own player profile
  getCurrent(): Promise<Player> {
    return apiClient.get(`${BASE}/me`);
  },

  // Create (admin / club use)
  create(payload: UpdatePlayerIdentityPayload & UpdatePlayerFootballPayload): Promise<Player> {
    return apiClient.post(BASE, payload);
  },

  // Delete
  delete(id: string): Promise<void> {
    return apiClient.delete(`${BASE}/${id}`);
  },

  // ─── Section-level updates ──────────────────────────────────────────────────

  /**
   * Bulk-update multiple profile sections in a single request.
   * Useful when the user saves the whole settings form at once.
   */
  updateProfile(id: string, payload: UpdatePlayerProfilePayload): Promise<Player> {
    return apiClient.patch(`${BASE}/${id}/profile`, payload);
  },

  updateIdentity(id: string, payload: UpdatePlayerIdentityPayload): Promise<Player> {
    return apiClient.patch(`${BASE}/${id}/identity`, payload);
  },

  updateContact(id: string, payload: UpdatePlayerContactPayload): Promise<Player> {
    return apiClient.patch(`${BASE}/${id}/contact`, payload);
  },

  updateFootball(id: string, payload: UpdatePlayerFootballPayload): Promise<Player> {
    return apiClient.patch(`${BASE}/${id}/football`, payload);
  },

  updateAgent(id: string, payload: UpdatePlayerAgentPayload): Promise<Player> {
    return apiClient.patch(`${BASE}/${id}/agent`, payload);
  },

  updateSocial(id: string, payload: UpdatePlayerSocialPayload): Promise<Player> {
    return apiClient.patch(`${BASE}/${id}/social`, payload);
  },

  updateAvailability(id: string, payload: UpdatePlayerAvailabilityPayload): Promise<Player> {
    return apiClient.patch(`${BASE}/${id}/availability`, payload);
  },

  updatePrivacy(id: string, payload: UpdatePlayerPrivacyPayload): Promise<Player> {
    return apiClient.patch(`${BASE}/${id}/privacy`, payload);
  },

  // ─── Avatar ─────────────────────────────────────────────────────────────────

  uploadAvatar(id: string, file: File): Promise<{ avatarUrl: string }> {
    const form = new FormData();
    form.append("avatar", file);
    return apiClient.post(`${BASE}/${id}/avatar`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deleteAvatar(id: string): Promise<void> {
    return apiClient.delete(`${BASE}/${id}/avatar`);
  },

  // ─── Career history ──────────────────────────────────────────────────────────

  getCareerHistory(id: string): Promise<PlayerCareerEntry[]> {
    return apiClient.get(`${BASE}/${id}/career`);
  },

  addCareerEntry(id: string, payload: CreateCareerEntryPayload): Promise<PlayerCareerEntry> {
    return apiClient.post(`${BASE}/${id}/career`, payload);
  },

  updateCareerEntry(
    id: string,
    entryId: string,
    payload: UpdateCareerEntryPayload
  ): Promise<PlayerCareerEntry> {
    return apiClient.patch(`${BASE}/${id}/career/${entryId}`, payload);
  },

  deleteCareerEntry(id: string, entryId: string): Promise<void> {
    return apiClient.delete(`${BASE}/${id}/career/${entryId}`);
  },

  // ─── Achievements ────────────────────────────────────────────────────────────

  getAchievements(id: string): Promise<PlayerAchievement[]> {
    return apiClient.get(`${BASE}/${id}/achievements`);
  },

  addAchievement(id: string, payload: CreateAchievementPayload): Promise<PlayerAchievement> {
    return apiClient.post(`${BASE}/${id}/achievements`, payload);
  },

  updateAchievement(
    id: string,
    achievementId: string,
    payload: Partial<CreateAchievementPayload>
  ): Promise<PlayerAchievement> {
    return apiClient.patch(`${BASE}/${id}/achievements/${achievementId}`, payload);
  },

  deleteAchievement(id: string, achievementId: string): Promise<void> {
    return apiClient.delete(`${BASE}/${id}/achievements/${achievementId}`);
  },

  // ─── Documents ───────────────────────────────────────────────────────────────

  getDocuments(id: string): Promise<PlayerDocument[]> {
    return apiClient.get(`${BASE}/${id}/documents`);
  },

  uploadDocument(
    id: string,
    file: File,
    meta: { type: PlayerDocument["type"]; name: string; expiresAt?: string }
  ): Promise<PlayerDocument> {
    const form = new FormData();
    form.append("document", file);
    form.append("type", meta.type);
    form.append("name", meta.name);
    if (meta.expiresAt) form.append("expiresAt", meta.expiresAt);
    return apiClient.post(`${BASE}/${id}/documents`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deleteDocument(id: string, documentId: string): Promise<void> {
    return apiClient.delete(`${BASE}/${id}/documents/${documentId}`);
  },

  // ─── Videos ──────────────────────────────────────────────────────────────────

  getVideos(id: string): Promise<PlayerVideo[]> {
    return apiClient.get(`${BASE}/${id}/videos`);
  },

  addVideo(
    id: string,
    payload: { url: string; type: PlayerVideo["type"]; title: string; season?: string }
  ): Promise<PlayerVideo> {
    return apiClient.post(`${BASE}/${id}/videos`, payload);
  },

  deleteVideo(id: string, videoId: string): Promise<void> {
    return apiClient.delete(`${BASE}/${id}/videos/${videoId}`);
  },

  // ─── Registration / club link ─────────────────────────────────────────────

  getRegistrationRequests(id: string): Promise<PlayerRegistrationRequest[]> {
    return apiClient.get(`${BASE}/${id}/registration-requests`);
  },

  requestClubLink(id: string, clubId: string): Promise<PlayerRegistrationRequest> {
    return apiClient.post(`${BASE}/${id}/registration-requests`, { clubId });
  },

  cancelClubLink(id: string, requestId: string): Promise<void> {
    return apiClient.delete(`${BASE}/${id}/registration-requests/${requestId}`);
  },

  // ─── Profile completion ───────────────────────────────────────────────────

  getProfileCompletion(id: string): Promise<PlayerProfileCompletion> {
    return apiClient.get(`${BASE}/${id}/completion`);
  },
};
