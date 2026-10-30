import type { ReactNode } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { safeRedirect } from '@/lib/redirect'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Evita que un usuario con sesión abra /login o /register.
 * Si hay `next`, lo respeta para no perder el destino original.
 */
export function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const [searchParams] = useSearchParams()

  if (loading) {
    return (
      <div className="container-mf space-y-4 pt-10">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (user) return <Navigate to={safeRedirect(searchParams.get('next'))} replace />

  return children
}
