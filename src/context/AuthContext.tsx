/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { TOKEN_KEY } from '@/lib/constants'
import { UNAUTHORIZED_EVENT, withRetry } from '@/lib/api'
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
  const navigate = useNavigate()
  const location = useLocation()

  const logout = useCallback(() => {
    removeStorage(TOKEN_KEY)
    setUser(null)
  }, [])

  const handleUnauthorized = useCallback(() => {
    logout()
    if (location.pathname === '/login' || location.pathname === '/register') return
    toast.error('Tu sesión expiró. Inicia sesión otra vez.')
    const next = encodeURIComponent(location.pathname + location.search)
    navigate(`/login?next=${next}`, { replace: true })
  }, [logout, location.pathname, location.search, navigate])

  useEffect(() => {
    if (!readStorage(TOKEN_KEY, null)) return
    withRetry(() => authService.getMe())
      .then(setUser)
      .catch(() => {
        // Si el token no se puede validar (401, 5xx o red), no lo dejamos huérfano.
        logout()
      })
      .finally(() => setLoading(false))
  }, [logout])

  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
  }, [handleUnauthorized])

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
