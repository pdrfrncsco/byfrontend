import apiClient from '@/lib/api-client'
import { API_ROUTES } from '@/constants/routes'
import type { ApiResponse } from '@/types'
import type {
  Club,
  ClubMember,
  ClubKpis,
  ClubSquadMember,
  ClubStaffMember,
  ClubDocument,
  ClubSponsor,
  Transfer,
  ClubListParams,
  ClubCreateData,
  ClubUpdateData,
  ClubMemberCreateData,
  ClubMemberUpdateData,
  ClubDocumentCreateData,
  ClubSponsorCreateData,
  TransferListParams,
  TransferCreateData,
  PaginatedResponse,
} from '../types'

type Envelope<T> = ApiResponse<T> | T

type PaginatedEnvelope<T> =
  | ApiResponse<PaginatedResponse<T>>
  | PaginatedResponse<T>
  | { count?: number; next?: string | null; previous?: string | null; results: T[] }
  | T[]

function hasData<T>(payload: unknown): payload is ApiResponse<T> {
  return !!payload && typeof payload === 'object' && 'data' in payload && 'success' in payload
}

function unwrapData<T>(payload: Envelope<T>): T {
  return hasData<T>(payload) ? payload.data : payload
}

function unwrapList<T>(payload: PaginatedEnvelope<T>): T[] {
  const data = hasData<PaginatedResponse<T>>(payload) ? payload.data : payload
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object' && 'results' in data) {
    return Array.isArray((data as { results?: T[] }).results) ? (data as { results: T[] }).results : []
  }
  return []
}

function unwrapPaginated<T>(payload: PaginatedEnvelope<T>): PaginatedResponse<T> {
  const data = hasData<PaginatedResponse<T>>(payload) ? payload.data : payload
  if (Array.isArray(data)) {
    return {
      count: data.length,
      next: null,
      previous: null,
      results: data,
    }
  }

  if (data && typeof data === 'object' && 'results' in data) {
    const results = Array.isArray((data as { results?: T[] }).results) ? (data as { results: T[] }).results : []
    return {
      count: typeof (data as { count?: number }).count === 'number' ? (data as { count: number }).count : results.length,
      next: (data as { next?: string | null }).next ?? null,
      previous: (data as { previous?: string | null }).previous ?? null,
      results,
    }
  }

  return {
    count: 0,
    next: null,
    previous: null,
    results: [],
  }
}

function buildClubListParams(params?: ClubListParams) {
  if (!params) return undefined
  const { tenant, organization, ...rest } = params

  return {
    ...rest,
    ...(organization ? { organization } : {}),
    ...(tenant ? { organization: tenant } : {}),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public Club Endpoints
// ─────────────────────────────────────────────────────────────────────────────

export async function listClubs(params?: ClubListParams): Promise<PaginatedResponse<Club>> {
  const res = await apiClient.get<ApiResponse<PaginatedResponse<Club>>>(API_ROUTES.CLUBS.PUBLIC.LIST, {
    params: buildClubListParams(params),
  })
  return unwrapPaginated(res.data)
}

export async function getClub(slug: string): Promise<Club> {
  const res = await apiClient.get<Envelope<Club>>(API_ROUTES.CLUBS.PUBLIC.GET(slug))
  return unwrapData(res.data)
}

export async function getClubKpis(slug: string): Promise<ClubKpis> {
  const res = await apiClient.get<Envelope<ClubKpis>>(API_ROUTES.CLUBS.PUBLIC.KPIS(slug))
  return unwrapData(res.data)
}

export async function getClubSquad(slug: string): Promise<ClubSquadMember[]> {
  const res = await apiClient.get<PaginatedEnvelope<ClubSquadMember>>(API_ROUTES.CLUBS.PUBLIC.SQUAD(slug))
  return unwrapList(res.data)
}

export async function getClubStaff(slug: string): Promise<ClubStaffMember[]> {
  const res = await apiClient.get<PaginatedEnvelope<ClubStaffMember>>(API_ROUTES.CLUBS.PUBLIC.STAFF(slug))
  return unwrapList(res.data)
}

export async function getClubPublicDocuments(slug: string): Promise<ClubDocument[]> {
  const res = await apiClient.get<PaginatedEnvelope<ClubDocument>>(API_ROUTES.CLUBS.PUBLIC.DOCUMENTS(slug))
  return unwrapList(res.data)
}

export async function getClubPublicSponsors(slug: string): Promise<ClubSponsor[]> {
  const res = await apiClient.get<PaginatedEnvelope<ClubSponsor>>(API_ROUTES.CLUBS.PUBLIC.SPONSORS(slug))
  return unwrapList(res.data)
}

// ─────────────────────────────────────────────────────────────────────────────
// Authenticated Club Management
// ─────────────────────────────────────────────────────────────────────────────

export async function getClubMe(): Promise<Club> {
  const res = await apiClient.get<Envelope<Club>>(API_ROUTES.CLUBS.ME)
  return unwrapData(res.data)
}

export async function createClub(data: ClubCreateData): Promise<Club> {
  const res = await apiClient.post<Envelope<Club>>(API_ROUTES.CLUBS.CREATE, data)
  return unwrapData(res.data)
}

export async function updateClub(data: ClubUpdateData): Promise<Club> {
  const res = await apiClient.patch<Envelope<Club>>(API_ROUTES.CLUBS.ME, data)
  return unwrapData(res.data)
}

export async function uploadClubLogo(file: File): Promise<Club> {
  const formData = new FormData()
  formData.append('logo', file)
  const res = await apiClient.post<Envelope<Club>>(API_ROUTES.CLUBS.LOGO, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return unwrapData(res.data)
}

export async function activateClub(slug: string): Promise<Club> {
  const res = await apiClient.post<Envelope<Club>>(API_ROUTES.CLUBS.ACTIVATE(slug))
  return unwrapData(res.data)
}

export async function suspendClub(slug: string): Promise<Club> {
  const res = await apiClient.post<Envelope<Club>>(API_ROUTES.CLUBS.SUSPEND(slug))
  return unwrapData(res.data)
}

// ─────────────────────────────────────────────────────────────────────────────
// Member Management
// ─────────────────────────────────────────────────────────────────────────────

export async function listClubMembers(slug: string): Promise<ClubMember[]> {
  const res = await apiClient.get<PaginatedEnvelope<ClubMember>>(API_ROUTES.CLUBS.MEMBERS(slug))
  return unwrapList(res.data)
}

export async function addClubMember(slug: string, data: ClubMemberCreateData): Promise<ClubMember> {
  const res = await apiClient.post<Envelope<ClubMember>>(API_ROUTES.CLUBS.MEMBERS(slug), data)
  return unwrapData(res.data)
}

export async function updateClubMember(slug: string, memberId: string, data: ClubMemberUpdateData): Promise<ClubMember> {
  const res = await apiClient.patch<Envelope<ClubMember>>(API_ROUTES.CLUBS.MEMBER_DETAIL(slug, memberId), data)
  return unwrapData(res.data)
}

export async function removeClubMember(slug: string, memberId: string): Promise<void> {
  await apiClient.delete(API_ROUTES.CLUBS.MEMBER_DETAIL(slug, memberId))
}

// ─────────────────────────────────────────────────────────────────────────────
// Document Management
// ─────────────────────────────────────────────────────────────────────────────

export async function listClubDocuments(slug: string): Promise<ClubDocument[]> {
  const res = await apiClient.get<PaginatedEnvelope<ClubDocument>>(API_ROUTES.CLUBS.DOCUMENTS(slug))
  return unwrapList(res.data)
}

export async function createClubDocument(slug: string, data: ClubDocumentCreateData): Promise<ClubDocument> {
  const formData = new FormData()
  formData.append('title', data.title)
  formData.append('category', data.category)
  if (data.description) formData.append('description', data.description)
  formData.append('document', data.document)
  if (data.is_public !== undefined) formData.append('is_public', String(data.is_public))
  if (data.valid_until) formData.append('valid_until', data.valid_until)

  const res = await apiClient.post<Envelope<ClubDocument>>(API_ROUTES.CLUBS.DOCUMENTS(slug), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return unwrapData(res.data)
}

export async function deleteClubDocument(slug: string, documentId: string): Promise<void> {
  await apiClient.delete(API_ROUTES.CLUBS.DOCUMENT_DETAIL(slug, documentId))
}

// ─────────────────────────────────────────────────────────────────────────────
// Sponsor Management
// ─────────────────────────────────────────────────────────────────────────────

export async function listClubSponsors(slug: string): Promise<ClubSponsor[]> {
  const res = await apiClient.get<PaginatedEnvelope<ClubSponsor>>(API_ROUTES.CLUBS.SPONSORS(slug))
  return unwrapList(res.data)
}

export async function createClubSponsor(slug: string, data: ClubSponsorCreateData): Promise<ClubSponsor> {
  const formData = new FormData()
  formData.append('name', data.name)
  if (data.sponsor_type) formData.append('sponsor_type', data.sponsor_type)
  if (data.description) formData.append('description', data.description)
  if (data.website) formData.append('website', data.website)
  if (data.logo) formData.append('logo', data.logo)
  if (data.is_active !== undefined) formData.append('is_active', String(data.is_active))
  if (data.sort_order !== undefined) formData.append('sort_order', String(data.sort_order))

  const res = await apiClient.post<Envelope<ClubSponsor>>(API_ROUTES.CLUBS.SPONSORS(slug), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return unwrapData(res.data)
}

export async function deleteClubSponsor(slug: string, sponsorId: string): Promise<void> {
  await apiClient.delete(API_ROUTES.CLUBS.SPONSOR_DETAIL(slug, sponsorId))
}

// ─────────────────────────────────────────────────────────────────────────────
// Transfer Management
// ─────────────────────────────────────────────────────────────────────────────

export async function listTransfers(params?: TransferListParams): Promise<PaginatedResponse<Transfer>> {
  const res = await apiClient.get<{ results: Transfer[] } | ApiResponse<PaginatedResponse<Transfer>> | PaginatedResponse<Transfer>>(
    API_ROUTES.CLUBS.TRANSFERS,
    { params },
  )
  return unwrapPaginated(res.data as PaginatedEnvelope<Transfer>)
}

export async function getTransfer(id: string): Promise<Transfer> {
  const res = await apiClient.get<Envelope<Transfer>>(API_ROUTES.CLUBS.TRANSFER_DETAIL(id))
  return unwrapData(res.data)
}

export async function createTransfer(data: TransferCreateData): Promise<Transfer> {
  const res = await apiClient.post<Envelope<Transfer>>(API_ROUTES.CLUBS.TRANSFERS, data)
  return unwrapData(res.data)
}

export async function approveTransfer(id: string): Promise<Transfer> {
  const res = await apiClient.post<Envelope<Transfer>>(API_ROUTES.CLUBS.TRANSFER_APPROVE(id))
  return unwrapData(res.data)
}

export async function rejectTransfer(id: string, reason?: string): Promise<Transfer> {
  const res = await apiClient.post<Envelope<Transfer>>(API_ROUTES.CLUBS.TRANSFER_REJECT(id), { reason })
  return unwrapData(res.data)
}
