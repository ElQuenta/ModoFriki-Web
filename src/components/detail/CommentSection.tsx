import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { Comment, CommentTargetType, Cursor } from '@/types'
import { errorMessage } from '@/lib/api'
import { COMMENT_SOURCE_MAX_LENGTH, validateCommentSource } from '@/lib/comments'
import { createComment, listComments, listReplies } from '@/services/community'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { Avatar } from '@/components/ui/avatar'
import { buttonStyles } from '@/components/ui/button'
import { ErrorState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { CommentEditor } from './CommentEditor'
import { CommentItem } from './CommentItem'

export function CommentSection({
  targetType,
  targetId,
  title = 'Comentarios',
}: {
  targetType: CommentTargetType
  targetId: string
  title?: string
}) {
  const { user } = useAuth()
  const ownerScope = user?.id ?? 'guest'
  const key = `comments:${ownerScope}:${targetType}:${targetId}`
  const [draft, setDraft] = useState({ key, source: '' })
  const text = draft.key === key ? draft.source : ''
  const [submission, setSubmission] = useState<{ key: string; pending: boolean; error?: string }>({
    key,
    pending: false,
  })
  const sending = submission.key === key && submission.pending
  const submitError = submission.key === key ? submission.error : undefined
  const [more, setMore] = useState<{
    key: string
    items: Comment[]
    cursor: Cursor | null
  }>()
  const [moreStatus, setMoreStatus] = useState<{ key: string; pending: boolean; error?: string }>({
    key,
    pending: false,
  })
  const loadingMore = moreStatus.key === key && moreStatus.pending
  const moreError = moreStatus.key === key ? moreStatus.error : undefined
  const currentKey = useRef(key)
  const pageLock = useRef<string | null>(null)
  const submitLock = useRef<string | null>(null)
  const pageController = useRef<AbortController | undefined>(undefined)

  const first = useAsync(() => listComments(targetType, targetId), key)
  const firstPage = first.data
  const extra = more?.key === key ? more.items : []
  const cursor =
    more?.key === key ? more.cursor : firstPage?.hasMore ? firstPage.nextCursor : null
  const comments = [
    ...new Map([...(firstPage?.items ?? []), ...extra].map((item) => [item.id, item])).values(),
  ]

  useEffect(() => {
    currentKey.current = key
    return () => {
      pageController.current?.abort()
      if (currentKey.current === key) currentKey.current = ''
    }
  }, [key])

  const mergeComment = (items: Comment[], incoming: Comment[]) => {
    const byId = new Map(items.map((item) => [item.id, item]))
    for (const item of incoming) byId.set(item.id, item)
    return [...byId.values()]
  }

  const update = (comment: Comment) => {
    first.setData((page) =>
      page && {
        ...page,
        items: page.items.map((item) => (item.id === comment.id ? comment : item)),
      },
    )
    setMore((current) =>
      current && {
        ...current,
        items: current.items.map((item) => (item.id === comment.id ? comment : item)),
      },
    )
  }

  const refreshComment = async (commentId: string, parentCommentId: string | null) => {
    if (parentCommentId) {
      let next: Cursor | null = null
      do {
        const page = await listReplies(parentCommentId, next)
        const match = page.items.find((item) => item.id === commentId)
        if (match) return match
        next = page.hasMore ? page.nextCursor : null
      } while (next)
      return null
    }

    let next: Cursor | null = null
    do {
      const page = await listComments(targetType, targetId, next)
      const match = page.items.find((item) => item.id === commentId)
      if (match) return match
      next = page.hasMore ? page.nextCursor : null
    } while (next)
    return null
  }

  const loadMore = async () => {
    if (!cursor || pageLock.current === key) return
    pageLock.current = key
    setMoreStatus({ key, pending: true })
    const requestKey = key
    const controller = new AbortController()
    pageController.current = controller
    try {
      const page = await listComments(targetType, targetId, cursor, 20, controller.signal)
      if (currentKey.current !== requestKey) return
      setMore({
        key: requestKey,
        items: mergeComment(extra, page.items),
        cursor: page.hasMore ? page.nextCursor : null,
      })
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      if (currentKey.current === requestKey)
        setMoreStatus({
          key: requestKey,
          pending: true,
          error: errorMessage(error, 'No pudimos cargar más comentarios.'),
        })
    } finally {
      if (currentKey.current === requestKey)
        setMoreStatus((current) =>
          current.key === requestKey ? { ...current, pending: false } : current,
        )
      if (pageLock.current === requestKey) pageLock.current = null
    }
  }

  const submit = async (source: string) => {
    const validationError = validateCommentSource(source)
    if (validationError) {
      setSubmission({ key, pending: false, error: validationError })
      return
    }
    if (submitLock.current === key) return
    submitLock.current = key
    setSubmission({ key, pending: true })
    const requestKey = key
    try {
      const created = await createComment({ targetType, targetId }, source)
      if (currentKey.current !== requestKey) return
      first.setData((page) =>
        page && {
          ...page,
          items: [created, ...page.items.filter((item) => item.id !== created.id)],
        },
      )
      setDraft({ key: requestKey, source: '' })
      toast.success('Comentario publicado')
    } catch (error) {
      if (currentKey.current === requestKey)
        setSubmission({
          key: requestKey,
          pending: false,
          error: errorMessage(error, 'No pudimos publicar tu comentario. Tu borrador sigue aquí.'),
        })
    } finally {
      if (submitLock.current === requestKey) submitLock.current = null
      if (currentKey.current === requestKey)
        setSubmission((current) =>
          current.key === requestKey ? { ...current, pending: false } : current,
        )
    }
  }

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display flex items-center gap-2 text-xl font-bold">
          <MessageCircle className="text-accent size-5" />
          {title}
          {firstPage ? (
            <span className="text-muted text-sm font-normal">
              ({comments.length}
              {cursor ? '+' : ''})
            </span>
          ) : null}
        </h2>
      </div>

      {user ? (
        <div className="surface-card p-3 sm:p-4">
          <div className="flex gap-2.5 sm:gap-3">
            <Avatar alt={user.username} size="sm" className="mt-1" />
            <div className="min-w-0 flex-1">
              <CommentEditor
                source={text}
                onSourceChange={(source) => {
                  setDraft({ key, source })
                  setSubmission({ key, pending: false })
                }}
                onSubmit={submit}
                mode="create"
                pending={sending}
                error={submitError}
                label="Escribe un comentario"
              />
              <p className="text-muted mt-2 text-[11px]">
                Sé respetuoso. Puedes reportar lo que incumpla las normas.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="surface-card flex flex-col items-start gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-secondary text-sm">Inicia sesión para comentar y votar.</p>
          <Link to="/login" className={buttonStyles({ size: 'sm' })}>
            Iniciar sesión
          </Link>
        </div>
      )}

      <div className="mt-4 space-y-3">
        {first.error && !first.data ? (
          <ErrorState message={first.error} onRetry={first.reload} />
        ) : first.loading && !first.data ? (
          Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))
        ) : comments.length === 0 ? (
          <p className="border-line bg-surface text-secondary rounded-2xl border p-5 text-center text-sm">
            Todavía no hay comentarios. ¡Sé el primero!
          </p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={`${ownerScope}:${targetType}:${targetId}:${comment.id}`}
              comment={comment}
              onChange={update}
              targetType={targetType}
              targetId={targetId}
              onRefreshComment={refreshComment}
            />
          ))
        )}
      </div>

      {moreError ? (
        <div className="mt-3 flex items-center justify-between gap-3 text-sm" role="status">
          <p className="text-danger">{moreError}</p>
          <button type="button" onClick={() => void loadMore()} className="text-accent font-semibold">
            Reintentar
          </button>
        </div>
      ) : null}
      {cursor ? (
        <button
          type="button"
          onClick={() => void loadMore()}
          disabled={loadingMore}
          className={buttonStyles({ variant: 'secondary', className: 'mt-3 w-full' })}
        >
          {loadingMore ? 'Cargando…' : 'Cargar más comentarios'}
        </button>
      ) : null}
      <span className="sr-only">Límite de comentario: {COMMENT_SOURCE_MAX_LENGTH} caracteres.</span>
    </section>
  )
}
