import { beforeEach, describe, expect, it, vi } from 'vitest'

const { request } = vi.hoisted(() => ({ request: vi.fn() }))
vi.mock('@/lib/api', () => ({ request: (...args: unknown[]) => request(...args) }))

import { getWork, listChapters, listWorks } from './catalog'

describe('catalog service pagination and cancellation', () => {
  beforeEach(() => request.mockReset())

  it('passes catalog page filters and AbortSignal separately from the query', async () => {
    const signal = new AbortController().signal
    request.mockResolvedValue([])
    await listWorks({ page: 2, limit: 20, search: 'abc', signal })
    expect(request).toHaveBeenCalledWith('/works', {
      query: { page: 2, limit: 20, search: 'abc' },
      signal,
    })
  })

  it('passes cancellation to a work detail request', async () => {
    const signal = new AbortController().signal
    request.mockResolvedValue({
      id: 'w', slug: 'w', title: 'Work', alternativeTitles: [], type: { name: 'Manga' }, typeId: 't',
      releaseStatus: 'ONGOING', publicationStatus: 'PUBLISHED', visitsCount: 0, synopsis: '', genres: [], updatedAt: '',
      coverAsset: null, coverThumbAsset: null, incapBannerAsset: null,
    })
    await getWork('w', signal)
    expect(request).toHaveBeenCalledWith('/works/w', { signal })
  })

  it('keeps complete chapter traversal and forwards AbortSignal on each page', async () => {
    const signal = new AbortController().signal
    const firstPage = Array.from({ length: 100 }, (_, position) => ({
      id: `c${position}`, workId: 'w', number: String(position + 1), title: null,
      kind: 'NORMAL', status: 'PUBLISHED', version: 1, publishedAt: null, createdAt: '', pages: [],
    }))
    request.mockResolvedValueOnce(firstPage).mockResolvedValueOnce([])
    const chapters = await listChapters('w', false, signal)
    expect(chapters).toHaveLength(100)
    expect(request).toHaveBeenNthCalledWith(1, '/works/w/chapters', {
      query: { page: 1, limit: 100, includeDrafts: undefined }, signal,
    })
    expect(request).toHaveBeenNthCalledWith(2, '/works/w/chapters', {
      query: { page: 2, limit: 100, includeDrafts: undefined }, signal,
    })
  })
})
