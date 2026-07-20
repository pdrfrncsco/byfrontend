import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { PlayerDashboardPage } from './PlayerDashboardPage'
import * as usePlayerModule from '../hooks'

// Mock dependencies
vi.mock('../hooks')
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      const translations: Record<string, string> = {
        'players.dashboard.title': 'Meu Perfil',
        'players.dashboard.loading': 'Carregando...',
        'players.dashboard.subtitle': 'Gestão de perfil do jogador',
        'players.dashboard.notFoundTitle': 'Perfil não encontrado',
        'players.dashboard.notFoundDescription': 'Não foi possível carregar seu perfil',
        'players.dashboard.explorePlayers': 'Explorar jogadores',
        'players.dashboard.titleWithName': `Meu Perfil • ${options?.name || 'Jogador'}`,
        'players.dashboard.subtitleActive': 'Você está ativo na plataforma',
        'players.dashboard.editProfile': 'Editar Perfil',
        'players.dashboard.sidebar.general': 'Geral',
        'players.dashboard.sidebar.settings': 'Configurações',
        'players.dashboard.sidebar.publicProfile': 'Perfil Público',
        'players.linkRequest.sidebar': 'Vincular Clube',
        'players.dashboard.currentClub': 'Clube Atual',
        'players.dashboard.stats.matches': 'Jogos',
        'players.dashboard.stats.goals': 'Gols',
        'players.dashboard.stats.assists': 'Assistências',
        'players.dashboard.stats.achievements': 'Conquistas',
        'players.dashboard.recentDocuments': 'Documentos Recentes',
        'players.detail.tabs.career': 'Carreira',
        'players.detail.tabs.videos': 'Vídeos',
        'players.detail.tabs.achievements': 'Conquistas',
      }
      return translations[key] || key
    },
  }),
}))

vi.mock('@/app/layouts/DashboardLayout', () => ({
  DashboardLayout: ({ children, title }: any) => (
    <div data-testid="dashboard-layout">
      <h1>{title}</h1>
      {children}
    </div>
  ),
}))

vi.mock('../components', () => ({
  PlayerAchievementsTab: ({ fallbackAchievements }: any) => (
    <div data-testid="player-achievements-tab">{fallbackAchievements?.length || 0} achievements</div>
  ),
  PlayerCareerTimeline: ({ career }: any) => (
    <div data-testid="player-career-timeline">{career?.length || 0} career entries</div>
  ),
  PlayerDocumentsTab: ({ fallbackDocuments }: any) => (
    <div data-testid="player-documents-tab">{fallbackDocuments?.length || 0} documents</div>
  ),
  PlayerVideosTab: ({ fallbackVideos }: any) => (
    <div data-testid="player-videos-tab">{fallbackVideos?.length || 0} videos</div>
  ),
}))

const mockPlayerData = {
  id: 'player-1',
  slug: 'player-one',
  first_name: 'João',
  last_name: 'Silva',
  full_name: 'João Silva',
  primary_position: 'Avançado',
  position_label: 'ST',
  status: 'active',
  status_label: 'Ativo',
  bio: 'Jogador profissional com 5 anos de experiência',
  avatar: null,
  current_club: {
    id: 'club-1',
    name: 'Sporting Huíla',
  },
  total_matches: 45,
  total_goals: 12,
  total_assists: 8,
  achievements: [
    { id: 'a1', title: 'Melhor Goleador' },
    { id: 'a2', title: 'MVP da Temporada' },
  ],
  career_history: [
    {
      id: 'c1',
      club: { id: 'club-1', name: 'Sporting Huíla' },
      position: 'ST',
      start_date: '2023-01-01',
      end_date: null,
    },
    {
      id: 'c2',
      club: { id: 'club-2', name: 'Benfica Luanda' },
      position: 'ST',
      start_date: '2020-01-01',
      end_date: '2022-12-31',
    },
  ],
  documents: [
    { id: 'd1', name: 'Passport', type: 'document' },
  ],
  videos: [
    { id: 'v1', title: 'Highlights 2025', url: 'https://example.com/video' },
  ],
}

describe('PlayerDashboardPage', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })

    // Reset mocks
    vi.clearAllMocks()

    // Setup default mock
    ;(usePlayerModule.usePlayerMe as any).mockReturnValue({
      data: mockPlayerData,
      isLoading: false,
      isError: false,
    })
  })

  it('renders loading state initially', () => {
    ;(usePlayerModule.usePlayerMe as any).mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
    })

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <PlayerDashboardPage />
        </BrowserRouter>
      </QueryClientProvider>,
    )

    expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument()
  })

  it('renders player data when loaded', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <PlayerDashboardPage />
        </BrowserRouter>
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText(/João Silva/)).toBeInTheDocument()
    })
  })

  it('displays player position and status badges', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <PlayerDashboardPage />
        </BrowserRouter>
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('ST')).toBeInTheDocument()
      expect(screen.getByText('Ativo')).toBeInTheDocument()
    })
  })

  it('displays current club information', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <PlayerDashboardPage />
        </BrowserRouter>
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText(/Sporting Huíla/)).toBeInTheDocument()
    })
  })

  it('displays player bio', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <PlayerDashboardPage />
        </BrowserRouter>
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText(/Jogador profissional com 5 anos/)).toBeInTheDocument()
    })
  })

  it('displays stats cards with correct values', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <PlayerDashboardPage />
        </BrowserRouter>
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('45')).toBeInTheDocument() // matches
      expect(screen.getByText('12')).toBeInTheDocument() // goals
      expect(screen.getByText('8')).toBeInTheDocument()  // assists
      expect(screen.getByText('2')).toBeInTheDocument()  // achievements count
    })
  })

  it('renders player career timeline', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <PlayerDashboardPage />
        </BrowserRouter>
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('player-career-timeline')).toBeInTheDocument()
      expect(screen.getByText('2 career entries')).toBeInTheDocument()
    })
  })

  it('renders documents tab', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <PlayerDashboardPage />
        </BrowserRouter>
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('player-documents-tab')).toBeInTheDocument()
      expect(screen.getByText('1 documents')).toBeInTheDocument()
    })
  })

  it('renders videos tab', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <PlayerDashboardPage />
        </BrowserRouter>
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('player-videos-tab')).toBeInTheDocument()
      expect(screen.getByText('1 videos')).toBeInTheDocument()
    })
  })

  it('renders achievements tab', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <PlayerDashboardPage />
        </BrowserRouter>
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('player-achievements-tab')).toBeInTheDocument()
      expect(screen.getByText('2 achievements')).toBeInTheDocument()
    })
  })

  it('displays action button to edit profile', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <PlayerDashboardPage />
        </BrowserRouter>
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('Editar Perfil')).toBeInTheDocument()
    })
  })

  it('displays sidebar with navigation links', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <PlayerDashboardPage />
        </BrowserRouter>
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('Geral')).toBeInTheDocument()
      expect(screen.getByText('Vincular Clube')).toBeInTheDocument()
      expect(screen.getByText('Configurações')).toBeInTheDocument()
      expect(screen.getByText('Perfil Público')).toBeInTheDocument()
    })
  })

  it('calls usePlayerMe hook on mount', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <PlayerDashboardPage />
        </BrowserRouter>
      </QueryClientProvider>,
    )

    expect(usePlayerModule.usePlayerMe).toHaveBeenCalled()
  })

  it('handles missing player data gracefully', () => {
    ;(usePlayerModule.usePlayerMe as any).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
    })

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <PlayerDashboardPage />
        </BrowserRouter>
      </QueryClientProvider>,
    )

    expect(screen.getByText('Perfil não encontrado')).toBeInTheDocument()
  })

  it('shows link to public profile', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <PlayerDashboardPage />
        </BrowserRouter>
      </QueryClientProvider>,
    )

    await waitFor(() => {
      const publicProfileLink = screen.getByText('Perfil Público')
      expect(publicProfileLink).toBeInTheDocument()
    })
  })

  it('displays i18n labels correctly', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <PlayerDashboardPage />
        </BrowserRouter>
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('Carreira')).toBeInTheDocument()
      expect(screen.getByText('Vídeos')).toBeInTheDocument()
    })
  })

  it('renders with real data when all hooks return data', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <PlayerDashboardPage />
        </BrowserRouter>
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument()
      expect(screen.getByText('45')).toBeInTheDocument() // matches
      expect(screen.getByText('Carreira')).toBeInTheDocument()
      expect(screen.getByTestId('player-career-timeline')).toBeInTheDocument()
    })
  })

  it('handles missing optional fields gracefully', () => {
    ;(usePlayerModule.usePlayerMe as any).mockReturnValue({
      data: {
        ...mockPlayerData,
        bio: null,
        current_club: null,
        avatar: null,
        career_history: [],
        documents: [],
        videos: [],
        achievements: [],
      },
      isLoading: false,
      isError: false,
    })

    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <PlayerDashboardPage />
        </BrowserRouter>
      </QueryClientProvider>,
    )

    // Should still render without errors
    expect(screen.getByText('João Silva')).toBeInTheDocument()
  })

  it('displays correct stats labels in Portuguese', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <PlayerDashboardPage />
        </BrowserRouter>
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('Jogos')).toBeInTheDocument()
      expect(screen.getByText('Gols')).toBeInTheDocument()
      expect(screen.getByText('Assistências')).toBeInTheDocument()
      expect(screen.getByText('Conquistas')).toBeInTheDocument()
    })
  })
})
