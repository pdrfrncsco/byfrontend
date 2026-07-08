import { BrowserRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { mockClub, mockClubMembers, mockClubTransfer } from '@/tests/__mocks__/club.mock'

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

vi.mock('@/modules/clubs/hooks/useClubs', () => ({
  useClubMe: vi.fn(),
  useClubMembers: vi.fn(),
  useAddClubMember: vi.fn(),
  useUpdateClubMember: vi.fn(),
  useRemoveClubMember: vi.fn(),
  useClubDocuments: vi.fn(),
  useCreateClubDocument: vi.fn(),
  useDeleteClubDocument: vi.fn(),
  useClubSponsors: vi.fn(),
  useCreateClubSponsor: vi.fn(),
  useDeleteClubSponsor: vi.fn(),
  useTransfers: vi.fn(),
}))

import {
  useClubMe,
  useClubMembers,
  useClubDocuments,
  useClubSponsors,
  useTransfers,
  useAddClubMember,
  useUpdateClubMember,
  useRemoveClubMember,
  useCreateClubDocument,
  useDeleteClubDocument,
  useCreateClubSponsor,
  useDeleteClubSponsor,
} from '@/modules/clubs/hooks/useClubs'
import ClubMembersPage from '@/modules/clubs/pages/ClubMembersPage'
import ClubDocumentsPage from '@/modules/clubs/pages/ClubDocumentsPage'
import ClubSponsorsPage from '@/modules/clubs/pages/ClubSponsorsPage'
import ClubTransfersPage from '@/modules/clubs/pages/ClubTransfersPage'

function renderPage(element: ReactNode) {
  return render(<BrowserRouter>{element}</BrowserRouter>)
}

describe('club management list pages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useClubMe).mockReturnValue({
      data: mockClub,
      isLoading: false,
    } as never)

    const mockMutation = {
      isPending: false,
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
    } as any

    vi.mocked(useAddClubMember).mockReturnValue(mockMutation)
    vi.mocked(useUpdateClubMember).mockReturnValue(mockMutation)
    vi.mocked(useRemoveClubMember).mockReturnValue(mockMutation)
    vi.mocked(useCreateClubDocument).mockReturnValue(mockMutation)
    vi.mocked(useDeleteClubDocument).mockReturnValue(mockMutation)
    vi.mocked(useCreateClubSponsor).mockReturnValue(mockMutation)
    vi.mocked(useDeleteClubSponsor).mockReturnValue(mockMutation)
  })

  it('renders members with filtering and management content', () => {
    vi.mocked(useClubMembers).mockReturnValue({
      data: mockClubMembers,
      isLoading: false,
    } as never)

    renderPage(<ClubMembersPage />)

    expect(screen.getByRole('heading', { name: /plantel e equipa técnica/i })).toBeInTheDocument()
    expect(screen.getByText('João Pedro')).toBeInTheDocument()
    expect(screen.getByText('Carlos Mendes')).toBeInTheDocument()
    expect(screen.getByLabelText(/pesquisar/i)).toBeInTheDocument()
  })

  it('shows the documents empty state with clear guidance', () => {
    vi.mocked(useClubDocuments).mockReturnValue({
      data: [],
      isLoading: false,
    } as never)

    renderPage(<ClubDocumentsPage />)

    expect(screen.getByRole('heading', { name: /documentos organizados/i })).toBeInTheDocument()
    expect(screen.getByText(/sem documentos/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /focar formulário/i })).toBeInTheDocument()
  })

  it('shows the sponsors empty state with clear guidance', () => {
    vi.mocked(useClubSponsors).mockReturnValue({
      data: [],
      isLoading: false,
    } as never)

    renderPage(<ClubSponsorsPage />)

    expect(screen.getByRole('heading', { name: /rede de patrocinadores/i })).toBeInTheDocument()
    expect(screen.getByText(/sem patrocinadores/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /focar formulário/i })).toBeInTheDocument()
  })

  it('renders transfer rows and filter controls', () => {
    vi.mocked(useTransfers).mockReturnValue({
      data: { results: [mockClubTransfer] },
      isLoading: false,
    } as never)

    renderPage(<ClubTransfersPage />)

    expect(screen.getByRole('heading', { name: /movimentos do plantel/i })).toBeInTheDocument()
    expect(screen.getByText(mockClubTransfer.player.full_name)).toBeInTheDocument()
    expect(screen.getByLabelText(/estado/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/tipo/i)).toBeInTheDocument()
  })
})
