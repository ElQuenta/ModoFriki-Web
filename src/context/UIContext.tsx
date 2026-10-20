/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react'
import { UI_KEY } from '@/lib/constants'
import { useLocalStorage } from '@/hooks/useLocalStorage'

interface UIContextValue {
  commandOpen: boolean
  mobileNavOpen: boolean
  announcementDismissed: boolean
  openCommand: () => void
  closeCommand: () => void
  toggleCommand: () => void
  openMobileNav: () => void
  closeMobileNav: () => void
  dismissAnnouncement: () => void
}

export const UIContext = createContext<UIContextValue | null>(null)

interface UIState {
  announcementDismissed: boolean
}

export function UIProvider({ children }: { children: ReactNode }) {
  const [commandOpen, setCommandOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [ui, setUI] = useLocalStorage<UIState>(UI_KEY, {
    announcementDismissed: false,
  })

  const openCommand = useCallback(() => setCommandOpen(true), [])
  const closeCommand = useCallback(() => setCommandOpen(false), [])
  const toggleCommand = useCallback(() => setCommandOpen((value) => !value), [])
  const openMobileNav = useCallback(() => setMobileNavOpen(true), [])
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), [])
  const dismissAnnouncement = useCallback(
    () => setUI((current) => ({ ...current, announcementDismissed: true })),
    [setUI],
  )

  const value = useMemo(
    () => ({
      commandOpen,
      mobileNavOpen,
      announcementDismissed: ui.announcementDismissed,
      openCommand,
      closeCommand,
      toggleCommand,
      openMobileNav,
      closeMobileNav,
      dismissAnnouncement,
    }),
    [
      commandOpen,
      mobileNavOpen,
      ui.announcementDismissed,
      openCommand,
      closeCommand,
      toggleCommand,
      openMobileNav,
      closeMobileNav,
      dismissAnnouncement,
    ],
  )

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}
