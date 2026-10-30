/**
 * Normaliza el parámetro `next` de login/registro.
 * Solo acepta rutas internas del mismo origen y descarta `//host` y `/\host`.
 */
export function safeRedirect(raw: string | null, fallback = '/'): string {
  if (!raw) return fallback

  try {
    const url = new URL(raw, window.location.origin)
    if (url.origin !== window.location.origin) return fallback

    // Routers and browsers may decode a path again after this check. Inspect
    // repeated encodings too, so `/%252f%252fhost` cannot become `//host`.
    let pathname = url.pathname
    for (let attempt = 0; attempt < 5; attempt += 1) {
      if (/^\/[/\\]/.test(pathname)) return fallback
      const decoded = decodeURIComponent(pathname)
      if (decoded === pathname) break
      pathname = decoded
    }
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return fallback
  }
}
