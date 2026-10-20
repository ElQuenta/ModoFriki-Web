import { cn } from '@/lib/cn'

export function Avatar({
  src,
  alt,
  size = 'md',
  className,
}: {
  src?: string
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}) {
  const sizes = {
    sm: 'size-8 text-xs',
    md: 'size-10 text-sm',
    lg: 'size-14 text-base',
    xl: 'size-20 text-xl',
  }

  return (
    <span
      className={cn(
        'border-line bg-raised text-accent relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border font-bold',
        sizes[size],
        className,
      )}
    >
      <span aria-hidden>{alt.slice(0, 2).toUpperCase()}</span>
      {src ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="absolute inset-0 size-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = 'none'
          }}
        />
      ) : null}
    </span>
  )
}
