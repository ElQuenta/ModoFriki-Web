import { request } from '@/lib/api'
import type { LatestChapterItem, Series } from '@/types'
import type { components } from '@/types/api.generated'

// Generados desde openapi.yaml del backend (npm run gen:api).
type WorkRefDto = components['schemas']['WorkRef']
type LatestChapterPage = components['schemas']['LatestChapterPage']
type PopularWorkPage = components['schemas']['PopularWorkPage']
type PopularWorkDto = components['schemas']['PopularWork']
type RecommendedWorks = components['schemas']['RecommendedWorks']

/** Acepta WorkRef y el resumen de obra de la biblioteca (misma forma, thumbUrl opcional). */
export function refToSeries(
  ref: Omit<WorkRefDto, 'thumbUrl'> & Partial<Pick<WorkRefDto, 'thumbUrl'>>,
  views?: number,
): Series {
  return {
    id: ref.id,
    slug: ref.slug,
    title: ref.title,
    alternativeTitles: [],
    coverUrl: ref.coverUrl ?? '',
    thumbUrl: ref.thumbUrl ?? undefined,
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
  signal?: AbortSignal
}

export async function listLatestChapters(query: PageQuery = {}) {
  const { signal, ...params } = query
  const data = await request<LatestChapterPage>('/chapters/latest', { query: params, signal })
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
  const { signal, ...params } = query
  const data = await request<PopularWorkPage>('/works/popular', { query: params, signal })
  return { ...data, items: data.items.map(toPopular) }
}

export async function listRecommendedWorks(limit = 12) {
  const data = await request<RecommendedWorks>('/works/recommended', { query: { limit } })
  return { basis: data.basis, items: data.items.map(toPopular) }
}
