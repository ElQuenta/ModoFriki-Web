import { useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BookOpen, ListOrdered, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Series } from '@/types'
import type { ManagementAccess } from '@/types/user-admin'
import { ApiError, errorMessage } from '@/lib/api'
import { listWorks } from '@/services/catalog'
import {
  createWork,
  deleteWork,
  updateWork,
  type WorkFiles,
  type WorkInput,
} from '@/services/admin'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { useDebounce } from '@/hooks/useDebounce'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { CoverImage } from '@/components/ui/cover-image'
import { EmptyState, ErrorState } from '@/components/ui/empty-state'
import { Modal } from '@/components/ui/modal'
import { Skeleton } from '@/components/ui/skeleton'
import { ChaptersPanel } from './ChaptersPanel'
import { WorkForm } from './WorkForm'
import { inputClass } from './styles'

const MAX_LIMIT = 100

type Dialog = { kind: 'create' } | { kind: 'edit' | 'delete'; work: Series }

export function WorksTab() {
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [extraPages, setExtraPages] = useState<{ filter: string; items: Series[]; page: number; lastBatchSize: number; loading: boolean; error?: string }>({ filter: '', items: [], page: 1, lastBatchSize: 0, loading: false })
  const [dialog, setDialog] = useState<Dialog>()
  const term = useDebounce(search.trim(), 300)
  const isAdmin = user?.role === 'ADMIN'
  // La visibilidad en el catálogo no acredita asignación editorial.
  const managementAccess: ManagementAccess = isAdmin ? 'allowed' : 'unknown'

  const filterKey = `${term}:${user?.id ?? 'guest'}`
  const filterRef = useRef(filterKey)
  filterRef.current = filterKey
  const { data, loading, error, reload, setData } = useAsync(
    () => listWorks({ page: 1, includeDrafts: true, search: term || undefined, limit: MAX_LIMIT }),
    `admin-works:${filterKey}`,
  )
  const continuation = extraPages.filter === filterKey ? extraPages : undefined
  const works = [...(data ?? []), ...(continuation?.items ?? [])]
  const lastBatchSize = continuation?.lastBatchSize ?? data?.length ?? 0
  const hasMore = lastBatchSize === MAX_LIMIT
  const loadMore = async () => {
    if (!hasMore || continuation?.loading) return
    const page = (continuation?.page ?? 1) + 1
    const requestedFilter = filterKey
    setExtraPages((current) => ({
      filter: requestedFilter,
      items: current.filter === requestedFilter ? current.items : [],
      page: page - 1,
      lastBatchSize: current.filter === requestedFilter ? current.lastBatchSize : data?.length ?? 0,
      loading: true,
    }))
    try {
      const batch = await listWorks({ page, limit: MAX_LIMIT, includeDrafts: true, search: term || undefined })
      if (filterRef.current !== requestedFilter) return
      setExtraPages((current) => {
        const existing = current.filter === requestedFilter ? current.items : []
        const ids = new Set([...((data ?? []).map((work) => work.id)), ...existing.map((work) => work.id)])
        return {
          filter: requestedFilter,
          items: [...existing, ...batch.filter((work) => !ids.has(work.id))],
          page,
          lastBatchSize: batch.length,
          loading: false,
        }
      })
    } catch (caught) {
      if (filterRef.current === requestedFilter) {
        setExtraPages((current) => ({ ...current, filter: requestedFilter, loading: false, error: errorMessage(caught, 'No pudimos cargar más obras.') }))
      }
    }
  }
  const retryMore = () => {
    if (continuation?.error) setExtraPages((current) => ({ ...current, error: undefined, lastBatchSize: MAX_LIMIT }))
    void loadMore()
  }
  const selectedId = params.get('work')
  const selected = works.find((work) => work.id === selectedId)
  // Si una escritura choca, useAsync recarga la versión autoritativa. Mantener
  // el formulario montado conserva texto y selecciones mientras cambia el CAS.
  const latestDialogWork = dialog?.kind === 'edit'
    ? works.find((work) => work.id === dialog.work.id) ?? dialog.work
    : undefined
  const close = () => setDialog(undefined)

  const select = (work?: Series) => {
    const next = new URLSearchParams(params)
    if (work) next.set('work', work.id)
    else next.delete('work')
    setParams(next)
  }

  const fail = (caught: unknown, fallback: string) => {
    if (caught instanceof ApiError && caught.status === 409) {
      setExtraPages({ filter: filterKey, items: [], page: 1, lastBatchSize: 0, loading: false })
      reload()
      toast.error(`${caught.message} Recargamos la lista con la versión más reciente.`)
    } else {
      toast.error(errorMessage(caught, fallback))
    }
  }

  const save = async (input: WorkInput, files: WorkFiles) => {
    try {
      if (dialog?.kind === 'edit' && latestDialogWork) {
        // Siempre con el updatedAt más reciente que conocemos.
        const updated = await updateWork(
          latestDialogWork.id,
          input,
          files,
          latestDialogWork.updatedAt ?? '',
        )
        setData((items) =>
          items?.map((item) => (item.id === updated.id ? updated : item)),
        )
        setExtraPages((current) => current.filter === filterKey
          ? { ...current, items: current.items.map((item) => item.id === updated.id ? updated : item) }
          : current)
        toast.success('Obra actualizada')
      } else {
        const created = await createWork(input, files)
        setData((items) => [created, ...(items ?? [])])
        toast.success('Obra creada')
      }
      close()
    } catch (caught) {
      fail(caught, 'No pudimos guardar la obra.')
    }
  }

  const remove = async (work: Series) => {
    try {
      await deleteWork(work.id, work.updatedAt ?? '')
      setData((items) => items?.filter((item) => item.id !== work.id))
      setExtraPages((current) => current.filter === filterKey
        ? { ...current, items: current.items.filter((item) => item.id !== work.id) }
        : current)
      toast.success('Obra eliminada')
    } catch (caught) {
      fail(caught, 'No pudimos eliminar la obra.')
    }
  }

  if (selected) return <ChaptersPanel work={selected} onBack={() => select()} />

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="text-muted absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
            }}
            placeholder="Buscar obras por título..."
            aria-label="Buscar obras"
            className={`${inputClass} pl-10`}
          />
        </div>
        {isAdmin ? (
          <Button onClick={() => setDialog({ kind: 'create' })}>
            <Plus className="size-4" /> Nueva obra
          </Button>
        ) : null}
      </div>
      {!isAdmin ? (
        <p className="text-muted mb-4 text-xs" role="status">
          {managementAccess === 'unknown'
            ? 'La asignación editorial de cada obra no está confirmada; las acciones de gestión permanecen deshabilitadas hasta verificarla.'
            : 'Tienes acceso de administración a las obras.'}
        </p>
      ) : null}

      {error && !works ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading && !works ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-20 w-full" />
          ))}
        </div>
      ) : !works?.length ? (
        <EmptyState
          icon={BookOpen}
          title="No hay obras"
          description={
            term
              ? 'Ninguna obra coincide con la búsqueda.'
              : 'Crea la primera obra del catálogo.'
          }
          actionLabel={isAdmin && !term ? 'Nueva obra' : undefined}
          onAction={isAdmin && !term ? () => setDialog({ kind: 'create' }) : undefined}
        />
      ) : (
        <ul className="border-line bg-surface divide-line divide-y overflow-hidden rounded-2xl border">
          {works.map((work) => (
            <li key={work.id} className="flex items-center gap-3 p-3">
              <CoverImage
                src={work.thumbUrl || work.coverUrl}
                alt={`Portada de ${work.title}`}
                title={work.title}
                className="h-16 w-11 shrink-0 rounded-md"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{work.title}</p>
                <p className="text-muted truncate text-[11px]">
                  {work.type} · {work.status}
                </p>
              </div>
              <Badge
                tone={work.publicationStatus === 'PUBLISHED' ? 'success' : 'warning'}
                className="hidden sm:inline-flex"
              >
                {work.publicationStatus === 'PUBLISHED' ? 'Publicada' : 'Borrador'}
              </Badge>
              {!isAdmin ? <span className="text-muted hidden text-[11px] md:inline">Acceso: desconocido</span> : null}
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => select(work)}
                  aria-label={`Capítulos de ${work.title}`}
                >
                  <ListOrdered className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDialog({ kind: 'edit', work })}
                  aria-label={`Editar ${work.title}`}
                  disabled={!isAdmin && managementAccess !== 'allowed'}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDialog({ kind: 'delete', work })}
                  aria-label={`Eliminar ${work.title}`}
                  disabled={!isAdmin && managementAccess !== 'allowed'}
                  className="hover:text-danger"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {continuation?.error ? <p className="text-danger mt-3 text-sm" role="status">{continuation.error} <button type="button" className="text-accent underline" onClick={retryMore}>Reintentar</button></p> : null}
      {hasMore ? (
        <Button variant="secondary" onClick={() => void loadMore()} disabled={continuation?.loading || loading} className="mt-3 w-full">
          {continuation?.loading ? 'Cargando…' : 'Cargar más'}
        </Button>
      ) : null}

      <Modal
        open={dialog?.kind === 'create' || dialog?.kind === 'edit'}
        onClose={close}
        title={dialog?.kind === 'edit' ? 'Editar obra' : 'Nueva obra'}
        className="max-w-2xl"
      >
        <WorkForm
          key={dialog?.kind === 'edit' ? dialog.work.id : 'new'}
          work={latestDialogWork}
          onSubmit={save}
          onCancel={close}
        />
      </Modal>

      <ConfirmDialog
        open={dialog?.kind === 'delete'}
        title="¿Eliminar obra?"
        description="Se ocultarán la obra y todos sus capítulos. Esta acción no se puede deshacer desde aquí."
        onConfirm={() => (dialog?.kind === 'delete' ? remove(dialog.work) : undefined)}
        onClose={close}
      />
    </div>
  )
}
