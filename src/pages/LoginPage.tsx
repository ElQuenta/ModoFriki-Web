import { AuthView } from '@/components/auth/AuthView'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function LoginPage() {
  useDocumentTitle('Iniciar sesión')
  return <AuthView mode="login" />
}
