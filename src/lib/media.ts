const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

/**
 * Resolves a media asset URL (avatar, logo, document, etc.) to an accessible URL.
 * - If null/undefined/empty, returns empty string.
 * - If already absolute (http://, https://, data:, blob:), returns as is.
 * - If relative (/media/... or media/...), prepends backend origin.
 */
export function resolveMediaUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return ''
  const trimmed = url.trim()
  if (!trimmed) return ''
  if (/^(https?:|\/\/|data:|blob:)/i.test(trimmed)) {
    return trimmed
  }
  const backendBase = apiBaseUrl.replace(/\/api\/v1\/?$/, '')
  return `${backendBase}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`
}
