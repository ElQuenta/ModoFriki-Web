import { useState } from 'react'
import {
  ChevronDown,
  Flag,
  MessageSquareReply,
  Pencil,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Comment, Cursor } from '@/types'
import { cn } from '@/lib/cn'
import { ApiError, errorMessage } from '@/lib/api'
import { formatRelativeDate } from '@/lib/format'
import { VOTES_KEY } from '@/lib/constants'
import { readStorage, writeStorage } from '@/lib/storage'
import * as community from '@/services/community'
import { useAuth } from '@/hooks/useAuth'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ReportDialog } from './ReportDialog'

const MAX_INDENT = 3

export function CommentItem({
  comment,
  onChange,
  depth = 0,
}: {
  comment: Comment
  onChange: (comment: Comment) => void
  depth?: number
}) {
  const { user } = useAuth()
  // El backend no devuelve el voto propio: se recuerda en este dispositivo.
  const [myVote, setMyVote] = useState<1 | -1 | undefined>(
    () => readStorage<Record<string, 1 | -1>>(VOTES_KEY, {})[comment.id],
  )
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [replying, setReplying] = useState(false)
  const [reply, setReply] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [replies, setReplies] = useState<Comment[]>()
  const [repliesCursor, setRepliesCursor] = useState<Cursor | null>(null)
  const [repliesOpen, setRepliesOpen] = useState(false)
  const [loadingReplies, setLoadingReplies] = useState(false)

  const deleted = comment.status === 'DELETED'
  const mine = Boolean(user && comment.author?.id === user.id)
  const name = comment.author?.username ?? 'Usuario eliminado'

  const vote = async (value: 1 | -1) => {
    if (!user) {
      toast('Inicia sesión para votar')
      return
    }
    const previous = myVote
    const next = previous === value ? undefined : value
    const delta = (next ?? 0) - (previous ?? 0)
    const optimistic = {
      upvotes: comment.votes.upvotes + (next === 1 ? 1 : 0) - (previous === 1 ? 1 : 0),
      downvotes:
        comment.votes.downvotes + (next === -1 ? 1 : 0) - (previous === -1 ? 1 : 0),
      score: comment.votes.score + delta,
    }
    const remember = (v: 1 | -1 | undefined) => {
      setMyVote(v)
      const all = readStorage<Record<string, 1 | -1>>(VOTES_KEY, {})
      if (v) all[comment.id] = v
      else delete all[comment.id]
      writeStorage(VOTES_KEY, all)
    }
    // Votar, responder y reportar suben la revisión del comentario en el backend.
    const revision = comment.revision + 1
    remember(next)
    onChange({ ...comment, votes: optimistic, revision })
    try {
      if (next)
        onChange({
          ...comment,
          votes: await community.voteComment(comment.id, next),
          revision,
        })
      else await community.removeVote(comment.id)
    } catch (error) {
      remember(previous)
      onChange(comment)
      toast.error(errorMessage(error, 'No pudimos registrar tu voto.'))
    }
  }

  const saveEdit = async () => {
    const body = draft.trim()
    if (!body) return
    setBusy(true)
    try {
      onChange(await community.editComment(comment.id, body, comment.revision))
      setEditing(false)
      toast.success('Comentario editado')
    } catch (error) {
      toast.error(
        error instanceof ApiError && error.status === 409
          ? 'El comentario cambió mientras lo editabas. Recarga la página e inténtalo otra vez.'
          : errorMessage(error, 'No pudimos editar el comentario.'),
      )
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    try {
      await community.deleteComment(comment.id)
      onChange({ ...comment, status: 'DELETED', bodyMarkdown: null })
      toast.success('Comentario eliminado')
    } catch (error) {
      toast.error(errorMessage(error, 'No pudimos eliminar el comentario.'))
    }
  }

  const loadReplies = async (cursor?: Cursor | null) => {
    setLoadingReplies(true)
    try {
      const page = await community.listReplies(comment.id, cursor)
      setReplies((current) => [...(cursor ? (current ?? []) : []), ...page.items])
      setRepliesCursor(page.hasMore ? page.nextCursor : null)
      setRepliesOpen(true)
    } catch (error) {
      toast.error(errorMessage(error, 'No pudimos cargar las respuestas.'))
    } finally {
      setLoadingReplies(false)
    }
  }

  const sendReply = async () => {
    const body = reply.trim()
    if (!body) return
    setBusy(true)
    try {
      const created = await community.createComment({ parentCommentId: comment.id }, body)
      setReplies((current) => [...(current ?? []), created])
      onChange({ ...comment, revision: comment.revision + 1 })
      setRepliesOpen(true)
      setReply('')
      setReplying(false)
      toast.success('Respuesta publicada')
    } catch (error) {
      toast.error(errorMessage(error, 'No pudimos publicar tu respuesta.'))
    } finally {
      setBusy(false)
    }
  }

  const updateReply = (updated: Comment) =>
    setReplies((current) =>
      current?.map((item) => (item.id === updated.id ? updated : item)),
    )

  return (
    <article className={cn(depth === 0 && 'surface-card p-4')}>
      <div className="flex gap-3">
        <Avatar alt={name} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <p className="text-sm font-semibold">{name}</p>
            <span className="text-muted text-[11px]">
              {formatRelativeDate(comment.createdAt)}
              {comment.editedAt && !deleted ? ' · editado' : ''}
            </span>
          </div>

          {editing ? (
            <div className="mt-2">
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                aria-label="Editar comentario"
                maxLength={10000}
                rows={3}
                className="border-line bg-base focus:border-accent/60 w-full resize-none rounded-xl border px-3 py-2 text-sm outline-none"
              />
              <div className="mt-2 flex gap-2">
                <Button
                  size="sm"
                  onClick={() => void saveEdit()}
                  disabled={busy || !draft.trim()}
                >
                  Guardar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <p
              className={cn(
                'mt-1.5 text-sm leading-relaxed break-words whitespace-pre-wrap',
                deleted ? 'text-muted italic' : 'text-secondary',
              )}
            >
              {deleted ? 'Este comentario fue eliminado.' : comment.bodyMarkdown}
            </p>
          )}

          {!deleted && !editing ? (
            <div className="text-muted mt-2 flex flex-wrap items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => void vote(1)}
                aria-pressed={myVote === 1}
                aria-label="Votar a favor"
                className={cn(
                  'hover:bg-raised flex h-8 items-center gap-1 rounded-lg px-2 transition-colors',
                  myVote === 1 && 'text-accent',
                )}
              >
                <ThumbsUp className="size-3.5" /> {comment.votes.upvotes}
              </button>
              <button
                type="button"
                onClick={() => void vote(-1)}
                aria-pressed={myVote === -1}
                aria-label="Votar en contra"
                className={cn(
                  'hover:bg-raised flex h-8 items-center gap-1 rounded-lg px-2 transition-colors',
                  myVote === -1 && 'text-danger',
                )}
              >
                <ThumbsDown className="size-3.5" /> {comment.votes.downvotes}
              </button>
              {user ? (
                <button
                  type="button"
                  onClick={() => setReplying((value) => !value)}
                  className="hover:bg-raised flex h-8 items-center gap-1 rounded-lg px-2 transition-colors"
                >
                  <MessageSquareReply className="size-3.5" /> Responder
                </button>
              ) : null}
              {mine ? (
                <button
                  type="button"
                  onClick={() => {
                    setDraft(comment.bodyMarkdown ?? '')
                    setEditing(true)
                  }}
                  className="hover:bg-raised flex h-8 items-center gap-1 rounded-lg px-2 transition-colors"
                >
                  <Pencil className="size-3.5" /> Editar
                </button>
              ) : null}
              {mine || user?.role === 'ADMIN' ? (
                <button
                  type="button"
                  onClick={() => setConfirmOpen(true)}
                  className="hover:text-danger hover:bg-raised flex h-8 items-center gap-1 rounded-lg px-2 transition-colors"
                >
                  <Trash2 className="size-3.5" /> Eliminar
                </button>
              ) : null}
              {user && !mine ? (
                <button
                  type="button"
                  onClick={() => setReportOpen(true)}
                  className="hover:bg-raised flex h-8 items-center gap-1 rounded-lg px-2 transition-colors"
                >
                  <Flag className="size-3.5" /> Reportar
                </button>
              ) : null}
            </div>
          ) : null}

          {replying ? (
            <div className="mt-2">
              <textarea
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                aria-label={`Responder a ${name}`}
                placeholder={`Responde a ${name}...`}
                maxLength={10000}
                rows={2}
                className="border-line bg-base focus:border-accent/60 w-full resize-none rounded-xl border px-3 py-2 text-sm outline-none"
              />
              <div className="mt-2 flex gap-2">
                <Button
                  size="sm"
                  onClick={() => void sendReply()}
                  disabled={busy || !reply.trim()}
                >
                  Responder
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setReplying(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() =>
              repliesOpen
                ? setRepliesOpen(false)
                : replies
                  ? setRepliesOpen(true)
                  : void loadReplies()
            }
            disabled={loadingReplies}
            className="text-accent mt-2 inline-flex items-center gap-1 text-xs font-semibold hover:underline"
          >
            <ChevronDown
              className={cn('size-3.5 transition-transform', repliesOpen && 'rotate-180')}
            />
            {loadingReplies
              ? 'Cargando…'
              : repliesOpen
                ? 'Ocultar respuestas'
                : 'Ver respuestas'}
          </button>

          {repliesOpen && replies ? (
            <div
              className={cn(
                'mt-3 space-y-4',
                depth < MAX_INDENT && 'border-line border-l pl-3 sm:pl-4',
              )}
            >
              {replies.length === 0 ? (
                <p className="text-muted text-xs">Todavía no hay respuestas.</p>
              ) : (
                replies.map((item) => (
                  <CommentItem
                    key={item.id}
                    comment={item}
                    onChange={updateReply}
                    depth={depth + 1}
                  />
                ))
              )}
              {repliesCursor ? (
                <button
                  type="button"
                  onClick={() => void loadReplies(repliesCursor)}
                  disabled={loadingReplies}
                  className="text-accent text-xs font-semibold hover:underline"
                >
                  Ver más respuestas
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="¿Eliminar comentario?"
        description="El comentario desaparecerá para todos. Esta acción no se puede deshacer."
        onConfirm={remove}
        onClose={() => setConfirmOpen(false)}
      />
      <ReportDialog
        open={reportOpen}
        commentId={comment.id}
        onClose={() => setReportOpen(false)}
      />
    </article>
  )
}
