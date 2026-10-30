import type { ReactNode } from 'react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '@/context/AuthContext'
import { useAuth } from '@/hooks/useAuth'
import { PROTECTED_FORBIDDEN_EVENT } from '@/lib/api'
import { TOKEN_KEY } from '@/lib/constants'
import { writeStorage } from '@/lib/storage'
import type { User } from '@/types'
import * as authService from '@/services/auth'

vi.mock('@/services/auth', () => ({ getMe: vi.fn(), login: vi.fn(), register: vi.fn() }))

const reader: User = {
  id: 'user-1', username: 'reader', email: 'reader@example.test', role: 'BASIC',
  timezone: 'UTC', createdAt: '2026-01-01T00:00:00.000Z',
}
const admin: User = { ...reader, id: 'admin-1', username: 'admin', role: 'ADMIN' }

function wrapper({ children }: { children: ReactNode }) {
  return <MemoryRouter><AuthProvider>{children}</AuthProvider></MemoryRouter>
}

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (error: unknown) => void
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}

describe('AuthProvider administrative revalidation', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.mocked(authService.getMe).mockReset()
  })

  it('revalidates on focus, deduplicates overlapping checks, and updates the role', async () => {
    writeStorage(TOKEN_KEY, 'admin-token')
    vi.mocked(authService.getMe).mockResolvedValueOnce(admin)
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.user).toEqual(admin))
    vi.mocked(authService.getMe).mockReset()
    const request = deferred<User>()
    vi.mocked(authService.getMe).mockReturnValue(request.promise)

    act(() => {
      window.dispatchEvent(new Event('focus'))
      window.dispatchEvent(new Event('focus'))
    })
    await waitFor(() => expect(result.current.revalidating).toBe(true))
    expect(authService.getMe).toHaveBeenCalledTimes(1)
    await act(async () => request.resolve(reader))
    await waitFor(() => expect(result.current.user).toEqual(reader))
    expect(result.current.revalidating).toBe(false)
  })

  it('revalidates after a protected 403 without retrying the rejected write', async () => {
    writeStorage(TOKEN_KEY, 'admin-token')
    vi.mocked(authService.getMe).mockResolvedValueOnce(admin)
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.user).toEqual(admin))
    vi.mocked(authService.getMe).mockReset()
    const request = deferred<User>()
    vi.mocked(authService.getMe).mockReturnValue(request.promise)

    act(() => window.dispatchEvent(new Event(PROTECTED_FORBIDDEN_EVENT)))
    await waitFor(() => expect(result.current.revalidating).toBe(true))
    await act(async () => request.resolve(reader))
    await waitFor(() => expect(result.current.user).toEqual(reader))
    expect(authService.getMe).toHaveBeenCalledTimes(1)
  })

  it('discards a late response from the previous token', async () => {
    writeStorage(TOKEN_KEY, 'old-token')
    vi.mocked(authService.getMe).mockResolvedValueOnce(admin)
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.user).toEqual(admin))
    vi.mocked(authService.getMe).mockReset()
    const pending = deferred<User>()
    vi.mocked(authService.getMe).mockReturnValue(pending.promise)

    act(() => window.dispatchEvent(new Event('focus')))
    await waitFor(() => expect(result.current.revalidating).toBe(true))
    act(() => {
      writeStorage(TOKEN_KEY, 'new-token')
      result.current.logout()
    })
    await act(async () => pending.resolve(reader))
    expect(result.current.user).toBeNull()
    expect(window.localStorage.getItem(TOKEN_KEY)).toBeNull()
  })

  it('keeps identity recoverable when revalidation fails', async () => {
    writeStorage(TOKEN_KEY, 'admin-token')
    vi.mocked(authService.getMe).mockResolvedValueOnce(admin)
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.user).toEqual(admin))
    vi.mocked(authService.getMe).mockRejectedValueOnce(new Error('offline'))

    await act(async () => {
      await expect(result.current.revalidateSession()).rejects.toThrow('offline')
    })
    expect(result.current.user).toEqual(admin)
    expect(result.current.sessionError).toBe('No pudimos validar la sesión.')
    expect(window.localStorage.getItem(TOKEN_KEY)).not.toBeNull()
  })
})
