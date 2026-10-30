import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BookOpen, ListOrdered, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Series } from '@/types'
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

const PAGE_SIZE = 20
// ponytail: una sola request de hasta 100 obras; paginar con varias si el catálogo crece.
const MAX_LIMIT = 100

type Dialog = { kind: 'create' } | { kind: 'edit' | 'delete'; work: Series }

export function WorksTab() {
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [pages, setPages] = useState(1)
  const [dialog, setDialog] = useState<Dialog>()
  const term = useDebounce(search.trim(), 300)
  const limit = Math.min(PAGE_SIZE * pages, MAX_LIMIT)
  const isAdmin = user?.role === 'ADMIN'

  const { data, staleData, loading, error, reload, setData } = useAsync(
    () => listWorks({ includeDrafts: true, search: term || undefined, limit }),
    `admin-works:${term}:${limit}`,
  )
  const works = data ?? (pages > 1 ? staleData : undefined)
  const hasMore = (data?.length ?? 0) === limit && limit < MAX_LIMIT
  const selectedId = params.get('work')
  const selected = works?.find((work) => work.id === selectedId)
  const close = () => setDialog(undefined)

  const select = (work?: Series) => {
    const next = new URLSearchParams(params)
    if (work) next.set('work', work.id)
    else next.delete('work')
    setParams(next)
  }

  const fail = (caught: unknown, fallback: string) => {
    if (caught instanceof ApiError && caught.status === 409) {
      reload()
      toast.error(`${caught.message} Recargamos la lista con la versión más reciente.`)
    } else {
      toast.error(errorMessage(caught, fallback))
    }
  }

  const save = async (input: WorkInput, files: WorkFiles) => {
    try {
      if (dialog?.kind === 'edit') {
        // Siempre con el updatedAt más reciente que conocemos.
        const updated = await updateWork(
          dialog.work.id,
          input,
          files,
          dialog.work.updatedAt ?? '',
        )
        setData((items) =>
          items?.map((item) => (item.id === updated.id ? updated : item)),
        )
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
              setPages(1)
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
        <p className="text-muted mb-4 text-xs">
          Como editor, solo puedes modificar las obras que tienes asignadas.
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
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDialog({ kind: 'delete', work })}
                  aria-label={`Eliminar ${work.title}`}
                  className="hover:text-danger"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {hasMore ? (
        <Button
          variant="secondary"
          onClick={() => setPages((value) => value + 1)}
          disabled={loading}
          className="mt-3 w-full"
        >
          {loading ? 'Cargando…' : 'Cargar más'}
        </Button>
      ) : null}

      <Modal
        open={dialog?.kind === 'create' || dialog?.kind === 'edit'}
        onClose={close}
        title={dialog?.kind === 'edit' ? 'Editar obra' : 'Nueva obra'}
        className="max-w-2xl"
      >
        <WorkForm
          key={
            dialog?.kind === 'edit' ? `${dialog.work.id}:${dialog.work.updatedAt}` : 'new'
          }
          work={dialog?.kind === 'edit' ? dialog.work : undefined}
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
