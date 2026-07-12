import type { Player, PlayerDetail, PlayerListResponse } from '@/modules/players/types'

export const mockPlayer: Player = {
  id: 'player-1',
  slug: 'joao-pedro',
  first_name: 'João',
  last_name: 'Pedro',
  full_name: 'João Pedro',
  email: 'joao@example.com',
  date_of_birth: '2000-03-15',
  age: 26,
  nationality: 'AO',
  height_cm: 182,
  weight_kg: 76,
  foot: 'right',
  primary_position: 'st',
  position_label: 'Striker',
  shirt_number: 9,
  bio: 'Avançado completo com boa finalização.',
  avatar: 'https://cdn.example.com/joao-pedro.jpg',
  status: 'active',
  status_label: 'Ativo',
  total_matches: 120,
  total_goals: 45,
  total_assists: 18,
  created_at: '2026-01-01T10:00:00Z',
}

export const mockPlayerDetail: PlayerDetail = {
  ...mockPlayer,
  phone: '+244900000000',
  updated_at: '2026-07-01T10:00:00Z',
  current_club: {
    id: 'club-1',
    name: 'Petro de Luanda',
    slug: 'petro-luanda',
    registered_since: '2024-08-01',
    shirt_number: 9,
  },
  career_history: [
    {
      club: 'Petro de Luanda',
      club_slug: 'petro-luanda',
      joined: '2024-08-01',
      left: null,
      status: 'registered',
      matches: 40,
      goals: 18,
      assists: 7,
    },
  ],
  documents: [],
  videos: [],
  achievements: [],
}

export const mockPaginatedPlayers: PlayerListResponse = {
  count: 1,
  next: null,
  previous: null,
  results: [mockPlayer],
}
