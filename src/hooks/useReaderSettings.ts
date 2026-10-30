import { useCallback, useMemo } from 'react'
import { READER_KEY } from '@/lib/constants'
import type { ReadingMode, ReaderSettings } from '@/types'
import { useLocalStorage } from './useLocalStorage'

const DEFAULT_SETTINGS: ReaderSettings = {
  mode: 'cascade',
  width: 'normal',
  zoom: 100,
}

const MODES: ReadingMode[] = ['cascade', 'paginated']
const WIDTHS: ReaderSettings['width'][] = ['compact', 'normal', 'wide']

/** Los datos vienen de localStorage: pueden estar incompletos o manipulados. */
function normalize(value: unknown): ReaderSettings {
  const record = (value && typeof value === 'object' ? value : {}) as Partial<ReaderSettings>
  const mode = MODES.includes(record.mode as ReadingMode)
    ? (record.mode as ReadingMode)
    : DEFAULT_SETTINGS.mode
  const width = WIDTHS.includes(record.width as ReaderSettings['width'])
    ? (record.width as ReaderSettings['width'])
    : DEFAULT_SETTINGS.width
  const zoomValue = Number(record.zoom)
  const zoom = Number.isFinite(zoomValue)
    ? Math.min(140, Math.max(70, Math.round(zoomValue)))
    : DEFAULT_SETTINGS.zoom

  return { mode, width, zoom }
}

export function useReaderSettings() {
  const [stored, setSettings] = useLocalStorage<ReaderSettings>(
    READER_KEY,
    DEFAULT_SETTINGS,
  )
  const settings = useMemo(() => normalize(stored), [stored])

  const setMode = useCallback(
    (mode: ReadingMode) => setSettings((current) => ({ ...normalize(current), mode })),
    [setSettings],
  )

  const setWidth = useCallback(
    (width: ReaderSettings['width']) =>
      setSettings((current) => ({ ...normalize(current), width })),
    [setSettings],
  )

  const setZoom = useCallback(
    (zoom: number) =>
      setSettings((current) => {
        const next = normalize(current)
        return {
          ...next,
          zoom: Number.isFinite(zoom)
            ? Math.min(140, Math.max(70, Math.round(zoom)))
            : next.zoom,
        }
      }),
    [setSettings],
  )

  const reset = useCallback(() => setSettings({ ...DEFAULT_SETTINGS }), [setSettings])

  return { settings, setMode, setWidth, setZoom, reset }
}
