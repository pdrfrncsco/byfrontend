export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  COACH: 'coach',
  CLUB: 'club',
  PLAYER: 'player',
  FAN: 'fan',
  JOURNALIST: 'journalist',
  SCOUT: 'scout',
  REFEREE: 'referee',
  USER: 'user',
} as const

export const PERMISSIONS = {
  // User Management
  CREATE_USER: 'create:user',
  READ_USER: 'read:user',
  UPDATE_USER: 'update:user',
  DELETE_USER: 'delete:user',

  // Organization Management
  CREATE_ORGANIZATION: 'create:organization',
  READ_ORGANIZATION: 'read:organization',
  UPDATE_ORGANIZATION: 'update:organization',
  DELETE_ORGANIZATION: 'delete:organization',

  // Club Management
  CREATE_CLUB: 'create:club',
  READ_CLUB: 'read:club',
  UPDATE_CLUB: 'update:club',
  DELETE_CLUB: 'delete:club',

  // Player Management
  CREATE_PLAYER: 'create:player',
  READ_PLAYER: 'read:player',
  UPDATE_PLAYER: 'update:player',
  DELETE_PLAYER: 'delete:player',

  // Match Management
  CREATE_MATCH: 'create:match',
  READ_MATCH: 'read:match',
  UPDATE_MATCH: 'update:match',
  DELETE_MATCH: 'delete:match',

  // News Management
  CREATE_NEWS: 'create:news',
  READ_NEWS: 'read:news',
  UPDATE_NEWS: 'update:news',
  DELETE_NEWS: 'delete:news',
} as const

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  [ROLES.MANAGER]: [
    PERMISSIONS.READ_USER,
    PERMISSIONS.READ_ORGANIZATION,
    PERMISSIONS.UPDATE_ORGANIZATION,
    PERMISSIONS.CREATE_CLUB,
    PERMISSIONS.READ_CLUB,
    PERMISSIONS.UPDATE_CLUB,
    PERMISSIONS.CREATE_PLAYER,
    PERMISSIONS.READ_PLAYER,
    PERMISSIONS.UPDATE_PLAYER,
  ],
  [ROLES.COACH]: [
    PERMISSIONS.READ_PLAYER,
    PERMISSIONS.UPDATE_PLAYER,
    PERMISSIONS.READ_MATCH,
    PERMISSIONS.UPDATE_MATCH,
  ],
  [ROLES.CLUB]: [
    PERMISSIONS.READ_CLUB,
    PERMISSIONS.UPDATE_CLUB,
    PERMISSIONS.READ_PLAYER,
    PERMISSIONS.UPDATE_PLAYER,
  ],
  [ROLES.PLAYER]: [PERMISSIONS.READ_PLAYER, PERMISSIONS.UPDATE_PLAYER],
  [ROLES.FAN]: [PERMISSIONS.READ_MATCH, PERMISSIONS.READ_NEWS],
  [ROLES.JOURNALIST]: [PERMISSIONS.CREATE_NEWS, PERMISSIONS.READ_NEWS, PERMISSIONS.UPDATE_NEWS],
  [ROLES.SCOUT]: [PERMISSIONS.READ_PLAYER, PERMISSIONS.READ_MATCH],
  [ROLES.REFEREE]: [PERMISSIONS.READ_MATCH, PERMISSIONS.UPDATE_MATCH],
  [ROLES.USER]: [PERMISSIONS.READ_USER],
}
