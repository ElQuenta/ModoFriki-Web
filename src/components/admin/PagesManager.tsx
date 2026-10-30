import { useState } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { toast } from 'sonner'
import type { Chapter } from '@/types'
import { errorMessage } from '@/lib/api'
import { insertPages, reorderPages, replacePages, validateImages } from '@/services/admin'
import { Button } from '@/components/ui/button'
import { Field } from './Field'
import { inputClass } from './styles'

export function PagesManager({
  workId,
  chapter,
  onChange,
}: {
  workId: string
  chapter: Chapter
  onChange: (chapter: Chapter) => void
}) {
  const [order, setOrder] = useState(chapter.pages)
  const [files, setFiles] = useState<File[]>([])
  const [position, setPosition] = useState(chapter.pages.length + 1)
  const [busy, setBusy] = useState(false)
  const dirty = order.some((page, index) => page.id !== chapter.pages[index]?.id)

  const run = async (action: () => Promise<Chapter>, success: string) => {
    setBusy(true)
    try {
      const updated = await action()
      onChange(updated)
      setOrder(updated.pages)
      setFiles([])
      setPosition(updated.pages.length + 1)
      toast.success(success)
    } catch (error) {
      toast.error(errorMessage(error, 'No pudimos actualizar las páginas.'))
    } finally {
      setBusy(false)
    }
  }

  const move = (index: number, delta: number) =>
    setOrder((current) => {
      const next = [...current]
      const target = index + delta
      if (target < 0 || target >= next.length) return current
      ;[next[index], next[target]] = [next[target]!, next[index]!]
      return next
    })

  const upload = (mode: 'replace' | 'insert') => {
    const invalid = validateImages(files)
    if (!files.length) return toast.error('Elige al menos una imagen.')
    if (invalid) return toast.error(invalid)
    void run(
      () =>
        mode === 'replace'
          ? replacePages(workId, chapter.id, files, chapter.version ?? 1)
          : insertPages(workId, chapter.id, files, position, chapter.version ?? 1),
      mode === 'replace' ? 'Páginas reemplazadas' : 'Páginas insertadas',
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-secondary text-xs font-semibold">
            {order.length} páginas · usa las flechas para reordenar
          </p>
          <Button
            size="sm"
            disabled={!dirty || busy}
            onClick={() =>
              void run(
                () =>
                  reorderPages(
                    workId,
                    chapter.id,
                    order.map((page) => page.id),
                    chapter.version ?? 1,
                  ),
                'Orden guardado',
              )
            }
          >
            Guardar orden
          </Button>
        </div>
        {order.length === 0 ? (
          <p className="text-muted text-xs">Este capítulo todavía no tiene páginas.</p>
        ) : (
          <ol className="grid max-h-80 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-5">
            {order.map((page, index) => (
              <li key={page.id} className="border-line bg-canvas rounded-lg border p-1">
                <img
                  src={page.imageUrl}
                  alt={`Página ${index + 1}`}
                  loading="lazy"
                  className="aspect-[2/3] w-full rounded object-cover"
                />
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-muted text-[10px]">{index + 1}</span>
                  <span className="flex">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0 || busy}
                      aria-label={`Subir la página ${index + 1}`}
                      className="hover:bg-raised flex size-7 items-center justify-center rounded disabled:opacity-30"
                    >
                      <ArrowUp className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === order.length - 1 || busy}
                      aria-label={`Bajar la página ${index + 1}`}
                      className="hover:bg-raised flex size-7 items-center justify-center rounded disabled:opacity-30"
                    >
                      <ArrowDown className="size-3.5" />
                    </button>
                  </span>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="border-line space-y-3 border-t pt-4">
        <Field
          label="Subir imágenes"
          hint="JPEG, PNG o WebP. Máximo 10 MiB cada una y 100 MiB en total."
        >
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => setFiles([...(event.target.files ?? [])])}
            className="text-secondary text-xs"
          />
        </Field>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <Field label="Insertar en la posición">
            <input
              type="number"
              min={1}
              max={order.length + 1}
              value={position}
              onChange={(event) => setPosition(Number(event.target.value) || 1)}
              className={`${inputClass} sm:w-28`}
            />
          </Field>
          <Button variant="secondary" disabled={busy} onClick={() => upload('insert')}>
            Insertar
          </Button>
          <Button variant="danger" disabled={busy} onClick={() => upload('replace')}>
            Reemplazar todas
          </Button>
        </div>
      </div>
    </div>
  )
}
