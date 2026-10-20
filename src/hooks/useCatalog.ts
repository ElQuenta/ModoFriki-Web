import * as catalog from '@/services/catalog'
import type { Taxonomy } from '@/types'
import { useAsync } from './useAsync'

// ponytail: la taxonomía se cachea toda la sesión; se invalida al crear géneros o tipos.
let genresCache: Promise<Taxonomy[]> | undefined
let typesCache: Promise<Taxonomy[]> | undefined

export function invalidateTaxonomy() {
  genresCache = undefined
  typesCache = undefined
}

export function useGenres() {
  return useAsync(() => {
    genresCache ??= catalog.listGenres().catch((error: unknown) => {
      genresCache = undefined
      throw error
    })
    return genresCache
  }, 'genres')
}

export function useWorkTypes() {
  return useAsync(() => {
    typesCache ??= catalog.listWorkTypes().catch((error: unknown) => {
      typesCache = undefined
      throw error
    })
    return typesCache
  }, 'work-types')
}

export function useWork(workId: string) {
  return useAsync(() => catalog.getWork(workId), `work:${workId}`)
}

/** Capítulos en orden descendente (el más nuevo primero). */
export function useChapters(workId: string) {
  return useAsync(
    async () => (await catalog.listChapters(workId)).toReversed(),
    `chapters:${workId}`,
  )
}

export function useChapter(workId: string, chapterId: string) {
  return useAsync(
    () => catalog.getChapter(workId, chapterId),
    `chapter:${workId}:${chapterId}`,
  )
}
