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
import { formatChapterNumber } from '@/lib/format'
import { withRetry } from '@/lib/api'
import { getChapter } from '@/services/catalog'
import { recordReadEvent } from '@/services/reading'
import { useHotkeys } from '@/hooks/useHotkeys'
import { useLibrary } from '@/hooks/useLibrary'
import { useReaderSettings } from '@/hooks/useReaderSettings'
import { buttonStyles } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CommentSection } from '@/components/detail/CommentSection'

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
    if (saved?.chapterId === chapter.id) return Math.max(0, saved.page - 1)
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

  // Una lectura por apertura: los reintentos reutilizan la misma clave.
  const [readKey] = useState(() => crypto.randomUUID())
  useEffect(() => {
    withRetry(() => recordReadEvent(chapter.id, readKey)).catch(() => undefined)
  }, [chapter.id, readKey])

  // Precarga el capítulo siguiente y sus primeras páginas.
  const nextId = nextChapter?.id
  useEffect(() => {
    if (!nextId) return
    getChapter(series.id, nextId)
      .then((next) =>
        next.pages.slice(0, 3).forEach((item) => {
          new Image().src = item.imageUrl
        }),
      )
      .catch(() => undefined)
  }, [series.id, nextId])

  useEffect(() => {
    updateProgress(series.id, chapter.id, chapter.number, currentPage, totalPages)
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
    <div className="bg-canvas min-h-dvh pb-24">
      <header className="border-line bg-canvas/90 sticky top-0 z-40 border-b backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-1.5 px-2 sm:gap-2 sm:px-5">
          <Link
            to={`/series/${series.id}`}
            aria-label="Volver a la serie"
            className="text-secondary hover:bg-raised hover:text-primary flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{series.title}</p>
            <p className="text-muted truncate text-[11px]">
              Capítulo {formatChapterNumber(chapter.number)}
              {chapter.title ? ` · ${chapter.title}` : ''}
            </p>
          </div>

          <div className="flex shrink-0 items-center">
            <Badge
              tone="neutral"
              className="px-2 py-1 text-[10px] sm:px-2.5 sm:text-[11px]"
            >
              {currentPage} / {totalPages}
            </Badge>
          </div>

          <button
            type="button"
            onClick={() => setMode(settings.mode === 'cascade' ? 'paginated' : 'cascade')}
            aria-label="Cambiar modo de lectura"
            className="border-line bg-surface text-secondary hover:text-primary flex h-10 shrink-0 items-center gap-1.5 rounded-lg border px-2 text-xs font-medium transition-colors sm:px-2.5"
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
              'flex size-10 shrink-0 items-center justify-center rounded-lg border transition-colors',
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
            className="border-line bg-surface text-secondary hover:text-primary hidden size-10 shrink-0 items-center justify-center rounded-lg border transition-colors sm:flex"
          >
            {fullscreen ? <Shrink className="size-4" /> : <Expand className="size-4" />}
          </button>
        </div>
        <div className="bg-raised h-0.5 w-full">
          <div
            className="bg-accent h-full transition-all duration-300"
            style={{ width: `${(currentPage / totalPages) * 100}%` }}
          />
        </div>
      </header>

      {settingsOpen ? (
        <>
          <button
            type="button"
            onClick={() => setSettingsOpen(false)}
            aria-label="Cerrar ajustes"
            className="fixed inset-0 z-40 bg-black/40 sm:hidden"
          />
          <div className="fixed inset-x-0 bottom-0 z-50 sm:inset-x-auto sm:top-16 sm:right-5 sm:bottom-auto">
            <div className="animate-fade-up border-line bg-surface shadow-card w-full rounded-t-2xl border p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:w-80 sm:rounded-2xl sm:pb-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-sm font-bold">Ajustes de lectura</h2>
                <button
                  type="button"
                  onClick={() => setSettingsOpen(false)}
                  aria-label="Cerrar ajustes"
                  className="text-muted hover:bg-raised hover:text-primary flex size-10 items-center justify-center rounded-lg"
                >
                  <X className="size-4" />
                </button>
              </div>

              <p className="text-muted mb-1.5 text-[11px] font-semibold tracking-wider uppercase">
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

              <p className="text-muted mt-4 mb-1.5 text-[11px] font-semibold tracking-wider uppercase">
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
                    {width === 'compact'
                      ? 'Compacto'
                      : width === 'normal'
                        ? 'Normal'
                        : 'Amplio'}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-muted text-[11px] font-semibold tracking-wider uppercase">
                  Zoom
                </p>
                <span className="text-accent text-xs font-semibold">
                  {settings.zoom}%
                </span>
              </div>
              <input
                type="range"
                min={70}
                max={140}
                step={10}
                value={settings.zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                aria-label="Zoom de lectura"
                className="mt-2 h-6 w-full accent-[var(--color-accent)]"
              />
            </div>
          </div>
        </>
      ) : null}

      <main className="reader-canvas mx-auto px-2 pt-4 sm:px-4">
        {settings.mode === 'cascade' ? (
          <div className={cn('mx-auto space-y-3', widthClass[settings.width])}>
            {pages.map((item, itemIndex) => (
              <div
                key={item.id}
                className="bg-surface relative overflow-hidden rounded-lg"
                style={{
                  width: `min(${settings.zoom}%, calc(100vw - 2rem))`,
                  marginInline: 'auto',
                }}
              >
                <img
                  src={item.imageUrl}
                  alt={`Página ${item.pageNumber} del capítulo ${formatChapterNumber(chapter.number)}`}
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
              <div
                className="border-line bg-surface relative mx-auto overflow-hidden rounded-xl border"
                style={{ width: `min(${settings.zoom}%, calc(100vw - 2rem))` }}
              >
                <img
                  src={page.imageUrl}
                  alt={`Página ${page.pageNumber} del capítulo ${formatChapterNumber(chapter.number)}`}
                  className="block max-h-[calc(100dvh-11rem)] w-full object-contain"
                />
                {page.dialogue ? (
                  <p className="absolute right-4 bottom-4 left-4 rounded-lg border border-white/15 bg-black/75 px-4 py-3 text-center text-sm font-medium text-white backdrop-blur">
                    {page.dialogue}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="mt-4 flex items-center justify-between gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => goToPage(pageIndex - 1)}
                disabled={pageIndex === 0}
                aria-label="Página anterior"
                className={buttonStyles({
                  variant: 'secondary',
                  size: 'md',
                  className: 'px-3 sm:px-5',
                })}
              >
                <ChevronLeft className="size-4 shrink-0" />
                <span className="hidden sm:inline">Anterior</span>
              </button>
              <span className="text-muted shrink-0 text-xs">
                {currentPage} de {totalPages}
              </span>
              <button
                type="button"
                onClick={() => goToPage(pageIndex + 1)}
                disabled={pageIndex >= totalPages - 1}
                aria-label="Página siguiente"
                className={buttonStyles({ size: 'md', className: 'px-3 sm:px-5' })}
              >
                <span className="hidden sm:inline">Siguiente</span>
                <ChevronRight className="size-4 shrink-0" />
              </button>
            </div>
          </div>
        )}
      </main>

      <div className="mx-auto max-w-3xl px-4 pb-8">
        <CommentSection
          targetType="CHAPTER"
          targetId={chapter.id}
          title="Comentarios del capítulo"
        />
      </div>

      <footer className="border-line bg-canvas/95 fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 px-2 py-2 sm:gap-2 sm:px-5 sm:py-2.5">
          {previousChapter ? (
            <Link
              to={`/read/${series.id}/${previousChapter.id}`}
              aria-label={`Capítulo anterior: ${formatChapterNumber(previousChapter.number)}`}
              className={buttonStyles({
                variant: 'ghost',
                size: 'sm',
                className: 'shrink-0 px-2 sm:px-3.5',
              })}
            >
              <ChevronLeft className="size-4 shrink-0" />
              <span className="hidden truncate sm:inline">
                Cap. {formatChapterNumber(previousChapter.number)}
              </span>
            </Link>
          ) : (
            <span className="w-10 shrink-0 sm:w-24" aria-hidden />
          )}

          <div className="flex min-w-0 flex-1 items-center justify-center gap-1">
            <button
              type="button"
              onClick={() => goToPage(Math.max(0, pageIndex - 1))}
              aria-label="Página anterior"
              className="text-secondary hover:bg-raised hover:text-primary flex size-10 shrink-0 items-center justify-center rounded-lg"
            >
              <ChevronLeft className="size-5" />
            </button>
            <select
              value={chapter.id}
              onChange={(event) => navigate(`/read/${series.id}/${event.target.value}`)}
              aria-label="Seleccionar capítulo"
              className="border-line bg-surface text-secondary focus:border-accent/60 h-10 max-w-32 min-w-0 flex-1 rounded-lg border px-2 text-xs outline-none sm:max-w-28"
            >
              {chapters.map((item) => (
                <option key={item.id} value={item.id}>
                  Cap. {formatChapterNumber(item.number)}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => goToPage(Math.min(totalPages - 1, pageIndex + 1))}
              aria-label="Página siguiente"
              className="text-secondary hover:bg-raised hover:text-primary flex size-10 shrink-0 items-center justify-center rounded-lg"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>

          {nextChapter ? (
            <Link
              to={`/read/${series.id}/${nextChapter.id}`}
              aria-label={`Capítulo siguiente: ${formatChapterNumber(nextChapter.number)}`}
              className={buttonStyles({
                size: 'sm',
                className: 'shrink-0 px-2 sm:px-3.5',
              })}
            >
              <span className="hidden truncate sm:inline">
                Cap. {formatChapterNumber(nextChapter.number)}
              </span>
              <ChevronRight className="size-4 shrink-0" />
            </Link>
          ) : (
            <span className="text-muted w-10 shrink-0 text-right text-[11px] sm:w-24">
              <span className="hidden sm:inline">Último capítulo</span>
            </span>
          )}
        </div>
      </footer>
    </div>
  )
}
