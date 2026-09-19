/**
 * BOLAYETU — Player Category API Service
 */

import apiClient from '@/lib/api-client'
import type { ApiResponse } from '@/types'
import type {
  PlayerCategory,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../types/player-category.types'

function extractCategories(payload: any): PlayerCategory[] {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  if (payload.data && Array.isArray(payload.data)) return payload.data
  if (payload.data?.results && Array.isArray(payload.data.results)) return payload.data.results
  if (payload.results && Array.isArray(payload.results)) return payload.results
  return []
}

export const playerCategoryApi = {
  /**
   * Get official federation categories.
   */
  getFederationCategories: async (orgIdOrSlug: string = 'me'): Promise<PlayerCategory[]> => {
    try {
      const res = await apiClient.get<ApiResponse<PlayerCategory[]>>(
        `/organizations/${orgIdOrSlug}/categories/`
      )
      const list = extractCategories(res.data)
      if (list.length > 0) return list
    } catch (err) {
      console.warn('Failed to fetch from /organizations/' + orgIdOrSlug + '/categories/:', err)
    }

    // Fallback to /organizations/categories/ in case 'me' does not have org context
    try {
      const fallbackRes = await apiClient.get<ApiResponse<PlayerCategory[]>>(
        `/organizations/categories/`
      )
      return extractCategories(fallbackRes.data)
    } catch {
      return []
    }
  },

  /**
   * Create an official federation category (org admin).
   */
  createFederationCategory: async (
    orgIdOrSlug: string,
    data: CreateCategoryDto
  ): Promise<PlayerCategory> => {
    const res = await apiClient.post<ApiResponse<PlayerCategory>>(
      `/organizations/${orgIdOrSlug}/categories/`,
      data
    )
    return res.data?.data || (res.data as any)
  },

  /**
   * Get categories available to a club (federation categories + custom club categories).
   */
  getClubCategories: async (clubIdOrSlug: string = 'me'): Promise<PlayerCategory[]> => {
    try {
      const res = await apiClient.get<ApiResponse<PlayerCategory[]>>(
        `/clubs/${clubIdOrSlug}/categories/`
      )
      return extractCategories(res.data)
    } catch (err) {
      console.warn('Failed to fetch club categories:', err)
      return []
    }
  },

  /**
   * Create a custom category for a club.
   */
  createClubCategory: async (
    clubIdOrSlug: string,
    data: CreateCategoryDto
  ): Promise<PlayerCategory> => {
    const res = await apiClient.post<ApiResponse<PlayerCategory>>(
      `/clubs/${clubIdOrSlug}/categories/`,
      data
    )
    return res.data.data
  },

  /**
   * Update a custom category.
   */
  updateClubCategory: async (
    clubIdOrSlug: string,
    categoryId: string,
    data: UpdateCategoryDto
  ): Promise<PlayerCategory> => {
    const res = await apiClient.patch<ApiResponse<PlayerCategory>>(
      `/clubs/${clubIdOrSlug}/categories/${categoryId}/`,
      data
    )
    return res.data.data
  },

  /**
   * Delete a custom category.
   */
  deleteClubCategory: async (
    clubIdOrSlug: string,
    categoryId: string
  ): Promise<void> => {
    await apiClient.delete(`/clubs/${clubIdOrSlug}/categories/${categoryId}/`)
  },
}
