import { request } from '@/lib/api'
import { refToSeries } from '@/services/discovery'

interface WorkSummaryDto {
  id: string
  slug: string
  title: string
  coverUrl: string | null
  thumbUrl?: string | null
}

interface Paginated<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

export interface WorkStats {
  workId: string
  visits: number
  visitsLast24Hours: number
  reads: number
  readsLast24Hours: number
  favorites: number
  ratings: number
  averageRating: number | null
}

export interface ReadEvent {
  counted: boolean
  occurredAt: string
  isRead: boolean
}

export interface ChapterReadState {
  chapterId: string
  isRead: boolean
  firstReadAt: string | null
  lastReadAt: string | null
  number?: string
  title?: string | null
}

export interface WorkProgress {
  workId: string
  isFavorite: boolean
  score: number | null
  totalChapters: number
  readChapters: number
  completionPercentage: number
  chapters: Paginated<ChapterReadState>
}

export interface ReadingStats {
  markedReadChapters: number
  favorites: number
  recordedReads: number
  activeDays: number
  readsToday: number
  readsLast7Days: number
  readsLast30Days: number
  currentStreak: number
  longestStreak: number
  lastReadingDate: string | null
  timezone: string
}

export interface ReadingCalendar {
  timezone: string
  from: string
  to: string
  days: { date: string; chaptersRead: number }[]
}

interface HistoryItemDto {
  chapterId: string
  isRead: boolean
  firstReadAt: string
  lastReadAt: string
  work: WorkSummaryDto
  chapter: { id: string; number: string; title: string | null }
}

const summary = (work: WorkSummaryDto) => refToSeries(work)

export function recordVisit(workId: string, idempotencyKey: string) {
  return request<unknown>(`/works/${workId}/visits`, {
    method: 'POST',
    body: { idempotencyKey },
  })
}

export function getWorkStats(workId: string) {
  return request<WorkStats>(`/works/${workId}/stats`)
}

export function setRating(workId: string, score: number) {
  if (!Number.isFinite(score) || score < 0 || score > 5 || score * 2 !== Math.round(score * 2)) {
    return Promise.reject(new Error('La valoración debe estar entre 0 y 5 en pasos de 0,5.'))
  }
  return request<{ workId: string; score: number | null }>(`/works/${workId}/rating`, {
    method: 'PUT',
    body: { score },
  })
}

export function removeRating(workId: string) {
  return request<void>(`/works/${workId}/rating`, { method: 'DELETE' })
}

export function recordReadEvent(chapterId: string, idempotencyKey: string) {
  return request<ReadEvent>(`/chapters/${chapterId}/read-events`, {
    method: 'POST',
    body: { idempotencyKey },
  })
}

export function markChapterRead(chapterId: string) {
  return request<ChapterReadState>(`/me/read-chapters/${chapterId}`, { method: 'PUT' })
}

export function unmarkChapterRead(chapterId: string) {
  return request<void>(`/me/read-chapters/${chapterId}`, { method: 'DELETE' })
}

const MAX_LIMIT = 100

export async function listFavorites(page = 1, limit = 20, signal?: AbortSignal) {
  const data = await request<Paginated<{ work: WorkSummaryDto; createdAt: string }>>(
    '/me/favorites',
    { query: { page, limit: Math.min(limit, MAX_LIMIT) }, signal },
  )
  return {
    ...data,
    items: data.items.map((item) => ({
      series: summary(item.work),
      addedAt: item.createdAt,
    })),
  }
}

/** Compatibility helper for consumers that explicitly need the entire collection. */
export async function listAllFavorites(signal?: AbortSignal) {
  const first = await listFavorites(1, MAX_LIMIT, signal)
  const items = [...first.items]
  const seen = new Set(items.map((item) => item.series.id))
  for (let page = 2; items.length < first.total; page += 1) {
    const next = await listFavorites(page, MAX_LIMIT, signal)
    if (!next.items.length) break
    const before = items.length
    for (const item of next.items) {
      if (!seen.has(item.series.id)) {
        seen.add(item.series.id)
        items.push(item)
      }
    }
    if (items.length === before) break
  }
  return items
}

export function addFavorite(workId: string) {
  return request<{ workId: string; isFavorite: boolean }>(`/me/favorites/${workId}`, {
    method: 'PUT',
  })
}

export function removeFavorite(workId: string) {
  return request<void>(`/me/favorites/${workId}`, { method: 'DELETE' })
}

export async function listReadingHistory(page = 1, limit = 20, signal?: AbortSignal) {
  const data = await request<Paginated<HistoryItemDto>>('/me/reading-history', {
    query: { page, limit: Math.min(limit, MAX_LIMIT) },
    signal,
  })
  return {
    ...data,
    items: data.items.map((item) => ({
      chapterId: item.chapterId,
      isRead: item.isRead,
      lastReadAt: item.lastReadAt,
      chapterNumber: item.chapter.number,
      chapterTitle: item.chapter.title ?? '',
      series: summary(item.work),
    })),
  }
}

export type HistoryEntry = Awaited<ReturnType<typeof listReadingHistory>>['items'][number]

export function getReadingStats() {
  return request<ReadingStats>('/me/reading-stats')
}

export function validateCalendarRange(from: string, to: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return 'Usa fechas con formato AAAA-MM-DD.'
  }
  const start = new Date(`${from}T00:00:00Z`)
  const end = new Date(`${to}T00:00:00Z`)
  if (Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf()) || start.toISOString().slice(0, 10) !== from || end.toISOString().slice(0, 10) !== to) {
    return 'El rango contiene una fecha no válida.'
  }
  const days = Math.floor((end.valueOf() - start.valueOf()) / 86_400_000) + 1
  if (days < 1) return 'La fecha inicial debe ser anterior o igual a la fecha final.'
  if (days > 366) return 'El rango no puede superar 366 días.'
  return undefined
}

export function getReadingCalendar(from?: string, to?: string, signal?: AbortSignal) {
  if (from && to) {
    const error = validateCalendarRange(from, to)
    if (error) return Promise.reject(new Error(error))
  } else if (from || to) {
    return Promise.reject(new Error('Indica ambas fechas para consultar un rango.'))
  }
  return request<ReadingCalendar>('/me/reading-calendar', { query: { from, to }, signal })
}

/** Progreso de la obra con el estado de todos sus capítulos (paginado de a 100). */
export async function getWorkProgress(workId: string, signal?: AbortSignal) {
  const first = await request<WorkProgress>(`/me/works/${workId}/progress`, {
    query: { page: 1, limit: MAX_LIMIT },
    signal,
  })
  const items = [...first.chapters.items]
  const seen = new Set(items.map((item) => item.chapterId))
  for (let page = 2; items.length < first.chapters.total; page += 1) {
    const next = await request<WorkProgress>(`/me/works/${workId}/progress`, {
      query: { page, limit: MAX_LIMIT },
      signal,
    })
    if (next.chapters.items.length === 0) break
    const before = items.length
    for (const item of next.chapters.items) {
      if (!seen.has(item.chapterId)) {
        seen.add(item.chapterId)
        items.push(item)
      }
    }
    if (items.length === before) break
  }
  return { ...first, chapters: { ...first.chapters, items } }
}
