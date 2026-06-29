/**
 * Organization constants — type labels, status labels, and configuration.
 */

import type { OrganizationType, OrganizationStatus } from '../types'

export const ORGANIZATION_TYPE_LABELS: Partial<Record<OrganizationType, string>> = {
  federation: 'Federação',
  association: 'Associação',
  league: 'Liga',
  organizer: 'Organizador',
  academy: 'Academia',
  club: 'Clube',
}

export const ORGANIZATION_STATUS_LABELS: Record<OrganizationStatus, string> = {
  pending: 'Pendente',
  active: 'Ativa',
  suspended: 'Suspensa',
  closed: 'Encerrada',
}

export const ORGANIZATION_TYPE_OPTIONS = Object.entries(
  ORGANIZATION_TYPE_LABELS,
).map(([value, label]) => ({ value, label }))

export const MAX_LOGO_SIZE = 5 * 1024 * 1024 // 5 MB

export const ACCEPTED_LOGO_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
]
export {}
