import { Route, Routes } from 'react-router-dom'
import { HomePage } from '@/pages/HomePage'
import { CatalogPage } from '@/pages/CatalogPage'
import { DetailPage } from '@/pages/DetailPage'
import { ReaderPage } from '@/pages/ReaderPage'
import { GenresPage } from '@/pages/GenresPage'
import { RankingsPage } from '@/pages/RankingsPage'
import { FavoritesPage } from '@/pages/FavoritesPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/series" element={<CatalogPage />} />
      <Route path="/series/:slug" element={<DetailPage />} />
      <Route path="/read/:slug/:chapter" element={<ReaderPage />} />
      <Route path="/genres" element={<GenresPage />} />
      <Route path="/rankings" element={<RankingsPage />} />
      <Route path="/favorites" element={<FavoritesPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
