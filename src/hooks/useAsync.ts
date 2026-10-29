import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError, errorMessage } from '@/lib/api'

interface Result<T> {
  key: string
  data?: T
  error?: string
  errorStatus?: number
}

/**
 * Carga datos asíncronos. Se vuelve a ejecutar cuando cambia `key`.
 * Mientras carga conserva el último `data` para evitar parpadeos.
 */
export function useAsync<T>(load: () => Promise<T>, key: string, enabled = true) {
  const [nonce, setNonce] = useState(0)
  const [result, setResult] = useState<Result<T>>({ key: '' })
  const loadRef = useRef(load)
  const current = `${key}#${nonce}`

  useEffect(() => {
    loadRef.current = load
  })

  useEffect(() => {
    if (!enabled) return
    let active = true
    loadRef.current().then(
      (data) => active && setResult({ key: current, data }),
      (error: unknown) =>
        active &&
        setResult((previous) => ({
          key: current,
          data: previous.data,
          error: errorMessage(error, 'No pudimos cargar los datos.'),
          errorStatus: error instanceof ApiError ? error.status : undefined,
        })),
    )
    return () => {
      active = false
    }
  }, [current, enabled])

  const fresh = result.key === current
  const reload = useCallback(() => setNonce((value) => value + 1), [])
  const setData = useCallback(
    (update: (data: T | undefined) => T | undefined) =>
      setResult((previous) => ({ ...previous, data: update(previous.data) })),
    [],
  )

  return {
    data: result.key.startsWith(`${key}#`) ? result.data : undefined,
    staleData: result.data,
    loading: enabled && !fresh,
    error: fresh ? result.error : undefined,
    errorStatus: fresh ? result.errorStatus : undefined,
    reload,
    setData,
  }
}
