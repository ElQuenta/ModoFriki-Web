import type { ReactNode } from 'react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '@/context/AuthContext'
import { useAuth } from '@/hooks/useAuth'
import { ApiError } from '@/lib/api'
import { TOKEN_KEY } from '@/lib/constants'
import { writeStorage } from '@/lib/storage'
import type { User } from '@/types'
import * as authService from '@/services/auth'

vi.mock('@/services/auth', () => ({
  getMe: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}))

const user: User = {
  id: 'user-1',
  username: 'reader',
  email: 'reader@example.test',
  role: 'BASIC',
  timezone: 'UTC',
  createdAt: '2026-01-01T00:00:00.000Z',
}

function wrapper({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter>
      <AuthProvider>{children}</AuthProvider>
    </MemoryRouter>
  )
}

describe('AuthProvider session validation', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.mocked(authService.getMe).mockReset()
  })

  it('retains the token and allows retry after a temporary server failure', async () => {
    writeStorage(TOKEN_KEY, 'valid-token')
    vi.mocked(authService.getMe)
      .mockRejectedValueOnce(new ApiError('Server unavailable', 503))
      .mockRejectedValueOnce(new ApiError('Server unavailable', 503))
      .mockRejectedValueOnce(new ApiError('Server unavailable', 503))
      .mockResolvedValueOnce(user)

    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.sessionError).toBe('Server unavailable'), {
      timeout: 3000,
    })

    expect(window.localStorage.getItem(TOKEN_KEY)).toBe(JSON.stringify('valid-token'))
    expect(result.current.user).toBeNull()

    await act(async () => result.current.retrySession())
    await waitFor(() => expect(result.current.user).toEqual(user))
    expect(result.current.sessionError).toBeUndefined()
  })

  it('clears an invalid token after an unauthorized response', async () => {
    writeStorage(TOKEN_KEY, 'expired-token')
    vi.mocked(authService.getMe).mockRejectedValueOnce(new ApiError('Unauthorized', 401))

    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(window.localStorage.getItem(TOKEN_KEY)).toBeNull()
    expect(result.current.user).toBeNull()
    expect(result.current.sessionError).toBeUndefined()
  })
})
