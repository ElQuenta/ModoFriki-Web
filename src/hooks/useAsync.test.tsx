import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/lib/api'
import { clearAsyncCache, useAsync } from './useAsync'

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}

describe('useAsync', () => {
  it('does not expose data from a different key when the new request fails', async () => {
    const first = deferred<string>()
    const second = deferred<string>()
    const loadA = vi.fn(() => first.promise)
    const loadB = vi.fn(() => second.promise)
    const { result, rerender } = renderHook(
      ({ id, load }: { id: string; load: () => Promise<string> }) =>
        useAsync(load, `work:${id}`),
      { initialProps: { id: 'A', load: loadA } },
    )

    await act(async () => first.resolve('work A'))
    expect(result.current.data).toBe('work A')

    rerender({ id: 'B', load: loadB })
    await act(async () => second.reject(new ApiError('Unavailable', 503)))

    await waitFor(() => expect(result.current.error).toBe('Unavailable'))
    expect(result.current.data).toBeUndefined()
  })

  it('keeps stale data for a failed request within the same family', async () => {
    const first = deferred<string[]>()
    const second = deferred<string[]>()
    const loadPage1 = vi.fn(() => first.promise)
    const loadPage2 = vi.fn(() => second.promise)
    const { result, rerender } = renderHook(
      ({ page, load }: { page: number; load: () => Promise<string[]> }) =>
        useAsync(load, `works:query:page:${page}`, true, 'works:query'),
      { initialProps: { page: 1, load: loadPage1 } },
    )

    await act(async () => first.resolve(['work A']))
    rerender({ page: 2, load: loadPage2 })
    await act(async () => second.reject(new ApiError('Unavailable', 503)))

    await waitFor(() => expect(result.current.error).toBe('Unavailable'))
    expect(result.current.data).toEqual(['work A'])
  })
})

describe('useAsync con cacheMs', () => {
  it('reutiliza la respuesta al volver a montar y reload() la ignora', async () => {
    clearAsyncCache()
    const load = vi.fn(async () => 'v1')
    const first = renderHook(() => useAsync(load, 'cache:a', true, undefined, 60_000))
    await waitFor(() => expect(first.result.current.data).toBe('v1'))
    first.unmount()

    const second = renderHook(() => useAsync(load, 'cache:a', true, undefined, 60_000))
    // Arranca ya cargado desde la caché, sin estado de carga.
    expect(second.result.current.loading).toBe(false)
    expect(second.result.current.data).toBe('v1')
    await act(async () => {})
    expect(load).toHaveBeenCalledTimes(1)

    load.mockResolvedValueOnce('v2')
    act(() => second.result.current.reload())
    await waitFor(() => expect(second.result.current.data).toBe('v2'))
    expect(load).toHaveBeenCalledTimes(2)
  })

  it('sin cacheMs siempre vuelve a pedir', async () => {
    clearAsyncCache()
    const load = vi.fn(async () => 'x')
    const first = renderHook(() => useAsync(load, 'cache:b'))
    await waitFor(() => expect(first.result.current.data).toBe('x'))
    first.unmount()
    const second = renderHook(() => useAsync(load, 'cache:b'))
    await waitFor(() => expect(second.result.current.data).toBe('x'))
    expect(load).toHaveBeenCalledTimes(2)
  })

  it('no cachea errores', async () => {
    clearAsyncCache()
    const load = vi
      .fn()
      .mockRejectedValueOnce(new ApiError('Caído', 503))
      .mockResolvedValue('ok')
    const first = renderHook(() => useAsync(load, 'cache:c', true, undefined, 60_000))
    await waitFor(() => expect(first.result.current.error).toBe('Caído'))
    first.unmount()
    const second = renderHook(() => useAsync(load, 'cache:c', true, undefined, 60_000))
    await waitFor(() => expect(second.result.current.data).toBe('ok'))
  })
})
