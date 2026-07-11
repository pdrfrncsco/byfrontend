import { BrowserRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { mockClub, mockClubKpis, mockClubMembers, mockClubDocuments, mockClubSponsors, mockClubTransfer } from '@/tests/__mocks__/club.mock'

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
  useClubKpis: vi.fn(),
  useClubMembers: vi.fn(),
  useClubDocuments: vi.fn(),
  useClubSponsors: vi.fn(),
  useTransfers: vi.fn(),
  useUpdateClub: vi.fn(),
  useUploadClubLogo: vi.fn(),
}))

import {
  useClubMe,
  useClubKpis,
  useClubMembers,
  useClubDocuments,
  useClubSponsors,
  useTransfers,
  useUpdateClub,
  useUploadClubLogo,
} from '@/modules/clubs/hooks/useClubs'
import ClubDashboardPage from '@/modules/clubs/pages/ClubDashboardPage'
import ClubSettingsPage from '@/modules/clubs/pages/ClubSettingsPage'

function renderPage(element: ReactNode) {
  return render(<BrowserRouter>{element}</BrowserRouter>)
}

describe('club dashboard and settings pages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useUploadClubLogo).mockReturnValue({
      isPending: false,
      mutate: vi.fn(),
    } as any)
  })

  it('renders club dashboard with summary actions and recent data', () => {
    vi.mocked(useClubMe).mockReturnValue({
      data: mockClub,
      isLoading: false,
    } as never)
    vi.mocked(useClubKpis).mockReturnValue({
      data: mockClubKpis,
      isLoading: false,
    } as never)
    vi.mocked(useClubMembers).mockReturnValue({
      data: mockClubMembers,
      isLoading: false,
    } as never)
    vi.mocked(useClubDocuments).mockReturnValue({
      data: mockClubDocuments,
      isLoading: false,
    } as never)
    vi.mocked(useClubSponsors).mockReturnValue({
      data: mockClubSponsors,
      isLoading: false,
    } as never)
    vi.mocked(useTransfers).mockReturnValue({
      data: { results: [mockClubTransfer] },
      isLoading: false,
    } as never)

    renderPage(<ClubDashboardPage />)

    expect(screen.getByRole('heading', { name: /portal do clube/i })).toBeInTheDocument()
    expect(screen.getByText(mockClub.name)).toBeInTheDocument()
    expect(screen.getByText('KPIs do clube')).toBeInTheDocument()
    expect(screen.getByText('Membros recentes')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /gerir membros/i })).toHaveAttribute('href', '/dashboard/club/members')
  })

  it('shows an actionable empty state when no club is associated', () => {
    vi.mocked(useClubMe).mockReturnValue({
      data: null,
      isLoading: false,
    } as never)
    vi.mocked(useClubKpis).mockReturnValue({ data: null, isLoading: false } as never)
    vi.mocked(useClubMembers).mockReturnValue({ data: [], isLoading: false } as never)
    vi.mocked(useClubDocuments).mockReturnValue({ data: [], isLoading: false } as never)
    vi.mocked(useClubSponsors).mockReturnValue({ data: [], isLoading: false } as never)
    vi.mocked(useTransfers).mockReturnValue({ data: { results: [] }, isLoading: false } as never)

    renderPage(<ClubSettingsPage />)

    expect(screen.getByText(/sem clube associado/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /voltar ao dashboard/i })).toBeInTheDocument()
  })

  it('renders club settings form with data and triggers submit', async () => {
    vi.mocked(useClubMe).mockReturnValue({
      data: mockClub,
      isLoading: false,
    } as never)
    vi.mocked(useClubKpis).mockReturnValue({ data: mockClubKpis, isLoading: false } as never)
    vi.mocked(useClubMembers).mockReturnValue({ data: mockClubMembers, isLoading: false } as never)
    vi.mocked(useClubDocuments).mockReturnValue({ data: [], isLoading: false } as never)
    vi.mocked(useClubSponsors).mockReturnValue({ data: [], isLoading: false } as never)
    vi.mocked(useTransfers).mockReturnValue({ data: { results: [] }, isLoading: false } as never)

    const updateMutation = {
      isPending: false,
      mutate: vi.fn(),
    } as any
    vi.mocked(useUpdateClub).mockReturnValue(updateMutation)

    renderPage(<ClubSettingsPage />)

    expect(screen.getByRole('heading', { name: new RegExp(`Configurações • ${mockClub.name}`, 'i') })).toBeInTheDocument()
    expect(screen.getByLabelText(/Nome do Clube/i)).toHaveValue(mockClub.name)

    const inputName = screen.getByLabelText(/Nome do Clube/i)
    fireEvent.change(inputName, { target: { value: 'Novo Nome do Clube' } })

    const submitBtn = screen.getByRole('button', { name: /Guardar Alterações/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(updateMutation.mutate).toHaveBeenCalled()
    })
  })
})
