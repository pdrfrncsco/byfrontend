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
