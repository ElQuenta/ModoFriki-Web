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
        userName: user?.username ?? 'Lector anónimo',
        userAvatar: '',
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
        <h2 className="font-display flex items-center gap-2 text-xl font-bold">
          <MessageCircle className="text-accent size-5" />
          Comentarios
          <span className="text-muted text-sm font-normal">({comments.length})</span>
        </h2>
      </div>

      <div className="surface-card p-3 sm:p-4">
        <div className="flex gap-2.5 sm:gap-3">
          <Avatar alt={user?.username ?? 'Lector'} size="sm" className="mt-1" />
          <div className="min-w-0 flex-1">
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Comparte tu teoría, sin spoilers..."
              rows={3}
              className="border-line bg-base text-primary placeholder:text-muted focus:border-accent/60 w-full resize-none rounded-xl border px-3 py-2.5 text-sm transition-colors outline-none"
            />
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-muted text-[11px]">
                Sé respetuoso. Los spoilers van marcados.
              </p>
              <Button
                size="sm"
                onClick={submit}
                disabled={!text.trim()}
                className="w-full sm:w-auto"
              >
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
            <article key={comment.id} className="surface-card p-3 sm:p-4">
              <div className="flex gap-2.5 sm:gap-3">
                <Avatar src={comment.userAvatar} alt={comment.userName} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{comment.userName}</p>
                    <span className="text-muted text-[11px]">
                      {formatRelativeDate(comment.createdAt)}
                    </span>
                    {comment.chapterNumber ? (
                      <span className="bg-raised text-muted rounded px-1.5 py-0.5 text-[10px]">
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
                      className="border-warning/20 bg-warning/5 text-warning mt-2 flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs"
                    >
                      <TriangleAlert className="size-3.5" />
                      Este comentario contiene spoilers. Toca para revelar.
                    </button>
                  ) : (
                    <p className="text-secondary mt-2 text-sm leading-relaxed">
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
                    <span className="text-muted text-[11px]">
                      {comment.replies.length} respuesta
                      {comment.replies.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  {comment.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className="border-line bg-base/50 mt-3 flex gap-2 rounded-xl border p-2.5 sm:gap-2.5 sm:p-3"
                    >
                      <Avatar src={reply.userAvatar} alt={reply.userName} size="sm" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold">
                          {reply.userName}{' '}
                          <span className="text-muted ml-1 font-normal">
                            {formatRelativeDate(reply.createdAt)}
                          </span>
                        </p>
                        <p className="text-secondary mt-1 text-xs leading-relaxed">
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
