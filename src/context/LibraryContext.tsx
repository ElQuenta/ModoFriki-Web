/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { PROGRESS_KEY } from '@/lib/constants'
import { errorMessage } from '@/lib/api'
import type { FavoriteItem, ReadingProgress, Series } from '@/types'
import * as reading from '@/services/reading'
import { useAuth } from '@/hooks/useAuth'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { percent } from '@/lib/format'

interface LibraryContextValue {
  favorites: Record<string, FavoriteItem>
  favoritesLoading: boolean
  favoritesError?: string
  reloadFavorites: () => void
  favoriteCount: number
  toggleFavorite: (series: Series) => Promise<void>
  removeFavorite: (seriesId: string) => Promise<void>
  isFavorite: (seriesId: string) => boolean
  /** Página exacta dentro del capítulo: el backend solo guarda lectura por capítulo. */
  progress: Record<string, ReadingProgress>
  updateProgress: (
    seriesId: string,
    chapterId: string,
    chapterNumber: string,
    page: number,
    totalPages: number,
  ) => void
  getProgress: (seriesId: string) => ReadingProgress | undefined
}

function without<T>(record: Record<string, T>, key: string) {
  const next = { ...record }
  delete next[key]
  return next
}

export const LibraryContext = createContext<LibraryContextValue | null>(null)

export function LibraryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState<Record<string, FavoriteItem>>({})
  const [loaded, setLoaded] = useState<{ userId?: string; error?: string }>({})
  const [nonce, setNonce] = useState(0)
  const [progress, setProgress] = useLocalStorage<Record<string, ReadingProgress>>(
    PROGRESS_KEY,
    {},
  )
  const userId = user?.id

  useEffect(() => {
    if (!userId) return
    let active = true
    reading.listAllFavorites().then(
      (items) => {
        if (!active) return
        setFavorites(
          Object.fromEntries(
            items.map((item) => [
              item.series.id,
              { seriesId: item.series.id, addedAt: item.addedAt, series: item.series },
            ]),
          ),
        )
        setLoaded({ userId })
      },
      (error: unknown) =>
        active &&
        setLoaded({
          userId,
          error: errorMessage(error, 'No pudimos cargar tus favoritos.'),
        }),
    )
    return () => {
      active = false
    }
  }, [userId, nonce])

  const visibleFavorites = useMemo(() => (userId ? favorites : {}), [userId, favorites])

  const removeFavorite = useCallback(
    async (seriesId: string) => {
      const previous = favorites[seriesId]
      setFavorites((current) => without(current, seriesId))
      try {
        await reading.removeFavorite(seriesId)
        toast.success('Quitado de favoritos')
      } catch (error) {
        if (previous) setFavorites((current) => ({ ...current, [seriesId]: previous }))
        toast.error(errorMessage(error, 'No pudimos quitarlo de favoritos.'))
      }
    },
    [favorites],
  )

  const toggleFavorite = useCallback(
    async (series: Series) => {
      if (!userId) {
        toast('Inicia sesión para guardar favoritos')
        navigate(`/login?next=${encodeURIComponent(`/series/${series.id}`)}`)
        return
      }
      if (favorites[series.id]) return removeFavorite(series.id)
      setFavorites((current) => ({
        ...current,
        [series.id]: { seriesId: series.id, addedAt: new Date().toISOString(), series },
      }))
      try {
        await reading.addFavorite(series.id)
        toast.success('Guardado en favoritos')
      } catch (error) {
        setFavorites((current) => without(current, series.id))
        toast.error(errorMessage(error, 'No pudimos guardarlo en favoritos.'))
      }
    },
    [userId, favorites, removeFavorite, navigate],
  )

  const updateProgress = useCallback(
    (
      seriesId: string,
      chapterId: string,
      chapterNumber: string,
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

  const reloadFavorites = useCallback(() => setNonce((value) => value + 1), [])

  const value = useMemo(
    () => ({
      favorites: visibleFavorites,
      favoritesLoading: Boolean(userId) && loaded.userId !== userId,
      favoritesError: loaded.userId === userId ? loaded.error : undefined,
      reloadFavorites,
      favoriteCount: Object.keys(visibleFavorites).length,
      toggleFavorite,
      removeFavorite,
      isFavorite: (seriesId: string) => Boolean(visibleFavorites[seriesId]),
      progress,
      updateProgress,
      getProgress: (seriesId: string) => progress[seriesId],
    }),
    [
      visibleFavorites,
      userId,
      loaded,
      reloadFavorites,
      toggleFavorite,
      removeFavorite,
      progress,
      updateProgress,
    ],
  )

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
}
