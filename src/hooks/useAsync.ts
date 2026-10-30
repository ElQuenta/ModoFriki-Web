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
 * Mientras carga conserva el último `data` de la misma familia para evitar
 * parpadeos (por ejemplo, al pedir la página siguiente de una lista).
 *
 * `family` acota qué datos viejos se pueden reutilizar. Por defecto es la
 * propia `key`, así que un cambio de usuario u obra nunca muestra datos ajenos.
 */
export function useAsync<T>(
  load: () => Promise<T>,
  key: string,
  enabled = true,
  family = key,
) {
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
    const belongsToFamily = (resultKey: string) =>
      resultKey.startsWith(`${family}#`) || resultKey.startsWith(`${family}:`)
    Promise.resolve()
      .then(() => loadRef.current())
      .then(
        (data) => active && setResult({ key: current, data }),
        (error: unknown) =>
          active &&
          setResult((previous) => ({
            key: current,
            // Keep stale data only for a refresh/page change in the same family.
            // Never relabel a different work, user, or query as the new result.
            data: belongsToFamily(previous.key) ? previous.data : undefined,
            error: errorMessage(error, 'No pudimos cargar los datos.'),
            errorStatus: error instanceof ApiError ? error.status : undefined,
          })),
      )
    return () => {
      active = false
    }
  }, [current, enabled, family])

  const matchesFamily =
    result.key.startsWith(`${family}#`) || result.key.startsWith(`${family}:`)
  const fresh = result.key === current
  const reload = useCallback(() => setNonce((value) => value + 1), [])
  const setData = useCallback(
    (update: (data: T | undefined) => T | undefined) =>
      setResult((previous) => ({ ...previous, data: update(previous.data) })),
    [],
  )

  return {
    data: matchesFamily ? result.data : undefined,
    staleData: matchesFamily ? result.data : undefined,
    loading: enabled && !fresh,
    error: fresh ? result.error : undefined,
    errorStatus: fresh ? result.errorStatus : undefined,
    reload,
    setData,
  }
}
