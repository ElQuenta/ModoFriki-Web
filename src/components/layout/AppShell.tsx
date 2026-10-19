import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { MobileNav } from './MobileNav'
import { AnnouncementBar } from './AnnouncementBar'
import { CommandPalette } from '@/components/common/CommandPalette'
import { useHotkeys } from '@/hooks/useHotkeys'
import { useUI } from '@/hooks/useUI'

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation()
  const { toggleCommand, closeCommand, closeMobileNav } = useUI()
  const isReader = location.pathname.startsWith('/read/')

  useHotkeys({
    'mod+k': toggleCommand,
    escape: () => {
      closeCommand()
      closeMobileNav()
    },
  })

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [location.pathname])

  if (isReader) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar />
      <Header />
      <main className="flex-1">
        <div key={location.pathname} className="animate-fade-in">
          {children}
        </div>
      </main>
      <Footer />
      <MobileNav />
      <CommandPalette />
    </div>
  )
}
