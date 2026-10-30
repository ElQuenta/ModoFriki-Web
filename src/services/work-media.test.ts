import { afterEach, describe, expect, it, vi } from 'vitest'
import type { WorkMediaSlots } from '@/types/work-media'
import { toSeries, type WorkDto } from './catalog'
import {
  clearWorkMediaSelection,
  createWorkMediaSlot,
  disposeWorkMediaSlot,
  selectWorkMedia,
  validateSelectedMediaFiles,
  validateWorkMediaSlots,
  WORK_MEDIA_FILE_LIMIT,
  WORK_MEDIA_REQUEST_LIMIT,
} from './work-media'

const asset = (id: string) => ({
  id, url: `https://media.test/${id}.png`, contentType: 'image/png' as const,
  status: 'AVAILABLE' as const, createdAt: '2026-01-01T00:00:00.000Z',
})

const dto: WorkDto = {
  id: 'work-1', slug: 'work', title: 'Obra', synopsis: '', typeId: 'type',
  publicationStatus: 'DRAFT', releaseStatus: 'ONGOING', createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z', publishedAt: null, visitsCount: 0,
  type: { id: 'type', name: 'Manga', slug: 'manga' }, coverAsset: asset('cover'),
  bannerAsset: null,
  coverThumbAsset: null, incapBannerAsset: asset('chapter-banner'), alternativeTitles: [], genres: [],
}

function file(name: string, type: string, size = 1) {
  const value = new File([], name, { type })
  Object.defineProperty(value, 'size', { value: size })
  return value
}

const completeSlots = (): WorkMediaSlots => ({
  cover: createWorkMediaSlot(null),
  detailBanner: createWorkMediaSlot(null),
  chapterBanner: createWorkMediaSlot(null),
})

afterEach(() => vi.restoreAllMocks())

describe('work media slots and current DTO', () => {
  it('maps only persisted DTO assets and never treats a visual fallback as detail-banner persistence', () => {
    const series = toSeries(dto)
    expect(series).toMatchObject({
      coverUrl: 'https://media.test/cover.png',
      coverMedia: { id: 'cover', url: 'https://media.test/cover.png' },
      detailBannerUrl: null,
      detailBannerMedia: null,
      chapterBannerUrl: 'https://media.test/chapter-banner.png',
      chapterBannerMedia: { id: 'chapter-banner', url: 'https://media.test/chapter-banner.png' },
      bannerUrl: 'https://media.test/chapter-banner.png',
    })
    expect(toSeries({ ...dto, coverAsset: null, incapBannerAsset: null })).toMatchObject({
      coverUrl: '', coverMedia: null, detailBannerUrl: null, chapterBannerUrl: null, bannerUrl: '',
    })
  })

  it('maps the independent persisted detail banner returned by the backend', () => {
    const series = toSeries({ ...dto, bannerAsset: asset('detail-banner') })
    expect(series).toMatchObject({
      detailBannerUrl: 'https://media.test/detail-banner.png',
      detailBannerMedia: { id: 'detail-banner', url: 'https://media.test/detail-banner.png' },
      chapterBannerUrl: 'https://media.test/chapter-banner.png',
    })
  })

  it('requires three separate persisted or newly selected slots even for a draft', () => {
    const slots = completeSlots()
    slots.cover = createWorkMediaSlot({ id: 'persisted-cover', url: '/cover.jpg' })
    slots.chapterBanner = createWorkMediaSlot({ id: 'persisted-chapter', url: '/chapter.jpg' })
    expect(validateWorkMediaSlots(slots)).toMatch(/banner de ficha/)
    slots.detailBanner = { ...createWorkMediaSlot(null), selected: file('detail.webp', 'image/webp') }
    expect(validateWorkMediaSlots(slots)).toBeUndefined()
  })

  it('enforces supported MIME types and inclusive individual and request size limits', () => {
    expect(validateSelectedMediaFiles([file('ok.jpg', 'image/jpeg', WORK_MEDIA_FILE_LIMIT)])).toBeUndefined()
    expect(validateSelectedMediaFiles([file('large.jpg', 'image/jpeg', WORK_MEDIA_FILE_LIMIT + 1)])).toMatch(/10 MiB/)
    expect(validateSelectedMediaFiles([file('bad.gif', 'image/gif')])).toMatch(/JPEG, PNG ni WebP/)
    expect(validateSelectedMediaFiles(Array.from({ length: 10 }, (_, i) => file(`${i}.png`, 'image/png', WORK_MEDIA_FILE_LIMIT)))).toBeUndefined()
    expect(validateSelectedMediaFiles(Array.from({ length: 11 }, (_, i) => file(`${i}.png`, 'image/png', WORK_MEDIA_FILE_LIMIT)))).toMatch(/100 MiB/)
    expect(WORK_MEDIA_REQUEST_LIMIT).toBe(100 * 1024 * 1024)
  })

  it('invalid replacement blocks the slot despite its persisted value; cancel restores it', () => {
    const slot = createWorkMediaSlot({ id: 'original', url: '/original.jpg' })
    const invalid = selectWorkMedia(slot, file('bad.gif', 'image/gif'))
    expect(invalid).toMatchObject({ persisted: slot.persisted, selected: null, previewUrl: '/original.jpg' })
    expect(invalid.error).toBeTruthy()
    expect(validateWorkMediaSlots({ cover: invalid, detailBanner: createWorkMediaSlot({ id: 'd', url: '/d' }), chapterBanner: createWorkMediaSlot({ id: 'c', url: '/c' }) })).toBe(invalid.error)
    expect(clearWorkMediaSelection(invalid)).toMatchObject({ persisted: slot.persisted, selected: null, previewUrl: '/original.jpg', error: undefined })
  })

  it('releases replaced, cancelled, and disposed object URL previews', () => {
    const create = vi.spyOn(URL, 'createObjectURL').mockReturnValueOnce('blob:one').mockReturnValueOnce('blob:two')
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    const first = selectWorkMedia(createWorkMediaSlot(null), file('one.png', 'image/png'))
    const second = selectWorkMedia(first, file('two.png', 'image/png'))
    expect(revoke).toHaveBeenCalledWith('blob:one')
    const cleared = clearWorkMediaSelection(second)
    expect(revoke).toHaveBeenCalledWith('blob:two')
    disposeWorkMediaSlot(cleared)
    expect(revoke).toHaveBeenCalledTimes(2)
    expect(create).toHaveBeenCalledTimes(2)
  })
})
