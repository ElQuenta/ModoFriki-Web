import { request } from '@/lib/api'
import type {
  Chapter,
  ChapterKind,
  PublicationStatus,
  ReleaseStatus,
  Series,
  SeriesStatus,
  Taxonomy,
} from '@/types'

interface AssetDto {
  id: string
  url: string
}

export interface WorkDto {
  id: string
  slug: string
  title: string
  synopsis: string
  typeId: string
  publicationStatus: PublicationStatus
  releaseStatus: ReleaseStatus
  updatedAt: string
  visitsCount?: number
  type: Taxonomy
  coverAsset: AssetDto | null
  incapBannerAsset: AssetDto | null
  alternativeTitles: { id: string; title: string }[]
  genres: { genre: Taxonomy }[]
}

export interface ChapterDto {
  id: string
  workId: string
  number: string
  title: string | null
  kind: ChapterKind
  status: PublicationStatus
  version: number
  publishedAt: string | null
  createdAt: string
  pages?: { id: string; position: number; asset: AssetDto }[]
}

export const RELEASE_STATUS_LABELS: Record<ReleaseStatus, SeriesStatus> = {
  ONGOING: 'En emisión',
  COMPLETED: 'Finalizado',
  HIATUS: 'En pausa',
  CANCELLED: 'Cancelado',
}

export function toSeries(work: WorkDto): Series {
  const cover = work.coverAsset?.url ?? ''
  return {
    id: work.id,
    slug: work.slug,
    title: work.title,
    alternativeTitles: work.alternativeTitles.map((item) => item.title),
    coverUrl: cover,
    bannerUrl: work.incapBannerAsset?.url ?? cover,
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
}

export async function listWorks(filters: WorkFilters = {}) {
  const works = await request<WorkDto[]>('/works', { query: { ...filters } })
  return works.map(toSeries)
}

export async function getWork(workId: string) {
  return toSeries(await request<WorkDto>(`/works/${workId}`))
}

const CHAPTER_PAGE = 100

/** Trae todos los capítulos (el backend pagina de a 100 como máximo), en orden ascendente. */
export async function listChapters(workId: string, includeDrafts = false) {
  const all: Chapter[] = []
  for (let page = 1; ; page += 1) {
    const batch = await request<ChapterDto[]>(`/works/${workId}/chapters`, {
      query: { page, limit: CHAPTER_PAGE, includeDrafts: includeDrafts || undefined },
    })
    all.push(...batch.map(toChapter))
    if (batch.length < CHAPTER_PAGE) return all
  }
}

export async function getChapter(workId: string, chapterId: string) {
  return toChapter(await request<ChapterDto>(`/works/${workId}/chapters/${chapterId}`))
}

export function listWorkTypes() {
  return request<Taxonomy[]>('/work-types')
}

export function listGenres() {
  return request<Taxonomy[]>('/genres')
}
