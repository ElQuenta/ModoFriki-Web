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
                  background: '#191919',
                  border: '1px solid #262626',
                  color: '#f5f5f5',
                },
              }}
            />
          </UIProvider>
        </LibraryProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
