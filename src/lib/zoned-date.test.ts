import { describe, expect, it } from 'vitest'
import {
  accountTimeZone,
  DEFAULT_ACCOUNT_TIME_ZONE,
  resolveZonedDateTime,
} from './zoned-date'

describe('account-zone date resolution', () => {
  it('uses account time zone or the explicit La Paz fallback', () => {
    expect(DEFAULT_ACCOUNT_TIME_ZONE).toBe('America/La_Paz')
    expect(accountTimeZone()).toBe('America/La_Paz')
    expect(accountTimeZone('America/New_York')).toBe('America/New_York')
    expect(accountTimeZone('invalid/zone')).toBe('America/La_Paz')
  })

  it('converts local time using the supplied account zone, independent of browser zone', () => {
    expect(resolveZonedDateTime({
      date: '2026-01-15', time: '12:30', timeZone: 'America/La_Paz',
    })).toEqual({
      kind: 'resolved',
      candidate: { instant: '2026-01-15T16:30:00.000Z', offset: '-04:00', offsetMinutes: -240 },
    })
  })

  it('rejects nonexistent daylight-saving local times', () => {
    expect(resolveZonedDateTime({
      date: '2026-03-08', time: '02:30', timeZone: 'America/New_York',
    })).toEqual({ kind: 'nonexistent' })
  })

  it('requires an explicit offset for ambiguous times and resolves either choice', () => {
    const input = { date: '2026-11-01', time: '01:30', timeZone: 'America/New_York' }
    const ambiguous = resolveZonedDateTime(input)
    expect(ambiguous.kind).toBe('ambiguous')
    if (ambiguous.kind !== 'ambiguous') throw new Error('expected ambiguous time')
    expect(ambiguous.candidates.map(({ offset }) => offset)).toEqual(['-04:00', '-05:00'])
    expect(resolveZonedDateTime({ ...input, offset: '-04:00' })).toMatchObject({
      kind: 'resolved', candidate: { instant: '2026-11-01T05:30:00.000Z', offset: '-04:00' },
    })
    expect(resolveZonedDateTime({ ...input, offset: '-05:00' })).toMatchObject({
      kind: 'resolved', candidate: { instant: '2026-11-01T06:30:00.000Z', offset: '-05:00' },
    })
  })

  it('reports malformed dates, times, zones, and offsets', () => {
    expect(resolveZonedDateTime({ date: '2026-02-30', time: '12:00', timeZone: 'UTC' })).toEqual({
      kind: 'invalid', reason: 'date',
    })
    expect(resolveZonedDateTime({ date: '2026-02-28', time: '25:00', timeZone: 'UTC' })).toEqual({
      kind: 'invalid', reason: 'time',
    })
    expect(resolveZonedDateTime({ date: '2026-02-28', time: '12:00', timeZone: 'Nowhere' })).toEqual({
      kind: 'invalid', reason: 'time-zone',
    })
    expect(resolveZonedDateTime({
      date: '2026-02-28', time: '12:00', timeZone: 'UTC', offset: '+02:00',
    })).toEqual({ kind: 'invalid', reason: 'offset' })
  })
})
