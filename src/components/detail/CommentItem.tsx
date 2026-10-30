import { useEffect, useRef, useState } from 'react'
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
import type { Comment, CommentTargetType, Cursor } from '@/types'
import { cn } from '@/lib/cn'
import { ApiError, errorMessage } from '@/lib/api'
import { COMMENT_SOURCE_MAX_LENGTH, validateCommentSource } from '@/lib/comments'
import { formatRelativeDate } from '@/lib/format'
import { VOTES_KEY } from '@/lib/constants'
import { readStorage, writeStorage } from '@/lib/storage'
import * as community from '@/services/community'
import { useAuth } from '@/hooks/useAuth'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { CommentEditor } from './CommentEditor'
import { CommentMarkdown } from './CommentMarkdown'
import { ReportDialog } from './ReportDialog'

const MAX_INDENT = 3

export function CommentItem({
  comment,
  onChange,
  depth = 0,
  targetType,
  targetId,
  onRefreshComment,
  contextKey,
}: {
  comment: Comment
  onChange: (comment: Comment) => void
  depth?: number
  targetType: CommentTargetType
  targetId: string
  onRefreshComment: (
    commentId: string,
    parentCommentId: string | null,
  ) => Promise<Comment | null>
  contextKey?: string
}) {
  const { user } = useAuth()
  const [votes, setVotes] = useState<Record<string, 1 | -1>>(
    () => readStorage<Record<string, 1 | -1>>(VOTES_KEY, {}),
  )
  const voteKey = user ? `${user.id}:${comment.id}` : undefined
  const myVote = voteKey ? votes[voteKey] : undefined
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [baseRevision, setBaseRevision] = useState(comment.revision)
  const [revisionStale, setRevisionStale] = useState(false)
  const [currentVersion, setCurrentVersion] = useState<Comment>()
  const [refreshingRevision, setRefreshingRevision] = useState(false)
  const [replying, setReplying] = useState(false)
  const [reply, setReply] = useState('')
  const [replyError, setReplyError] = useState<string>()
  const [busy, setBusy] = useState(false)
  const [editError, setEditError] = useState<string>()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [replies, setReplies] = useState<Comment[]>()
  const [repliesCursor, setRepliesCursor] = useState<Cursor | null>(null)
  const [repliesOpen, setRepliesOpen] = useState(false)
  const [loadingReplies, setLoadingReplies] = useState(false)
  const [repliesError, setRepliesError] = useState<string>()
  const repliesLock = useRef<string | null>(null)
  const repliesController = useRef<AbortController | undefined>(undefined)
  const mutationLock = useRef(false)
  const context = contextKey ?? `${user?.id ?? 'guest'}:${targetType}:${targetId}:${comment.id}`
  const activeContext = useRef(context)

  useEffect(() => {
    activeContext.current = context
    return () => {
      repliesController.current?.abort()
      if (activeContext.current === context) activeContext.current = ''
    }
  }, [context])

  const deleted = comment.status === 'DELETED'
  const mine = Boolean(user && comment.author?.id === user.id)
  const name = comment.author?.username ?? 'Autor no disponible'

  const merge = (items: Comment[], incoming: Comment[]) => {
    const byId = new Map(items.map((item) => [item.id, item]))
    incoming.forEach((item) => byId.set(item.id, item))
    return [...byId.values()]
  }

  const rememberVote = (value: 1 | -1 | undefined) => {
    if (!user || !voteKey) return
    const all = readStorage<Record<string, 1 | -1>>(VOTES_KEY, {})
    if (value) all[voteKey] = value
    else delete all[voteKey]
    writeStorage(VOTES_KEY, all)
    setVotes(all)
  }

  const refreshThisComment = async () => {
    const requestContext = activeContext.current
    const latest = await onRefreshComment(comment.id, comment.parentCommentId)
    if (activeContext.current !== requestContext) return null
    if (latest) {
      onChange(latest)
      setRevisionStale(false)
      setCurrentVersion(undefined)
    }
    return latest
  }

  const vote = async (value: 1 | -1) => {
    if (!user) {
      toast('Inicia sesión para votar')
      return
    }
    if (mutationLock.current) return
    mutationLock.current = true
    const previous = myVote
    const next = previous === value ? undefined : value
    setBusy(true)
    rememberVote(next)
    try {
      if (next) {
        const votesAfter = await community.voteComment(comment.id, next)
        if (activeContext.current !== context) return
        onChange({ ...comment, votes: votesAfter })
      } else {
        await community.removeVote(comment.id)
        if (activeContext.current !== context) return
        const latest = await refreshThisComment()
        if (!latest) setRevisionStale(true)
      }
      setRevisionStale(true)
    } catch (error) {
      if (activeContext.current !== context) return
      rememberVote(previous)
      toast.error(errorMessage(error, 'No pudimos registrar tu voto.'))
    } finally {
      mutationLock.current = false
      setBusy(false)
    }
  }

  const openEdit = async () => {
    setDraft(comment.bodyMarkdown ?? '')
    setEditError(undefined)
    setCurrentVersion(undefined)
    setEditing(true)
    if (!revisionStale) {
      setBaseRevision(comment.revision)
      return
    }
    setRefreshingRevision(true)
    try {
      const latest = await refreshThisComment()
      if (!latest) {
        setEditError('No encontramos la versión vigente. Recarga los comentarios e inténtalo otra vez.')
        setEditing(false)
        return
      }
      setDraft(latest.bodyMarkdown ?? '')
      setBaseRevision(latest.revision)
    } catch (error) {
      setEditError(errorMessage(error, 'No pudimos actualizar la versión antes de editar.'))
      setEditing(false)
    } finally {
      setRefreshingRevision(false)
    }
  }

  const saveEdit = async (source: string, expectedRevision = baseRevision) => {
    const validationError = validateCommentSource(source)
    if (validationError) {
      setEditError(validationError)
      return
    }
    if (mutationLock.current || refreshingRevision) return
    mutationLock.current = true
    setBusy(true)
    setEditError(undefined)
    try {
      const updated = await community.editComment(comment.id, source, expectedRevision)
      if (activeContext.current !== context) return
      onChange(updated)
      setBaseRevision(updated.revision)
      setRevisionStale(false)
      setCurrentVersion(undefined)
      setEditing(false)
      toast.success('Comentario editado')
    } catch (error) {
      if (activeContext.current !== context) return
      if (error instanceof ApiError && error.status === 409) {
        setEditError('El comentario cambió en el servidor. Tu borrador se conserva; revisa la versión vigente antes de continuar.')
        try {
          const latest = await refreshThisComment()
          if (latest) setCurrentVersion(latest)
          else setEditError('El comentario cambió y no encontramos su versión vigente. Tu borrador se conserva; recarga y compara antes de reintentar.')
        } catch {
          setEditError('El comentario cambió. Tu borrador se conserva, pero no pudimos cargar la versión vigente. Reintenta la consulta antes de editar.')
        }
      } else {
        setEditError(errorMessage(error, 'No pudimos editar el comentario. Tu borrador se conserva.'))
      }
    } finally {
      mutationLock.current = false
      setBusy(false)
    }
  }

  const remove = async () => {
    const requestContext = activeContext.current
    try {
      await community.deleteComment(comment.id)
      if (activeContext.current !== requestContext) return
      onChange({ ...comment, status: 'DELETED', bodyMarkdown: null })
      toast.success('Comentario eliminado')
    } catch (error) {
      if (activeContext.current !== requestContext) return
      toast.error(errorMessage(error, 'No pudimos eliminar el comentario.'))
    }
  }

  const loadReplies = async (cursor?: Cursor | null) => {
    if (repliesLock.current === activeContext.current) return
    setLoadingReplies(true)
    setRepliesError(undefined)
    const requestContext = activeContext.current
    repliesLock.current = requestContext
    const controller = new AbortController()
    repliesController.current = controller
    try {
      const page = await community.listReplies(comment.id, cursor, 20, controller.signal)
      if (activeContext.current !== requestContext) return
      setReplies((current) => merge(cursor ? current ?? [] : [], page.items))
      setRepliesCursor(page.hasMore ? page.nextCursor : null)
      setRepliesOpen(true)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      if (activeContext.current === requestContext)
        setRepliesError(errorMessage(error, 'No pudimos cargar las respuestas.'))
    } finally {
      if (repliesLock.current === requestContext) repliesLock.current = null
      if (activeContext.current === requestContext) setLoadingReplies(false)
    }
  }

  const sendReply = async (source: string) => {
    const validationError = validateCommentSource(source)
    if (validationError) {
      setReplyError(validationError)
      return
    }
    if (mutationLock.current) return
    mutationLock.current = true
    setBusy(true)
    setReplyError(undefined)
    const requestContext = activeContext.current
    try {
      const created = await community.createComment({ parentCommentId: comment.id }, source)
      if (activeContext.current !== requestContext) return
      setReplies((current) => merge(current ?? [], [created]))
      setRevisionStale(true)
      setRepliesOpen(true)
      setReply('')
      setReplying(false)
      toast.success('Respuesta publicada')
    } catch (error) {
      if (activeContext.current === requestContext)
        setReplyError(errorMessage(error, 'No pudimos publicar tu respuesta. Tu borrador sigue aquí.'))
    } finally {
      mutationLock.current = false
      if (activeContext.current === requestContext) setBusy(false)
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
              <CommentEditor
                key={`${comment.id}:${baseRevision}`}
                source={draft}
                onSourceChange={(source) => {
                  setDraft(source)
                  setEditError(undefined)
                }}
                onSubmit={(source) => saveEdit(source)}
                onCancel={() => setEditing(false)}
                mode="edit"
                pending={busy || refreshingRevision}
                error={editError}
                previewKey={`${comment.id}:${baseRevision}`}
                label="Editar comentario"
              />
              {refreshingRevision ? <p className="text-muted mt-2 text-xs">Actualizando versión…</p> : null}
              {currentVersion ? (
                <div className="border-line bg-raised mt-3 rounded-xl border p-3 text-sm" role="status">
                  <p className="text-primary font-semibold">Versión vigente en el servidor</p>
                  <div className="text-secondary mt-2">
                    <CommentMarkdown source={currentVersion.bodyMarkdown ?? ''} resetKey={`${currentVersion.id}:${currentVersion.revision}`} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setDraft(currentVersion.bodyMarkdown ?? '')
                        setBaseRevision(currentVersion.revision)
                        setCurrentVersion(undefined)
                        setEditError(undefined)
                      }}
                    >
                      Usar versión vigente
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setBaseRevision(currentVersion.revision)
                        setCurrentVersion(undefined)
                        void saveEdit(draft, currentVersion.revision)
                      }}
                    >
                      Reintentar con mi borrador
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div
              className={cn(
                'mt-1.5 text-sm leading-relaxed break-words',
                deleted ? 'text-muted italic' : 'text-secondary',
              )}
            >
              {deleted ? (
                <p>Este comentario fue eliminado.</p>
              ) : (
                <CommentMarkdown
                  source={comment.bodyMarkdown ?? ''}
                  resetKey={`${comment.id}:${comment.revision}:${targetType}:${targetId}`}
                />
              )}
            </div>
          )}

          {!deleted && !editing ? (
            <div className="text-muted mt-2 flex flex-wrap items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => void vote(1)}
                aria-pressed={myVote === 1}
                aria-label="Votar a favor"
                disabled={busy}
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
                disabled={busy}
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
                  onClick={() => {
                    setReplying((value) => !value)
                    setReplyError(undefined)
                  }}
                  className="hover:bg-raised flex h-8 items-center gap-1 rounded-lg px-2 transition-colors"
                >
                  <MessageSquareReply className="size-3.5" /> Responder
                </button>
              ) : null}
              {mine ? (
                <button
                  type="button"
                  onClick={() => void openEdit()}
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
              <CommentEditor
                source={reply}
                onSourceChange={(source) => {
                  setReply(source)
                  setReplyError(undefined)
                }}
                onSubmit={(source) => sendReply(source)}
                onCancel={() => setReplying(false)}
                mode="reply"
                pending={busy}
                error={replyError}
                label={`Responder a ${name}`}
              />
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

          {repliesError ? (
            <div className="mt-2 flex items-center justify-between gap-3 text-sm" role="status">
              <p className="text-danger">{repliesError}</p>
              <button
                type="button"
                onClick={() => void loadReplies(repliesCursor)}
                className="text-accent font-semibold"
              >
                Reintentar
              </button>
            </div>
          ) : null}

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
                    key={`${user?.id ?? 'guest'}:${targetType}:${targetId}:${item.id}`}
                    comment={item}
                    onChange={updateReply}
                    depth={depth + 1}
                    targetType={targetType}
                    targetId={targetId}
                    onRefreshComment={onRefreshComment}
                    contextKey={`${context}:${item.id}`}
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
        onSuccess={() => setRevisionStale(true)}
      />
      <span className="sr-only">Máximo {COMMENT_SOURCE_MAX_LENGTH} caracteres de texto fuente.</span>
    </article>
  )
}
