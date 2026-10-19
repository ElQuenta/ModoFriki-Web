import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Expand,
  List,
  Settings2,
  Shrink,
  X,
} from 'lucide-react'
import type { Chapter, Series } from '@/types'
import { cn } from '@/lib/cn'
import { useHotkeys } from '@/hooks/useHotkeys'
import { useLibrary } from '@/hooks/useLibrary'
import { useReaderSettings } from '@/hooks/useReaderSettings'
import { buttonStyles } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const widthClass = {
  compact: 'max-w-2xl',
  normal: 'max-w-3xl',
  wide: 'max-w-5xl',
}

export function ReaderView({
  series,
  chapter,
  chapters,
}: {
  series: Series
  chapter: Chapter
  chapters: Chapter[]
}) {
  const navigate = useNavigate()
  const { settings, setMode, setWidth, setZoom } = useReaderSettings()
  const { getProgress, updateProgress } = useLibrary()
  const saved = getProgress(series.id)
  const [pageIndex, setPageIndex] = useState(() => {
    if (saved?.chapterNumber === chapter.number) return Math.max(0, saved.page - 1)
    return 0
  })
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  const pages = chapter.pages
  const totalPages = pages.length
  const currentPage = Math.min(pageIndex + 1, totalPages)
  const index = chapters.findIndex((item) => item.id === chapter.id)
  const nextChapter = index > 0 ? chapters[index - 1] : undefined
  const previousChapter = index < chapters.length - 1 ? chapters[index + 1] : undefined
  const page = pages[Math.min(pageIndex, totalPages - 1)]

  const goToPage = useCallback(
    (next: number) => {
      const clamped = Math.min(totalPages - 1, Math.max(0, next))
      setPageIndex(clamped)
      if (settings.mode === 'paginated') window.scrollTo({ top: 0 })
    },
    [settings.mode, totalPages],
  )

  useEffect(() => {
    updateProgress(
      series.id,
      chapter.id,
      chapter.number,
      currentPage,
      totalPages,
    )
  }, [series.id, chapter.id, chapter.number, currentPage, totalPages, updateProgress])

  useEffect(() => {
    if (settings.mode !== 'cascade') return
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        const ratio = max > 0 ? window.scrollY / max : 0
        const next = Math.min(totalPages, Math.max(1, Math.ceil(ratio * totalPages)))
        setPageIndex(next - 1)
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }, [settings.mode, totalPages, chapter.id])

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
        setFullscreen(true)
      } else {
        await document.exitFullscreen()
        setFullscreen(false)
      }
    } catch {
      setFullscreen(false)
    }
  }, [])

  useHotkeys({
    arrowright: () => goToPage(pageIndex + 1),
    d: () => goToPage(pageIndex + 1),
    arrowleft: () => goToPage(pageIndex - 1),
    a: () => goToPage(pageIndex - 1),
    f: () => void toggleFullscreen(),
    m: () => setMode(settings.mode === 'cascade' ? 'paginated' : 'cascade'),
    escape: () => setSettingsOpen(false),
  })

  return (
    <div className="min-h-screen bg-base pb-24">
      <header className="sticky top-0 z-40 border-b border-line bg-base/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-3 sm:px-5">
          <Link
            to={`/series/${series.slug}`}
            aria-label="Volver a la serie"
            className="flex size-10 shrink-0 items-center justify-center rounded-xl text-secondary transition-colors hover:bg-raised hover:text-primary"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{series.title}</p>
            <p className="truncate text-[11px] text-muted">
              Capítulo {chapter.number} · {chapter.title}
            </p>
          </div>

          <div className="hidden items-center gap-1.5 sm:flex">
            <Badge tone="neutral">{currentPage} / {totalPages}</Badge>
          </div>

          <button
            type="button"
            onClick={() => setMode(settings.mode === 'cascade' ? 'paginated' : 'cascade')}
            aria-label="Cambiar modo de lectura"
            className="flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 text-xs font-medium text-secondary transition-colors hover:text-primary"
          >
            <List className="size-4" />
            <span className="hidden sm:inline">
              {settings.mode === 'cascade' ? 'Cascada' : 'Paginado'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setSettingsOpen((value) => !value)}
            aria-label="Ajustes de lectura"
            aria-expanded={settingsOpen}
            className={cn(
              'flex size-9 items-center justify-center rounded-lg border transition-colors',
              settingsOpen
                ? 'border-accent/40 bg-accent/10 text-accent'
                : 'border-line bg-surface text-secondary hover:text-primary',
            )}
          >
            <Settings2 className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => void toggleFullscreen()}
            aria-label="Pantalla completa"
            className="hidden size-9 items-center justify-center rounded-lg border border-line bg-surface text-secondary transition-colors hover:text-primary sm:flex"
          >
            {fullscreen ? <Shrink className="size-4" /> : <Expand className="size-4" />}
          </button>
        </div>
        <div className="h-0.5 w-full bg-raised">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${(currentPage / totalPages) * 100}%` }}
          />
        </div>
      </header>

      {settingsOpen ? (
        <div className="fixed inset-x-0 top-16 z-50 flex justify-end px-3 pt-2 sm:px-5">
          <div className="animate-fade-up w-full max-w-xs rounded-2xl border border-line bg-surface p-4 shadow-card">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-sm font-bold">Ajustes de lectura</h2>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                aria-label="Cerrar ajustes"
                className="flex size-7 items-center justify-center rounded-md text-muted hover:bg-raised hover:text-primary"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="mb-1.5 text-[11px] font-semibold tracking-wider text-muted uppercase">
              Modo
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(['cascade', 'paginated'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setMode(mode)}
                  className={cn(
                    'rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
                    settings.mode === mode
                      ? 'border-accent/40 bg-accent/10 text-accent'
                      : 'border-line text-secondary hover:text-primary',
                  )}
                >
                  {mode === 'cascade' ? 'Cascada' : 'Paginado'}
                </button>
              ))}
            </div>

            <p className="mt-4 mb-1.5 text-[11px] font-semibold tracking-wider text-muted uppercase">
              Ancho
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(['compact', 'normal', 'wide'] as const).map((width) => (
                <button
                  key={width}
                  type="button"
                  onClick={() => setWidth(width)}
                  className={cn(
                    'rounded-lg border px-2 py-2 text-xs font-medium capitalize transition-colors',
                    settings.width === width
                      ? 'border-accent/40 bg-accent/10 text-accent'
                      : 'border-line text-secondary hover:text-primary',
                  )}
                >
                  {width === 'compact' ? 'Compacto' : width === 'normal' ? 'Normal' : 'Amplio'}
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-[11px] font-semibold tracking-wider text-muted uppercase">
                Zoom
              </p>
              <span className="text-xs font-semibold text-accent">{settings.zoom}%</span>
            </div>
            <input
              type="range"
              min={70}
              max={140}
              step={10}
              value={settings.zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              aria-label="Zoom de lectura"
              className="mt-2 w-full accent-[var(--color-accent)]"
            />
          </div>
        </div>
      ) : null}

      <main className="reader-canvas mx-auto px-2 pt-4 sm:px-4">
        {settings.mode === 'cascade' ? (
          <div className={cn('mx-auto space-y-3', widthClass[settings.width])}>
            {pages.map((item, itemIndex) => (
              <div
                key={item.id}
                className="relative overflow-hidden rounded-lg bg-surface"
                style={{ width: `${settings.zoom}%`, marginInline: 'auto' }}
              >
                <img
                  src={item.imageUrl}
                  alt={`Página ${item.pageNumber} de ${chapter.title}`}
                  loading={itemIndex < 2 ? 'eager' : 'lazy'}
                  className="block h-auto w-full"
                />
                {item.dialogue ? (
                  <p className="absolute right-4 bottom-4 left-4 rounded-lg border border-white/15 bg-black/75 px-4 py-3 text-center text-sm font-medium text-white backdrop-blur">
                    {item.dialogue}
                  </p>
                ) : null}
                <span className="absolute top-3 right-3 rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-semibold text-white/80 backdrop-blur">
                  {item.pageNumber} / {totalPages}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className={cn('mx-auto', widthClass[settings.width])}>
            {page ? (
              <div className="relative overflow-hidden rounded-xl border border-line bg-surface">
                <img
                  src={page.imageUrl}
                  alt={`Página ${page.pageNumber} de ${chapter.title}`}
                  className="block h-auto w-full"
                />
                {page.dialogue ? (
                  <p className="absolute right-4 bottom-4 left-4 rounded-lg border border-white/15 bg-black/75 px-4 py-3 text-center text-sm font-medium text-white backdrop-blur">
                    {page.dialogue}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => goToPage(pageIndex - 1)}
                disabled={pageIndex === 0}
                className={buttonStyles({ variant: 'secondary', size: 'md' })}
              >
                <ChevronLeft className="size-4" /> Anterior
              </button>
              <span className="text-xs text-muted">
                {currentPage} de {totalPages}
              </span>
              <button
                type="button"
                onClick={() => goToPage(pageIndex + 1)}
                disabled={pageIndex >= totalPages - 1}
                className={buttonStyles({ size: 'md' })}
              >
                Siguiente <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-base/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2.5 sm:px-5">
          {previousChapter ? (
            <Link
              to={`/read/${series.slug}/${previousChapter.number}`}
              className={buttonStyles({ variant: 'ghost', size: 'sm', className: 'min-w-0' })}
            >
              <ChevronLeft className="size-4 shrink-0" />
              <span className="truncate">Cap. {previousChapter.number}</span>
            </Link>
          ) : (
            <span className="w-24" />
          )}

          <div className="flex flex-1 items-center justify-center gap-1">
            <button
              type="button"
              onClick={() => goToPage(Math.max(0, pageIndex - 1))}
              aria-label="Página anterior"
              className="flex size-9 items-center justify-center rounded-lg text-secondary hover:bg-raised hover:text-primary"
            >
              <ChevronLeft className="size-5" />
            </button>
            <select
              value={chapter.number}
              onChange={(event) =>
                navigate(`/read/${series.slug}/${event.target.value}`)
              }
              aria-label="Seleccionar capítulo"
              className="h-9 max-w-28 rounded-lg border border-line bg-surface px-2 text-xs text-secondary outline-none focus:border-accent/60"
            >
              {chapters.map((item) => (
                <option key={item.id} value={item.number}>
                  Cap. {item.number}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => goToPage(Math.min(totalPages - 1, pageIndex + 1))}
              aria-label="Página siguiente"
              className="flex size-9 items-center justify-center rounded-lg text-secondary hover:bg-raised hover:text-primary"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>

          {nextChapter ? (
            <Link
              to={`/read/${series.slug}/${nextChapter.number}`}
              className={buttonStyles({ size: 'sm', className: 'min-w-0' })}
            >
              <span className="truncate">Cap. {nextChapter.number}</span>
              <ChevronRight className="size-4 shrink-0" />
            </Link>
          ) : (
            <span className="w-24 text-right text-[11px] text-muted">Último capítulo</span>
          )}
        </div>
      </footer>
    </div>
  )
}
