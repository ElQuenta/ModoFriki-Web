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
  const [loaded, setLoaded] = useState<{
    userId?: string
    nonce?: number
    error?: string
  }>({})
  const [nonce, setNonce] = useState(0)
  const [progress, setProgress] = useLocalStorage<Record<string, ReadingProgress>>(
    PROGRESS_KEY,
    {},
  )
  const userId = user?.id
  const scope = userId ?? 'guest'

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
        setLoaded({ userId, nonce })
      },
      (error: unknown) =>
        active &&
        setLoaded({
          userId,
          nonce,
          error: errorMessage(error, 'No pudimos cargar tus favoritos.'),
        }),
    )
    return () => {
      active = false
    }
  }, [userId, nonce])

  // Los favoritos solo se muestran cuando pertenecen al usuario actual. Así no
  // se filtran los de la cuenta anterior mientras carga la nueva.
  const visibleFavorites = useMemo(
    () => (userId && loaded.userId === userId && loaded.nonce === nonce ? favorites : {}),
    [userId, favorites, loaded.userId, loaded.nonce, nonce],
  )

  // El progreso local se guarda por usuario. Las claves antiguas sin prefijo se
  // tratan como progreso de invitado para no mezclar cuentas en el mismo equipo.
  const userProgress = useMemo(() => {
    const prefix = `${scope}:`
    const scoped: Record<string, ReadingProgress> = {}
    for (const [key, value] of Object.entries(progress)) {
      if (key.startsWith(prefix)) scoped[key.slice(prefix.length)] = value
    }
    if (!userId) {
      for (const [key, value] of Object.entries(progress)) {
        if (!key.includes(':') && !scoped[key]) scoped[key] = value
      }
    }
    return scoped
  }, [progress, scope, userId])

  const removeFavorite = useCallback(
    async (seriesId: string) => {
      const previous = visibleFavorites[seriesId]
      if (!previous) return
      setFavorites((current) => without(current, seriesId))
      try {
        await reading.removeFavorite(seriesId)
        toast.success('Quitado de favoritos')
      } catch (error) {
        setFavorites((current) => ({ ...current, [seriesId]: previous }))
        toast.error(errorMessage(error, 'No pudimos quitarlo de favoritos.'))
      }
    },
    [visibleFavorites],
  )

  const toggleFavorite = useCallback(
    async (series: Series) => {
      if (!userId) {
        toast('Inicia sesión para guardar favoritos')
        navigate(`/login?next=${encodeURIComponent(`/series/${series.id}`)}`)
        return
      }
      if (visibleFavorites[series.id]) return removeFavorite(series.id)
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
    [userId, visibleFavorites, removeFavorite, navigate],
  )

  const updateProgress = useCallback(
    (
      seriesId: string,
      chapterId: string,
      chapterNumber: string,
      page: number,
      totalPages: number,
    ) => {
      setProgress((current) => {
        const next: Record<string, ReadingProgress> = {
          ...current,
          [`${scope}:${seriesId}`]: {
            seriesId,
            chapterId,
            chapterNumber,
            page,
            totalPages,
            percentage: percent(page, totalPages),
            updatedAt: new Date().toISOString(),
          },
        }
        // Migra el progreso antiguo de invitado a su clave con prefijo.
        if (!userId) delete next[seriesId]
        return next
      })
    },
    [setProgress, scope, userId],
  )

  const reloadFavorites = useCallback(() => setNonce((value) => value + 1), [])

  const value = useMemo(
    () => ({
      favorites: visibleFavorites,
      favoritesLoading:
        Boolean(userId) && (loaded.userId !== userId || loaded.nonce !== nonce),
      favoritesError:
        loaded.userId === userId && loaded.nonce === nonce ? loaded.error : undefined,
      reloadFavorites,
      favoriteCount: Object.keys(visibleFavorites).length,
      toggleFavorite,
      removeFavorite,
      isFavorite: (seriesId: string) => Boolean(visibleFavorites[seriesId]),
      progress: userProgress,
      updateProgress,
      getProgress: (seriesId: string) => userProgress[seriesId],
    }),
    [
      visibleFavorites,
      userId,
      loaded,
      nonce,
      reloadFavorites,
      toggleFavorite,
      removeFavorite,
      userProgress,
      updateProgress,
    ],
  )

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
}
