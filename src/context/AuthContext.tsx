/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { TOKEN_KEY } from '@/lib/constants'
import { ApiError, errorMessage, PROTECTED_FORBIDDEN_EVENT, UNAUTHORIZED_EVENT, withRetry } from '@/lib/api'
import { readStorage, removeStorage, writeStorage } from '@/lib/storage'
import * as authService from '@/services/auth'
import type { AuthSession, User } from '@/types'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  sessionError?: string
  retrySession: () => Promise<void>
  revalidateSession: () => Promise<User>
  revalidating: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(() => Boolean(readStorage(TOKEN_KEY, null)))
  const [sessionError, setSessionError] = useState<string>()
  const [revalidating, setRevalidating] = useState(false)
  const revalidationRef = useRef<Promise<User> | null>(null)
  const sessionGenerationRef = useRef(0)
  const navigate = useNavigate()
  const location = useLocation()

  const logout = useCallback(() => {
    sessionGenerationRef.current += 1
    revalidationRef.current = null
    removeStorage(TOKEN_KEY)
    setUser(null)
    setLoading(false)
    setRevalidating(false)
    setSessionError(undefined)
  }, [])

  const revalidateSession = useCallback((): Promise<User> => {
    const token = readStorage<string | null>(TOKEN_KEY, null)
    if (!token) {
      setUser(null)
      return Promise.reject(new Error('Inicia sesión para continuar.'))
    }
    if (revalidationRef.current) return revalidationRef.current

    const generation = sessionGenerationRef.current
    setRevalidating(true)
    setSessionError(undefined)
    const request = authService
      .getMe()
      .then((freshUser) => {
        if (
          generation !== sessionGenerationRef.current ||
          readStorage<string | null>(TOKEN_KEY, null) !== token
        ) {
          throw new Error('La sesión cambió. Vuelve a intentarlo.')
        }
        setUser(freshUser)
        setSessionError(undefined)
        return freshUser
      })
      .catch((error: unknown) => {
        const stillSameSession =
          generation === sessionGenerationRef.current &&
          readStorage<string | null>(TOKEN_KEY, null) === token
        if (stillSameSession) {
          if (error instanceof ApiError && error.status === 401) logout()
          else setSessionError(errorMessage(error, 'No pudimos validar la sesión.'))
        }
        throw error
      })
      .finally(() => {
        if (revalidationRef.current === request) {
          revalidationRef.current = null
          setRevalidating(false)
        }
      })
    revalidationRef.current = request
    return request
  }, [logout])

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

    const generation = sessionGenerationRef.current
    setLoading(true)
    setSessionError(undefined)
    try {
      await withRetry(() => revalidateSession())
    } catch {
      // revalidateSession preserves the identity and exposes a recoverable error.
    } finally {
      if (generation === sessionGenerationRef.current) setLoading(false)
    }
  }, [revalidateSession])

  useEffect(() => {
    if (!readStorage(TOKEN_KEY, null)) return
    const timer = window.setTimeout(() => void retrySession(), 0)
    return () => window.clearTimeout(timer)
  }, [retrySession])

  useEffect(() => {
    const onFocus = () => {
      if (document.visibilityState === 'visible' && readStorage(TOKEN_KEY, null)) {
        void revalidateSession().catch(() => undefined)
      }
    }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onFocus)
    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onFocus)
    }
  }, [revalidateSession])

  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
  }, [handleUnauthorized])

  useEffect(() => {
    const onProtectedForbidden = () => {
      if (readStorage(TOKEN_KEY, null)) {
        void revalidateSession().catch(() => undefined)
      }
    }
    window.addEventListener(PROTECTED_FORBIDDEN_EVENT, onProtectedForbidden)
    return () => window.removeEventListener(PROTECTED_FORBIDDEN_EVENT, onProtectedForbidden)
  }, [revalidateSession])

  const start = useCallback((session: AuthSession) => {
    sessionGenerationRef.current += 1
    revalidationRef.current = null
    setRevalidating(false)
    setLoading(false)
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
      revalidateSession,
      revalidating,
      login,
      register,
      logout,
    }),
    [user, loading, sessionError, retrySession, revalidateSession, revalidating, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
