import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { usePlayerPermissions } from '@/modules/players/hooks/usePlayerPermissions'
import type { Player } from '@/modules/players/types'

// Mock useAuth
const mockUseAuth = vi.fn()
vi.mock('@/app/providers', () => ({
  useAuth: () => mockUseAuth(),
}))

// Mock useCurrentPlayer
const mockUseCurrentPlayer = vi.fn()
vi.mock('@/modules/players/hooks/useCurrentPlayer', () => ({
  useCurrentPlayer: () => mockUseCurrentPlayer(),
}))

const samplePlayer: Player = {
  id: 'player-uuid-1',
  global_id: 'BY-PLY-001',
  slug: 'gilberto-alves',
  first_name: 'Gilberto',
  last_name: 'Alves',
  full_name: 'Gilberto Alves',
  email: 'gilberto@example.com',
  date_of_birth: '2001-03-10',
  age: 25,
  is_minor: false,
  nationality: 'Angola',
  height_cm: 180,
  weight_kg: 75,
  foot: 'right',
  primary_position: 'rw',
  position_label: 'Extremo Direito',
  shirt_number: 7,
  bio: 'Extremo veloz.',
  profile_photo_url: null,
  avatar: null,
  is_public: true,
  status: 'active',
  status_label: 'Ativo',
  total_matches: 30,
  total_goals: 12,
  total_assists: 8,
  created_at: '2026-01-01T00:00:00Z',
}

describe('usePlayerPermissions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna todas as permissões como false para visitante não autenticado', () => {
    mockUseAuth.mockReturnValue({ user: null })
    mockUseCurrentPlayer.mockReturnValue({ player: null })

    const { result } = renderHook(() => usePlayerPermissions(samplePlayer))

    expect(result.current.isSelf).toBe(false)
    expect(result.current.canViewMedical).toBe(false)
    expect(result.current.canViewContracts).toBe(false)
    expect(result.current.canViewDocuments).toBe(false)
    expect(result.current.canEditProfile).toBe(false)
    expect(result.current.canManageRegistrations).toBe(false)
  })

  it('concede permissões de atleta quando o utilizador é o próprio jogador', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-player-1', roles: ['player'], role: 'player' },
    })
    mockUseCurrentPlayer.mockReturnValue({
      player: { id: 'player-uuid-1', slug: 'gilberto-alves' },
    })

    const { result } = renderHook(() => usePlayerPermissions(samplePlayer))

    expect(result.current.isSelf).toBe(true)
    expect(result.current.canViewMedical).toBe(true)
    expect(result.current.canEditMedical).toBe(false) // apenas corpo clínico pode editar
    expect(result.current.canViewContracts).toBe(true)
    expect(result.current.canEditContracts).toBe(false) // contratos são geridos pelo clube
    expect(result.current.canViewDocuments).toBe(true)
    expect(result.current.canUploadDocuments).toBe(true)
    expect(result.current.canEditProfile).toBe(true)
  })

  it('concede acesso clínico e edição médica apenas ao corpo clínico', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-doc-1', roles: ['doctor'], role: 'doctor' },
    })
    mockUseCurrentPlayer.mockReturnValue({ player: null })

    const { result } = renderHook(() => usePlayerPermissions(samplePlayer))

    expect(result.current.isMedicalStaff).toBe(true)
    expect(result.current.isSelf).toBe(false)
    expect(result.current.canViewMedical).toBe(true)
    expect(result.current.canEditMedical).toBe(true)
    expect(result.current.canViewContracts).toBe(false) // médico não acede a contratos salariais
  })

  it('concede permissões de gestão desportiva a staff de clube', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-club-1', roles: ['club_admin'], role: 'club_admin' },
    })
    mockUseCurrentPlayer.mockReturnValue({ player: null })

    const { result } = renderHook(() => usePlayerPermissions(samplePlayer))

    expect(result.current.isClubStaff).toBe(true)
    expect(result.current.canViewContracts).toBe(true)
    expect(result.current.canEditContracts).toBe(true)
    expect(result.current.canViewDocuments).toBe(true)
    expect(result.current.canManageRegistrations).toBe(true)
    expect(result.current.canTransfer).toBe(true)
    expect(result.current.canViewMedical).toBe(false) // apenas médico ou o próprio
  })

  it('permite a agentes consultar contratos e documentos mas não dados médicos', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-agent-1', roles: ['agent'], role: 'agent' },
    })
    mockUseCurrentPlayer.mockReturnValue({ player: null })

    const { result } = renderHook(() => usePlayerPermissions(samplePlayer))

    expect(result.current.isAgent).toBe(true)
    expect(result.current.canViewContracts).toBe(true)
    expect(result.current.canViewDocuments).toBe(true)
    expect(result.current.canEditContracts).toBe(false)
    expect(result.current.canViewMedical).toBe(false)
  })
})
