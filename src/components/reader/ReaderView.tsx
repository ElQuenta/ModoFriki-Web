import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpen,
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
import { createId } from '@/lib/id'
import { getChapter } from '@/services/catalog'
import { recordReadEvent } from '@/services/reading'
import { useHotkeys } from '@/hooks/useHotkeys'
import { useLibrary } from '@/hooks/useLibrary'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { useReaderSettings } from '@/hooks/useReaderSettings'
import { buttonStyles } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { CommentSection } from '@/components/detail/CommentSection'

const widthClass = {
  compact: 'max-w-2xl',
  normal: 'max-w-3xl',
  wide: 'max-w-5xl',
}

/** El scroll suave global convertiría cada salto de página en una animación. */
function scrollToInstant(top: number) {
  const root = document.documentElement
  const previous = root.style.scrollBehavior
  root.style.scrollBehavior = 'auto'
  window.scrollTo(0, top)
  root.style.scrollBehavior = previous
}

function scrollElementInstant(element: HTMLElement) {
  const root = document.documentElement
  const previous = root.style.scrollBehavior
  root.style.scrollBehavior = 'auto'
  element.scrollIntoView({ block: 'start' })
  root.style.scrollBehavior = previous
}

function ReaderImage({
  src,
  alt,
  className,
  loading,
}: {
  src: string
  alt: string
  className: string
  loading?: 'eager' | 'lazy'
}) {
  const [attempt, setAttempt] = useState(0)
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div
        className={cn(
          'bg-surface flex min-h-48 flex-col items-center justify-center gap-3 p-6 text-center',
          className,
        )}
      >
        <p className="text-muted text-xs">No pudimos cargar esta página.</p>
        <button
          type="button"
          onClick={() => {
            setFailed(false)
            setAttempt((value) => value + 1)
          }}
          className="text-accent text-xs font-semibold hover:underline"
        >
          Reintentar
        </button>
      </div>
    )
  }

  const url = attempt > 0 ? `${src}${src.includes('?') ? '&' : '?'}retry=${attempt}` : src

  return (
    <img
      key={attempt}
      src={url}
      alt={alt}
      loading={loading}
      decoding="async"
      onError={() => setFailed(true)}
      className={className}
    />
  )
}

export function ReaderView({
  series,
  chapter,
  chapters,
  chaptersLoading = false,
  chaptersError = false,
  onRetryChapters,
}: {
  series: Series
  chapter: Chapter
  chapters: Chapter[]
  chaptersLoading?: boolean
  chaptersError?: boolean
  onRetryChapters?: () => void
}) {
  const navigate = useNavigate()
  const { settings, setMode, setWidth, setZoom } = useReaderSettings()
  const { getProgress, updateProgress } = useLibrary()
  const saved = getProgress(series.id)
  // Se captura una sola vez: updateProgress cambia `saved` en cada página.
  const savedPageRef = useRef(saved?.chapterId === chapter.id ? saved.page : 0)

  const pages = chapter.pages
  const totalPages = pages.length
  const [pageIndex, setPageIndex] = useState(() => {
    if (saved?.chapterId === chapter.id) return Math.max(0, saved.page - 1)
    return 0
  })
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [progressReady, setProgressReady] = useState(false)

  const pageRefs = useRef<Array<HTMLDivElement | null>>([])
  const suppressScroll = useRef(false)
  const restoredRef = useRef(false)
  const settingsPanelRef = useRef<HTMLDivElement>(null)

  const currentPage = totalPages === 0 ? 0 : Math.min(pageIndex + 1, totalPages)
  const index = chapters.findIndex((item) => item.id === chapter.id)
  const nextChapter = index > 0 ? chapters[index - 1] : undefined
  const previousChapter = index < chapters.length - 1 ? chapters[index + 1] : undefined
  const page = pages[Math.min(pageIndex, Math.max(totalPages - 1, 0))]

  useLockBodyScroll(settingsOpen)

  const goToPage = useCallback(
    (next: number) => {
      if (totalPages === 0) return false
      const clamped = Math.min(totalPages - 1, Math.max(0, next))
      if (clamped === pageIndex) return false

      setPageIndex(clamped)

      if (settings.mode === 'cascade') {
        const target = pageRefs.current[clamped]
        if (target) {
          suppressScroll.current = true
          scrollElementInstant(target)
          window.setTimeout(() => {
            suppressScroll.current = false
          }, 120)
        }
      } else {
        scrollToInstant(0)
      }

      return true
    },
    [pageIndex, settings.mode, totalPages],
  )

  // Una lectura por apertura: los reintentos reutilizan la misma clave.
  const [readKey] = useState(() => createId())
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

  // Precarga la página siguiente en modo paginado.
  useEffect(() => {
    if (settings.mode !== 'paginated') return
    const nextPage = pages[pageIndex + 1]
    if (nextPage) new Image().src = nextPage.imageUrl
  }, [settings.mode, pages, pageIndex])

  // No guardamos el progreso hasta restaurar la página previa: si no, el
  // primer render escribiría "página 1" y perdería la posición guardada.
  useEffect(() => {
    const frame = requestAnimationFrame(() => setProgressReady(true))
    return () => cancelAnimationFrame(frame)
  }, [chapter.id])

  useEffect(() => {
    if (!progressReady || totalPages === 0) return
    updateProgress(series.id, chapter.id, chapter.number, currentPage, totalPages)
  }, [
    progressReady,
    series.id,
    chapter.id,
    chapter.number,
    currentPage,
    totalPages,
    updateProgress,
  ])

  // Restaura la página exacta al abrir un capítulo ya empezado.
  useLayoutEffect(() => {
    if (restoredRef.current) return
    restoredRef.current = true
    if (settings.mode !== 'cascade') return
    const savedPage = savedPageRef.current
    if (savedPage <= 1) return

    const restore = () => {
      const target = pageRefs.current[savedPage - 1]
      if (target) scrollElementInstant(target)
    }

    suppressScroll.current = true
    restore()
    // Las imágenes aún no tienen altura: repetimos cuando el layout se asienta.
    const timer = window.setTimeout(() => {
      restore()
      suppressScroll.current = false
    }, 250)

    return () => {
      window.clearTimeout(timer)
      suppressScroll.current = false
    }
  }, [chapter.id, settings.mode])

  // En cascada, la página actual es la que cruza el tercio superior del viewport.
  useEffect(() => {
    if (settings.mode !== 'cascade' || totalPages === 0) return

    let frame = 0
    const update = () => {
      if (suppressScroll.current || !progressReady) return

      const middle = window.scrollY + window.innerHeight * 0.35
      let current = 0
      for (let itemIndex = 0; itemIndex < pageRefs.current.length; itemIndex += 1) {
        const element = pageRefs.current[itemIndex]
        if (!element) continue
        const top = element.getBoundingClientRect().top + window.scrollY
        if (top <= middle) current = itemIndex
        else break
      }

      setPageIndex((previous) => (previous === current ? previous : current))
    }

    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [settings.mode, totalPages, progressReady, chapter.id])

  // Al cambiar de modo, mantén al lector en la misma página.
  const previousMode = useRef(settings.mode)
  useLayoutEffect(() => {
    if (previousMode.current === settings.mode) return
    previousMode.current = settings.mode

    if (settings.mode === 'cascade') {
      suppressScroll.current = true
      const target = pageRefs.current[pageIndex]
      if (target) scrollElementInstant(target)
      const timer = window.setTimeout(() => {
        suppressScroll.current = false
      }, 150)
      return () => window.clearTimeout(timer)
    }

    scrollToInstant(0)
  }, [settings.mode, pageIndex])

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onChange)
    onChange()
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen()
      else await document.exitFullscreen()
    } catch {
      setFullscreen(Boolean(document.fullscreenElement))
    }
  }, [])

  // Escape debe funcionar aunque el foco esté en el range del panel.
  useHotkeys(
    {
      escape: () => {
        setSettingsOpen(false)
        return true
      },
    },
    settingsOpen,
  )

  useHotkeys(
    {
      arrowright: () => goToPage(pageIndex + 1),
      d: () => goToPage(pageIndex + 1),
      arrowleft: () => goToPage(pageIndex - 1),
      a: () => goToPage(pageIndex - 1),
      f: () => {
        void toggleFullscreen()
        return true
      },
      m: () => {
        setMode(settings.mode === 'cascade' ? 'paginated' : 'cascade')
        return true
      },
    },
    !settingsOpen,
  )

  // Foco inicial, trampa de tabulación y restauración al cerrar el panel.
  useEffect(() => {
    if (!settingsOpen) return
    const panel = settingsPanelRef.current
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const focusables = panel?.querySelectorAll<HTMLElement>(
      'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])',
    )

    focusables?.[0]?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !focusables || focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (!first || !last) return

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    panel?.addEventListener('keydown', onKeyDown)
    return () => {
      panel?.removeEventListener('keydown', onKeyDown)
      previous?.focus()
    }
  }, [settingsOpen])

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
            <h1 className="truncate text-sm font-semibold">{series.title}</h1>
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
              {totalPages > 0 ? `${currentPage} / ${totalPages}` : 'Sin páginas'}
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
            aria-controls="reader-settings"
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
            aria-label={fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            aria-pressed={fullscreen}
            className="border-line bg-surface text-secondary hover:text-primary hidden size-10 shrink-0 items-center justify-center rounded-lg border transition-colors sm:flex"
          >
            {fullscreen ? <Shrink className="size-4" /> : <Expand className="size-4" />}
          </button>
        </div>
        <div
          className="bg-raised h-0.5 w-full"
          role="progressbar"
          aria-label="Progreso de lectura"
          aria-valuemin={0}
          aria-valuemax={Math.max(totalPages, 1)}
          aria-valuenow={currentPage}
        >
          <div
            className="bg-accent h-full transition-all duration-300"
            style={{ width: `${totalPages > 0 ? (currentPage / totalPages) * 100 : 0}%` }}
          />
        </div>
        <p className="sr-only" aria-live="polite">
          {totalPages > 0 ? `Página ${currentPage} de ${totalPages}` : 'Capítulo sin páginas'}
        </p>
      </header>

      {settingsOpen ? (
        <>
          <button
            type="button"
            onClick={() => setSettingsOpen(false)}
            aria-label="Cerrar ajustes"
            tabIndex={-1}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />
          <div
            ref={settingsPanelRef}
            id="reader-settings"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reader-settings-title"
            className="fixed inset-x-0 bottom-0 z-[60] sm:inset-x-auto sm:top-16 sm:right-5 sm:bottom-auto"
          >
            <div className="animate-fade-up border-line bg-surface shadow-card w-full rounded-t-2xl border p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:w-80 sm:rounded-2xl sm:pb-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 id="reader-settings-title" className="font-display text-sm font-bold">
                  Ajustes de lectura
                </h2>
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
                    aria-pressed={settings.mode === mode}
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
                    aria-pressed={settings.width === width}
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
        {totalPages === 0 ? (
          <div className="container-mf py-10">
            <EmptyState
              icon={BookOpen}
              title="Este capítulo no tiene páginas"
              description="El capítulo está publicado pero todavía no tiene páginas disponibles."
              actionLabel="Volver a la serie"
              actionTo={`/series/${series.id}`}
            />
          </div>
        ) : settings.mode === 'cascade' ? (
          <div className={cn('mx-auto space-y-3', widthClass[settings.width])}>
            {pages.map((item, itemIndex) => (
              <div
                key={item.id}
                ref={(node) => {
                  pageRefs.current[itemIndex] = node
                }}
                className="bg-surface relative scroll-mt-20 overflow-hidden rounded-lg"
                style={{
                  width: `min(${settings.zoom}%, calc(100vw - 2rem))`,
                  marginInline: 'auto',
                }}
              >
                <ReaderImage
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
                <ReaderImage
                  key={page.id}
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
              onClick={() => goToPage(pageIndex - 1)}
              disabled={totalPages === 0 || pageIndex === 0}
              aria-label="Página anterior"
              className="text-secondary hover:bg-raised hover:text-primary flex size-10 shrink-0 items-center justify-center rounded-lg disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft className="size-5" />
            </button>
            <select
              value={chapter.id}
              onChange={(event) => navigate(`/read/${series.id}/${event.target.value}`)}
              aria-label="Seleccionar capítulo"
              className="border-line bg-surface text-secondary focus:border-accent/60 h-10 max-w-32 min-w-0 flex-1 rounded-lg border px-2 text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:max-w-28"
            >
              {chapters.map((item) => (
                <option key={item.id} value={item.id}>
                  Cap. {formatChapterNumber(item.number)}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => goToPage(pageIndex + 1)}
              disabled={totalPages === 0 || pageIndex >= totalPages - 1}
              aria-label="Página siguiente"
              className="text-secondary hover:bg-raised hover:text-primary flex size-10 shrink-0 items-center justify-center rounded-lg disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>

          {chaptersError ? (
            <button
              type="button"
              onClick={onRetryChapters}
              className="text-danger w-10 shrink-0 text-right text-[10px] font-semibold underline sm:w-24 sm:text-[11px]"
            >
              Reintentar
            </button>
          ) : nextChapter ? (
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
          ) : chaptersLoading ? (
            <span className="w-10 shrink-0 sm:w-24" aria-hidden />
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
