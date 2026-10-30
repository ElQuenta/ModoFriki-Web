import { readStorage } from '@/lib/storage'
import { TOKEN_KEY } from '@/lib/constants'

export const API_URL = (
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'
).replace(/\/$/, '')

export const UNAUTHORIZED_EVENT = 'modofriki:unauthorized'

export class ApiError extends Error {
  status: number
  /** Mensaje original del backend (en inglés), útil para distinguir casos. */
  detail?: string

  constructor(message: string, status: number, detail?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

// Mensajes del backend que merecen un texto propio en vez del genérico por estado.
const DETAILS: Record<string, string> = {
  'A published work requires a cover':
    'Para publicar la obra necesitas subir una portada.',
  'Published work requires a cover': 'Para publicar la obra necesitas subir una portada.',
  'Publish the work before publishing its chapters':
    'Publica la obra antes de publicar sus capítulos.',
  'Published chapters require pages':
    'Para publicar el capítulo necesitas subir páginas.',
  'Published chapter requires pages and a published work':
    'Para publicar el capítulo necesitas páginas y que la obra esté publicada.',
  'Chapter number already exists': 'Ya existe un capítulo con ese número.',
  'Resource or media identifier already exists':
    'Ya existe un elemento con ese nombre o slug.',
  'Another upload is pending for this work':
    'Hay otra subida en curso para esta obra. Espera un momento.',
  'Work is not assigned to this editor':
    'Esta obra no está asignada a tu cuenta de editor.',
  'At least one page is required': 'Sube al menos una página.',
  'Chapter exceeds 1000 pages': 'Un capítulo no puede pasar de 1000 páginas.',
  'Invalid insertion position': 'La posición de inserción no es válida.',
  'Unknown genre': 'Uno de los géneros no existe.',
  'Unknown work type': 'El tipo de obra no existe.',
  'Combined files exceed 100 MiB': 'Los archivos juntos pasan de 100 MiB.',
}

const MESSAGES: Record<number, string> = {
  0: 'No pudimos conectar con el servidor. Revisa tu conexión.',
  400: 'Revisa los datos que enviaste.',
  401: 'Tu sesión no es válida. Inicia sesión otra vez.',
  403: 'No tienes permiso para hacer esto.',
  404: 'No encontramos lo que buscas.',
  409: 'Alguien cambió estos datos antes que tú. Recarga e inténtalo otra vez.',
  413: 'Los archivos pesan demasiado.',
  415: 'Ese formato de archivo no está permitido. Usa JPEG, PNG o WebP.',
  429: 'Demasiadas solicitudes. Espera un momento.',
  503: 'El almacenamiento no está disponible ahora. Inténtalo más tarde.',
}

export function errorMessage(
  error: unknown,
  fallback = 'Algo salió mal. Inténtalo otra vez.',
) {
  if (error instanceof ApiError) return error.message
  return fallback
}

type Query = Record<string, string | number | boolean | undefined | null>

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  query?: Query
  signal?: AbortSignal
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, signal } = options
  const url = new URL(API_URL + path)
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  }

  const token = readStorage<string | null>(TOKEN_KEY, null)
  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`
  const isForm = body instanceof FormData
  if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json'

  let response: Response
  try {
    response = await fetch(url, {
      method,
      headers,
      signal,
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError(MESSAGES[0], 0)
  }

  if (response.status === 204) return undefined as T

  const payload = (await response.json().catch(() => null)) as {
    data?: T
    error?: { message?: string }
  } | null

  if (!response.ok) {
    // Un 401 al intentar entrar o registrarse es un fallo de credenciales, no una
    // sesión expirada: no debe cerrar la sesión que ya existiera en el dispositivo.
    const isAuthAttempt = path === '/auth/login' || path === '/auth/register'
    if (response.status === 401 && token && !isAuthAttempt)
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    const detail = payload?.error?.message
    const message =
      (detail && DETAILS[detail]) ??
      MESSAGES[response.status] ??
      'Algo salió mal en el servidor.'
    throw new ApiError(message, response.status, detail)
  }

  return payload?.data as T
}

/** Reintenta errores de red o 5xx (no los 4xx). Úsalo con operaciones idempotentes. */
export async function withRetry<T>(run: () => Promise<T>, attempts = 3): Promise<T> {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await run()
    } catch (error) {
      const retriable =
        error instanceof ApiError && (error.status === 0 || error.status >= 500)
      if (!retriable || attempt >= attempts) throw error
      await new Promise((resolve) => setTimeout(resolve, 500 * attempt))
    }
  }
}
