import { useState } from 'react'
import { ArrowLeft, Images, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Chapter, Series } from '@/types'
import { ApiError, errorMessage } from '@/lib/api'
import { formatChapterNumber, formatDate } from '@/lib/format'
import { listChapters } from '@/services/catalog'
import {
  createChapter,
  deleteChapter,
  updateChapter,
  type ChapterInput,
} from '@/services/admin'
import { useAsync } from '@/hooks/useAsync'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { EmptyState, ErrorState } from '@/components/ui/empty-state'
import { Modal } from '@/components/ui/modal'
import { Skeleton } from '@/components/ui/skeleton'
import { ChapterForm } from './ChapterForm'
import { PagesManager } from './PagesManager'

type Dialog =
  | { kind: 'create' }
  | { kind: 'edit'; chapter: Chapter }
  | { kind: 'pages'; chapter: Chapter }
  | { kind: 'delete'; chapter: Chapter }

export function ChaptersPanel({ work, onBack }: { work: Series; onBack: () => void }) {
  const { data, loading, error, reload, setData } = useAsync(
    () => listChapters(work.id, true),
    `admin-chapters:${work.id}`,
  )
  const [dialog, setDialog] = useState<Dialog>()
  const close = () => setDialog(undefined)

  const upsert = (chapter: Chapter) =>
    setData((items) => {
      const list = items ?? []
      const exists = list.some((item) => item.id === chapter.id)
      const next = exists
        ? list.map((item) => (item.id === chapter.id ? chapter : item))
        : [...list, chapter]
      return next.sort((a, b) => Number(a.number) - Number(b.number))
    })

  // Ante un 409 recargamos para tener la versión más reciente.
  const fail = (caught: unknown, fallback: string) => {
    if (caught instanceof ApiError && caught.status === 409) {
      reload()
      toast.error(`${caught.message} Recargamos la lista.`)
    } else {
      toast.error(errorMessage(caught, fallback))
    }
  }

  const save = async (input: ChapterInput, pages: File[]) => {
    try {
      if (dialog?.kind === 'edit') {
        upsert(
          await updateChapter(
            work.id,
            dialog.chapter.id,
            input,
            dialog.chapter.version ?? 1,
          ),
        )
        toast.success('Capítulo actualizado')
      } else {
        upsert(await createChapter(work.id, input, pages))
        toast.success('Capítulo creado')
      }
      close()
    } catch (caught) {
      fail(caught, 'No pudimos guardar el capítulo.')
    }
  }

  const remove = async (chapter: Chapter) => {
    try {
      await deleteChapter(work.id, chapter.id, chapter.version ?? 1)
      setData((items) => items?.filter((item) => item.id !== chapter.id))
      toast.success('Capítulo eliminado')
    } catch (caught) {
      fail(caught, 'No pudimos eliminar el capítulo.')
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            aria-label="Volver a las obras"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div className="min-w-0">
            <p className="text-muted text-[11px]">Capítulos de</p>
            <h2 className="font-display truncate text-lg font-bold">{work.title}</h2>
          </div>
        </div>
        <Button onClick={() => setDialog({ kind: 'create' })}>
          <Plus className="size-4" /> Nuevo capítulo
        </Button>
      </div>

      {error && !data ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading && !data ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
        </div>
      ) : !data?.length ? (
        <EmptyState
          icon={Images}
          title="Sin capítulos"
          description="Crea el primer capítulo y sube sus páginas."
          actionLabel="Nuevo capítulo"
          onAction={() => setDialog({ kind: 'create' })}
        />
      ) : (
        <ul className="border-line bg-surface divide-line divide-y overflow-hidden rounded-2xl border">
          {data.map((chapter) => (
            <li key={chapter.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <span className="font-display w-12 shrink-0 text-sm font-bold">
                {formatChapterNumber(chapter.number)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {chapter.title || `Capítulo ${formatChapterNumber(chapter.number)}`}
                </p>
                <p className="text-muted text-[11px]">
                  {chapter.pages.length} páginas · {formatDate(chapter.releaseDate)}
                </p>
              </div>
              <Badge tone={chapter.status === 'PUBLISHED' ? 'success' : 'warning'}>
                {chapter.status === 'PUBLISHED' ? 'Publicado' : 'Borrador'}
              </Badge>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDialog({ kind: 'pages', chapter })}
                  aria-label={`Páginas del capítulo ${formatChapterNumber(chapter.number)}`}
                >
                  <Images className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDialog({ kind: 'edit', chapter })}
                  aria-label={`Editar el capítulo ${formatChapterNumber(chapter.number)}`}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDialog({ kind: 'delete', chapter })}
                  aria-label={`Eliminar el capítulo ${formatChapterNumber(chapter.number)}`}
                  className="hover:text-danger"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={dialog?.kind === 'create' || dialog?.kind === 'edit'}
        onClose={close}
        title={dialog?.kind === 'edit' ? 'Editar capítulo' : 'Nuevo capítulo'}
      >
        <ChapterForm
          key={dialog?.kind === 'edit' ? dialog.chapter.id : 'new'}
          chapter={dialog?.kind === 'edit' ? dialog.chapter : undefined}
          onSubmit={save}
          onCancel={close}
        />
      </Modal>

      <Modal
        open={dialog?.kind === 'pages'}
        onClose={close}
        title="Páginas"
        description="Reordena, inserta o reemplaza las páginas del capítulo."
        className="max-w-3xl"
      >
        {dialog?.kind === 'pages' ? (
          <PagesManager
            key={dialog.chapter.id}
            workId={work.id}
            chapter={dialog.chapter}
            onChange={(chapter) => {
              upsert(chapter)
              setDialog({ kind: 'pages', chapter })
            }}
          />
        ) : null}
      </Modal>

      <ConfirmDialog
        open={dialog?.kind === 'delete'}
        title="¿Eliminar capítulo?"
        description="Se borrarán el capítulo y sus páginas. Esta acción no se puede deshacer."
        onConfirm={() => (dialog?.kind === 'delete' ? remove(dialog.chapter) : undefined)}
        onClose={close}
      />
    </div>
  )
}
