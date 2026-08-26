// Players module — API service (Sprint 1 expansion)

import apiClient from '@/lib/api-client'
import { API_ROUTES } from '@/constants/routes'
import type { ApiResponse } from '@/types'
import type {
  Player,
  PlayerDetail,
  PlayerListParams,
  PlayerListResponse,
  PlayerCreate,
  PlayerUpdate,
  PlayerRegisterPayload,
  PlayerRegistrationRequest,
  PlayerRegistrationRequestCreate,
  PlayerRegistrationRequestReview,
  PlayerDocument,
  PlayerDocumentCreate,
  PlayerDocumentUpdate,
  PlayerVideo,
  PlayerVideoCreate,
  PlayerVideoUpdate,
  PlayerAchievement,
  PlayerAchievementCreate,
  PlayerAchievementUpdate,
  PlayerOnboardingStatus,
  // Phase 2
  PlayerCareer,
  PlayerSeasonStatistics,
  PlayerFootballProfile,
  // Phase 1: Contact & Identity
  PlayerContact,
  PlayerPrivacySettings,
  PlayerPrivacySettingsUpdate,
  PlayerContactUpdate,
  EmergencyContact,
  EmergencyContactCreate,
  PlayerIdentityDocument,
  PlayerIdentityDocumentCreate,
  PlayerIdentityDocumentUpdate,
  // Phase 3
  PlayerContract,
  PlayerContractCreate,
  PlayerContractUpdate,
  PlayerContractSign,
  PlayerContractRenew,
  PlayerContractTerminate,
  Agent,
  PlayerAgentRelationship,
  PlayerAgentRelationshipCreate,
  PlayerTrainingHistory,
  PlayerTrainingHistoryCreate,
  TrainingCompensationData,
  // Phase 4
  PlayerMedicalProfile,
  PlayerMedicalProfileUpdate,
  MedicalDocument,
  MedicalDocumentCreate,
  MedicalDocumentReject,
  PlayerMedicalHistory,
} from '../types'

// ─── Response Envelope Helpers ────────────────────────────────────────────────

type Envelope<T> = ApiResponse<T> | T
type PaginatedEnvelope<T> =
  | ApiResponse<PlayerListResponse>
  | PlayerListResponse
  | { count?: number; next?: string | null; previous?: string | null; results: T[] }
  | T[]

function hasData<T>(payload: unknown): payload is ApiResponse<T> {
  return !!payload && typeof payload === 'object' && 'data' in payload && 'success' in payload
}

function unwrapData<T>(payload: Envelope<T>): T {
  return hasData<T>(payload) ? payload.data : payload
}

function unwrapList<T>(payload: PaginatedEnvelope<T> | Envelope<T[]>): T[] {
  const data = hasData<T[]>(payload) ? payload.data : payload
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object' && 'results' in data) {
    const r = (data as { results?: T[] }).results
    return Array.isArray(r) ? r : []
  }
  return []
}

function unwrapPaginated<T>(
  payload: PaginatedEnvelope<T>
): { count: number; next: string | null; previous: string | null; results: T[] } {
  const data = hasData<{ count: number; next: string | null; previous: string | null; results: T[] }>(payload)
    ? payload.data
    : payload
  if (Array.isArray(data)) {
    return { count: data.length, next: null, previous: null, results: data }
  }
  if (data && typeof data === 'object' && 'results' in data) {
    const p = data as { count?: number; next?: string | null; previous?: string | null; results?: T[] }
    return {
      count: p.count ?? p.results?.length ?? 0,
      next: p.next ?? null,
      previous: p.previous ?? null,
      results: Array.isArray(p.results) ? p.results : [],
    }
  }
  return { count: 0, next: null, previous: null, results: [] }
}

// ─── Player CRUD ──────────────────────────────────────────────────────────────

export async function listPlayers(params?: PlayerListParams): Promise<PlayerListResponse> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.LIST, { params })
  return unwrapPaginated(res.data)
}

export async function getPlayer(slug: string): Promise<PlayerDetail> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.GET(slug))
  return unwrapData(res.data)
}

export async function searchPlayers(q: string): Promise<Player[]> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.SEARCH, { params: { q } })
  return unwrapList(res.data)
}

export async function createPlayer(data: PlayerCreate): Promise<Player> {
  const res = await apiClient.post(API_ROUTES.PLAYERS.CREATE, data)
  return unwrapData(res.data)
}

export async function updatePlayer(slug: string, data: PlayerUpdate): Promise<Player> {
  const res = await apiClient.patch(API_ROUTES.PLAYERS.UPDATE(slug), data)
  return unwrapData(res.data)
}

export async function registerPlayer(slug: string, data: PlayerRegisterPayload): Promise<unknown> {
  const res = await apiClient.post(API_ROUTES.PLAYERS.REGISTER(slug), data)
  return unwrapData(res.data)
}

export async function getPlayerMe(): Promise<PlayerDetail> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.ME)
  return unwrapData(res.data)
}

export async function getPlayerOnboardingStatus(): Promise<PlayerOnboardingStatus> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.ME_ONBOARDING_STATUS)
  return unwrapData(res.data)
}

export async function completeOnboardingStep(step: string): Promise<PlayerOnboardingStatus> {
  const res = await apiClient.patch(API_ROUTES.PLAYERS.ME_ONBOARDING_COMPLETE_STEP, { step })
  return unwrapData(res.data)
}

export async function updatePlayerMe(data: PlayerUpdate): Promise<Player> {
  const res = await apiClient.patch(API_ROUTES.PLAYERS.ME, data)
  return unwrapData(res.data)
}

export async function uploadPlayerAvatar(file: File, slug?: string): Promise<Player> {
  const formData = new FormData()
  formData.append('avatar', file)
  const url = slug ? API_ROUTES.PLAYERS.AVATAR(slug) : API_ROUTES.PLAYERS.ME_AVATAR
  const res = await apiClient.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return unwrapData(res.data)
}

// ─── Registration Requests ────────────────────────────────────────────────────

export async function listMyRegistrationRequests(): Promise<PlayerRegistrationRequest[]> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.ME_REGISTRATION_REQUESTS)
  return unwrapList(res.data)
}

export async function submitRegistrationRequest(
  data: PlayerRegistrationRequestCreate
): Promise<PlayerRegistrationRequest> {
  const res = await apiClient.post(API_ROUTES.PLAYERS.ME_REGISTRATION_REQUESTS, data)
  return unwrapData(res.data)
}

export async function listClubPlayerRegistrationRequests(): Promise<PlayerRegistrationRequest[]> {
  const res = await apiClient.get(API_ROUTES.CLUBS.PLAYER_REGISTRATION_REQUESTS)
  return unwrapList(res.data)
}

export async function reviewClubPlayerRegistrationRequest(
  requestId: string,
  data: PlayerRegistrationRequestReview
): Promise<PlayerRegistrationRequest> {
  const res = await apiClient.patch(
    API_ROUTES.CLUBS.PLAYER_REGISTRATION_REQUEST_REVIEW(requestId),
    data
  )
  return unwrapData(res.data)
}

// ─── Player Documents ─────────────────────────────────────────────────────────

export async function listPlayerDocuments(slug: string): Promise<PlayerDocument[]> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.DOCUMENTS(slug))
  return unwrapList(res.data)
}

export async function getPlayerDocument(slug: string, documentId: string): Promise<PlayerDocument> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.DOCUMENT_DETAIL(slug, documentId))
  return unwrapData(res.data)
}

export async function createPlayerDocument(
  slug: string,
  data: PlayerDocumentCreate
): Promise<PlayerDocument> {
  const formData = new FormData()
  formData.append('title', data.title)
  formData.append('category', data.category)
  if (data.description) formData.append('description', data.description)
  if (data.document) formData.append('document', data.document)
  else if (data.asset) formData.append('asset', data.asset)
  if (data.valid_from) formData.append('valid_from', data.valid_from)
  if (data.valid_until) formData.append('valid_until', data.valid_until)
  if (data.club) formData.append('club', data.club)
  if (data.is_private !== undefined) formData.append('is_private', String(data.is_private))
  const res = await apiClient.post(API_ROUTES.PLAYERS.DOCUMENTS(slug), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return unwrapData(res.data)
}

export async function updatePlayerDocument(
  slug: string,
  documentId: string,
  data: PlayerDocumentUpdate
): Promise<PlayerDocument> {
  const res = await apiClient.patch(API_ROUTES.PLAYERS.DOCUMENT_DETAIL(slug, documentId), data)
  return unwrapData(res.data)
}

export async function deletePlayerDocument(slug: string, documentId: string): Promise<void> {
  await apiClient.delete(API_ROUTES.PLAYERS.DOCUMENT_DETAIL(slug, documentId))
}

export async function verifyPlayerDocument(slug: string, documentId: string): Promise<PlayerDocument> {
  const res = await apiClient.post(API_ROUTES.PLAYERS.DOCUMENT_VERIFY(slug, documentId))
  return unwrapData(res.data)
}

// ─── Player Videos ────────────────────────────────────────────────────────────

export async function listPlayerVideos(slug: string): Promise<PlayerVideo[]> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.VIDEOS(slug))
  return unwrapList(res.data)
}

export async function getPlayerVideo(slug: string, videoId: string): Promise<PlayerVideo> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.VIDEO_DETAIL(slug, videoId))
  return unwrapData(res.data)
}

export async function createPlayerVideo(slug: string, data: PlayerVideoCreate): Promise<PlayerVideo> {
  if (data.video) {
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('video_type', data.video_type)
    if (data.description) formData.append('description', data.description)
    if (data.thumbnail_url) formData.append('thumbnail_url', data.thumbnail_url)
    formData.append('video', data.video)
    if (data.match) formData.append('match', data.match)
    if (data.is_featured !== undefined) formData.append('is_featured', String(data.is_featured))
    if (data.order !== undefined) formData.append('order', String(data.order))
    const res = await apiClient.post(API_ROUTES.PLAYERS.VIDEOS(slug), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return unwrapData(res.data)
  }
  const res = await apiClient.post(API_ROUTES.PLAYERS.VIDEOS(slug), data)
  return unwrapData(res.data)
}

export async function updatePlayerVideo(
  slug: string,
  videoId: string,
  data: PlayerVideoUpdate
): Promise<PlayerVideo> {
  const res = await apiClient.patch(API_ROUTES.PLAYERS.VIDEO_DETAIL(slug, videoId), data)
  return unwrapData(res.data)
}

export async function deletePlayerVideo(slug: string, videoId: string): Promise<void> {
  await apiClient.delete(API_ROUTES.PLAYERS.VIDEO_DETAIL(slug, videoId))
}

export async function publishPlayerVideo(slug: string, videoId: string): Promise<PlayerVideo> {
  const res = await apiClient.post(API_ROUTES.PLAYERS.VIDEO_PUBLISH(slug, videoId))
  return unwrapData(res.data)
}

// ─── Player Achievements ──────────────────────────────────────────────────────

export async function listPlayerAchievements(slug: string): Promise<PlayerAchievement[]> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.ACHIEVEMENTS(slug))
  return unwrapList(res.data)
}

export async function getPlayerAchievement(slug: string, achievementId: string): Promise<PlayerAchievement> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.ACHIEVEMENT_DETAIL(slug, achievementId))
  return unwrapData(res.data)
}

export async function createPlayerAchievement(
  slug: string,
  data: PlayerAchievementCreate
): Promise<PlayerAchievement> {
  if (data.trophy_image || data.certificate || data.trophy_asset || data.certificate_asset) {
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('achievement_type', data.achievement_type)
    formData.append('level', data.level)
    if (data.description) formData.append('description', data.description)
    if (data.date_achieved) formData.append('date_achieved', data.date_achieved)
    if (data.season) formData.append('season', data.season)
    if (data.competition) formData.append('competition', data.competition)
    if (data.club) formData.append('club', data.club)
    if (data.trophy_image) formData.append('trophy_image', data.trophy_image)
    if (data.trophy_asset) formData.append('trophy_asset', data.trophy_asset)
    if (data.certificate) formData.append('certificate', data.certificate)
    if (data.certificate_asset) formData.append('certificate_asset', data.certificate_asset)
    if (data.trophy_image_url) formData.append('trophy_image_url', data.trophy_image_url)
    if (data.certificate_url) formData.append('certificate_url', data.certificate_url)
    if (data.stats_snapshot) formData.append('stats_snapshot', JSON.stringify(data.stats_snapshot))
    const res = await apiClient.post(API_ROUTES.PLAYERS.ACHIEVEMENTS(slug), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return unwrapData(res.data)
  }
  const res = await apiClient.post(API_ROUTES.PLAYERS.ACHIEVEMENTS(slug), data)
  return unwrapData(res.data)
}

export async function updatePlayerAchievement(
  slug: string,
  achievementId: string,
  data: PlayerAchievementUpdate
): Promise<PlayerAchievement> {
  const res = await apiClient.patch(API_ROUTES.PLAYERS.ACHIEVEMENT_DETAIL(slug, achievementId), data)
  return unwrapData(res.data)
}

export async function deletePlayerAchievement(slug: string, achievementId: string): Promise<void> {
  await apiClient.delete(API_ROUTES.PLAYERS.ACHIEVEMENT_DETAIL(slug, achievementId))
}

export async function verifyPlayerAchievement(slug: string, achievementId: string): Promise<PlayerAchievement> {
  const res = await apiClient.post(API_ROUTES.PLAYERS.ACHIEVEMENT_VERIFY(slug, achievementId))
  return unwrapData(res.data)
}

// ─── Phase 2: Career & Statistics ────────────────────────────────────────────

export async function getPlayerCareer(slug: string): Promise<PlayerCareer[]> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.CAREER(slug))
  return unwrapList(res.data)
}

export async function getPlayerSeasonStatistics(
  slug: string,
  season?: string
): Promise<PlayerSeasonStatistics[]> {
  const url = season
    ? API_ROUTES.PLAYERS.STATISTICS_SEASON(slug, season)
    : API_ROUTES.PLAYERS.STATISTICS(slug)
  const res = await apiClient.get(url)
  return unwrapList(res.data)
}

export async function getPlayerFootballProfile(slug: string): Promise<PlayerFootballProfile> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.FOOTBALL_PROFILE(slug))
  return unwrapData(res.data)
}

export async function updatePlayerFootballProfile(
  slug: string,
  data: Partial<PlayerFootballProfile>
): Promise<PlayerFootballProfile> {
  const res = await apiClient.patch(API_ROUTES.PLAYERS.FOOTBALL_PROFILE(slug), data)
  return unwrapData(res.data)
}

// ─── Phase 1: Contact ─────────────────────────────────────────────────────────

export async function getPlayerContact(slug: string): Promise<PlayerContact> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.CONTACT(slug))
  return unwrapData(res.data)
}

export async function updatePlayerContact(
  slug: string,
  data: PlayerContactUpdate
): Promise<PlayerContact> {
  const res = await apiClient.patch(API_ROUTES.PLAYERS.CONTACT(slug), data)
  return unwrapData(res.data)
}

export async function getPlayerPrivacySettings(slug: string): Promise<PlayerPrivacySettings> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.PRIVACY(slug))
  return unwrapData(res.data)
}

export async function updatePlayerPrivacySettings(
  slug: string,
  data: PlayerPrivacySettingsUpdate
): Promise<PlayerPrivacySettings> {
  const res = await apiClient.patch(API_ROUTES.PLAYERS.PRIVACY(slug), data)
  return unwrapData(res.data)
}

export async function listPlayerEmergencyContacts(slug: string): Promise<EmergencyContact[]> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.EMERGENCY_CONTACTS(slug))
  return unwrapList(res.data)
}

export async function createPlayerEmergencyContact(
  slug: string,
  data: EmergencyContactCreate
): Promise<EmergencyContact> {
  const res = await apiClient.post(API_ROUTES.PLAYERS.EMERGENCY_CONTACTS(slug), data)
  return unwrapData(res.data)
}

export async function deletePlayerEmergencyContact(
  slug: string,
  contactId: string
): Promise<void> {
  await apiClient.delete(`${API_ROUTES.PLAYERS.EMERGENCY_CONTACTS(slug)}${contactId}/`)
}

// ─── Phase 1: Identity Documents ─────────────────────────────────────────────

export async function listPlayerIdentityDocuments(slug: string): Promise<PlayerIdentityDocument[]> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.IDENTITY_DOCUMENTS(slug))
  return unwrapList(res.data)
}

export async function createPlayerIdentityDocument(
  slug: string,
  data: PlayerIdentityDocumentCreate
): Promise<PlayerIdentityDocument> {
  const formData = new FormData()
  formData.append('document_type', data.document_type)
  if (data.document_number) formData.append('document_number', data.document_number)
  if (data.issuing_country) formData.append('issuing_country', data.issuing_country)
  if (data.issuing_authority) formData.append('issuing_authority', data.issuing_authority)
  if (data.issue_date) formData.append('issue_date', data.issue_date)
  if (data.expiry_date) formData.append('expiry_date', data.expiry_date)
  if (data.document_front) formData.append('document_front', data.document_front)
  if (data.document_back) formData.append('document_back', data.document_back)
  if (data.asset) formData.append('asset', data.asset)
  const res = await apiClient.post(API_ROUTES.PLAYERS.IDENTITY_DOCUMENTS(slug), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return unwrapData(res.data)
}

export async function updatePlayerIdentityDocument(
  slug: string,
  docId: string,
  data: PlayerIdentityDocumentUpdate
): Promise<PlayerIdentityDocument> {
  const res = await apiClient.patch(API_ROUTES.PLAYERS.IDENTITY_DOCUMENT_DETAIL(slug, docId), data)
  return unwrapData(res.data)
}

export async function deletePlayerIdentityDocument(slug: string, docId: string): Promise<void> {
  await apiClient.delete(API_ROUTES.PLAYERS.IDENTITY_DOCUMENT_DETAIL(slug, docId))
}

export async function verifyPlayerIdentityDocument(
  slug: string,
  docId: string
): Promise<PlayerIdentityDocument> {
  const res = await apiClient.post(API_ROUTES.PLAYERS.IDENTITY_DOCUMENT_VERIFY(slug, docId))
  return unwrapData(res.data)
}

// ─── Phase 3: Contracts (UUID-based) ──────────────────────────────────────────

export async function listPlayerContracts(playerId: string): Promise<PlayerContract[]> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.CONTRACTS(playerId))
  return unwrapList(res.data)
}

export async function getContractDetail(playerId: string, contractId: string): Promise<PlayerContract> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.CONTRACT_DETAIL(playerId, contractId))
  return unwrapData(res.data)
}

export async function createPlayerContract(
  playerId: string,
  data: PlayerContractCreate
): Promise<PlayerContract> {
  const res = await apiClient.post(API_ROUTES.PLAYERS.CONTRACTS(playerId), data)
  return unwrapData(res.data)
}

export async function updatePlayerContract(
  playerId: string,
  contractId: string,
  data: PlayerContractUpdate
): Promise<PlayerContract> {
  const res = await apiClient.patch(API_ROUTES.PLAYERS.CONTRACT_DETAIL(playerId, contractId), data)
  return unwrapData(res.data)
}

export async function deletePlayerContract(playerId: string, contractId: string): Promise<void> {
  await apiClient.delete(API_ROUTES.PLAYERS.CONTRACT_DETAIL(playerId, contractId))
}

export async function signPlayerContract(
  playerId: string,
  contractId: string,
  data: PlayerContractSign
): Promise<PlayerContract> {
  const res = await apiClient.patch(API_ROUTES.PLAYERS.CONTRACT_SIGN(playerId, contractId), data)
  return unwrapData(res.data)
}

export async function renewPlayerContract(
  playerId: string,
  contractId: string,
  data: PlayerContractRenew
): Promise<PlayerContract> {
  const res = await apiClient.post(API_ROUTES.PLAYERS.CONTRACT_RENEW(playerId, contractId), data)
  return unwrapData(res.data)
}

export async function terminatePlayerContract(
  playerId: string,
  contractId: string,
  data: PlayerContractTerminate
): Promise<PlayerContract> {
  const res = await apiClient.patch(
    API_ROUTES.PLAYERS.CONTRACT_TERMINATE(playerId, contractId),
    data
  )
  return unwrapData(res.data)
}

// ─── Phase 3: Agents (UUID-based) ─────────────────────────────────────────────

export async function listAgents(): Promise<Agent[]> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.AGENTS_LIST)
  return unwrapList(res.data)
}

export async function listPlayerAgentRelationships(
  playerId: string
): Promise<PlayerAgentRelationship[]> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.AGENTS(playerId))
  return unwrapList(res.data)
}

export async function createAgentRelationship(
  playerId: string,
  data: PlayerAgentRelationshipCreate
): Promise<PlayerAgentRelationship> {
  const res = await apiClient.post(API_ROUTES.PLAYERS.AGENTS(playerId), data)
  return unwrapData(res.data)
}

export async function updateAgentRelationship(
  playerId: string,
  relId: string,
  data: Partial<PlayerAgentRelationshipCreate>
): Promise<PlayerAgentRelationship> {
  const res = await apiClient.patch(API_ROUTES.PLAYERS.AGENT_DETAIL(playerId, relId), data)
  return unwrapData(res.data)
}

export async function deleteAgentRelationship(playerId: string, relId: string): Promise<void> {
  await apiClient.delete(API_ROUTES.PLAYERS.AGENT_DETAIL(playerId, relId))
}

// ─── Phase 3: Training History (UUID-based) ───────────────────────────────────

export async function listPlayerTrainingHistory(
  playerId: string
): Promise<PlayerTrainingHistory[]> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.TRAINING_HISTORY(playerId))
  return unwrapList(res.data)
}

export async function createPlayerTrainingEntry(
  playerId: string,
  data: PlayerTrainingHistoryCreate
): Promise<PlayerTrainingHistory> {
  const res = await apiClient.post(API_ROUTES.PLAYERS.TRAINING_HISTORY(playerId), data)
  return unwrapData(res.data)
}

export async function updatePlayerTrainingEntry(
  playerId: string,
  entryId: string,
  data: Partial<PlayerTrainingHistoryCreate>
): Promise<PlayerTrainingHistory> {
  const res = await apiClient.patch(
    API_ROUTES.PLAYERS.TRAINING_HISTORY_DETAIL(playerId, entryId),
    data
  )
  return unwrapData(res.data)
}

export async function deletePlayerTrainingEntry(playerId: string, entryId: string): Promise<void> {
  await apiClient.delete(API_ROUTES.PLAYERS.TRAINING_HISTORY_DETAIL(playerId, entryId))
}

export async function verifyPlayerTrainingEntry(
  playerId: string,
  entryId: string
): Promise<PlayerTrainingHistory> {
  const res = await apiClient.patch(
    API_ROUTES.PLAYERS.TRAINING_HISTORY_VERIFY(playerId, entryId),
    {}
  )
  return unwrapData(res.data)
}

export async function getPlayerTrainingCompensation(
  playerId: string
): Promise<TrainingCompensationData> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.TRAINING_COMPENSATION(playerId))
  return unwrapData(res.data)
}

// ─── Phase 4: Medical (UUID-based) ────────────────────────────────────────────

export async function getPlayerMedicalProfile(
  playerId: string
): Promise<PlayerMedicalProfile | null> {
  try {
    const res = await apiClient.get<PlayerMedicalProfile>(API_ROUTES.PLAYERS.MEDICAL(playerId))
    return unwrapData(res.data)
  } catch (err: any) {
    if (err?.response?.status === 404) return null
    throw err
  }
}

export async function updatePlayerMedicalProfile(
  playerId: string,
  data: PlayerMedicalProfileUpdate
): Promise<PlayerMedicalProfile> {
  const res = await apiClient.patch(API_ROUTES.PLAYERS.MEDICAL(playerId), data)
  return unwrapData(res.data)
}

export async function getPlayerMedicalHistory(playerId: string): Promise<PlayerMedicalHistory> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.MEDICAL_HISTORY(playerId))
  return unwrapData(res.data)
}

export async function listPlayerMedicalDocuments(playerId: string): Promise<MedicalDocument[]> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.MEDICAL_DOCUMENTS(playerId))
  return unwrapList(res.data)
}

export async function createPlayerMedicalDocument(
  playerId: string,
  data: MedicalDocumentCreate
): Promise<MedicalDocument> {
  const formData = new FormData()
  formData.append('document_type', data.document_type)
  formData.append('title', data.title)
  formData.append('issued_at', data.issued_at)
  formData.append('file', data.file)
  if (data.description) formData.append('description', data.description)
  if (data.expires_at) formData.append('expires_at', data.expires_at)
  if (data.is_confidential !== undefined)
    formData.append('is_confidential', String(data.is_confidential))
  const res = await apiClient.post(API_ROUTES.PLAYERS.MEDICAL_DOCUMENTS(playerId), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return unwrapData(res.data)
}

export async function verifyMedicalDocument(
  playerId: string,
  docId: string
): Promise<MedicalDocument> {
  const res = await apiClient.patch(
    API_ROUTES.PLAYERS.MEDICAL_DOCUMENT_VERIFY(playerId, docId),
    {}
  )
  return unwrapData(res.data)
}

export async function rejectMedicalDocument(
  playerId: string,
  docId: string,
  data: MedicalDocumentReject
): Promise<MedicalDocument> {
  const res = await apiClient.patch(
    API_ROUTES.PLAYERS.MEDICAL_DOCUMENT_REJECT(playerId, docId),
    data
  )
  return unwrapData(res.data)
}
