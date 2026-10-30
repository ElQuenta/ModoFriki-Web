import { describe, expect, it } from 'vitest'
import { toChapter, toSeries, type ChapterDto, type WorkDto } from './catalog'
import { refToSeries } from './discovery'
import { validateImages } from './admin'

const date = '2026-10-01T00:00:00.000Z'
const asset = (id: string) => ({
  id,
  url: `https://blob.test/${id}.png`,
  contentType: 'image/png' as const,
  status: 'AVAILABLE' as const,
  createdAt: date,
})
const genre = { id: 'g1', name: 'Acción', slug: 'accion' }
const work: WorkDto = {
  id: 'w1',
  slug: 'obra',
  title: 'Obra',
  synopsis: 'Sinopsis',
  typeId: 't1',
  publicationStatus: 'PUBLISHED',
  releaseStatus: 'HIATUS',
  createdAt: date,
  updatedAt: date,
  publishedAt: date,
  visitsCount: 7,
  type: { id: 't1', name: 'Manhwa', slug: 'manhwa' },
  coverAsset: asset('cover'),
  coverThumbAsset: null,
  incapBannerAsset: null,
  alternativeTitles: [{ id: 'a1', workId: 'w1', title: 'Alt', normalizedTitle: 'alt' }],
  genres: [{ id: 'wg1', workId: 'w1', genreId: 'g1', genre }],
}

describe('toSeries', () => {
  it('mapea el DTO de obra al dominio', () => {
    expect(toSeries(work)).toMatchObject({
      id: 'w1',
      title: 'Obra',
      coverUrl: 'https://blob.test/cover.png',
      bannerUrl: 'https://blob.test/cover.png',
      type: 'Manhwa',
      status: 'En pausa',
      views: 7,
      genres: ['Acción'],
      alternativeTitles: ['Alt'],
    })
  })

  it('usa el banner propio si existe y cadena vacía sin portada', () => {
    expect(toSeries({ ...work, incapBannerAsset: asset('banner') }).bannerUrl).toBe(
      'https://blob.test/banner.png',
    )
    expect(toSeries({ ...work, coverAsset: null }).coverUrl).toBe('')
  })
})

describe('toChapter', () => {
  it('ordena las páginas por posición y usa publishedAt como fecha', () => {
    const dto: ChapterDto = {
      id: 'c1',
      workId: 'w1',
      number: '12.5',
      title: null,
      kind: 'NORMAL',
      status: 'PUBLISHED',
      version: 3,
      publishedAt: '2026-10-02T00:00:00.000Z',
      createdAt: '2026-10-01T00:00:00.000Z',
      updatedAt: '2026-10-02T00:00:00.000Z',
      pages: [
        { id: 'p2', chapterId: 'c1', position: 2, asset: asset('p2') },
        { id: 'p1', chapterId: 'c1', position: 1, asset: asset('p1') },
      ],
    }
    expect(toChapter(dto)).toMatchObject({
      seriesId: 'w1',
      number: '12.5',
      title: '',
      version: 3,
      releaseDate: '2026-10-02T00:00:00.000Z',
      pages: [
        { id: 'p1', pageNumber: 1, imageUrl: 'https://blob.test/p1.png' },
        { id: 'p2', pageNumber: 2, imageUrl: 'https://blob.test/p2.png' },
      ],
    })
  })

  it('sin publicar usa createdAt y sin páginas devuelve []', () => {
    const chapter = toChapter({
      id: 'c',
      workId: 'w',
      number: '1',
      title: 'T',
      kind: 'NORMAL',
      status: 'DRAFT',
      version: 1,
      publishedAt: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      pages: [],
    })
    expect(chapter.releaseDate).toBe('2026-01-01T00:00:00.000Z')
    expect(chapter.pages).toEqual([])
  })
})

describe('refToSeries', () => {
  it('convierte la referencia corta y tolera portada nula', () => {
    expect(
      refToSeries({ id: 'w', slug: 's', title: 'T', coverUrl: null }, 4),
    ).toMatchObject({ id: 'w', coverUrl: '', views: 4, genres: [] })
  })
})

describe('validateImages', () => {
  const file = (name: string, type: string, size: number) =>
    new File([new Uint8Array(size)], name, { type })

  it('acepta JPEG, PNG y WebP dentro del límite', () => {
    expect(
      validateImages([file('a.jpg', 'image/jpeg', 10), file('b.webp', 'image/webp', 10)]),
    ).toBeUndefined()
  })

  it('rechaza otros formatos', () => {
    expect(validateImages([file('doc.pdf', 'application/pdf', 10)])).toContain('doc.pdf')
  })

  it('rechaza archivos de más de 10 MiB', () => {
    expect(
      validateImages([file('big.png', 'image/png', 10 * 1024 * 1024 + 1)]),
    ).toContain('10 MiB')
  })

  it('rechaza más de 100 páginas', () => {
    expect(
      validateImages(
        Array.from({ length: 101 }, (_, i) => file(`${i}.png`, 'image/png', 1)),
      ),
    ).toContain('100 páginas')
  })
})
