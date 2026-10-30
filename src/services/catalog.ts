import { request } from '@/lib/api'
import type { Chapter, ReleaseStatus, Series, SeriesStatus, Taxonomy } from '@/types'
import type { components } from '@/types/api.generated'

// Generados desde openapi.yaml del backend (npm run gen:api): si el contrato cambia,
// el build falla aquí en vez de fallar en producción.
export type WorkDto = components['schemas']['CatalogWork']
export type ChapterDto = components['schemas']['CatalogChapter']
export type ChapterDetailDto = components['schemas']['CatalogChapterDetail']

export const RELEASE_STATUS_LABELS: Record<ReleaseStatus, SeriesStatus> = {
  ONGOING: 'En emisión',
  COMPLETED: 'Finalizado',
  HIATUS: 'En pausa',
  CANCELLED: 'Cancelado',
}

export function toSeries(work: WorkDto): Series {
  const cover = work.coverAsset?.url ?? ''
  const detailBanner = work.bannerAsset?.url ?? null
  const chapterBanner = work.incapBannerAsset?.url ?? null
  return {
    id: work.id,
    slug: work.slug,
    title: work.title,
    alternativeTitles: work.alternativeTitles.map((item) => item.title),
    coverUrl: cover,
    thumbUrl: work.coverThumbAsset?.url,
    detailBannerUrl: detailBanner,
    chapterBannerUrl: chapterBanner,
    coverMedia: work.coverAsset ? { id: work.coverAsset.id, url: work.coverAsset.url } : null,
    detailBannerMedia: work.bannerAsset
      ? { id: work.bannerAsset.id, url: work.bannerAsset.url }
      : null,
    chapterBannerMedia: work.incapBannerAsset
      ? { id: work.incapBannerAsset.id, url: work.incapBannerAsset.url }
      : null,
    // Alias temporal para vistas antiguas; no constituye un banner de ficha persistido.
    bannerUrl: chapterBanner ?? cover,
    type: work.type.name,
    typeId: work.typeId,
    status: RELEASE_STATUS_LABELS[work.releaseStatus],
    releaseStatus: work.releaseStatus,
    publicationStatus: work.publicationStatus,
    views: work.visitsCount,
    synopsis: work.synopsis,
    genres: work.genres.map((item) => item.genre.name),
    genreItems: work.genres.map((item) => item.genre),
    updatedAt: work.updatedAt,
  }
}

export function toChapter(chapter: ChapterDto): Chapter {
  return {
    id: chapter.id,
    seriesId: chapter.workId,
    number: chapter.number,
    title: chapter.title ?? '',
    kind: chapter.kind,
    status: chapter.status,
    version: chapter.version,
    releaseDate: chapter.publishedAt ?? chapter.createdAt,
    pages: [...(chapter.pages ?? [])]
      .sort((a, b) => a.position - b.position)
      .map((page) => ({
        id: page.id,
        pageNumber: page.position,
        imageUrl: page.asset.url,
      })),
  }
}

export interface WorkFilters {
  page?: number
  limit?: number
  search?: string
  typeId?: string
  genreId?: string
  includeDrafts?: boolean
  signal?: AbortSignal
}

export async function listWorks(filters: WorkFilters = {}) {
  const { signal, ...query } = filters
  const works = await request<WorkDto[]>('/works', { query, signal })
  return works.map(toSeries)
}

export async function getWork(workId: string, signal?: AbortSignal) {
  return toSeries(await request<WorkDto>(`/works/${workId}`, { signal }))
}

const CHAPTER_PAGE = 100

/** Trae todos los capítulos (el backend pagina de a 100 como máximo), en orden ascendente. */
export async function listChapters(workId: string, includeDrafts = false, signal?: AbortSignal) {
  const all: Chapter[] = []
  for (let page = 1; ; page += 1) {
    const batch = await request<ChapterDto[]>(`/works/${workId}/chapters`, {
      query: { page, limit: CHAPTER_PAGE, includeDrafts: includeDrafts || undefined },
      signal,
    })
    all.push(...batch.map(toChapter))
    if (batch.length < CHAPTER_PAGE) return all
  }
}

export async function getChapter(workId: string, chapterId: string) {
  return toChapter(await request<ChapterDetailDto>(`/works/${workId}/chapters/${chapterId}`))
}

export function listWorkTypes() {
  return request<Taxonomy[]>('/work-types')
}

export function listGenres() {
  return request<Taxonomy[]>('/genres')
}
