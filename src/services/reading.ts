import { request } from '@/lib/api'
import { refToSeries } from '@/services/discovery'

interface WorkSummaryDto {
  id: string
  slug: string
  title: string
  coverUrl: string | null
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

export async function listAllFavorites() {
  const all: { series: ReturnType<typeof summary>; addedAt: string }[] = []
  for (let page = 1; ; page += 1) {
    const data = await request<Paginated<{ work: WorkSummaryDto; createdAt: string }>>(
      '/me/favorites',
      { query: { page, limit: MAX_LIMIT } },
    )
    all.push(
      ...data.items.map((item) => ({
        series: summary(item.work),
        addedAt: item.createdAt,
      })),
    )
    if (data.items.length < MAX_LIMIT || all.length >= data.total) return all
  }
}

export function addFavorite(workId: string) {
  return request<{ workId: string; isFavorite: boolean }>(`/me/favorites/${workId}`, {
    method: 'PUT',
  })
}

export function removeFavorite(workId: string) {
  return request<void>(`/me/favorites/${workId}`, { method: 'DELETE' })
}

export async function listReadingHistory(page = 1, limit = 20) {
  const data = await request<Paginated<HistoryItemDto>>('/me/reading-history', {
    query: { page, limit },
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

export function getReadingCalendar(from?: string, to?: string) {
  return request<ReadingCalendar>('/me/reading-calendar', { query: { from, to } })
}

/** Progreso de la obra con el estado de todos sus capítulos (paginado de a 100). */
export async function getWorkProgress(workId: string) {
  const first = await request<WorkProgress>(`/me/works/${workId}/progress`, {
    query: { page: 1, limit: MAX_LIMIT },
  })
  const items = [...first.chapters.items]
  for (let page = 2; items.length < first.chapters.total; page += 1) {
    const next = await request<WorkProgress>(`/me/works/${workId}/progress`, {
      query: { page, limit: MAX_LIMIT },
    })
    if (next.chapters.items.length === 0) break
    items.push(...next.chapters.items)
  }
  return { ...first, chapters: { ...first.chapters, items } }
}
