import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import ClubDashboardPage from './ClubDashboardPage'
import * as useClubsModule from '../hooks/useClubs'

// Mock dependencies
vi.mock('../hooks/useClubs')
vi.mock('@/app/layouts/DashboardLayout', () => ({
  DashboardLayout: ({ children, title }: any) => (
    <div data-testid="dashboard-layout">
      <h1>{title}</h1>
      {children}
    </div>
  ),
}))

const mockClubData = {
  id: 'club-1',
  name: 'Test Club',
  slug: 'test-club',
  short_name: 'TC',
  status: 'active',
  status_label: 'Active',
  city: 'Luanda',
  country: 'Angola',
  description: 'Test club description',
  is_public: true,
  is_verified: true,
  logo_url: null,
  created_at: '2026-07-01T00:00:00Z',
  updated_at: '2026-07-20T00:00:00Z',
}

const mockKpis = {
  total_members: 25,
  total_players: 12,
  active_transfers: 3,
  total_competitions: 2,
  win_rate: 0.65,
}

const mockMembers = [
  { id: 'm1', full_name: 'João Silva', display_name: 'João', role: 'admin', role_label: 'Administrador', is_active: true },
  { id: 'm2', full_name: 'Maria Santos', display_name: 'Maria', role: 'member', role_label: 'Membro', is_active: true },
]

const mockTransfers = {
  results: [
    {
      id: 't1',
      player: { id: 'p1', full_name: 'Player One' },
      from_club: { id: 'c1', name: 'Old Club' },
      to_club: { id: 'c2', name: 'Test Club' },
      status: 'completed',
      status_display: 'Concluída',
      created_at: '2026-07-15T00:00:00Z',
    },
  ],
}

describe('ClubDashboardPage', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })

    // Reset mocks
    vi.clearAllMocks()

    // Setup default mocks
    ;(useClubsModule.useClubMe as any).mockReturnValue({
      data: mockClubData,
      isLoading: false,
      isError: false,
    })

    ;(useClubsModule.useClubKpis as any).mockReturnValue({
      data: mockKpis,
      isLoading: false,
    })

    ;(useClubsModule.useClubMembers as any).mockReturnValue({
      data: mockMembers,
      isLoading: false,
    })

    ;(useClubsModule.useClubDocuments as any).mockReturnValue({
      data: [],
      isLoading: false,
    })

    ;(useClubsModule.useClubSponsors as any).mockReturnValue({
      data: [],
      isLoading: false,
    })

    ;(useClubsModule.useTransfers as any).mockReturnValue({
      data: mockTransfers,
      isLoading: false,
    })
  })

  it('renders loading state initially', () => {
    ;(useClubsModule.useClubMe as any).mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
    })

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ClubDashboardPage />
        </BrowserRouter>
      </QueryClientProvider>,
    )

    expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument()
  })

  it('renders club data when loaded', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ClubDashboardPage />
        </BrowserRouter>
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('Portal do Clube • Test Club')).toBeInTheDocument()
      expect(screen.getByText('Test Club')).toBeInTheDocument()
    })
  })

  it('displays club status badge', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ClubDashboardPage />
        </BrowserRouter>
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('active')).toBeInTheDocument()
    })
  })

  it('displays verified badge when club is verified', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ClubDashboardPage />
        </BrowserRouter>
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('Verificado')).toBeInTheDocument()
    })
  })

  it('displays club location and update information', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ClubDashboardPage />
        </BrowserRouter>
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText(/Luanda • Angola/)).toBeInTheDocument()
    })
  })

  it('renders KPI cards', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ClubDashboardPage />
        </BrowserRouter>
      </QueryClientProvider>,
    )

    await waitFor(() => {
      // ClubKpisCard should render with mock data
      expect(useClubsModule.useClubKpis).toHaveBeenCalled()
    })
  })

  it('displays recent members section', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ClubDashboardPage />
        </BrowserRouter>
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('Membros recentes')).toBeInTheDocument()
      expect(screen.getByText('João Silva')).toBeInTheDocument()
      expect(screen.getByText('Maria Santos')).toBeInTheDocument()
    })
  })

  it('shows empty state when no members exist', async () => {
    ;(useClubsModule.useClubMembers as any).mockReturnValue({
      data: [],
      isLoading: false,
    })

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ClubDashboardPage />
        </BrowserRouter>
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('Sem membros')).toBeInTheDocument()
    })
  })

  it('displays recent transfers section', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ClubDashboardPage />
        </BrowserRouter>
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('Transferências recentes')).toBeInTheDocument()
      expect(screen.getByText('Player One')).toBeInTheDocument()
    })
  })

  it('shows empty state when no transfers exist', async () => {
    ;(useClubsModule.useTransfers as any).mockReturnValue({
      data: { results: [] },
      isLoading: false,
    })

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ClubDashboardPage />
        </BrowserRouter>
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('Sem transferências')).toBeInTheDocument()
    })
  })

  it('displays shortcuts section', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ClubDashboardPage />
        </BrowserRouter>
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('Editar perfil')).toBeInTheDocument()
      expect(screen.getByText('Gerir membros')).toBeInTheDocument()
      expect(screen.getByText('Pedidos de vínculo')).toBeInTheDocument()
    })
  })

  it('renders all quick links', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ClubDashboardPage />
        </BrowserRouter>
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('Registar jogador')).toBeInTheDocument()
      expect(screen.getByText('Ver perfil público')).toBeInTheDocument()
    })
  })

  it('calls useClubMe hook on mount', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ClubDashboardPage />
        </BrowserRouter>
      </QueryClientProvider>,
    )

    expect(useClubsModule.useClubMe).toHaveBeenCalled()
  })

  it('calls useClubKpis with club slug', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ClubDashboardPage />
        </BrowserRouter>
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(useClubsModule.useClubKpis).toHaveBeenCalledWith('test-club')
    })
  })

  it('calls useClubMembers with club slug', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ClubDashboardPage />
        </BrowserRouter>
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(useClubsModule.useClubMembers).toHaveBeenCalledWith('test-club')
    })
  })

  it('calls useTransfers with correct page_size', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ClubDashboardPage />
        </BrowserRouter>
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(useClubsModule.useTransfers).toHaveBeenCalledWith({ page_size: 5 })
    })
  })

  it('renders with real data when all hooks return data', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ClubDashboardPage />
        </BrowserRouter>
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('Test Club')).toBeInTheDocument()
      expect(screen.getByText('Membros recentes')).toBeInTheDocument()
      expect(screen.getByText('Transferências recentes')).toBeInTheDocument()
      expect(screen.getByText('Atividade recente')).toBeInTheDocument()
    })
  })
})
