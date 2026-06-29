import apiClient from '@/lib/api-client'
import { API_ROUTES } from '@/constants/routes'
import type { Club, ClubMember } from '../types'

export async function listClubs(params?: Record<string, any>) {
  // Use public clubs endpoint (supports tenant filter & search)
  const res = await apiClient.get(API_ROUTES.CLUBS.PUBLIC.LIST, { params })
  return res.data
}

export async function getClub(idOrSlug: string) {
  // Public detail uses slug; admin endpoints may accept id/slug as identifier.
  const res = await apiClient.get(API_ROUTES.CLUBS.PUBLIC.GET(idOrSlug))
  return res.data
}

export async function createClub(payload: Partial<Club>) {
  const res = await apiClient.post(API_ROUTES.CLUBS.CREATE, payload)
  return res.data
}

export async function updateClub(id: string, payload: Partial<Club>) {
  const res = await apiClient.patch(API_ROUTES.CLUBS.UPDATE(id), payload)
  return res.data
}

export async function uploadClubLogo(id: string, file: File) {
  const form = new FormData()
  form.append('logo', file)
  const res = await apiClient.post(`${API_ROUTES.CLUBS.UPDATE(id)}/logo/`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

// Members
export async function listClubMembers(clubId: string) {
  const res = await apiClient.get(`${API_ROUTES.CLUBS.GET(clubId)}/members/`)
  return res.data
}

export async function addClubMember(clubId: string, payload: Partial<ClubMember>) {
  const res = await apiClient.post(`${API_ROUTES.CLUBS.GET(clubId)}/members/`, payload)
  return res.data
}

export async function updateClubMember(clubId: string, memberId: string, payload: Partial<ClubMember>) {
  const res = await apiClient.patch(`${API_ROUTES.CLUBS.GET(clubId)}/members/${memberId}/`, payload)
  return res.data
}

export async function removeClubMember(clubId: string, memberId: string) {
  const res = await apiClient.delete(`${API_ROUTES.CLUBS.GET(clubId)}/members/${memberId}/`)
  return res.data
}

