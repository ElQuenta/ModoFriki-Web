import { AuthView } from '@/components/auth/AuthView'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function RegisterPage() {
  useDocumentTitle('Crear cuenta')
  return <AuthView mode="register" />
}
