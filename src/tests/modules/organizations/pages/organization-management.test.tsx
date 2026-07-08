import { BrowserRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import {
  mockOrganization,
  mockOrganizationKpis,
  mockOrgMembers,
  mockClubAffiliationRequest,
} from '@/tests/__mocks__/organization.mock'

// Mock layouts
vi.mock('@/app/layouts/DashboardLayout', () => ({
  DashboardLayout: ({
    title,
    subtitle,
    children,
    headerActions,
  }: {
    title: string
    subtitle?: string
    children: ReactNode
    headerActions?: ReactNode
  }) => (
    <div>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
      {headerActions}
      {children}
    </div>
  ),
}))

// Mock hooks
vi.mock('@/modules/organizations/hooks', () => ({
  useOrganizationMe: vi.fn(),
  useOrganizationKpis: vi.fn(),
  useOrganizationClubs: vi.fn(),
  useOrganizationTournaments: vi.fn(),
  useLaunchOrganization: vi.fn(),
  useUpdateOrganization: vi.fn(),
  useUploadLogo: vi.fn(),
  useUploadBanner: vi.fn(),
  useOrganizationMembers: vi.fn(),
  useAddMember: vi.fn(),
  useUpdateMember: vi.fn(),
  useRemoveMember: vi.fn(),
  useOrganizationClubRequests: vi.fn(),
  useReviewClubRequest: vi.fn(),
}))

vi.mock('@/modules/transfers', () => ({
  useTransfers: vi.fn(),
}))

import {
  useOrganizationMe,
  useOrganizationKpis,
  useOrganizationClubs,
  useOrganizationTournaments,
  useLaunchOrganization,
  useUpdateOrganization,
  useUploadLogo,
  useUploadBanner,
  useOrganizationMembers,
  useAddMember,
  useUpdateMember,
  useRemoveMember,
  useOrganizationClubRequests,
  useReviewClubRequest,
} from '@/modules/organizations/hooks'
import { useTransfers } from '@/modules/transfers'

import OrganizationDashboardPage from '@/modules/organizations/pages/OrganizationDashboardPage'
import { OrganizationSettingsPage } from '@/modules/organizations/pages/OrganizationSettingsPage'
import { OrganizationMembersPage } from '@/modules/organizations/pages/OrganizationMembersPage'
import { OrganizationAffiliationsPage } from '@/modules/organizations/pages/OrganizationAffiliationsPage'

function renderPage(element: ReactNode) {
  return render(<BrowserRouter>{element}</BrowserRouter>)
}

describe('organization management pages', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default mutations implementation
    const mockMutation = {
      isPending: false,
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
    } as any

    vi.mocked(useLaunchOrganization).mockReturnValue(mockMutation)
    vi.mocked(useUpdateOrganization).mockReturnValue(mockMutation)
    vi.mocked(useUploadLogo).mockReturnValue(mockMutation)
    vi.mocked(useUploadBanner).mockReturnValue(mockMutation)
    vi.mocked(useAddMember).mockReturnValue(mockMutation)
    vi.mocked(useUpdateMember).mockReturnValue(mockMutation)
    vi.mocked(useRemoveMember).mockReturnValue(mockMutation)
    vi.mocked(useReviewClubRequest).mockReturnValue(mockMutation)
  })

  describe('OrganizationDashboardPage', () => {
    it('renders organization dashboard KPIs and transfers', () => {
      vi.mocked(useOrganizationMe).mockReturnValue({
        data: mockOrganization,
        isLoading: false,
      } as any)
      vi.mocked(useOrganizationKpis).mockReturnValue({
        data: mockOrganizationKpis,
        isLoading: false,
      } as any)
      vi.mocked(useOrganizationClubs).mockReturnValue({
        data: [],
        isLoading: false,
      } as any)
      vi.mocked(useOrganizationTournaments).mockReturnValue({
        data: [],
        isLoading: false,
      } as any)
      vi.mocked(useTransfers).mockReturnValue({
        data: { results: [] },
        isLoading: false,
      } as any)

      renderPage(<OrganizationDashboardPage />)

      expect(screen.getByText(/Bem-vindo, Federação Angolana de Futebol/i)).toBeInTheDocument()
      expect(screen.getByText(/Torneios/i)).toBeInTheDocument()
      expect(screen.getByText(/Clubes/i)).toBeInTheDocument()
    })
  })

  describe('OrganizationSettingsPage', () => {
    it('renders configuration form with fields populated', () => {
      vi.mocked(useOrganizationMe).mockReturnValue({
        data: mockOrganization,
        isLoading: false,
      } as any)

      renderPage(<OrganizationSettingsPage />)

      expect(screen.getByRole('heading', { name: /Definições da Organização/i })).toBeInTheDocument()
      expect(screen.getByLabelText(/Nome Completo da Organização/i)).toHaveValue(mockOrganization.name)
      expect(screen.getByLabelText(/País de Registo/i)).toHaveValue(mockOrganization.country)
      expect(screen.getByLabelText(/Cidade Sede/i)).toHaveValue(mockOrganization.city)
    })

    it('triggers update organization mutation on submit', async () => {
      const updateMutation = {
        isPending: false,
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
      } as any
      vi.mocked(useUpdateOrganization).mockReturnValue(updateMutation)
      vi.mocked(useOrganizationMe).mockReturnValue({
        data: mockOrganization,
        isLoading: false,
      } as any)

      renderPage(<OrganizationSettingsPage />)

      const nameInput = screen.getByLabelText(/Nome Completo da Organização/i)
      fireEvent.change(nameInput, { target: { value: 'Novo Nome FAF' } })

      const submitButton = screen.getByRole('button', { name: /guardar alterações/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(updateMutation.mutate).toHaveBeenCalled()
      })
    })
  })

  describe('OrganizationMembersPage', () => {
    it('renders members list and allows showing invite form', () => {
      vi.mocked(useOrganizationMembers).mockReturnValue({
        data: mockOrgMembers,
        isLoading: false,
      } as any)

      renderPage(<OrganizationMembersPage />)

      expect(screen.getByText('João Silva')).toBeInTheDocument()
      expect(screen.getByText('Maria Santos')).toBeInTheDocument()

      const inviteButton = screen.getByRole('button', { name: /convidar membro/i })
      fireEvent.click(inviteButton)

      expect(screen.getByLabelText(/Endereço de Email/i)).toBeInTheDocument()
    })

    it('submits invite form with input data', async () => {
      const addMemberMutation = {
        isPending: false,
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
      } as any
      vi.mocked(useAddMember).mockReturnValue(addMemberMutation)
      vi.mocked(useOrganizationMembers).mockReturnValue({
        data: mockOrgMembers,
        isLoading: false,
      } as any)

      renderPage(<OrganizationMembersPage />)

      const inviteButton = screen.getByRole('button', { name: /convidar membro/i })
      fireEvent.click(inviteButton)

      const emailInput = screen.getByLabelText(/Endereço de Email/i)
      fireEvent.change(emailInput, { target: { value: 'novo.membro@faf.co.ao' } })

      const submitInviteButton = screen.getByRole('button', { name: /^Convidar$/i })
      fireEvent.click(submitInviteButton)

      await waitFor(() => {
        expect(addMemberMutation.mutate).toHaveBeenCalledWith(
          { email: 'novo.membro@faf.co.ao', role: 'member' },
          expect.any(Object)
        )
      })
    })
  })

  describe('OrganizationAffiliationsPage', () => {
    it('renders club affiliation requests', () => {
      vi.mocked(useOrganizationClubRequests).mockReturnValue({
        data: [mockClubAffiliationRequest],
        isLoading: false,
      } as any)

      renderPage(<OrganizationAffiliationsPage />)

      expect(screen.getByText('Petro de Luanda')).toBeInTheDocument()
      expect(screen.getByText('Luanda')).toBeInTheDocument()
    })

    it('triggers review request mutation on approve click', async () => {
      const reviewMutation = {
        isPending: false,
        mutate: vi.fn(),
        mutateAsync: vi.fn(),
      } as any
      vi.mocked(useReviewClubRequest).mockReturnValue(reviewMutation)
      vi.mocked(useOrganizationClubRequests).mockReturnValue({
        data: [mockClubAffiliationRequest],
        isLoading: false,
      } as any)

      renderPage(<OrganizationAffiliationsPage />)

      const approveButton = screen.getByRole('button', { name: /aprovar/i })
      fireEvent.click(approveButton)

      const confirmButton = screen.getByRole('button', { name: /confirmar aprovação/i })
      fireEvent.click(confirmButton)

      await waitFor(() => {
        expect(reviewMutation.mutate).toHaveBeenCalledWith(
          { id: mockClubAffiliationRequest.id, data: { approve: true, review_notes: undefined } },
          expect.any(Object)
        )
      })
    })
  })
})
