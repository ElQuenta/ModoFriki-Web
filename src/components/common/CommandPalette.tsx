import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CornerDownLeft, Search, TrendingUp } from 'lucide-react'
import { listWorks } from '@/services/catalog'
import { listPopularWorks } from '@/services/discovery'
import { useAsync } from '@/hooks/useAsync'
import { useDebounce } from '@/hooks/useDebounce'
import { useUI } from '@/hooks/useUI'
import { Modal } from '@/components/ui/modal'
import { cn } from '@/lib/cn'

interface Result {
  id: string
  title: string
  subtitle: string
  to: string
  kind: 'Serie'
}

export function CommandPalette() {
  const { commandOpen, closeCommand } = useUI()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const term = useDebounce(query.trim(), 250)
  const { data, loading, error } = useAsync<Result[]>(
    async () => {
      const works = term
        ? await listWorks({ search: term, limit: 8 })
        : (await listPopularWorks({ limit: 5 })).items
      return works.map((series) => ({
        id: series.id,
        title: series.title,
        subtitle: [series.type, series.genres.slice(0, 2).join(', ')]
          .filter(Boolean)
          .join(' · '),
        to: `/series/${series.id}`,
        kind: 'Serie' as const,
      }))
    },
    `palette:${term}`,
    commandOpen,
  )
  const results = data ?? []

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
      description="Busca series por título."
      className="max-w-2xl p-0"
    >
      <div className="border-line border-b px-4">
        <div className="flex items-center gap-3">
          <Search className="text-accent size-5" />
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
            placeholder="Escribe un título..."
            aria-label="Término de búsqueda"
            className="text-primary placeholder:text-muted h-16 w-full bg-transparent text-base outline-none"
          />
        </div>
      </div>

      <div className="max-h-[min(60vh,28rem)] overflow-y-auto p-2">
        {error ? (
          <div className="text-danger px-4 py-10 text-center text-sm">{error}</div>
        ) : loading && results.length === 0 ? (
          <div className="text-secondary px-4 py-10 text-center text-sm">Buscando…</div>
        ) : results.length === 0 ? (
          <div className="text-secondary px-4 py-10 text-center text-sm">
            {query ? `No encontramos resultados para “${query}”.` : 'Aún no hay series.'}
          </div>
        ) : (
          <>
            {!query ? (
              <p className="text-muted flex items-center gap-2 px-3 py-2 text-xs font-semibold tracking-wider uppercase">
                <TrendingUp className="text-accent size-3.5" /> Populares
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
                    <span className="bg-raised text-muted rounded px-1.5 py-0.5 text-[10px] font-semibold">
                      {result.kind}
                    </span>
                  </span>
                  <span className="text-secondary mt-0.5 block truncate text-xs">
                    {result.subtitle}
                  </span>
                </span>
                <CornerDownLeft
                  className={cn(
                    'text-muted size-4 shrink-0 transition-opacity',
                    active === index ? 'opacity-100' : 'opacity-0',
                  )}
                />
              </button>
            ))}
          </>
        )}
      </div>

      <div className="border-line text-muted flex items-center gap-4 border-t px-4 py-2.5 text-[11px]">
        <span>
          <kbd className="border-line-strong rounded border px-1">↑</kbd>{' '}
          <kbd className="border-line-strong rounded border px-1">↓</kbd> navegar
        </span>
        <span>
          <kbd className="border-line-strong rounded border px-1">Enter</kbd> abrir
        </span>
        <span>
          <kbd className="border-line-strong rounded border px-1">Esc</kbd> cerrar
        </span>
      </div>
    </Modal>
  )
}
