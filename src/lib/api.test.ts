import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, PROTECTED_FORBIDDEN_EVENT, request, UNAUTHORIZED_EVENT, withRetry } from './api'
import { TOKEN_KEY } from './constants'
import { assertAvailable, IntegrationUnavailableError } from './integration'

const fetchMock = vi.fn()
const reply = (status: number, body?: unknown) =>
  new Response(body === undefined ? null : JSON.stringify(body), { status })

describe('integration availability', () => {
  it('keeps unavailable capacity distinct from empty and preserves its DEP reference', () => {
    expect(() => assertAvailable({ status: 'unavailable', dependency: 'DEP-003' })).toThrow(
      expect.objectContaining({ name: 'IntegrationUnavailableError', dependency: 'DEP-003' }),
    )
    expect(() => assertAvailable({ status: 'available' })).not.toThrow()
    expect(IntegrationUnavailableError).toBeDefined()
  })
})

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockReset()
  localStorage.clear()
})
afterEach(() => vi.unstubAllGlobals())

describe('request', () => {
  it('devuelve data y arma la URL con la query (sin vacíos)', async () => {
    fetchMock.mockResolvedValue(reply(200, { success: true, code: 200, data: [1, 2] }))
    await expect(
      request('/works', { query: { page: 2, search: '', typeId: undefined } }),
    ).resolves.toEqual([1, 2])
    const url = new URL(fetchMock.mock.calls[0][0])
    expect(url.pathname.endsWith('/works')).toBe(true)
    expect(url.searchParams.get('page')).toBe('2')
    expect(url.searchParams.has('search')).toBe(false)
  })

  it('agrega el token y el Content-Type JSON', async () => {
    localStorage.setItem(TOKEN_KEY, JSON.stringify('tok-123'))
    fetchMock.mockResolvedValue(reply(200, { data: null }))
    await request('/comments', { method: 'POST', body: { a: 1 } })
    const init = fetchMock.mock.calls[0][1]
    expect(init.headers).toMatchObject({
      Authorization: 'Bearer tok-123',
      'Content-Type': 'application/json',
    })
    expect(init.body).toBe('{"a":1}')
  })

  it('no pone Content-Type JSON en multipart', async () => {
    fetchMock.mockResolvedValue(reply(201, { data: {} }))
    await request('/works', { method: 'POST', body: new FormData() })
    expect(fetchMock.mock.calls[0][1].headers['Content-Type']).toBeUndefined()
  })

  it('204 devuelve undefined', async () => {
    fetchMock.mockResolvedValue(reply(204))
    await expect(
      request('/me/favorites/x', { method: 'DELETE' }),
    ).resolves.toBeUndefined()
  })

  it('preserves AbortSignal and does not translate cancellation into a network error', async () => {
    const controller = new AbortController()
    fetchMock.mockImplementation((_url, init) => {
      expect(init.signal).toBe(controller.signal)
      return Promise.reject(new DOMException('Aborted', 'AbortError'))
    })
    await expect(request('/works', { signal: controller.signal })).rejects.toMatchObject({ name: 'AbortError' })
  })

  it('traduce un mensaje conocido del backend', async () => {
    fetchMock.mockResolvedValue(
      reply(409, { error: { message: 'Chapter number already exists' } }),
    )
    await expect(request('/x')).rejects.toMatchObject({
      status: 409,
      message: 'Ya existe un capítulo con ese número.',
      detail: 'Chapter number already exists',
    })
  })

  it('usa el mensaje por estado si no hay uno propio', async () => {
    fetchMock.mockResolvedValue(reply(429, { error: { message: 'Too many requests' } }))
    await expect(request('/x')).rejects.toMatchObject({
      status: 429,
      message: 'Demasiadas solicitudes. Espera un momento.',
    })
  })

  it('un fallo de red es ApiError con status 0', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))
    await expect(request('/x')).rejects.toMatchObject({ status: 0 })
  })

  it('emite modofriki:unauthorized ante 401 con sesión', async () => {
    localStorage.setItem(TOKEN_KEY, JSON.stringify('tok'))
    const listener = vi.fn()
    window.addEventListener(UNAUTHORIZED_EVENT, listener)
    fetchMock.mockResolvedValue(reply(401, { error: { message: 'Invalid token' } }))
    await expect(request('/auth/me')).rejects.toBeInstanceOf(ApiError)
    expect(listener).toHaveBeenCalledTimes(1)
    window.removeEventListener(UNAUTHORIZED_EVENT, listener)
  })

  it.each([403, 404, 409])('preserves status %i as a typed API error', async (status) => {
    fetchMock.mockResolvedValue(reply(status, { error: { message: 'failure' } }))
    await expect(request('/resource')).rejects.toMatchObject({ name: 'ApiError', status })
  })

  it('emits the protected-forbidden event once after an authenticated 403', async () => {
    localStorage.setItem(TOKEN_KEY, JSON.stringify('tok'))
    const listener = vi.fn()
    window.addEventListener(PROTECTED_FORBIDDEN_EVENT, listener)
    fetchMock.mockResolvedValue(reply(403, { error: { message: 'Forbidden' } }))
    await expect(request('/admin/users')).rejects.toMatchObject({ status: 403 })
    expect(listener).toHaveBeenCalledTimes(1)
    window.removeEventListener(PROTECTED_FORBIDDEN_EVENT, listener)
  })

  it('un 401 en login o registro no cierra la sesión existente', async () => {
    localStorage.setItem(TOKEN_KEY, JSON.stringify('tok'))
    const listener = vi.fn()
    window.addEventListener(UNAUTHORIZED_EVENT, listener)
    fetchMock.mockResolvedValue(
      reply(401, { error: { message: 'Invalid email or password' } }),
    )
    await expect(
      request('/auth/login', { method: 'POST', body: {} }),
    ).rejects.toMatchObject({ status: 401 })
    expect(listener).not.toHaveBeenCalled()
    window.removeEventListener(UNAUTHORIZED_EVENT, listener)
  })
})

describe('withRetry', () => {
  it('no reintenta errores 4xx', async () => {
    const run = vi.fn().mockRejectedValue(new ApiError('x', 404))
    await expect(withRetry(run)).rejects.toMatchObject({ status: 404 })
    expect(run).toHaveBeenCalledTimes(1)
  })

  it('reintenta 5xx y errores de red hasta lograrlo', async () => {
    vi.useFakeTimers()
    const run = vi
      .fn()
      .mockRejectedValueOnce(new ApiError('x', 503))
      .mockRejectedValueOnce(new ApiError('x', 0))
      .mockResolvedValue('ok')
    const result = withRetry(run)
    await vi.runAllTimersAsync()
    await expect(result).resolves.toBe('ok')
    expect(run).toHaveBeenCalledTimes(3)
    vi.useRealTimers()
  })

  it('retries an idempotent operation only when the caller opts in', async () => {
    vi.useFakeTimers()
    const run = vi.fn().mockRejectedValueOnce(new ApiError('offline', 0)).mockResolvedValue('saved')
    const result = withRetry(run)
    await vi.runAllTimersAsync()
    await expect(result).resolves.toBe('saved')
    expect(run).toHaveBeenCalledTimes(2)
    vi.useRealTimers()
  })
})
