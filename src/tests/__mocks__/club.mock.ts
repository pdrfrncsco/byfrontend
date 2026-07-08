import type {
  Club,
  ClubKpis,
  ClubMember,
  ClubDocument,
  ClubSponsor,
  Transfer,
} from '@/modules/clubs/types'

export const mockClub: Club = {
  id: 'club-1',
  name: 'Atlético BolaYetu',
  slug: 'atletico-bolayetu',
  short_name: 'AB',
  logo_url: 'https://cdn.example.com/logo.png',
  primary_color: '#123456',
  secondary_color: '#abcdef',
  founded_year: 1998,
  stadium_name: 'Estádio Central',
  stadium_capacity: 42000,
  country: 'Angola',
  city: 'Luanda',
  location: 'Luanda, Angola',
  email: 'info@bolayetu.co.ao',
  website: 'https://bolayetu.co.ao',
  description: 'Clube de referência',
  is_public: true,
  is_verified: true,
  status: 'active',
  status_label: 'Ativo',
  tenant_name: 'Federação Bolayetu',
  tenant_slug: 'federacao-bolayetu',
  created_at: '2026-07-01T10:00:00Z',
  updated_at: '2026-07-02T10:00:00Z',
}

export const mockClubKpis: ClubKpis = {
  squad_size: 22,
  staff_count: 8,
  total_matches: 30,
  wins: 18,
  draws: 6,
  losses: 6,
  goals_for: 41,
  goals_against: 19,
  clean_sheets: 12,
  active_competitions: 3,
}

export const mockClubMembers: ClubMember[] = [
  {
    id: 'member-1',
    club: mockClub.id,
    full_name: 'João Pedro',
    display_name: 'João Pedro',
    role: 'coach',
    role_label: 'Treinador',
    jersey_number: null,
    position: null,
    is_active: true,
    joined_at: '2026-01-12T00:00:00Z',
  },
  {
    id: 'member-2',
    club: mockClub.id,
    full_name: 'Carlos Mendes',
    display_name: 'Carlos Mendes',
    role: 'manager',
    role_label: 'Gestor',
    jersey_number: null,
    position: null,
    is_active: false,
    joined_at: '2025-09-20T00:00:00Z',
  },
]

export const mockClubDocuments: ClubDocument[] = [
  {
    id: 'doc-1',
    club: mockClub.id,
    tenant: mockClub.tenant_slug,
    title: 'Licença de Clube',
    category: 'license',
    category_label: 'Licença',
    description: 'Documento oficial',
    asset: 'asset-1',
    asset_url: 'https://cdn.example.com/license.pdf',
    uploaded_by: 'user-1',
    uploaded_by_email: 'admin@bolayetu.co.ao',
    is_public: true,
    valid_until: '2026-12-31',
    created_at: '2026-07-02T08:00:00Z',
  },
]

export const mockClubSponsors: ClubSponsor[] = [
  {
    id: 'sponsor-1',
    club: mockClub.id,
    tenant: mockClub.tenant_slug,
    name: 'BolaYetu Bank',
    sponsor_type: 'main',
    sponsor_type_label: 'Principal',
    description: 'Patrocinador principal',
    website: 'https://bank.example.com',
    logo_asset: 'asset-2',
    logo_url: 'https://cdn.example.com/sponsor.png',
    uploaded_by: 'user-1',
    uploaded_by_email: 'admin@bolayetu.co.ao',
    is_active: true,
    sort_order: 1,
    created_at: '2026-07-02T08:00:00Z',
  },
]

export const mockClubSquad = [
  {
    id: 'squad-1',
    display_name: 'Mário Silva',
    jersey_number: 9,
    position: 'FW',
    position_label: 'Avançado',
    joined_at: '2026-02-01',
  },
]

export const mockClubStaff = [
  {
    id: 'staff-1',
    display_name: 'Ana Costa',
    role: 'coach',
    role_label: 'Treinadora',
    joined_at: '2026-03-01',
  },
]

export const mockClubTransfer: Transfer = {
  id: 'transfer-1',
  player: {
    id: 'player-1',
    full_name: 'Mário Silva',
    primary_position: 'FW',
    date_of_birth: '2001-01-01',
  },
  from_club: null,
  to_club: {
    id: mockClub.id,
    name: mockClub.name,
    slug: mockClub.slug,
  },
  transfer_type: 'free_agent',
  transfer_type_display: 'Free Agent Signing',
  transfer_date: '2026-07-03',
  status: 'approved',
  status_display: 'Approved',
  loan_end_date: null,
  loan_return_mandatory: false,
  fee: null,
  salary_contribution: false,
  approved_at: '2026-07-03T10:00:00Z',
  completed_at: null,
  cancelled_at: null,
  rejected_at: null,
  returned_at: null,
  notes: 'Contrato curto',
  created_at: '2026-07-03T09:00:00Z',
}

export const mockPaginatedClubs = {
  count: 1,
  next: null,
  previous: null,
  results: [mockClub],
}
