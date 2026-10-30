import { request } from '@/lib/api'
import { toChapter, toSeries, type ChapterDto, type WorkDto } from '@/services/catalog'
import type { ChapterKind, PublicationStatus, ReleaseStatus, Taxonomy } from '@/types'

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_FILE_BYTES = 10 * 1024 * 1024
export const MAX_TOTAL_BYTES = 100 * 1024 * 1024

/** Devuelve un mensaje de error si los archivos no cumplen los límites del backend. */
export function validateImages(files: File[]): string | undefined {
  const invalid = files.find((file) => !ALLOWED_IMAGE_TYPES.includes(file.type))
  if (invalid) return `“${invalid.name}” no es JPEG, PNG ni WebP.`
  const heavy = files.find((file) => file.size > MAX_FILE_BYTES)
  if (heavy) return `“${heavy.name}” pesa más de 10 MiB.`
  const total = files.reduce((sum, file) => sum + file.size, 0)
  if (total > MAX_TOTAL_BYTES) return 'Los archivos juntos pasan de 100 MiB.'
  if (files.length > 100) return 'Puedes subir hasta 100 páginas por vez.'
  return undefined
}

type Fields = Record<string, string | number | string[] | null | undefined>

/** Arma el multipart: los arrays van como JSON string, como espera el backend. */
function toForm(fields: Fields, files: Record<string, File[] | File | undefined> = {}) {
  const form = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    // ponytail: multipart no puede mandar null; un título vacío simplemente no se envía.
    if (value === undefined || value === null || value === '') continue
    form.append(key, Array.isArray(value) ? JSON.stringify(value) : String(value))
  }
  for (const [key, value] of Object.entries(files)) {
    for (const file of Array.isArray(value) ? value : value ? [value] : []) {
      form.append(key, file)
    }
  }
  return form
}

export interface WorkInput {
  title: string
  synopsis: string
  typeId: string
  publicationStatus: PublicationStatus
  releaseStatus: ReleaseStatus
  alternativeTitles: string[]
  genreIds: string[]
}

export interface WorkFiles {
  cover?: File
  banner?: File
  inpagecover?: File
}

export async function createWork(input: WorkInput, files: WorkFiles) {
  const dto = await request<WorkDto>('/works', {
    method: 'POST',
    body: toForm({ ...input }, { ...files }),
  })
  return toSeries(dto)
}

export async function updateWork(
  workId: string,
  input: Partial<WorkInput>,
  files: WorkFiles,
  expectedUpdatedAt: string,
) {
  const dto = await request<WorkDto>(`/works/${workId}`, {
    method: 'PATCH',
    body: toForm({ ...input, expectedUpdatedAt }, { ...files }),
  })
  return toSeries(dto)
}

export function deleteWork(workId: string, expectedUpdatedAt: string) {
  return request<void>(`/works/${workId}`, {
    method: 'DELETE',
    body: { expectedUpdatedAt },
  })
}

export interface ChapterInput {
  number: string
  title: string | null
  kind: ChapterKind
  status: PublicationStatus
}

export async function createChapter(workId: string, input: ChapterInput, pages: File[]) {
  const dto = await request<ChapterDto>(`/works/${workId}/chapters`, {
    method: 'POST',
    body: toForm({ ...input }, { pages }),
  })
  return toChapter(dto)
}

export async function updateChapter(
  workId: string,
  chapterId: string,
  input: Partial<ChapterInput>,
  expectedVersion: number,
) {
  const dto = await request<ChapterDto>(`/works/${workId}/chapters/${chapterId}`, {
    method: 'PATCH',
    body: toForm({ ...input, expectedVersion }),
  })
  return toChapter(dto)
}

export function deleteChapter(
  workId: string,
  chapterId: string,
  expectedVersion: number,
) {
  return request<void>(`/works/${workId}/chapters/${chapterId}`, {
    method: 'DELETE',
    body: { expectedVersion },
  })
}

const pagesPath = (workId: string, chapterId: string) =>
  `/works/${workId}/chapters/${chapterId}/pages`

export async function replacePages(
  workId: string,
  chapterId: string,
  pages: File[],
  expectedVersion: number,
) {
  const dto = await request<ChapterDto>(pagesPath(workId, chapterId), {
    method: 'PUT',
    body: toForm({ expectedVersion }, { pages }),
  })
  return toChapter(dto)
}

export async function insertPages(
  workId: string,
  chapterId: string,
  pages: File[],
  position: number,
  expectedVersion: number,
) {
  const dto = await request<ChapterDto>(pagesPath(workId, chapterId), {
    method: 'POST',
    body: toForm({ expectedVersion, position }, { pages }),
  })
  return toChapter(dto)
}

/** El reorden va en JSON: el backend no acepta pageIds por multipart. */
export async function reorderPages(
  workId: string,
  chapterId: string,
  pageIds: string[],
  expectedVersion: number,
) {
  const dto = await request<ChapterDto>(pagesPath(workId, chapterId), {
    method: 'PATCH',
    body: { expectedVersion, pageIds },
  })
  return toChapter(dto)
}

export function createWorkType(name: string, slug: string) {
  return request<Taxonomy>('/work-types', { method: 'POST', body: { name, slug } })
}

export function createGenre(name: string, slug: string) {
  return request<Taxonomy>('/genres', { method: 'POST', body: { name, slug } })
}
