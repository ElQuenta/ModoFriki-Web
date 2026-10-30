import { beforeEach, describe, expect, it, vi } from 'vitest'

const { request } = vi.hoisted(() => ({ request: vi.fn() }))
vi.mock('@/lib/api', () => ({ request: (...args: unknown[]) => request(...args) }))

import { getReadingCalendar, getWorkProgress, listAllFavorites, listFavorites, listReadingHistory, validateCalendarRange } from './reading'

const work = (id: number) => ({ id: `work-${id}`, slug: `work-${id}`, title: `Work ${id}`, coverUrl: null })

describe('reading pagination and calendar contracts', () => {
  beforeEach(() => request.mockReset())

  it('returns one favorites page with its real total and forwards AbortSignal', async () => {
    const controller = new AbortController()
    request.mockResolvedValue({ page: 2, limit: 20, total: 41, items: [{ work: work(21), createdAt: '2026-01-01' }] })
    const result = await listFavorites(2, 20, controller.signal)
    expect(result.total).toBe(41)
    expect(result.items[0]?.series.id).toBe('work-21')
    expect(request).toHaveBeenCalledWith('/me/favorites', { query: { page: 2, limit: 20 }, signal: controller.signal })
  })

  it('accumulates 41 favorites through three real-total pages when a full list is explicitly requested', async () => {
    const page = (number: number, ids: number[]) => ({ page: number, limit: 20, total: 41, items: ids.map((id) => ({ work: work(id), createdAt: '2026-01-01' })) })
    request.mockResolvedValueOnce(page(1, Array.from({ length: 20 }, (_, i) => i + 1)))
      .mockResolvedValueOnce(page(2, Array.from({ length: 20 }, (_, i) => i + 21)))
      .mockResolvedValueOnce(page(3, [41]))
    const result = await listAllFavorites()
    expect(result).toHaveLength(41)
    expect(request).toHaveBeenCalledTimes(3)
  })

  it('maps history a requested page without fetching earlier pages again', async () => {
    request.mockResolvedValue({ page: 3, limit: 20, total: 41, items: [{ chapterId: 'c41', isRead: true, firstReadAt: '2026-01-01', lastReadAt: '2026-01-02', work: work(41), chapter: { id: 'c41', number: '12.125', title: null } }] })
    const result = await listReadingHistory(3, 20)
    expect(request).toHaveBeenCalledTimes(1)
    expect(result.total).toBe(41)
    expect(result.items[0]).toMatchObject({ chapterId: 'c41', chapterNumber: '12.125', chapterTitle: '' })
  })

  it('supports incremental reading-history pages beyond the first forty records', async () => {
    for (let page = 1; page <= 3; page += 1) {
      const ids = page === 3 ? [41] : Array.from({ length: 20 }, (_, i) => (page - 1) * 20 + i + 1)
      request.mockResolvedValueOnce({ page, limit: 20, total: 41, items: ids.map((id) => ({ chapterId: `c${id}`, isRead: false, firstReadAt: '2026-01-01', lastReadAt: '2026-01-01', work: work(1), chapter: { id: `c${id}`, number: String(id), title: null } })) })
    }
    const pages = await Promise.all([listReadingHistory(1), listReadingHistory(2), listReadingHistory(3)])
    expect(pages.flatMap((page) => page.items)).toHaveLength(41)
    expect(pages.map((page) => page.total)).toEqual([41, 41, 41])
  })

  it('uses real page totals and deduplicates chapter progress across 100-item pages', async () => {
    const chapter = (chapterId: string) => ({ chapterId, isRead: true, firstReadAt: null, lastReadAt: null })
    const base = { workId: 'w', isFavorite: false, score: 0, totalChapters: 101, readChapters: 101, completionPercentage: 100 }
    request.mockResolvedValueOnce({ ...base, chapters: { page: 1, limit: 100, total: 101, items: [...Array.from({ length: 100 }, (_, i) => chapter(`c${i}`))] } })
    request.mockResolvedValueOnce({ ...base, chapters: { page: 2, limit: 100, total: 101, items: [chapter('c99'), chapter('c100')] } })
    const result = await getWorkProgress('w')
    expect(request).toHaveBeenCalledTimes(2)
    expect(result.chapters.items).toHaveLength(101)
    expect(result.score).toBe(0)
  })

  it('validates an inclusive 366-day calendar range and rejects invalid or oversized ranges before HTTP', async () => {
    expect(validateCalendarRange('2024-01-01', '2024-12-31')).toBeUndefined()
    expect(validateCalendarRange('2024-01-01', '2025-01-01')).toBe('El rango no puede superar 366 días.')
    expect(validateCalendarRange('2024-02-31', '2024-03-01')).toBeTruthy()
    expect(validateCalendarRange('2024-02-02', '2024-02-01')).toBeTruthy()
    await expect(getReadingCalendar('2024-01-01', '2025-01-01')).rejects.toThrow()
    expect(request).not.toHaveBeenCalled()
  })
})
