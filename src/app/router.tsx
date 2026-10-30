import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { PublicOnlyRoute } from '@/components/auth/PublicOnlyRoute'
import { Skeleton } from '@/components/ui/skeleton'

const HomePage = lazy(() =>
  import('@/pages/HomePage').then((module) => ({ default: module.HomePage })),
)
const CatalogPage = lazy(() =>
  import('@/pages/CatalogPage').then((module) => ({ default: module.CatalogPage })),
)
const DetailPage = lazy(() =>
  import('@/pages/DetailPage').then((module) => ({ default: module.DetailPage })),
)
const ReaderPage = lazy(() =>
  import('@/pages/ReaderPage').then((module) => ({ default: module.ReaderPage })),
)
const GenresPage = lazy(() =>
  import('@/pages/GenresPage').then((module) => ({ default: module.GenresPage })),
)
const RankingsPage = lazy(() =>
  import('@/pages/RankingsPage').then((module) => ({ default: module.RankingsPage })),
)
const LatestChaptersPage = lazy(() =>
  import('@/pages/LatestChaptersPage').then((module) => ({ default: module.LatestChaptersPage })),
)
const FavoritesPage = lazy(() =>
  import('@/pages/FavoritesPage').then((module) => ({ default: module.FavoritesPage })),
)
const ProfilePage = lazy(() =>
  import('@/pages/ProfilePage').then((module) => ({ default: module.ProfilePage })),
)
const LoginPage = lazy(() =>
  import('@/pages/LoginPage').then((module) => ({ default: module.LoginPage })),
)
const RegisterPage = lazy(() =>
  import('@/pages/RegisterPage').then((module) => ({ default: module.RegisterPage })),
)
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })),
)
const AdminPage = lazy(() =>
  import('@/pages/AdminPage').then((module) => ({ default: module.AdminPage })),
)

export function AppRoutes() {
  return (
    <Suspense
      fallback={
        <div className="container-mf space-y-4 pt-10" aria-label="Cargando página">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/series" element={<CatalogPage />} />
        <Route path="/series/:id/:slug?" element={<DetailPage />} />
        <Route path="/read/:workId/:chapterId" element={<ReaderPage />} />
        <Route path="/genres" element={<GenresPage />} />
        <Route path="/rankings" element={<RankingsPage />} />
        <Route path="/chapters/latest" element={<LatestChaptersPage />} />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <FavoritesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['ADMIN', 'EDITOR']}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
