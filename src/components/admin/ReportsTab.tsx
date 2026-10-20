import { useState } from 'react'
import { Flag } from 'lucide-react'
import { toast } from 'sonner'
import type { Cursor, ReportStatus } from '@/types'
import { cn } from '@/lib/cn'
import { errorMessage } from '@/lib/api'
import { formatRelativeDate } from '@/lib/format'
import {
  listReports,
  REPORT_REASONS,
  resolveReport,
  type ModerationReport,
} from '@/services/community'
import { useAsync } from '@/hooks/useAsync'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState, ErrorState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { textareaClass } from './styles'

const FILTERS: { value: ReportStatus | ''; label: string }[] = [
  { value: 'OPEN', label: 'Abiertos' },
  { value: 'IN_REVIEW', label: 'En revisión' },
  { value: 'RESOLVED', label: 'Resueltos' },
  { value: 'DISMISSED', label: 'Descartados' },
  { value: '', label: 'Todos' },
]

const STATUS_LABELS: Record<ReportStatus, string> = {
  OPEN: 'Abierto',
  IN_REVIEW: 'En revisión',
  RESOLVED: 'Resuelto',
  DISMISSED: 'Descartado',
}

const reasonLabel = (reason: string) =>
  REPORT_REASONS.find((item) => item.value === reason)?.label ?? reason

function ReportCard({
  report,
  onResolved,
}: {
  report: ModerationReport
  onResolved: (report: ModerationReport) => void
}) {
  const [resolution, setResolution] = useState('')
  const [busy, setBusy] = useState(false)
  const closed = report.status === 'RESOLVED' || report.status === 'DISMISSED'

  const resolve = async (status: 'RESOLVED' | 'DISMISSED') => {
    if (!resolution.trim())
      return toast.error('Escribe una resolución antes de cerrar el reporte.')
    setBusy(true)
    try {
      onResolved(await resolveReport(report.id, status, resolution.trim()))
      toast.success(status === 'RESOLVED' ? 'Reporte resuelto' : 'Reporte descartado')
    } catch (error) {
      toast.error(errorMessage(error, 'No pudimos actualizar el reporte.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className="surface-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="danger">{reasonLabel(report.reason)}</Badge>
        <Badge tone={closed ? 'neutral' : 'warning'}>
          {STATUS_LABELS[report.status]}
        </Badge>
        <span className="text-muted ml-auto text-[11px]">
          {formatRelativeDate(report.createdAt)}
        </span>
      </div>
      <p className="text-secondary mt-3 text-sm whitespace-pre-wrap">
        {report.details || 'Sin detalles.'}
      </p>
      <p className="text-muted mt-2 text-[11px] break-all">
        Comentario {report.commentId} · reportado por {report.reporterId}
      </p>
      {closed ? (
        <p className="border-line text-secondary mt-3 border-t pt-3 text-xs">
          <span className="font-semibold">Resolución:</span> {report.resolution}
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          <textarea
            value={resolution}
            onChange={(event) => setResolution(event.target.value)}
            placeholder="Explica la decisión…"
            aria-label="Resolución"
            maxLength={2000}
            rows={2}
            className={textareaClass}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => void resolve('RESOLVED')} disabled={busy}>
              Resolver
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => void resolve('DISMISSED')}
              disabled={busy}
            >
              Descartar
            </Button>
          </div>
        </div>
      )}
    </article>
  )
}

export function ReportsTab() {
  const [status, setStatus] = useState<ReportStatus | ''>('OPEN')
  const key = `reports:${status}`
  const first = useAsync(() => listReports(status || undefined), key)
  const [more, setMore] = useState<{
    key: string
    items: ModerationReport[]
    cursor: Cursor | null
  }>()
  const [loadingMore, setLoadingMore] = useState(false)
  const extra = more?.key === key ? more.items : []
  const cursor =
    more?.key === key ? more.cursor : first.data?.hasMore ? first.data.nextCursor : null
  const reports = [...(first.data?.items ?? []), ...extra]

  const replace = (updated: ModerationReport) => {
    const swap = (items: ModerationReport[]) =>
      items.map((item) => (item.id === updated.id ? updated : item))
    first.setData((page) => page && { ...page, items: swap(page.items) })
    setMore((current) => current && { ...current, items: swap(current.items) })
  }

  const loadMore = async () => {
    if (!cursor) return
    setLoadingMore(true)
    try {
      const page = await listReports(status || undefined, cursor)
      setMore({
        key,
        items: [...extra, ...page.items],
        cursor: page.hasMore ? page.nextCursor : null,
      })
    } catch (error) {
      toast.error(errorMessage(error, 'No pudimos cargar más reportes.'))
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <div>
      <div
        className="no-scrollbar mb-4 flex gap-1.5 overflow-x-auto"
        role="group"
        aria-label="Estado"
      >
        {FILTERS.map((filter) => (
          <button
            key={filter.value || 'all'}
            type="button"
            aria-pressed={status === filter.value}
            onClick={() => setStatus(filter.value)}
            className={cn(
              'shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors',
              status === filter.value
                ? 'border-accent/40 bg-accent/10 text-accent'
                : 'border-line bg-surface text-secondary hover:text-primary',
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {first.error && !first.data ? (
        <ErrorState message={first.error} onRetry={first.reload} />
      ) : first.loading && !first.data ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-32 w-full" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <EmptyState
          icon={Flag}
          title="No hay reportes"
          description="Cuando la comunidad reporte comentarios, aparecerán aquí."
        />
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} onResolved={replace} />
          ))}
        </div>
      )}

      {cursor ? (
        <Button
          variant="secondary"
          onClick={() => void loadMore()}
          disabled={loadingMore}
          className="mt-3 w-full"
        >
          {loadingMore ? 'Cargando…' : 'Cargar más'}
        </Button>
      ) : null}
    </div>
  )
}
