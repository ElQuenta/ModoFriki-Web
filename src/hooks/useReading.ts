import { useState } from 'react'
import { toast } from 'sonner'
import { errorMessage, withRetry } from '@/lib/api'
import * as reading from '@/services/reading'
import { useAsync } from './useAsync'
import { useAuth } from './useAuth'

/** Estadísticas públicas de la obra; registra la visita después de leerlas. */
export function useWorkStats(workId: string) {
  // Una clave por apertura de ficha: los reintentos no cuentan doble.
  const [visitKey] = useState(() => crypto.randomUUID())
  return useAsync(async () => {
    const stats = await reading.getWorkStats(workId)
    withRetry(() => reading.recordVisit(workId, visitKey)).catch(() => undefined)
    return stats
  }, `stats:${workId}`)
}

/** Progreso propio (favorito, valoración y capítulos leídos), con mutaciones optimistas. */
export function useWorkProgress(workId: string, onRatingChange?: () => void) {
  const { user } = useAuth()
  const query = useAsync(
    () => reading.getWorkProgress(workId),
    `progress:${workId}:${user?.id}`,
    Boolean(user),
  )
  const { data, setData } = query

  const readIds = new Set(
    data?.chapters.items.filter((item) => item.isRead).map((item) => item.chapterId),
  )

  const setRead = async (chapterId: string, isRead: boolean) => {
    const apply = (value: boolean) =>
      setData((current) => {
        if (!current) return current
        const exists = current.chapters.items.some((item) => item.chapterId === chapterId)
        const items = exists
          ? current.chapters.items.map((item) =>
              item.chapterId === chapterId ? { ...item, isRead: value } : item,
            )
          : [
              ...current.chapters.items,
              { chapterId, isRead: value, firstReadAt: null, lastReadAt: null },
            ]
        const readChapters = items.filter((item) => item.isRead).length
        return {
          ...current,
          readChapters,
          completionPercentage: current.totalChapters
            ? Math.round((readChapters / current.totalChapters) * 100)
            : 0,
          chapters: { ...current.chapters, items },
        }
      })
    apply(isRead)
    try {
      if (isRead) await reading.markChapterRead(chapterId)
      else await reading.unmarkChapterRead(chapterId)
    } catch (error) {
      apply(!isRead)
      toast.error(errorMessage(error, 'No pudimos actualizar el capítulo.'))
    }
  }

  const setScore = async (score: number | null) => {
    const previous = data?.score ?? null
    setData((current) => current && { ...current, score })
    try {
      if (score === null) await reading.removeRating(workId)
      else await reading.setRating(workId, score)
      toast.success(score === null ? 'Valoración eliminada' : 'Valoración guardada')
      onRatingChange?.()
    } catch (error) {
      setData((current) => current && { ...current, score: previous })
      toast.error(errorMessage(error, 'No pudimos guardar tu valoración.'))
    }
  }

  return { ...query, readIds, setRead, setScore }
}
