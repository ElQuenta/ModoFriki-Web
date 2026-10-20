import { ProfileView } from '@/components/profile/ProfileView'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function ProfilePage() {
  useDocumentTitle('Mi perfil')
  return <ProfileView />
}
