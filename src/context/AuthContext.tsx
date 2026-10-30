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
import { ApiError, errorMessage, UNAUTHORIZED_EVENT, withRetry } from '@/lib/api'
import { readStorage, removeStorage, writeStorage } from '@/lib/storage'
import * as authService from '@/services/auth'
import type { AuthSession, User } from '@/types'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  sessionError?: string
  retrySession: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(() => Boolean(readStorage(TOKEN_KEY, null)))
  const [sessionError, setSessionError] = useState<string>()
  const navigate = useNavigate()
  const location = useLocation()

  const logout = useCallback(() => {
    removeStorage(TOKEN_KEY)
    setUser(null)
    setSessionError(undefined)
  }, [])

  const handleUnauthorized = useCallback(() => {
    logout()
    if (location.pathname === '/login' || location.pathname === '/register') return
    toast.error('Tu sesión expiró. Inicia sesión otra vez.')
    const next = encodeURIComponent(location.pathname + location.search)
    navigate(`/login?next=${next}`, { replace: true })
  }, [logout, location.pathname, location.search, navigate])

  const retrySession = useCallback(async () => {
    if (!readStorage(TOKEN_KEY, null)) {
      setUser(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setSessionError(undefined)
    try {
      setUser(await withRetry(() => authService.getMe()))
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        logout()
      } else {
        // A network or server failure does not prove that the saved token expired.
        setSessionError(
          errorMessage(error, 'No pudimos validar la sesion. Comprueba la conexion.'),
        )
      }
    } finally {
      setLoading(false)
    }
  }, [logout])

  useEffect(() => {
    if (!readStorage(TOKEN_KEY, null)) return
    const timer = window.setTimeout(() => void retrySession(), 0)
    return () => window.clearTimeout(timer)
  }, [retrySession])

  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
  }, [handleUnauthorized])

  const start = useCallback((session: AuthSession) => {
    writeStorage(TOKEN_KEY, session.token)
    setUser(session.user)
    setSessionError(undefined)
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
    () => ({
      user,
      isAuthenticated: Boolean(user),
      loading,
      sessionError,
      retrySession,
      login,
      register,
      logout,
    }),
    [user, loading, sessionError, retrySession, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
