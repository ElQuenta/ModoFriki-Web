import { readStorage } from '@/lib/storage'
import { TOKEN_KEY } from '@/lib/constants'

export const API_URL = (
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'
).replace(/\/$/, '')

export const UNAUTHORIZED_EVENT = 'modofriki:unauthorized'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
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
    if (response.status === 401 && token)
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    const message =
      MESSAGES[response.status] ??
      payload?.error?.message ??
      'Algo salió mal en el servidor.'
    throw new ApiError(message, response.status)
  }

  return payload?.data as T
}
