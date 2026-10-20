import { request } from '@/lib/api'
import type { ChapterKind, LatestChapterItem, Series } from '@/types'

interface WorkRefDto {
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

interface LatestChapterDto {
  id: string
  workId: string
  number: string
  title: string | null
  kind: ChapterKind
  publishedAt: string
  work: WorkRefDto
}

interface PopularWorkDto {
  work: WorkRefDto
  visits: number
}

export function refToSeries(ref: WorkRefDto, views?: number): Series {
  return {
    id: ref.id,
    slug: ref.slug,
    title: ref.title,
    alternativeTitles: [],
    coverUrl: ref.coverUrl ?? '',
    bannerUrl: ref.coverUrl ?? '',
    type: '',
    synopsis: '',
    genres: [],
    views,
  }
}

const toPopular = (item: PopularWorkDto) => refToSeries(item.work, item.visits)

interface PageQuery {
  page?: number
  limit?: number
  typeId?: string
}

export async function listLatestChapters(query: PageQuery = {}) {
  const data = await request<Paginated<LatestChapterDto>>('/chapters/latest', {
    query: { ...query },
  })
  return {
    ...data,
    items: data.items.map<LatestChapterItem>((item) => ({
      series: refToSeries(item.work),
      chapter: {
        id: item.id,
        seriesId: item.workId,
        number: item.number,
        title: item.title ?? '',
        kind: item.kind,
        releaseDate: item.publishedAt,
        pages: [],
      },
    })),
  }
}

export async function listPopularWorks(
  query: PageQuery & { period?: 'all' | 'day' } = {},
) {
  const data = await request<Paginated<PopularWorkDto>>('/works/popular', {
    query: { ...query },
  })
  return { ...data, items: data.items.map(toPopular) }
}

export async function listRecommendedWorks(limit = 12) {
  const data = await request<{ basis: 'genres' | 'popular'; items: PopularWorkDto[] }>(
    '/works/recommended',
    { query: { limit } },
  )
  return { basis: data.basis, items: data.items.map(toPopular) }
}
