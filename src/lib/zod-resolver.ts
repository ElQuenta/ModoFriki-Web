import type { FieldErrors, FieldValues, Resolver } from 'react-hook-form'
import type { z } from 'zod'

/** Resolver mínimo de zod para react-hook-form (sin agregar @hookform/resolvers). */
export function zodResolver<T extends FieldValues>(schema: z.ZodType<T>): Resolver<T> {
  return async (values) => {
    const result = schema.safeParse(values)
    if (result.success) return { values: result.data, errors: {} }
    const errors: Record<string, { type: string; message: string }> = {}
    for (const issue of result.error.issues) {
      errors[issue.path.join('.')] ??= { type: issue.code, message: issue.message }
    }
    return { values: {}, errors: errors as FieldErrors<T> }
  }
}
