import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { ComponentProps } from 'react'
import { AuthContext } from '@/context/AuthContext'
import type { User, UserRole } from '@/types'
import { ProtectedRoute } from './ProtectedRoute'

type AuthValue = NonNullable<ComponentProps<typeof AuthContext.Provider>['value']>
const user = (role: UserRole): User => ({
  id: 'u1',
  username: 'lector',
  email: 'l@x.dev',
  role,
  timezone: 'America/La_Paz',
  createdAt: '2026-01-01T00:00:00.000Z',
})

function LoginProbe() {
  const location = useLocation()
  return <p>login {location.search}</p>
}

function renderAt(path: string, auth: Partial<AuthValue>, roles?: UserRole[]) {
  const value = {
    user: null,
    isAuthenticated: false,
    loading: false,
    retrySession: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    ...auth,
  } as AuthValue
  return render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/login" element={<LoginProbe />} />
          <Route
            path="*"
            element={
              <ProtectedRoute roles={roles}>
                <p>contenido privado</p>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe('ProtectedRoute', () => {
  it('sin sesión redirige a /login con next', () => {
    renderAt('/favorites?tab=x', {})
    expect(screen.getByText('login ?next=%2Ffavorites%3Ftab%3Dx')).toBeInTheDocument()
    expect(screen.queryByText('contenido privado')).not.toBeInTheDocument()
  })

  it('mientras carga la sesión no redirige ni muestra el contenido', () => {
    renderAt('/favorites', { loading: true })
    expect(screen.queryByText(/login/)).not.toBeInTheDocument()
    expect(screen.queryByText('contenido privado')).not.toBeInTheDocument()
  })

  it('con sesión muestra el contenido', () => {
    renderAt('/favorites', { user: user('BASIC'), isAuthenticated: true })
    expect(screen.getByText('contenido privado')).toBeInTheDocument()
  })

  it('bloquea por rol', () => {
    renderAt('/admin', { user: user('BASIC'), isAuthenticated: true }, [
      'ADMIN',
      'EDITOR',
    ])
    expect(screen.getByText('No tienes permiso')).toBeInTheDocument()
    expect(screen.queryByText('contenido privado')).not.toBeInTheDocument()
  })

  it('deja pasar el rol permitido', () => {
    renderAt('/admin', { user: user('EDITOR'), isAuthenticated: true }, [
      'ADMIN',
      'EDITOR',
    ])
    expect(screen.getByText('contenido privado')).toBeInTheDocument()
  })

  it('permite ADMIN en una ruta administrativa', () => {
    renderAt('/admin', { user: user('ADMIN'), isAuthenticated: true }, ['ADMIN', 'EDITOR'])
    expect(screen.getByText('contenido privado')).toBeInTheDocument()
  })
})
