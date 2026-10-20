/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { TOKEN_KEY } from '@/lib/constants'
import { ApiError, UNAUTHORIZED_EVENT } from '@/lib/api'
import { readStorage, removeStorage, writeStorage } from '@/lib/storage'
import * as authService from '@/services/auth'
import type { AuthSession, User } from '@/types'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(() => Boolean(readStorage(TOKEN_KEY, null)))

  const logout = useCallback(() => {
    removeStorage(TOKEN_KEY)
    setUser(null)
  }, [])

  useEffect(() => {
    if (!readStorage(TOKEN_KEY, null)) return
    authService
      .getMe()
      .then(setUser)
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 401) logout()
      })
      .finally(() => setLoading(false))
  }, [logout])

  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, logout)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, logout)
  }, [logout])

  const start = useCallback((session: AuthSession) => {
    writeStorage(TOKEN_KEY, session.token)
    setUser(session.user)
  }, [])

  const login = useCallback(
    async (email: string, password: string) =>
      start(await authService.login({ email, password })),
    [start],
  )

  const register = useCallback(
    async (username: string, email: string, password: string) =>
      start(
        await authService.register({
          username,
          email,
          password,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      ),
    [start],
  )

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), loading, login, register, logout }),
    [user, loading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
