import client from '@/lib/api-client'
import { API_ROUTES } from '@/constants/routes'
import type { ApiResponse } from '@/types'
import type {
  Organization,
  PublicOrganization,
  OrganizationKpis,
  OrganizationHistoryEntry,
  OrganizationListParams,
  OrganizationUpdateData,
  OrganizationLaunchResult,
  OnboardingStatus,
} from '../types'

export const organizationApi = {
  async getMe(): Promise<Organization> {
    const response = await client.get<ApiResponse<Organization>>(API_ROUTES.ORGANIZATIONS.ME)
    return response.data.data
  },

  async updateMe(data: OrganizationUpdateData): Promise<Organization> {
    const response = await client.patch<ApiResponse<Organization>>(API_ROUTES.ORGANIZATIONS.ME, data)
    return response.data.data
  },

  async uploadLogo(file: File): Promise<Organization> {
    const formData = new FormData()
    formData.append('logo', file)
    const response = await client.post<ApiResponse<Organization>>(
      API_ROUTES.ORGANIZATIONS.LOGO,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    return response.data.data
  },

  async uploadBanner(file: File): Promise<Organization> {
    const formData = new FormData()
    formData.append('banner', file)
    const response = await client.post<ApiResponse<Organization>>(
      // new banner endpoint
      API_ROUTES.ORGANIZATIONS.BANNER,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    return response.data.data
  },

  async launchPortal(): Promise<OrganizationLaunchResult> {
    const response = await client.post<ApiResponse<OrganizationLaunchResult>>(
      API_ROUTES.ORGANIZATIONS.LAUNCH,
    )
    return response.data.data
  },

  async getOnboardingStatus(): Promise<OnboardingStatus> {
    const response = await client.get<ApiResponse<OnboardingStatus>>(
      API_ROUTES.ORGANIZATIONS.ONBOARDING_STATUS,
    )
    return response.data.data
  },

  async listPublic(params?: OrganizationListParams): Promise<PublicOrganization[]> {
    const response = await client.get<ApiResponse<PublicOrganization[]>>(
      API_ROUTES.ORGANIZATIONS.PUBLIC.LIST,
      { params },
    )
    return response.data.data
  },

  async getPublicDetail(slug: string): Promise<Organization> {
    const response = await client.get<ApiResponse<Organization>>(
      API_ROUTES.ORGANIZATIONS.PUBLIC.GET(slug),
    )
    return response.data.data
  },

  async subscribe(slug: string): Promise<{ subscribed: boolean; organization_id: string }> {
    const response = await client.post<
      ApiResponse<{ subscribed: boolean; organization_id: string }>
    >(API_ROUTES.ORGANIZATIONS.PUBLIC.SUBSCRIBE(slug))
    return response.data.data
  },

  async unsubscribe(slug: string): Promise<{ subscribed: boolean; organization_id: string }> {
    const response = await client.post<
      ApiResponse<{ subscribed: boolean; organization_id: string }>
    >(API_ROUTES.ORGANIZATIONS.PUBLIC.UNSUBSCRIBE(slug))
    return response.data.data
  },

  async getTournaments(slug: string): Promise<unknown[]> {
    const response = await client.get<ApiResponse<unknown[]>>(
      API_ROUTES.ORGANIZATIONS.PUBLIC.TOURNAMENTS(slug),
    )
    return response.data.data
  },

  async getClubs(slug: string): Promise<unknown[]> {
    const response = await client.get<ApiResponse<unknown[]>>(
      API_ROUTES.ORGANIZATIONS.PUBLIC.CLUBS(slug),
    )
    return response.data.data
  },

  async getHistory(slug: string): Promise<OrganizationHistoryEntry[]> {
    const response = await client.get<ApiResponse<OrganizationHistoryEntry[]>>(
      API_ROUTES.ORGANIZATIONS.PUBLIC.HISTORY(slug),
    )
    return response.data.data
  },

  async getKpis(slug: string): Promise<OrganizationKpis> {
    const response = await client.get<ApiResponse<OrganizationKpis>>(
      API_ROUTES.ORGANIZATIONS.PUBLIC.KPIS(slug),
    )
    return response.data.data
  },
}
