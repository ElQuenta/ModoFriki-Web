/**
 * Normaliza el parámetro `next` de login/registro.
 * Solo acepta rutas internas del mismo origen y descarta `//host` y `/\host`.
 */
export function safeRedirect(raw: string | null, fallback = '/'): string {
  if (!raw) return fallback

  try {
    const url = new URL(raw, window.location.origin)
    if (url.origin !== window.location.origin) return fallback
    if (url.pathname.startsWith('//')) return fallback
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return fallback
  }
}
