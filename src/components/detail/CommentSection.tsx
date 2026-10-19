import { useState } from 'react'
import { Heart, MessageCircle, Send, TriangleAlert } from 'lucide-react'
import { getCommentsForSeries } from '@/data/mock'
import type { UserComment } from '@/types'
import { cn } from '@/lib/cn'
import { formatRelativeDate } from '@/lib/format'
import { useAuth } from '@/hooks/useAuth'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

export function CommentSection({ seriesId }: { seriesId: string }) {
  const { user } = useAuth()
  const [comments, setComments] = useState<UserComment[]>(() =>
    getCommentsForSeries(seriesId),
  )
  const [text, setText] = useState('')
  const [liked, setLiked] = useState<Record<string, boolean>>({})
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})

  const submit = () => {
    if (!text.trim()) return
    setComments((current) => [
      {
        id: crypto.randomUUID(),
        seriesId,
        userName: user?.name ?? 'Lector anónimo',
        userAvatar: user?.avatarUrl ?? '',
        content: text.trim(),
        createdAt: new Date().toISOString(),
        likes: 0,
        spoiler: false,
        replies: [],
      },
      ...current,
    ])
    setText('')
  }

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold">
          <MessageCircle className="size-5 text-accent" />
          Comentarios
          <span className="text-sm font-normal text-muted">({comments.length})</span>
        </h2>
      </div>

      <div className="surface-card p-4">
        <div className="flex gap-3">
          <Avatar
            src={user?.avatarUrl ?? ''}
            alt={user?.name ?? 'Lector'}
            size="sm"
            className="mt-1"
          />
          <div className="min-w-0 flex-1">
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Comparte tu teoría, sin spoilers..."
              rows={3}
              className="w-full resize-none rounded-xl border border-line bg-base px-3 py-2.5 text-sm text-primary outline-none transition-colors placeholder:text-muted focus:border-accent/60"
            />
            <div className="mt-2 flex items-center justify-between">
              <p className="text-[11px] text-muted">Sé respetuoso. Los spoilers van marcados.</p>
              <Button size="sm" onClick={submit} disabled={!text.trim()}>
                <Send className="size-3.5" /> Publicar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {comments.map((comment) => {
          const isLiked = liked[comment.id]
          return (
            <article key={comment.id} className="surface-card p-4">
              <div className="flex gap-3">
                <Avatar src={comment.userAvatar} alt={comment.userName} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{comment.userName}</p>
                    <span className="text-[11px] text-muted">
                      {formatRelativeDate(comment.createdAt)}
                    </span>
                    {comment.chapterNumber ? (
                      <span className="rounded bg-raised px-1.5 py-0.5 text-[10px] text-muted">
                        Cap. {comment.chapterNumber}
                      </span>
                    ) : null}
                  </div>

                  {comment.spoiler && !revealed[comment.id] ? (
                    <button
                      type="button"
                      onClick={() =>
                        setRevealed((current) => ({ ...current, [comment.id]: true }))
                      }
                      className="mt-2 flex w-full items-center gap-2 rounded-lg border border-warning/20 bg-warning/5 px-3 py-2 text-left text-xs text-warning"
                    >
                      <TriangleAlert className="size-3.5" />
                      Este comentario contiene spoilers. Toca para revelar.
                    </button>
                  ) : (
                    <p className="mt-2 text-sm leading-relaxed text-secondary">
                      {comment.content}
                    </p>
                  )}

                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setLiked((current) => ({
                          ...current,
                          [comment.id]: !current[comment.id],
                        }))
                      }
                      className={cn(
                        'inline-flex items-center gap-1.5 text-[11px] font-medium transition-colors',
                        isLiked ? 'text-accent' : 'text-muted hover:text-accent',
                      )}
                    >
                      <Heart className={cn('size-3.5', isLiked && 'fill-current')} />
                      {comment.likes + (isLiked ? 1 : 0)}
                    </button>
                    <span className="text-[11px] text-muted">
                      {comment.replies.length} respuesta
                      {comment.replies.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  {comment.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className="mt-3 flex gap-2.5 rounded-xl border border-line bg-base/50 p-3"
                    >
                      <Avatar src={reply.userAvatar} alt={reply.userName} size="sm" />
                      <div>
                        <p className="text-xs font-semibold">
                          {reply.userName}{' '}
                          <span className="ml-1 font-normal text-muted">
                            {formatRelativeDate(reply.createdAt)}
                          </span>
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-secondary">
                          {reply.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
