import type { SanctionInput, SanctionStatus, UUID } from '@/types/user-admin'

export type SanctionValidationError =
  | 'subject-required'
  | 'reason-required'
  | 'reason-too-long'
  | 'ends-at-required'
  | 'ends-at-invalid'
  | 'ends-at-not-future'
  | 'ends-at-not-extended'

export interface SanctionValidationOptions {
  now?: Date
  previous?: SanctionStatus
}

/** Mirrors the published backend reason limit and future-expiry rules. */
export function validateSanctionInput(
  input: SanctionInput,
  options: SanctionValidationOptions = {},
): SanctionValidationError | null {
  if (!input.subjectId) return 'subject-required'
  if (!input.reason.trim()) return 'reason-required'
  if (input.reason.trim().length > 2000) return 'reason-too-long'
  if (input.type === 'permanent') return null
  if (!input.endsAt) return 'ends-at-required'

  const endsAt = Date.parse(input.endsAt)
  if (!Number.isFinite(endsAt)) return 'ends-at-invalid'
  const now = options.now?.getTime() ?? Date.now()
  if (endsAt <= now) return 'ends-at-not-future'

  const previous = options.previous
  if (previous?.kind === 'active-temporary') {
    const oldEndsAt = Date.parse(previous.endsAt)
    if (Number.isFinite(oldEndsAt) && endsAt <= oldEndsAt) return 'ends-at-not-extended'
  }
  return null
}

export function makeSanctionInput(input: {
  subjectId: UUID
  reason: string
  type: 'temporary' | 'permanent'
  endsAt?: string
}): SanctionInput {
  const reason = input.reason.trim()
  return input.type === 'permanent'
    ? { subjectId: input.subjectId, reason, type: 'permanent' }
    : { subjectId: input.subjectId, reason, type: 'temporary', endsAt: input.endsAt }
}
