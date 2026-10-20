import { Star, X } from 'lucide-react'
import { cn } from '@/lib/cn'

const SCORES = Array.from({ length: 11 }, (_, index) => index / 2)

/** Valoración de 0 a 5 en pasos de 0,5. `null` = sin valorar. */
export function RatingControl({
  value,
  onChange,
  disabled = false,
}: {
  value: number | null
  onChange: (score: number | null) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex" role="group" aria-label="Tu valoración">
        {[1, 2, 3, 4, 5].map((star) => {
          const fill = value === null ? 0 : Math.min(1, Math.max(0, value - star + 1))
          return (
            <button
              key={star}
              type="button"
              disabled={disabled}
              onClick={() => onChange(value === star ? star - 0.5 : star)}
              aria-label={`Valorar con ${star} ${star === 1 ? 'estrella' : 'estrellas'}`}
              className="text-warning flex size-8 items-center justify-center rounded-md disabled:opacity-50"
            >
              <Star
                className={cn(
                  'size-5',
                  fill === 1 && 'fill-current',
                  fill === 0.5 && 'fill-current opacity-50',
                )}
              />
            </button>
          )
        })}
      </div>
      <select
        value={value ?? ''}
        disabled={disabled}
        onChange={(event) =>
          onChange(event.target.value === '' ? null : Number(event.target.value))
        }
        aria-label="Puntuación exacta"
        className="border-line bg-surface text-secondary h-8 rounded-lg border px-1.5 text-xs outline-none"
      >
        <option value="">—</option>
        {SCORES.map((score) => (
          <option key={score} value={score}>
            {score.toFixed(1)}
          </option>
        ))}
      </select>
      {value !== null ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(null)}
          aria-label="Quitar valoración"
          className="text-muted hover:text-danger flex size-8 items-center justify-center"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  )
}
