import { useState } from 'react'
import { BookOpen } from 'lucide-react'
import { cn } from '@/lib/cn'

export function CoverImage({
  src,
  alt,
  title,
  className,
  imgClassName,
}: {
  src: string
  alt: string
  title: string
  className?: string
  imgClassName?: string
}) {
  const [failed, setFailed] = useState(false)

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-gradient-to-br from-raised via-surface to-base',
        className,
      )}
    >
      {failed ? (
        <div className="flex size-full flex-col items-center justify-center gap-2 p-4 text-center">
          <BookOpen className="size-7 text-accent" />
          <span className="font-display text-sm font-semibold text-secondary">{title}</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={cn('size-full object-cover', imgClassName)}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  )
}
