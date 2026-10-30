/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
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
  favoritesTotal: number
  favoritesHasMore: boolean
  favoritesLoadingMore: boolean
  loadMoreFavorites: () => Promise<void>
  toggleFavorite: (series: Series, authoritativeFavorite?: boolean) => Promise<void>
  removeFavorite: (seriesId: string) => Promise<void>
  isFavorite: (seriesId: string) => boolean
  favoriteStatus: (seriesId: string) => 'favorite' | 'not-favorite' | 'unknown'
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
    page?: number
    total?: number
    loadingMore?: boolean
  }>({})
  const [nonce, setNonce] = useState(0)
  const [progress, setProgress] = useLocalStorage<Record<string, ReadingProgress>>(
    PROGRESS_KEY,
    {},
  )
  const userId = user?.id
  const scope = userId ?? 'guest'
  const identityRef = useRef(`${userId ?? 'guest'}:${nonce}`)
  identityRef.current = `${userId ?? 'guest'}:${nonce}`

  useEffect(() => {
    if (!userId) return
    let active = true
    const controller = new AbortController()
    reading.listFavorites(1, 20, controller.signal).then(
      (result) => {
        if (!active) return
        setFavorites(
          Object.fromEntries(
            result.items.map((item) => [
              item.series.id,
              { seriesId: item.series.id, addedAt: item.addedAt, series: item.series },
            ]),
          ),
        )
        setLoaded({ userId, nonce, page: result.page, total: result.total })
      },
      (error: unknown) =>
        active && !(error instanceof DOMException && error.name === 'AbortError') &&
        setLoaded({
          userId,
          nonce,
          error: errorMessage(error, 'No pudimos cargar tus favoritos.'),
        }),
    )
    return () => {
      active = false
      controller.abort()
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
      const requestIdentity = `${userId ?? 'guest'}:${nonce}`
      const previous = visibleFavorites[seriesId]
      if (!previous) return
      setFavorites((current) => without(current, seriesId))
      try {
        await reading.removeFavorite(seriesId)
        if (identityRef.current !== requestIdentity) return
        setLoaded((current) => ({ ...current, total: Math.max(0, (current.total ?? 1) - 1) }))
        toast.success('Quitado de favoritos')
      } catch (error) {
        if (identityRef.current !== requestIdentity) return
        setFavorites((current) => ({ ...current, [seriesId]: previous }))
        toast.error(errorMessage(error, 'No pudimos quitarlo de favoritos.'))
      }
    },
    [visibleFavorites, userId, nonce],
  )

  const toggleFavorite = useCallback(
    async (series: Series, authoritativeFavorite?: boolean) => {
      if (!userId) {
        toast('Inicia sesión para guardar favoritos')
        navigate(`/login?next=${encodeURIComponent(`/series/${series.id}`)}`)
        return
      }
      const requestIdentity = `${userId}:${nonce}`
      if (visibleFavorites[series.id]) return removeFavorite(series.id)
      if (authoritativeFavorite) {
        const requestIdentity = `${userId}:${nonce}`
        try {
          await reading.removeFavorite(series.id)
          if (identityRef.current !== requestIdentity) return
          setLoaded((current) => ({ ...current, total: Math.max(0, (current.total ?? 1) - 1) }))
          toast.success('Quitado de favoritos')
        } catch (error) {
          if (identityRef.current === requestIdentity) toast.error(errorMessage(error, 'No pudimos quitarlo de favoritos.'))
        }
        return
      }
      setFavorites((current) => ({
        ...current,
        [series.id]: { seriesId: series.id, addedAt: new Date().toISOString(), series },
      }))
      try {
        await reading.addFavorite(series.id)
        if (identityRef.current !== requestIdentity) return
        setLoaded((current) => ({ ...current, total: (current.total ?? 0) + 1 }))
        toast.success('Guardado en favoritos')
      } catch (error) {
        if (identityRef.current !== requestIdentity) return
        setFavorites((current) => without(current, series.id))
        toast.error(errorMessage(error, 'No pudimos guardarlo en favoritos.'))
      }
    },
    [userId, nonce, visibleFavorites, removeFavorite, navigate],
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

  const loadMoreFavorites = useCallback(async () => {
    const page = loaded.page ?? 0
    const total = loaded.total ?? 0
    if (!userId || loaded.loadingMore || page * 20 >= total) return
    setLoaded((current) => ({ ...current, loadingMore: true, error: undefined }))
    const requestIdentity = `${userId}:${nonce}`
    try {
      const result = await reading.listFavorites(page + 1, 20)
      if (identityRef.current !== requestIdentity) return
      setFavorites((current) => ({
        ...current,
        ...Object.fromEntries(result.items.map((item) => [item.series.id, {
          seriesId: item.series.id, addedAt: item.addedAt, series: item.series,
        }]))
      }))
      setLoaded((current) => current.userId === userId
        ? { ...current, page: result.page, total: result.total, loadingMore: false }
        : current)
    } catch (error) {
      setLoaded((current) => current.userId === userId
        ? { ...current, loadingMore: false, error: errorMessage(error, 'No pudimos cargar más favoritos.') }
        : current)
    }
  }, [userId, nonce, loaded])

  const value = useMemo(
    () => ({
      favorites: visibleFavorites,
      favoritesLoading:
        Boolean(userId) && (loaded.userId !== userId || loaded.nonce !== nonce),
      favoritesError:
        loaded.userId === userId && loaded.nonce === nonce ? loaded.error : undefined,
      reloadFavorites,
      favoriteCount: Object.keys(visibleFavorites).length,
      favoritesTotal: loaded.userId === userId && loaded.nonce === nonce ? loaded.total ?? 0 : 0,
      favoritesHasMore: loaded.userId === userId && loaded.nonce === nonce && (loaded.page ?? 0) * 20 < (loaded.total ?? 0),
      favoritesLoadingMore: Boolean(loaded.loadingMore),
      loadMoreFavorites,
      toggleFavorite,
      removeFavorite,
      isFavorite: (seriesId: string) => Boolean(visibleFavorites[seriesId]),
      favoriteStatus: (seriesId: string) => visibleFavorites[seriesId]
        ? 'favorite' as const
        : userId && loaded.userId === userId && loaded.nonce === nonce && (loaded.page ?? 0) * 20 >= (loaded.total ?? 0)
          ? 'not-favorite' as const
          : 'unknown' as const,
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
      loadMoreFavorites,
      toggleFavorite,
      removeFavorite,
      userProgress,
      updateProgress,
    ],
  )

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
}
