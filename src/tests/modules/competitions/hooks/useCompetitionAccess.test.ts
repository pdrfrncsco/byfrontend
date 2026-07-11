import { describe, expect, it } from 'vitest'
import { canManageCompetition } from '@/modules/competitions/hooks/useCompetitionAccess'

describe('canManageCompetition', () => {
  it('allows organization owners and admins', () => {
    expect(
      canManageCompetition({
        id: '1',
        username: 'owner',
        email: 'owner@example.com',
        roles: ['active', 'owner'],
        role: 'owner',
        tenant_id: 'tenant-1',
      }),
    ).toBe(true)

    expect(
      canManageCompetition({
        id: '2',
        username: 'admin',
        email: 'admin@example.com',
        roles: ['active', 'admin_faf'],
        role: 'admin',
        tenant_id: 'tenant-2',
      }),
    ).toBe(true)
  })

  it('allows competition organizers and rejects regular members', () => {
    expect(
      canManageCompetition({
        id: '3',
        username: 'organizer',
        email: 'organizer@example.com',
        roles: ['competition_organizer'],
        role: 'competition_organizer',
        tenant_id: 'tenant-3',
      }),
    ).toBe(true)

    expect(
      canManageCompetition({
        id: '4',
        username: 'member',
        email: 'member@example.com',
        roles: ['active', 'fan'],
        role: 'fan',
        tenant_id: 'tenant-4',
      }),
    ).toBe(false)
  })
})
