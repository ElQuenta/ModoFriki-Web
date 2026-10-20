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
        'from-raised via-surface to-base relative overflow-hidden rounded-xl bg-gradient-to-br',
        className,
      )}
    >
      {failed ? (
        <div className="flex size-full flex-col items-center justify-center gap-2 p-4 text-center">
          <BookOpen className="text-accent size-7" />
          <span className="font-display text-secondary text-sm font-semibold">
            {title}
          </span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={cn('size-full object-cover', imgClassName)}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  )
}
