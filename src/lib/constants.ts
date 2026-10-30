import type { SeriesStatus, SeriesType, UserRole } from '@/types'

export const APP_NAME = 'ModoFriki'

export const NAV_LINKS = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/series', label: 'Catálogo' },
  { to: '/rankings', label: 'Rankings' },
  { to: '/genres', label: 'Géneros' },
] as const

export const SERIES_TYPES: SeriesType[] = ['Manhwa', 'Manga', 'Manhua', 'Novela']

export const SERIES_STATUSES: SeriesStatus[] = ['En emisión', 'Finalizado', 'En pausa']

export const SORT_OPTIONS = [
  { value: 'recent', label: 'Recientes' },
  { value: 'views', label: 'Más visitadas' },
] as const

export const READER_KEY = 'modofriki_reader'
export const PROGRESS_KEY = 'modofriki_progress'
/** Listas públicas (novedades, rankings): mismo minuto que la caché del backend. */
export const PUBLIC_CACHE_MS = 60_000
export const TOKEN_KEY = 'modofriki_token'
export const VOTES_KEY = 'modofriki_votes'
export const UI_KEY = 'modofriki_ui'

export const ROLE_LABELS: Record<UserRole, string> = {
  BASIC: 'Lector',
  EDITOR: 'Editor',
  ADMIN: 'Admin',
}
