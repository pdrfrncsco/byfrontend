import apiClient from "@/lib/api-client";
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
  PlayerAchievementCreate,
  PlayerAchievement,
  PlayerDocument,
  PlayerDocumentCreate,
  PlayerVideo,
  PlayerVideoCreate,
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

  addAchievement(id: string, payload: PlayerAchievementCreate): Promise<PlayerAchievement> {
    const form = new FormData();
    form.append('title', payload.title);
    form.append('achievement_type', payload.achievement_type);
    form.append('level', payload.level);
    if (payload.description) form.append('description', payload.description);
    if (payload.date_achieved) form.append('date_achieved', payload.date_achieved);
    if (payload.season) form.append('season', payload.season);
    if (payload.competition) form.append('competition', payload.competition);
    if (payload.club) form.append('club', payload.club);
    if (payload.trophy_image instanceof File) form.append('trophy_image', payload.trophy_image);
    if (payload.certificate instanceof File) form.append('certificate', payload.certificate);
    return apiClient.post(`${BASE}/${id}/achievements`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  updateAchievement(
    id: string,
    achievementId: string,
    payload: Partial<PlayerAchievementCreate>
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

  /** Upload a player document (multipart). */
  createDocument(id: string, payload: PlayerDocumentCreate): Promise<PlayerDocument> {
    const form = new FormData();
    form.append('title', payload.title);
    form.append('category', payload.category);
    if (payload.description) form.append('description', payload.description);
    if (payload.document instanceof File) form.append('document', payload.document);
    if (payload.valid_from) form.append('valid_from', payload.valid_from);
    if (payload.valid_until) form.append('valid_until', payload.valid_until);
    if (payload.club) form.append('club', payload.club);
    if (payload.is_private !== undefined) form.append('is_private', String(payload.is_private));
    return apiClient.post(`${BASE}/${id}/documents`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /** @deprecated Use createDocument instead */
  uploadDocument(
    id: string,
    file: File,
    meta: { type: string; name: string; expiresAt?: string }
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

  /** Add a player video (supports both URL and file upload). */
  createVideo(id: string, payload: PlayerVideoCreate): Promise<PlayerVideo> {
    if (payload.video instanceof File) {
      const form = new FormData();
      form.append('title', payload.title);
      form.append('video_type', payload.video_type);
      form.append('video', payload.video);
      if (payload.description) form.append('description', payload.description);
      if (payload.thumbnail_url) form.append('thumbnail_url', payload.thumbnail_url);
      if (payload.match) form.append('match', payload.match);
      if (payload.is_featured !== undefined) form.append('is_featured', String(payload.is_featured));
      if (payload.order !== undefined) form.append('order', String(payload.order));
      return apiClient.post(`${BASE}/${id}/videos`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return apiClient.post(`${BASE}/${id}/videos`, payload);
  },

  /** @deprecated Use createVideo instead */
  addVideo(
    id: string,
    payload: { url: string; type: string; title: string; season?: string }
  ): Promise<PlayerVideo> {
    return apiClient.post(`${BASE}/${id}/videos`, payload);
  },

  deleteVideo(id: string, videoId: string): Promise<void> {
    return apiClient.delete(`${BASE}/${id}/videos/${videoId}`);
  },

  publishVideo(id: string, videoId: string): Promise<PlayerVideo> {
    return apiClient.post(`${BASE}/${id}/videos/${videoId}/publish`);
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

  getPlayerOnboardingStatus(): Promise<{ onboarding_required: boolean }> {
    return apiClient.get(`${BASE}/onboarding/status`);
  },
};
