import { useCallback } from 'react'
import { READER_KEY } from '@/lib/constants'
import type { ReadingMode, ReaderSettings } from '@/types'
import { useLocalStorage } from './useLocalStorage'

const DEFAULT_SETTINGS: ReaderSettings = {
  mode: 'cascade',
  width: 'normal',
  zoom: 100,
}

export function useReaderSettings() {
  const [settings, setSettings] = useLocalStorage<ReaderSettings>(
    READER_KEY,
    DEFAULT_SETTINGS,
  )

  const setMode = useCallback(
    (mode: ReadingMode) => setSettings((current) => ({ ...current, mode })),
    [setSettings],
  )

  const setWidth = useCallback(
    (width: ReaderSettings['width']) =>
      setSettings((current) => ({ ...current, width })),
    [setSettings],
  )

  const setZoom = useCallback(
    (zoom: number) =>
      setSettings((current) => ({
        ...current,
        zoom: Math.min(140, Math.max(70, zoom)),
      })),
    [setSettings],
  )

  const reset = useCallback(() => setSettings(DEFAULT_SETTINGS), [setSettings])

  return { settings, setMode, setWidth, setZoom, reset }
}
