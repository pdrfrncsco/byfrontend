import { useAuth } from '@/app/providers'
import type { UserProfile } from '@/app/providers/AuthProvider'

const COMPETITION_ADMIN_ROLES = new Set(['owner', 'admin', 'competition_organizer'])

export function canManageCompetition(user: UserProfile | null): boolean {
  if (!user) return false

  const roles = new Set([...(user.roles ?? []), user.role ?? ''].filter(Boolean))

  return [...roles].some(role => {
    const normalizedRole = role.includes('_') ? role.split('_')[0] : role
    return COMPETITION_ADMIN_ROLES.has(role) || COMPETITION_ADMIN_ROLES.has(normalizedRole)
  })
}

export function useCompetitionAccess() {
  const { user } = useAuth()

  return {
    isAdmin: canManageCompetition(user),
  }
}
