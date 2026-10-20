import { CatalogView } from '@/components/catalog/CatalogView'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function CatalogPage() {
  useDocumentTitle('Catálogo')
  return <CatalogView />
}
