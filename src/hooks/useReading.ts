import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { errorMessage, withRetry } from '@/lib/api'
import { createId } from '@/lib/id'
import * as reading from '@/services/reading'
import { useAsync } from './useAsync'
import { useAuth } from './useAuth'

/** Estadísticas públicas de la obra; registra la visita después de leerlas. */
export function useWorkStats(workId: string) {
  // Una clave por apertura de ficha: los reintentos no cuentan doble.
  const [visitKey] = useState(() => createId())
  return useAsync(async () => {
    const stats = await reading.getWorkStats(workId)
    withRetry(() => reading.recordVisit(workId, visitKey)).catch(() => undefined)
    return stats
  }, `stats:${workId}`)
}

/** Progreso propio (favorito, valoración y capítulos leídos), con mutaciones optimistas. */
export function useWorkProgress(workId: string, onRatingChange?: () => void) {
  const { user } = useAuth()
  const identity = `${user?.id ?? 'guest'}:${workId}`
  const identityRef = useRef(identity)
  useEffect(() => { identityRef.current = identity }, [identity])
  const query = useAsync(
    () => reading.getWorkProgress(workId),
    `progress:${workId}:${user?.id}`,
    Boolean(user),
  )
  const { data, setData } = query

  const readIds = new Set(
    data?.chapters.items.filter((item) => item.isRead).map((item) => item.chapterId),
  )
  const pendingReads = useRef(new Set<string>())

  const setRead = async (chapterId: string, isRead: boolean) => {
    const requestIdentity = identity
    const operationKey = `${requestIdentity}:${chapterId}`
    // Evita que dos clics rápidos manden marcar y desmarcar a la vez.
    if (pendingReads.current.has(operationKey)) return
    pendingReads.current.add(operationKey)

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
      if (identityRef.current !== requestIdentity) return
      apply(!isRead)
      toast.error(errorMessage(error, 'No pudimos actualizar el capítulo.'))
    } finally {
      pendingReads.current.delete(operationKey)
    }
  }

  const setScore = async (score: number | null) => {
    if (score !== null && (!Number.isFinite(score) || score < 0 || score > 5 || score * 2 !== Math.round(score * 2))) return
    const requestIdentity = identity
    const previous = data?.score ?? null
    setData((current) => current && { ...current, score })
    try {
      if (score === null) await reading.removeRating(workId)
      else await reading.setRating(workId, score)
      if (identityRef.current !== requestIdentity) return
      toast.success(score === null ? 'Valoración eliminada' : 'Valoración guardada')
      onRatingChange?.()
    } catch (error) {
      if (identityRef.current !== requestIdentity) return
      setData((current) => current && { ...current, score: previous })
      toast.error(errorMessage(error, 'No pudimos guardar tu valoración.'))
    }
  }

  return { ...query, readIds, setRead, setScore }
}
