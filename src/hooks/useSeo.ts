import { useEffect } from 'react'

export interface SeoOptions {
  /** Page title. The site name is appended automatically. */
  title?: string
  /** Meta description (~150-160 chars). */
  description?: string
  /** Absolute or root-relative image URL for social previews. */
  image?: string
  /** Root-relative path used to build the canonical / og:url. Defaults to the current path. */
  path?: string
  /** Open Graph type. */
  type?: 'website' | 'article'
  /** When true, adds a robots noindex directive. */
  noIndex?: boolean
}

const SITE_NAME = 'Bolayetu'
const DEFAULT_DESCRIPTION =
  'Plataforma digital para organizações, clubes, jogadores, árbitros, patrocinadores e adeptos de futebol em Angola e em África.'
const DEFAULT_IMAGE = '/favicon.svg'

function siteUrl(): string {
  const configured = import.meta.env.VITE_SITE_URL as string | undefined
  if (configured) return configured.replace(/\/$/, '')
  if (typeof window !== 'undefined') return window.location.origin
  return ''
}

function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  return `${siteUrl()}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel: string, href: string): void {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

/**
 * Sets document title and social/SEO meta tags for the current page.
 * Dependency-free; suitable for the Vite SPA (client-side crawlers, social re-fetch).
 */
export function useSeo(options: SeoOptions): void {
  const { title, description = DEFAULT_DESCRIPTION, image = DEFAULT_IMAGE, path, type = 'website', noIndex } = options

  useEffect(() => {
    const fullTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME
    const url = absoluteUrl(path ?? (typeof window !== 'undefined' ? window.location.pathname : '/'))
    const imageUrl = absoluteUrl(image)

    document.title = fullTitle

    upsertMeta('name', 'description', description)
    upsertMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow')

    upsertMeta('property', 'og:site_name', SITE_NAME)
    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:type', type)
    upsertMeta('property', 'og:url', url)
    upsertMeta('property', 'og:image', imageUrl)

    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', fullTitle)
    upsertMeta('name', 'twitter:description', description)
    upsertMeta('name', 'twitter:image', imageUrl)

    upsertLink('canonical', url)
  }, [title, description, image, path, type, noIndex])
}
