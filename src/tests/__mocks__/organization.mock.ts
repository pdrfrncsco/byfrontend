import type { Organization, PublicOrganization, OrganizationKpis, OrgMember, ClubAffiliationRequest } from '@/modules/organizations/types'

export const mockOrganization: Organization = {
  id: 'org-1',
  name: 'Federação Angolana de Futebol',
  slug: 'faf',
  type: 'federation',
  logo_url: 'https://example.com/logo.png',
  banner_url: 'https://example.com/banner.png',
  description: 'Federação nacional de futebol de Angola',
  country: 'Angola',
  city: 'Luanda',
  email: 'contato@faf.co.ao',
  phone: '+244 923 456 789',
  website: 'https://faf.co.ao',
  is_verified: true,
  verified: true,
  status: 'active',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-06-01T00:00:00Z',
}

export const mockPublicOrganization: PublicOrganization = {
  id: 'org-1',
  name: 'Federação Angolana de Futebol',
  slug: 'faf',
  type: 'federation',
  type_label: 'Federação',
  logo_url: 'https://example.com/logo.png',
  banner_url: 'https://example.com/banner.png',
  description: 'Federação nacional de futebol de Angola',
  country: 'Angola',
  city: 'Luanda',
  active_subscribers: 12500,
  is_subscribed: false,
  verified: true,
}

export const mockOrganizationKpis: OrganizationKpis = {
  total_games: 120,
  total_goals: 264,
  goals_per_game: 2.2,
  live_games: 1,
  scheduled_games: 24,
  active_subscribers: 12500,
  total_tournaments: 6,
  active_tournaments: 4,
  upcoming_tournaments: 2,
  completed_tournaments: 2,
  total_clubs: 24,
}

export const mockOrgMembers: OrgMember[] = [
  {
    id: 'member-1',
    user: {
      id: 'user-1',
      full_name: 'João Silva',
      email: 'joao@example.com',
    },
    role: 'admin',
    is_active: true,
    joined_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'member-2',
    user: {
      id: 'user-2',
      full_name: 'Maria Santos',
      email: 'maria@example.com',
    },
    role: 'manager',
    is_active: true,
    joined_at: '2024-02-20T00:00:00Z',
  },
]

export const mockClubAffiliationRequest: ClubAffiliationRequest = {
  id: 'request-1',
  name: 'Petro de Luanda',
  short_name: 'APL',
  city: 'Luanda',
  country: 'Angola',
  email: 'contato@petro.ao',
  phone: '+244 923 111 222',
  stadium_name: 'Estádio 11 de Novembro',
  status: 'pending',
  status_label: 'Pendente',
  submitted_by_email: 'admin@petro.ao',
  created_at: '2024-03-01T00:00:00Z',
}

export const mockOrganizationList: PublicOrganization[] = [
  mockPublicOrganization,
  {
    ...mockPublicOrganization,
    id: 'org-2',
    name: 'Girabola',
    slug: 'girabola',
    type: 'league',
    type_label: 'Liga',
    active_subscribers: 8500,
  },
]
