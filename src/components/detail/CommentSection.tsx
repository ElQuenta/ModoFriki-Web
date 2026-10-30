import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Send } from 'lucide-react'
import { toast } from 'sonner'
import type { Comment, CommentTargetType, Cursor } from '@/types'
import { errorMessage } from '@/lib/api'
import { createComment, listComments } from '@/services/community'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { Avatar } from '@/components/ui/avatar'
import { Button, buttonStyles } from '@/components/ui/button'
import { ErrorState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { CommentItem } from './CommentItem'

const COMMENT_MAX = 10000

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
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const key = `comments:${targetType}:${targetId}`
  const [more, setMore] = useState<{
    key: string
    items: Comment[]
    cursor: Cursor | null
  }>()
  const [loadingMore, setLoadingMore] = useState(false)

  const first = useAsync(() => listComments(targetType, targetId), key)
  const firstPage = first.data
  const extra = more?.key === key ? more.items : []
  const cursor =
    more?.key === key ? more.cursor : firstPage?.hasMore ? firstPage.nextCursor : null
  const comments = [...(firstPage?.items ?? []), ...extra]

  const replace = (items: Comment[], comment: Comment) =>
    items.map((item) => (item.id === comment.id ? comment : item))

  const update = (comment: Comment) => {
    first.setData((page) => page && { ...page, items: replace(page.items, comment) })
    setMore(
      (current) => current && { ...current, items: replace(current.items, comment) },
    )
  }

  const loadMore = async () => {
    if (!cursor) return
    setLoadingMore(true)
    try {
      const page = await listComments(targetType, targetId, cursor)
      setMore({
        key,
        items: [...extra, ...page.items],
        cursor: page.hasMore ? page.nextCursor : null,
      })
    } catch (error) {
      toast.error(errorMessage(error, 'No pudimos cargar más comentarios.'))
    } finally {
      setLoadingMore(false)
    }
  }

  const submit = async () => {
    const body = text.trim()
    if (!body) return
    setSending(true)
    try {
      const created = await createComment({ targetType, targetId }, body)
      first.setData((page) => page && { ...page, items: [created, ...page.items] })
      setText('')
      toast.success('Comentario publicado')
    } catch (error) {
      toast.error(errorMessage(error, 'No pudimos publicar tu comentario.'))
    } finally {
      setSending(false)
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
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Comparte tu teoría..."
                aria-label="Escribe un comentario"
                maxLength={COMMENT_MAX}
                rows={3}
                className="border-line bg-canvas text-primary placeholder:text-muted focus:border-accent/60 w-full resize-none rounded-xl border px-3 py-2.5 text-sm transition-colors outline-none"
              />
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-muted text-[11px]">
                  Sé respetuoso. Puedes reportar lo que incumpla las normas.
                </p>
                <Button
                  size="sm"
                  onClick={() => void submit()}
                  disabled={!text.trim() || sending}
                  className="w-full sm:w-auto"
                >
                  <Send className="size-3.5" /> {sending ? 'Publicando…' : 'Publicar'}
                </Button>
              </div>
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
            <CommentItem key={comment.id} comment={comment} onChange={update} />
          ))
        )}
      </div>

      {cursor ? (
        <Button
          variant="secondary"
          onClick={() => void loadMore()}
          disabled={loadingMore}
          className="mt-3 w-full"
        >
          {loadingMore ? 'Cargando…' : 'Cargar más comentarios'}
        </Button>
      ) : null}
    </section>
  )
}
