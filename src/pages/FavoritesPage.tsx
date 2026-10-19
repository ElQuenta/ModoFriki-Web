import { FavoritesView } from '@/components/favorites/FavoritesView'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function FavoritesPage() {
  useDocumentTitle('Favoritos')
  return <FavoritesView />
}
