/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useMemo, type ReactNode } from 'react'
import { FAVORITES_KEY, PROGRESS_KEY } from '@/lib/constants'
import type { FavoriteItem, FavoriteStatus, ReadingProgress } from '@/types'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { percent } from '@/lib/format'

const SEED_FAVORITES: Record<string, FavoriteItem> = {
  s1: { seriesId: 's1', status: 'Leyendo', addedAt: '2026-10-01T10:00:00.000Z' },
  s2: { seriesId: 's2', status: 'Por leer', addedAt: '2026-10-04T10:00:00.000Z' },
  s10: { seriesId: 's10', status: 'Completado', addedAt: '2026-09-20T10:00:00.000Z' },
}

const SEED_PROGRESS: Record<string, ReadingProgress> = {
  s1: {
    seriesId: 's1',
    chapterId: 'cazador-de-sombras-cap-5',
    chapterNumber: 5,
    page: 3,
    totalPages: 5,
    percentage: 60,
    updatedAt: '2026-10-18T20:00:00.000Z',
  },
  s12: {
    seriesId: 's12',
    chapterId: 'codigo-rojo-cap-2',
    chapterNumber: 2,
    page: 2,
    totalPages: 5,
    percentage: 40,
    updatedAt: '2026-10-17T18:00:00.000Z',
  },
}

interface LibraryContextValue {
  favorites: Record<string, FavoriteItem>
  progress: Record<string, ReadingProgress>
  favoriteCount: number
  toggleFavorite: (seriesId: string, status?: FavoriteStatus) => void
  setFavoriteStatus: (seriesId: string, status: FavoriteStatus) => void
  removeFavorite: (seriesId: string) => void
  isFavorite: (seriesId: string) => boolean
  getFavorite: (seriesId: string) => FavoriteItem | undefined
  updateProgress: (
    seriesId: string,
    chapterId: string,
    chapterNumber: number,
    page: number,
    totalPages: number,
  ) => void
  getProgress: (seriesId: string) => ReadingProgress | undefined
  clearHistory: () => void
}

export const LibraryContext = createContext<LibraryContextValue | null>(null)

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useLocalStorage<Record<string, FavoriteItem>>(
    FAVORITES_KEY,
    SEED_FAVORITES,
  )
  const [progress, setProgress] = useLocalStorage<Record<string, ReadingProgress>>(
    PROGRESS_KEY,
    SEED_PROGRESS,
  )

  const toggleFavorite = useCallback(
    (seriesId: string, status: FavoriteStatus = 'Leyendo') => {
      setFavorites((current) => {
        if (current[seriesId]) {
          const next = { ...current }
          delete next[seriesId]
          return next
        }
        return {
          ...current,
          [seriesId]: { seriesId, status, addedAt: new Date().toISOString() },
        }
      })
    },
    [setFavorites],
  )

  const setFavoriteStatus = useCallback(
    (seriesId: string, status: FavoriteStatus) => {
      setFavorites((current) => ({
        ...current,
        [seriesId]: {
          seriesId,
          status,
          addedAt: current[seriesId]?.addedAt ?? new Date().toISOString(),
        },
      }))
    },
    [setFavorites],
  )

  const removeFavorite = useCallback(
    (seriesId: string) => {
      setFavorites((current) => {
        const next = { ...current }
        delete next[seriesId]
        return next
      })
    },
    [setFavorites],
  )

  const updateProgress = useCallback(
    (
      seriesId: string,
      chapterId: string,
      chapterNumber: number,
      page: number,
      totalPages: number,
    ) => {
      setProgress((current) => ({
        ...current,
        [seriesId]: {
          seriesId,
          chapterId,
          chapterNumber,
          page,
          totalPages,
          percentage: percent(page, totalPages),
          updatedAt: new Date().toISOString(),
        },
      }))
    },
    [setProgress],
  )

  const clearHistory = useCallback(() => setProgress({}), [setProgress])

  const value = useMemo(
    () => ({
      favorites,
      progress,
      favoriteCount: Object.keys(favorites).length,
      toggleFavorite,
      setFavoriteStatus,
      removeFavorite,
      isFavorite: (seriesId: string) => Boolean(favorites[seriesId]),
      getFavorite: (seriesId: string) => favorites[seriesId],
      updateProgress,
      getProgress: (seriesId: string) => progress[seriesId],
      clearHistory,
    }),
    [
      favorites,
      progress,
      toggleFavorite,
      setFavoriteStatus,
      removeFavorite,
      updateProgress,
      clearHistory,
    ],
  )

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
}
