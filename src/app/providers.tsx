import type { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/context/AuthContext'
import { LibraryProvider } from '@/context/LibraryContext'
import { UIProvider } from '@/context/UIContext'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LibraryProvider>
          <UIProvider>
            {children}
            <Toaster
              theme="dark"
              position="bottom-right"
              toastOptions={{
                style: {
                  background: 'var(--color-raised)',
                  border: '1px solid var(--color-line)',
                  color: 'var(--color-primary)',
                },
              }}
            />
          </UIProvider>
        </LibraryProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
