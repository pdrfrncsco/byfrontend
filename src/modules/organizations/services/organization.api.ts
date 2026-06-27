import client from '@/lib/api-client'
import type {
  Organization,
  PublicOrganization,
  OrganizationKpis,
  OrganizationHistoryEntry,
  OrganizationListParams,
  OrganizationUpdateData,
} from '../types'

export const organizationApi = {
  /**
   * Obtém a organização do usuário autenticado
   */
  async getMe(): Promise<Organization> {
    const response = await client.get<Organization>('/organizations/me/')
    return response.data
  },

  /**
   * Atualiza a organização do usuário autenticado
   */
  async updateMe(data: OrganizationUpdateData): Promise<Organization> {
    const response = await client.put<Organization>('/organizations/me/', data)
    return response.data
  },

  /**
   * Upload do logo da organização
   */
  async uploadLogo(file: File): Promise<Organization> {
    const formData = new FormData()
    formData.append('logo', file)
    const response = await client.post<Organization>('/organizations/me/logo/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  /**
   * Lista organizações públicas
   */
  async listPublic(params?: OrganizationListParams): Promise<PublicOrganization[]> {
    const response = await client.get<PublicOrganization[]>('/organizations/public/', { params })
    return response.data
  },

  /**
   * Obtém detalhes de uma organização pública por slug
   */
  async getPublicDetail(slug: string): Promise<Organization> {
    const response = await client.get<Organization>(`/organizations/public/${slug}/`)
    return response.data
  },

  /**
   * Subscreve o usuário a uma organização
   */
  async subscribe(slug: string): Promise<{ subscribed: boolean; organization_id: string }> {
    const response = await client.post<{ subscribed: boolean; organization_id: string }>(
      `/organizations/public/${slug}/subscribe/`
    )
    return response.data
  },

  /**
   * Cancela a subscrição do usuário a uma organização
   */
  async unsubscribe(slug: string): Promise<{ subscribed: boolean; organization_id: string }> {
    const response = await client.post<{ subscribed: boolean; organization_id: string }>(
      `/organizations/public/${slug}/unsubscribe/`
    )
    return response.data
  },

  /**
   * Obtém torneios de uma organização
   */
  async getTournaments(slug: string): Promise<unknown[]> {
    const response = await client.get(`/organizations/public/${slug}/tournaments/`)
    return response.data
  },

  /**
   * Obtém clubes de uma organização
   */
  async getClubs(slug: string): Promise<unknown[]> {
    const response = await client.get(`/organizations/public/${slug}/clubs/`)
    return response.data
  },

  /**
   * Obtém histórico de uma organização
   */
  async getHistory(slug: string): Promise<OrganizationHistoryEntry[]> {
    const response = await client.get<OrganizationHistoryEntry[]>(
      `/organizations/public/${slug}/history/`
    )
    return response.data
  },

  /**
   * Obtém KPIs de uma organização
   */
  async getKpis(slug: string): Promise<OrganizationKpis> {
    const response = await client.get<OrganizationKpis>(`/organizations/public/${slug}/kpis/`)
    return response.data
  },
}
