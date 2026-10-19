import { cn } from '@/lib/cn'

export function Avatar({
  src,
  alt,
  size = 'md',
  className,
}: {
  src: string
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
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-raised font-bold text-accent',
        sizes[size],
        className,
      )}
    >
      <span aria-hidden>{alt.slice(0, 1).toUpperCase()}</span>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="absolute inset-0 size-full object-cover"
        onError={(event) => {
          event.currentTarget.style.display = 'none'
        }}
      />
    </span>
  )
}
