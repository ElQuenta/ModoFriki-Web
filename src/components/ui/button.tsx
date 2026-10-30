/* eslint-disable react-refresh/only-export-components */
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
type Size = 'sm' | 'md' | 'lg' | 'icon'

const variants: Record<Variant, string> = {
  primary:
    'bg-accent text-canvas font-semibold hover:bg-accent-hover shadow-accent',
  secondary: 'bg-raised text-primary hover:bg-overlay border border-line',
  ghost: 'text-secondary hover:bg-raised hover:text-primary',
  outline: 'border border-line-strong text-primary hover:border-accent hover:text-accent',
  danger: 'bg-danger/10 text-danger hover:bg-danger/20 border border-danger/30',
}

const sizes: Record<Size, string> = {
  sm: 'h-10 px-3.5 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
  icon: 'size-10',
}

export function buttonStyles({
  variant = 'primary',
  size = 'md',
  className,
}: {
  variant?: Variant
  size?: Size
  className?: string
} = {}) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50',
    variants[variant],
    sizes[size],
    className,
  )
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonStyles({ variant, size, className })}
      {...props}
    />
  )
}
