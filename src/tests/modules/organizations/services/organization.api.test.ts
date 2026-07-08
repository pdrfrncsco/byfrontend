import { describe, it, expect, vi, beforeEach } from 'vitest'
import { organizationApi } from '@/modules/organizations/services/organization.api'
import client from '@/lib/api-client'
import type { AxiosResponse } from 'axios'
import { mockOrganization, mockPublicOrganization, mockOrganizationKpis, mockOrgMembers, mockClubAffiliationRequest } from '@/tests/__mocks__/organization.mock'

// Mock the API client
vi.mock('@/lib/api-client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

const createMockResponse = <T>(data: T): AxiosResponse<T> => ({
  data: { data } as any,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {} as any,
})

describe('organizationApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getMe', () => {
    it('should fetch current organization', async () => {
      vi.mocked(client.get).mockResolvedValueOnce(createMockResponse(mockOrganization))

      const result = await organizationApi.getMe()

      expect(result).toEqual(mockOrganization)
      expect(client.get).toHaveBeenCalledWith(expect.stringContaining('organizations/me'))
    })
  })

  describe('listPublic', () => {
    it('should fetch public organizations without params', async () => {
      vi.mocked(client.get).mockResolvedValueOnce(createMockResponse([mockPublicOrganization]))

      const result = await organizationApi.listPublic()

      expect(result).toEqual([mockPublicOrganization])
      expect(client.get).toHaveBeenCalledWith(expect.any(String), { params: undefined })
    })

    it('should fetch public organizations with params', async () => {
      vi.mocked(client.get).mockResolvedValueOnce(createMockResponse([mockPublicOrganization]))
      const params = { type: 'federation' as const, search: 'test' }

      const result = await organizationApi.listPublic(params)

      expect(result).toEqual([mockPublicOrganization])
      expect(client.get).toHaveBeenCalledWith(expect.any(String), { params })
    })
  })

  describe('getPublicDetail', () => {
    it('should fetch public organization detail by slug', async () => {
      const slug = 'faf'
      vi.mocked(client.get).mockResolvedValueOnce(createMockResponse(mockPublicOrganization))

      const result = await organizationApi.getPublicDetail(slug)

      expect(result).toEqual(mockPublicOrganization)
      expect(client.get).toHaveBeenCalledWith(expect.stringContaining(slug))
    })
  })

  describe('getKpis', () => {
    it('should fetch organization kpis', async () => {
      const slug = 'faf'
      vi.mocked(client.get).mockResolvedValueOnce(createMockResponse(mockOrganizationKpis))

      const result = await organizationApi.getKpis(slug)

      expect(result).toEqual(mockOrganizationKpis)
      expect(client.get).toHaveBeenCalledWith(expect.stringContaining(slug))
    })
  })

  describe('updateMe', () => {
    it('should update organization', async () => {
      const updateData = { name: 'Novo Nome' }
      vi.mocked(client.patch).mockResolvedValueOnce(createMockResponse({ ...mockOrganization, ...updateData }))

      const result = await organizationApi.updateMe(updateData)

      expect(result.name).toBe('Novo Nome')
      expect(client.patch).toHaveBeenCalledWith(expect.any(String), updateData)
    })
  })

  describe('subscribe/unsubscribe', () => {
    it('should subscribe to organization', async () => {
      const slug = 'faf'
      const mockResponse = { subscribed: true, organization_id: mockOrganization.id }
      vi.mocked(client.post).mockResolvedValueOnce(createMockResponse(mockResponse))

      const result = await organizationApi.subscribe(slug)

      expect(result.subscribed).toBe(true)
      expect(client.post).toHaveBeenCalledWith(expect.stringContaining('subscribe'))
    })

    it('should unsubscribe from organization', async () => {
      const slug = 'faf'
      const mockResponse = { subscribed: false, organization_id: mockOrganization.id }
      vi.mocked(client.post).mockResolvedValueOnce(createMockResponse(mockResponse))

      const result = await organizationApi.unsubscribe(slug)

      expect(result.subscribed).toBe(false)
      expect(client.post).toHaveBeenCalledWith(expect.stringContaining('unsubscribe'))
    })
  })

  describe('Member Management', () => {
    it('should fetch members', async () => {
      vi.mocked(client.get).mockResolvedValueOnce(createMockResponse(mockOrgMembers))

      const result = await organizationApi.getMembers()

      expect(result).toEqual(mockOrgMembers)
      expect(result.length).toBe(2)
    })

    it('should add member', async () => {
      const inviteData = { email: 'novo@example.com', role: 'manager' }
      const newMember = { ...mockOrgMembers[0], id: 'member-3', user: { ...mockOrgMembers[0].user!, email: inviteData.email } }
      vi.mocked(client.post).mockResolvedValueOnce(createMockResponse(newMember))

      const result = await organizationApi.addMember(inviteData)

      expect(result.user.email).toBe(inviteData.email)
    })

    it('should remove member', async () => {
      vi.mocked(client.delete).mockResolvedValueOnce({} as any)

      await organizationApi.removeMember('member-1')

      expect(client.delete).toHaveBeenCalled()
    })
  })

  describe('Club Affiliation', () => {
    it('should fetch club requests', async () => {
      vi.mocked(client.get).mockResolvedValueOnce(createMockResponse([mockClubAffiliationRequest]))

      const result = await organizationApi.getClubRequests()

      expect(result).toEqual([mockClubAffiliationRequest])
      expect(result[0].status).toBe('pending')
    })

    it('should review club request (approve)', async () => {
      const reviewData = { approve: true, notes: 'Bem-vindo!' }
      const approvedRequest = { ...mockClubAffiliationRequest, status: 'approved' as const }
      vi.mocked(client.patch).mockResolvedValueOnce(createMockResponse(approvedRequest))

      const result = await organizationApi.reviewClubRequest('request-1', reviewData)

      expect(result.status).toBe('approved')
    })

    it('should review club request (reject)', async () => {
      const reviewData = { approve: false, notes: 'Documentação incompleta' }
      const rejectedRequest = { ...mockClubAffiliationRequest, status: 'rejected' as const }
      vi.mocked(client.patch).mockResolvedValueOnce(createMockResponse(rejectedRequest))

      const result = await organizationApi.reviewClubRequest('request-1', reviewData)

      expect(result.status).toBe('rejected')
    })
  })
})
