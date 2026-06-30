import client from '@/lib/api-client'
import type { ApiResponse } from '@/types'
import type {
  Organization,
  PublicOrganization,
  OrganizationKpis,
  OrganizationHistoryEntry,
  OrganizationListParams,
  OrganizationUpdateData,
  OrganizationLaunchResult,
} from '../types'

export const organizationApi = {
  /**
   * Obtém a organização do usuário autenticado
   */
  async getMe(): Promise<Organization> {
    const response = await client.get<ApiResponse<Organization>>('/organizations/me/')
    return response.data.data
  },

  /**
   * Atualiza a organização do usuário autenticado
   */
  async updateMe(data: OrganizationUpdateData): Promise<Organization> {
    const response = await client.patch<ApiResponse<Organization>>('/organizations/me/', data)
    return response.data.data
  },

  /**
   * Upload do logo da organização
   */
  async uploadLogo(file: File): Promise<Organization> {
    const formData = new FormData()
    formData.append('logo', file)
    const response = await client.post<ApiResponse<Organization>>(
      '/organizations/me/logo/',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    return response.data.data
  },

  /**
   * Lança o portal da organização após o onboarding
   */
  async launchPortal(): Promise<OrganizationLaunchResult> {
    const response = await client.post<ApiResponse<OrganizationLaunchResult>>(
      '/organizations/me/launch/',
    )
    return response.data.data
  },

  /**
   * Lista organizações públicas
   */
  async listPublic(params?: OrganizationListParams): Promise<PublicOrganization[]> {
    const response = await client.get<ApiResponse<PublicOrganization[]>>('/organizations/public/', {
      params,
    })
    return response.data.data
  },

  /**
   * Obtém detalhes de uma organização pública por slug
   */
  async getPublicDetail(slug: string): Promise<Organization> {
    const response = await client.get<ApiResponse<Organization>>(`/organizations/public/${slug}/`)
    return response.data.data
  },

  /**
   * Subscreve o usuário a uma organização
   */
  async subscribe(
    slug: string,
  ): Promise<{ subscribed: boolean; organization_id: string }> {
    const response = await client.post<
      ApiResponse<{ subscribed: boolean; organization_id: string }>
    >(`/organizations/public/${slug}/subscribe/`)
    return response.data.data
  },

  /**
   * Cancela a subscrição do usuário a uma organização
   */
  async unsubscribe(
    slug: string,
  ): Promise<{ subscribed: boolean; organization_id: string }> {
    const response = await client.post<
      ApiResponse<{ subscribed: boolean; organization_id: string }>
    >(`/organizations/public/${slug}/unsubscribe/`)
    return response.data.data
  },

  /**
   * Obtém torneios de uma organização
   */
  async getTournaments(slug: string): Promise<unknown[]> {
    const response = await client.get<ApiResponse<unknown[]>>(
      `/organizations/public/${slug}/tournaments/`,
    )
    return response.data.data
  },

  /**
   * Obtém clubes de uma organização
   */
  async getClubs(slug: string): Promise<unknown[]> {
    const response = await client.get<ApiResponse<unknown[]>>(
      `/organizations/public/${slug}/clubs/`,
    )
    return response.data.data
  },

  /**
   * Obtém histórico de uma organização
   */
  async getHistory(slug: string): Promise<OrganizationHistoryEntry[]> {
    const response = await client.get<ApiResponse<OrganizationHistoryEntry[]>>(
      `/organizations/public/${slug}/history/`,
    )
    return response.data.data
  },

  /**
   * Obtém KPIs de uma organização
   */
  async getKpis(slug: string): Promise<OrganizationKpis> {
    const response = await client.get<ApiResponse<OrganizationKpis>>(
      `/organizations/public/${slug}/kpis/`,
    )
    return response.data.data
  },
}
