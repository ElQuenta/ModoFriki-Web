import { describe, expect, it } from 'vitest'
import { makeSanctionInput, validateSanctionInput } from './admin-validation'
import type { SanctionInput, UUID } from '@/types/user-admin'

const now = new Date('2026-01-01T00:00:00.000Z')
const subjectId = '00000000-0000-4000-8000-000000000001' as UUID
const input: SanctionInput = {
  subjectId,
  reason: ' spam ',
  type: 'temporary',
  endsAt: '2026-01-02T00:00:00.000Z',
}

describe('sanction form validation', () => {
  it('requires a nonblank reason but adds no invented maximum', () => {
    expect(validateSanctionInput({ ...input, reason: ' \n ' }, { now })).toBe('reason-required')
    expect(validateSanctionInput({ ...input, reason: 'x'.repeat(50_000) }, { now })).toBeNull()
  })

  it('requires a future end only for temporary sanctions', () => {
    expect(validateSanctionInput({ ...input, endsAt: undefined }, { now })).toBe('ends-at-required')
    expect(validateSanctionInput({ ...input, endsAt: 'not-a-date' }, { now })).toBe('ends-at-invalid')
    expect(validateSanctionInput({ ...input, endsAt: now.toISOString() }, { now })).toBe('ends-at-not-future')
    expect(validateSanctionInput({ ...input, type: 'permanent', endsAt: undefined }, { now })).toBeNull()
  })

  it('requires an extension to exceed both the current time and previous expiry', () => {
    const previous = { kind: 'active-temporary' as const, endsAt: '2026-01-03T00:00:00.000Z' }
    expect(validateSanctionInput(input, { now, previous })).toBe('ends-at-not-extended')
    expect(validateSanctionInput({ ...input, endsAt: '2026-01-04T00:00:00.000Z' }, { now, previous })).toBeNull()
  })

  it('omits incompatible expiry fields for permanent sanctions', () => {
    expect(makeSanctionInput({ ...input, type: 'permanent' })).toEqual({
      subjectId,
      reason: 'spam',
      type: 'permanent',
    })
  })
})
