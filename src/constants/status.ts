export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  PAUSED: 'paused',
  FINISHED: 'finished',
  CANCELLED: 'cancelled',
  POSTPONED: 'postponed',
} as const

export const TRANSFER_STATUS = {
  PENDING: 'pending',
  PROPOSED: 'proposed',
  NEGOTIATING: 'negotiating',
  AGREED: 'agreed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
} as const

export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
} as const

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  DELETED: 'deleted',
} as const

export const CLUB_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DISSOLVED: 'dissolved',
} as const

export const COMPETITION_STATUS = {
  UPCOMING: 'upcoming',
  ACTIVE: 'active',
  FINISHED: 'finished',
  CANCELLED: 'cancelled',
} as const
