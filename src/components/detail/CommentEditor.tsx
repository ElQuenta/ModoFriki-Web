import { useId, useRef, useState, type FormEvent } from 'react'
import {
  Bold,
  Code2,
  Eye,
  Italic,
  Link2,
  List,
  Quote,
  Send,
  Strikethrough,
  EyeOff,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CommentMarkdown } from './CommentMarkdown'

export type CommentEditorMode = 'create' | 'reply' | 'edit'

type FormatAction = {
  label: string
  icon: typeof Bold
  before: string
  after: string
  placeholder: string
}

const FORMAT_ACTIONS: FormatAction[] = [
  { label: 'Negrita', icon: Bold, before: '**', after: '**', placeholder: 'texto' },
  { label: 'Cursiva', icon: Italic, before: '*', after: '*', placeholder: 'texto' },
  {
    label: 'Tachado',
    icon: Strikethrough,
    before: '~~',
    after: '~~',
    placeholder: 'texto',
  },
  { label: 'Enlace', icon: Link2, before: '[', after: '](https://)', placeholder: 'texto' },
  { label: 'Cita', icon: Quote, before: '> ', after: '', placeholder: 'cita' },
  { label: 'Lista', icon: List, before: '- ', after: '', placeholder: 'elemento' },
  { label: 'Código', icon: Code2, before: '`', after: '`', placeholder: 'código' },
  {
    label: 'Bloque de código',
    icon: Code2,
    before: '```\n',
    after: '\n```',
    placeholder: 'código',
  },
  {
    label: 'Spoiler',
    icon: EyeOff,
    before: '||',
    after: '||',
    placeholder: 'texto oculto',
  },
]

/**
 * Controlled comment source editor shared by top-level comments, replies and edits.
 * It owns only temporary preview/cancel UI; the caller owns persistence and the draft.
 */
export function CommentEditor({
  source,
  onSourceChange,
  onSubmit,
  onCancel,
  mode = 'create',
  pending = false,
  submitDisabled = false,
  error,
  initialSource,
  previewKey,
  label,
}: {
  source: string
  onSourceChange: (source: string) => void
  onSubmit: (source: string) => void | Promise<void>
  onCancel?: () => void
  mode?: CommentEditorMode
  pending?: boolean
  submitDisabled?: boolean
  error?: string
  /** Snapshot used to identify a dirty draft. Defaults to the initially rendered source. */
  initialSource?: string
  /** Change this when destination/comment identity changes to reset spoiler disclosures. */
  previewKey?: string
  label?: string
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const id = useId()
  const selectionRef = useRef<[number, number]>([0, 0])
  const [preview, setPreview] = useState(false)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const [baseline] = useState(initialSource ?? source)

  const valid = source.trim().length > 0 && source.length <= 10_000
  const dirty = source !== baseline
  const actionLabel = mode === 'edit' ? 'Guardar cambios' : mode === 'reply' ? 'Responder' : 'Publicar'
  const sourceLabel = label ?? (mode === 'edit' ? 'Editar comentario' : mode === 'reply' ? 'Escribe una respuesta' : 'Escribe un comentario')

  const rememberSelection = () => {
    const textarea = textareaRef.current
    if (textarea) selectionRef.current = [textarea.selectionStart, textarea.selectionEnd]
  }

  const applyFormat = (action: FormatAction) => {
    const textarea = textareaRef.current
    if (!textarea || pending) return
    const [start, end] = selectionRef.current
    const selected = source.slice(start, end)
    const content = selected || action.placeholder
    const replacement = `${action.before}${content}${action.after}`
    const updated = `${source.slice(0, start)}${replacement}${source.slice(end)}`
    const selectionStart = start + action.before.length
    const selectionEnd = selectionStart + content.length
    selectionRef.current = [selectionStart, selectionEnd]
    onSourceChange(updated)
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(selectionStart, selectionEnd)
    })
  }

  const requestCancel = () => {
    if (pending || !onCancel) return
    if (dirty) setConfirmDiscard(true)
    else onCancel()
  }

  const discard = () => {
    setConfirmDiscard(false)
    onCancel?.()
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!valid || pending || confirmDiscard) return
    void onSubmit(source)
  }

  return (
    <form onSubmit={submit} className="space-y-2.5" aria-label="Editor de comentario">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1" role="toolbar" aria-label="Formato del comentario">
          {FORMAT_ACTIONS.map(({ label: actionLabel, icon: Icon, ...action }) => (
            <button
              key={actionLabel}
              type="button"
              aria-label={actionLabel}
              title={actionLabel}
              disabled={pending || preview || confirmDiscard}
              onMouseDown={rememberSelection}
              onClick={() => applyFormat({ label: actionLabel, icon: Icon, ...action })}
              className="text-secondary hover:bg-raised hover:text-primary focus-visible:ring-accent inline-flex size-8 items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
            >
              <Icon className="size-4" aria-hidden="true" />
            </button>
          ))}
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          aria-pressed={preview}
          onClick={() => setPreview((value) => !value)}
          disabled={confirmDiscard}
        >
          {preview ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          {preview ? 'Editar' : 'Vista previa'}
        </Button>
      </div>

      {preview ? (
        <div
          className="border-line bg-canvas text-secondary min-h-24 rounded-xl border px-3 py-2.5 text-sm"
          aria-label="Vista previa del comentario"
        >
          {source.trim() ? (
            <CommentMarkdown source={source} resetKey={previewKey} />
          ) : (
            <span className="text-muted">La vista previa aparecerá aquí.</span>
          )}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={source}
          onChange={(event) => onSourceChange(event.target.value)}
          onSelect={() => {
            const textarea = textareaRef.current
            if (textarea) selectionRef.current = [textarea.selectionStart, textarea.selectionEnd]
          }}
          onKeyUp={rememberSelection}
          onClick={rememberSelection}
          placeholder="Comparte tu teoría..."
          aria-label={sourceLabel}
          aria-invalid={Boolean(error) || (source.length > 10_000)}
          aria-describedby={`${id}-help ${id}-count ${id}-error`}
          maxLength={10_000}
          rows={mode === 'reply' ? 2 : 3}
          disabled={pending || confirmDiscard}
          className="border-line bg-canvas text-primary placeholder:text-muted focus:border-accent/60 w-full resize-y rounded-xl border px-3 py-2.5 text-sm transition-colors outline-none disabled:opacity-60"
        />
      )}

      {confirmDiscard ? (
        <div className="border-warning/30 bg-warning/5 rounded-xl border p-3" role="group" aria-label="Confirmar descarte">
          <p className="text-primary text-sm">Tienes cambios sin guardar. ¿Descartarlos?</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="danger" onClick={discard}>
              Descartar cambios
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => setConfirmDiscard(false)}>
              Seguir editando
            </Button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-0.5">
          <p id={`${id}-help`} className="text-muted text-[11px]">
            Se admite formato Markdown. Sé respetuoso con la comunidad.
          </p>
          <p id={`${id}-count`} className="text-muted text-[11px]" aria-live="polite">
            {source.length.toLocaleString('es')} / 10 000 caracteres
          </p>
          {error ? (
            <p id={`${id}-error`} className="text-danger text-xs" role="alert">
              {error}
            </p>
          ) : (
            <span id={`${id}-error`} className="sr-only" />
          )}
          {source.length > 10_000 ? (
            <p className="text-danger text-xs" role="alert">
              El comentario no puede superar los 10 000 caracteres.
            </p>
          ) : null}
        </div>
        <div className="flex gap-2 sm:justify-end">
          {onCancel ? (
            <Button type="button" size="sm" variant="ghost" onClick={requestCancel} disabled={pending}>
              Cancelar
            </Button>
          ) : null}
          <Button type="submit" size="sm" disabled={!valid || pending || submitDisabled || confirmDiscard || preview}>
            <Send className="size-3.5" aria-hidden="true" />
            {pending ? 'Guardando…' : actionLabel}
          </Button>
        </div>
      </div>
    </form>
  )
}
