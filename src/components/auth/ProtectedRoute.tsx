import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { ShieldX } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import type { UserRole } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'

export function ProtectedRoute({
  children,
  roles,
}: {
  children: ReactNode
  roles?: UserRole[]
}) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="container-mf space-y-4 pt-10">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?next=${next}`} replace />
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="container-mf pt-10 pb-16">
        <EmptyState
          icon={ShieldX}
          title="No tienes permiso"
          description="Tu cuenta no puede acceder a esta sección. Si crees que es un error, contacta con un administrador."
          actionLabel="Volver al inicio"
          actionTo="/"
        />
      </div>
    )
  }

  return children
}
