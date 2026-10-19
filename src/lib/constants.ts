import type { FavoriteStatus, SeriesStatus, SeriesType } from '@/types'

export const APP_NAME = 'ModoFriki'

export const NAV_LINKS = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/series', label: 'Catálogo' },
  { to: '/rankings', label: 'Rankings' },
  { to: '/genres', label: 'Géneros' },
] as const

export const SERIES_TYPES: SeriesType[] = ['Manhwa', 'Manga', 'Manhua', 'Novela']

export const SERIES_STATUSES: SeriesStatus[] = ['En emisión', 'Finalizado', 'En pausa']

export const FAVORITE_STATUSES: FavoriteStatus[] = [
  'Leyendo',
  'Por leer',
  'Completado',
  'En pausa',
]

export const SORT_OPTIONS = [
  { value: 'recent', label: 'Recientes' },
  { value: 'rating', label: 'Mejor valoradas' },
  { value: 'views', label: 'Más leídas' },
  { value: 'title', label: 'A-Z' },
] as const

export const READER_KEY = 'modofriki_reader'
export const FAVORITES_KEY = 'modofriki_favorites'
export const PROGRESS_KEY = 'modofriki_progress'
export const AUTH_KEY = 'modofriki_auth'
export const UI_KEY = 'modofriki_ui'
