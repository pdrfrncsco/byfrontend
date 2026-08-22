import { type NavContext } from '@/types/navigation'

interface TenantContextLike {
  id: string
  name: string
  logoUrl?: string | null
}

export interface SidebarLocationLike {
  pathname: string
  hash: string
}

export interface SidebarLinkLike {
  href: string
}

export function isSidebarLinkActive(location: SidebarLocationLike, href: string) {
  if (href.startsWith('#')) {
    return location.hash === href
  }

  return location.pathname === href || location.pathname.startsWith(`${href}/`)
}

export function getActiveSidebarHref(location: SidebarLocationLike, links: SidebarLinkLike[]) {
  return links
    .filter((link) => isSidebarLinkActive(location, link.href))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href
}

export function resolveNavContext(
  pathname: string,
  tenant: TenantContextLike | null,
  user: any,
  dashboardType?: string,
): NavContext {
  const normalizedType = dashboardType === 'federation' || dashboardType === 'league'
    ? 'organization'
    : dashboardType

  if (normalizedType === 'organization' || pathname.includes('/dashboard/organization') || pathname.includes('/org/') || pathname.includes('/organization')) {
    return {
      type: 'organization',
      entityId: tenant?.id || '',
      entityName: tenant?.name || 'Organização',
      entityLogo: tenant?.logoUrl ?? undefined,
      subLabel: 'Organização',
    }
  }

  if (normalizedType === 'club' || pathname.includes('/dashboard/club') || pathname.includes('/club/')) {
    return {
      type: 'club',
      entityId: tenant?.id || '',
      entityName: tenant?.name || 'Clube',
      entityLogo: tenant?.logoUrl ?? undefined,
      subLabel: 'Consola de Clube',
    }
  }

  if (normalizedType === 'competition' || pathname.includes('/dashboard/competition') || pathname.includes('/competition/')) {
    return {
      type: 'competition',
      entityId: tenant?.id || '',
      entityName: tenant?.name || 'Competição',
      entityLogo: tenant?.logoUrl ?? undefined,
      subLabel: 'Organizador de Provas',
    }
  }

  if (normalizedType === 'player' || pathname.includes('/dashboard/player') || pathname.includes('/player/')) {
    return {
      type: 'player',
      entityId: user?.playerId || '',
      entityName: user?.username || 'Jogador',
      entityAvatar: user?.avatarUrl,
      subLabel: 'Portal do Atleta',
    }
  }

  // Fallback Administrativo/Executivo
  return {
    type: 'admin',
    entityId: '',
    entityName: 'Painel Executivo',
    subLabel: 'BolaYetu Angola',
  }
}
