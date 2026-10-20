import { Providers } from './providers'
import { AppRoutes } from './router'
import { AppShell } from '@/components/layout/AppShell'

export function App() {
  return (
    <Providers>
      <AppShell>
        <AppRoutes />
      </AppShell>
    </Providers>
  )
}
