/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useMemo, type ReactNode } from 'react'
import { AUTH_KEY } from '@/lib/constants'
import { DEMO_USERS } from '@/data/mock'
import type { User, UserPreferences } from '@/types'
import { useLocalStorage } from '@/hooks/useLocalStorage'

interface AuthResult {
  ok: boolean
  error?: string
}

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => AuthResult
  register: (name: string, email: string, password: string) => AuthResult
  logout: () => void
  updatePreferences: (preferences: Partial<UserPreferences>) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useLocalStorage<User | null>(AUTH_KEY, DEMO_USERS[0])

  const login = useCallback(
    (email: string, password: string): AuthResult => {
      if (!email.trim() || !password.trim()) {
        return { ok: false, error: 'Completa el correo y la contraseña.' }
      }
      const known = DEMO_USERS.find(
        (candidate) => candidate.email.toLowerCase() === email.toLowerCase(),
      )
      const nextUser: User = known ?? {
        ...DEMO_USERS[0],
        id: crypto.randomUUID(),
        name: email.split('@')[0] ?? 'Lector',
        username: email.split('@')[0] ?? 'lector',
        email,
      }
      setUser(nextUser)
      return { ok: true }
    },
    [setUser],
  )

  const register = useCallback(
    (name: string, email: string, password: string): AuthResult => {
      if (!name.trim() || !email.trim() || password.length < 6) {
        return {
          ok: false,
          error: 'Usa un nombre, un correo válido y una contraseña de 6 caracteres.',
        }
      }
      setUser({
        ...DEMO_USERS[0],
        id: crypto.randomUUID(),
        name: name.trim(),
        username: email.split('@')[0] ?? 'lector',
        email,
      })
      return { ok: true }
    },
    [setUser],
  )

  const logout = useCallback(() => setUser(null), [setUser])

  const updatePreferences = useCallback(
    (preferences: Partial<UserPreferences>) => {
      setUser((current) =>
        current
          ? { ...current, preferences: { ...current.preferences, ...preferences } }
          : current,
      )
    },
    [setUser],
  )

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      updatePreferences,
    }),
    [user, login, register, logout, updatePreferences],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
