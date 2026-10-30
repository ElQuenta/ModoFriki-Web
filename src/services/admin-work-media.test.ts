import { beforeEach, describe, expect, it, vi } from 'vitest'

const { request } = vi.hoisted(() => ({ request: vi.fn() }))
vi.mock('@/lib/api', () => ({ request }))

import { createWork, updateWork } from './admin'

const input = {
  title: 'Obra', synopsis: 'Sinopsis', typeId: 'type', publicationStatus: 'DRAFT' as const,
  releaseStatus: 'ONGOING' as const, alternativeTitles: [], genreIds: [],
}
const asset = (id: string) => ({
  id, url: `https://assets.test/${id}.png`, contentType: 'image/png' as const,
  status: 'AVAILABLE' as const, createdAt: '2026-01-01T00:00:00.000Z',
})
const savedWork = {
  id: 'work-id', slug: 'obra', title: 'Obra', synopsis: 'Sinopsis', typeId: 'type',
  publicationStatus: 'DRAFT' as const, releaseStatus: 'ONGOING' as const,
  createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-02T00:00:00.000Z',
  publishedAt: null, visitsCount: 0, type: { id: 'type', name: 'Manga', slug: 'manga' },
  coverAsset: asset('cover'), bannerAsset: asset('detail'), coverThumbAsset: null,
  incapBannerAsset: asset('chapter'), alternativeTitles: [], genres: [],
}

describe('work media transport', () => {
  beforeEach(() => request.mockReset().mockResolvedValue(savedWork))

  it('creates works with all independent media multipart fields', async () => {
    const cover = new File(['cover'], 'cover.png', { type: 'image/png' })
    const banner = new File(['detail'], 'detail.png', { type: 'image/png' })
    const inpagecover = new File(['chapter'], 'chapter.png', { type: 'image/png' })
    const result = await createWork(input, { cover, banner, inpagecover })

    expect(request).toHaveBeenCalledWith('/works', expect.objectContaining({ method: 'POST', body: expect.any(FormData) }))
    const form = request.mock.calls[0][1].body as FormData
    expect(form.get('cover')).toBe(cover)
    expect(form.get('banner')).toBe(banner)
    expect(form.get('inpagecover')).toBe(inpagecover)
    expect(result.detailBannerMedia).toEqual({ id: 'detail', url: 'https://assets.test/detail.png' })
  })

  it('updates a single selected medium and preserves the current independent fields server-side', async () => {
    const banner = new File(['new detail'], 'new-detail.png', { type: 'image/png' })
    await updateWork('work-id', input, { banner }, '2026-01-01T00:00:00.000Z')

    expect(request).toHaveBeenCalledWith('/works/work-id', expect.objectContaining({ method: 'PATCH', body: expect.any(FormData) }))
    const form = request.mock.calls[0][1].body as FormData
    expect(form.get('banner')).toBe(banner)
    expect(form.get('cover')).toBeNull()
    expect(form.get('inpagecover')).toBeNull()
    expect(form.get('expectedUpdatedAt')).toBe('2026-01-01T00:00:00.000Z')
  })
})
