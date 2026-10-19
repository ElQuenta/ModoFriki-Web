import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CornerDownLeft, Search, TrendingUp } from 'lucide-react'
import { CHAPTERS, FEATURED_SERIES, SERIES } from '@/data/mock'
import { useUI } from '@/hooks/useUI'
import { Modal } from '@/components/ui/modal'
import { cn } from '@/lib/cn'

interface Result {
  id: string
  title: string
  subtitle: string
  to: string
  kind: 'Serie' | 'Capítulo'
}

export function CommandPalette() {
  const { commandOpen, closeCommand } = useUI()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const results = useMemo<Result[]>(() => {
    const term = query.trim().toLowerCase()
    if (!term) {
      return FEATURED_SERIES.map((series) => ({
        id: series.id,
        title: series.title,
        subtitle: `${series.type} · ${series.totalChapters} capítulos`,
        to: `/series/${series.slug}`,
        kind: 'Serie' as const,
      }))
    }

    const seriesResults: Result[] = SERIES.filter((series) => {
      return (
        series.title.toLowerCase().includes(term) ||
        series.genres.some((genre) => genre.toLowerCase().includes(term)) ||
        series.tags.some((tag) => tag.toLowerCase().includes(term))
      )
    })
      .slice(0, 5)
      .map((series) => ({
        id: series.id,
        title: series.title,
        subtitle: `${series.type} · ${series.genres.slice(0, 2).join(', ')}`,
        to: `/series/${series.slug}`,
        kind: 'Serie',
      }))

    const chapterResults: Result[] = CHAPTERS.filter((chapter) => {
      const series = SERIES.find((item) => item.id === chapter.seriesId)
      return (
        series?.title.toLowerCase().includes(term) ||
        chapter.title.toLowerCase().includes(term)
      )
    })
      .slice(0, 4)
      .map((chapter) => {
        const series = SERIES.find((item) => item.id === chapter.seriesId)
        return {
          id: chapter.id,
          title: `${series?.title ?? 'Serie'} · Cap. ${chapter.number}`,
          subtitle: chapter.title,
          to: `/read/${series?.slug ?? ''}/${chapter.number}`,
          kind: 'Capítulo',
        }
      })

    return [...seriesResults, ...chapterResults]
  }, [query])

  useEffect(() => {
    if (commandOpen) {
      const timer = window.setTimeout(() => inputRef.current?.focus(), 40)
      return () => window.clearTimeout(timer)
    }
  }, [commandOpen])

  const close = () => {
    setQuery('')
    setActive(0)
    closeCommand()
  }

  const go = (result: Result | undefined) => {
    if (!result) return
    close()
    navigate(result.to)
  }

  return (
    <Modal
      open={commandOpen}
      onClose={close}
      title="Buscar en ModoFriki"
      description="Series, capítulos, géneros y tags."
      className="max-w-2xl p-0"
    >
      <div className="border-b border-line px-4">
        <div className="flex items-center gap-3">
          <Search className="size-5 text-accent" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setActive(0)
            }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault()
                setActive((value) => Math.min(value + 1, results.length - 1))
              }
              if (event.key === 'ArrowUp') {
                event.preventDefault()
                setActive((value) => Math.max(value - 1, 0))
              }
              if (event.key === 'Enter') go(results[active])
            }}
            placeholder="Escribe un título, género o capítulo..."
            aria-label="Término de búsqueda"
            className="h-16 w-full bg-transparent text-base text-primary outline-none placeholder:text-muted"
          />
        </div>
      </div>

      <div className="max-h-[min(60vh,28rem)] overflow-y-auto p-2">
        {results.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-secondary">
            No encontramos resultados para “{query}”.
          </div>
        ) : (
          <>
            {!query ? (
              <p className="flex items-center gap-2 px-3 py-2 text-xs font-semibold tracking-wider text-muted uppercase">
                <TrendingUp className="size-3.5 text-accent" /> Destacados
              </p>
            ) : null}
            {results.map((result, index) => (
              <button
                key={result.id}
                type="button"
                onMouseEnter={() => setActive(index)}
                onClick={() => go(result)}
                className={cn(
                  'flex w-full items-center justify-between gap-4 rounded-xl px-3 py-3 text-left transition-colors',
                  active === index ? 'bg-accent/10' : 'hover:bg-raised',
                )}
              >
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold">{result.title}</span>
                    <span className="rounded bg-raised px-1.5 py-0.5 text-[10px] font-semibold text-muted">
                      {result.kind}
                    </span>
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-secondary">
                    {result.subtitle}
                  </span>
                </span>
                <CornerDownLeft
                  className={cn(
                    'size-4 shrink-0 text-muted transition-opacity',
                    active === index ? 'opacity-100' : 'opacity-0',
                  )}
                />
              </button>
            ))}
          </>
        )}
      </div>

      <div className="flex items-center gap-4 border-t border-line px-4 py-2.5 text-[11px] text-muted">
        <span>
          <kbd className="rounded border border-line-strong px-1">↑</kbd>{' '}
          <kbd className="rounded border border-line-strong px-1">↓</kbd> navegar
        </span>
        <span>
          <kbd className="rounded border border-line-strong px-1">Enter</kbd> abrir
        </span>
        <span>
          <kbd className="rounded border border-line-strong px-1">Esc</kbd> cerrar
        </span>
      </div>
    </Modal>
  )
}
