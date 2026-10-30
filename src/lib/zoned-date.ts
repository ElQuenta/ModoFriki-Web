export const DEFAULT_ACCOUNT_TIME_ZONE = 'America/La_Paz'

export interface ZonedDateTimeInput {
  date: string
  time: string
  timeZone: string
  /** Required only when the local time maps to more than one instant. */
  offset?: string
}

export interface ZonedDateTimeCandidate {
  instant: string
  offset: string
  offsetMinutes: number
}

export type ZonedDateTimeResult =
  | { kind: 'invalid'; reason: 'date' | 'time' | 'time-zone' | 'offset' }
  | { kind: 'nonexistent' }
  | { kind: 'ambiguous'; candidates: ZonedDateTimeCandidate[] }
  | { kind: 'resolved'; candidate: ZonedDateTimeCandidate }

function partsAt(epoch: number, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(epoch))
  const value = Object.fromEntries(parts.map(({ type, value }) => [type, value]))
  return {
    year: Number(value.year), month: Number(value.month), day: Number(value.day),
    hour: Number(value.hour), minute: Number(value.minute), second: Number(value.second),
  }
}

function isValidDate(date: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  if (!match) return false
  const [, year, month, day] = match.map(Number)
  const parsed = new Date(Date.UTC(year!, month! - 1, day!))
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month! - 1 && parsed.getUTCDate() === day
}

function formatOffset(minutes: number): string {
  const sign = minutes < 0 ? '-' : '+'
  const absolute = Math.abs(minutes)
  return `${sign}${String(Math.floor(absolute / 60)).padStart(2, '0')}:${String(absolute % 60).padStart(2, '0')}`
}

function offsetAt(epoch: number, timeZone: string): number {
  const parts = partsAt(epoch, timeZone)
  const representedAsUtc = Date.UTC(
    parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second,
  )
  return Math.round((representedAsUtc - Math.floor(epoch / 1000) * 1000) / 60_000)
}

/** Resolve account-local civil time without ever consulting the host's local zone. */
export function resolveZonedDateTime(input: ZonedDateTimeInput): ZonedDateTimeResult {
  if (!isValidDate(input.date)) return { kind: 'invalid', reason: 'date' }
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(input.time)
  if (!timeMatch || Number(timeMatch[1]) > 23 || Number(timeMatch[2]) > 59) {
    return { kind: 'invalid', reason: 'time' }
  }
  try {
    new Intl.DateTimeFormat('en', { timeZone: input.timeZone }).format(0)
  } catch {
    return { kind: 'invalid', reason: 'time-zone' }
  }

  const [year, month, day] = input.date.split('-').map(Number)
  const [hour, minute] = input.time.split(':').map(Number)
  const localAsUtc = Date.UTC(year!, month! - 1, day!, hour!, minute!)
  const offsets = new Set<number>()
  // Probe both sides of transitions and nearby dates; offsets can differ across DST.
  for (let delta = -36; delta <= 36; delta += 3) {
    offsets.add(offsetAt(localAsUtc + delta * 3_600_000, input.timeZone))
  }

  const candidates = [...offsets]
    .map((offsetMinutes): ZonedDateTimeCandidate | null => {
      const epoch = localAsUtc - offsetMinutes * 60_000
      const actual = partsAt(epoch, input.timeZone)
      if (
        actual.year !== year || actual.month !== month || actual.day !== day ||
        actual.hour !== hour || actual.minute !== minute || actual.second !== 0
      ) return null
      return {
        instant: new Date(epoch).toISOString(),
        offset: formatOffset(offsetMinutes),
        offsetMinutes,
      }
    })
    .filter((candidate): candidate is ZonedDateTimeCandidate => candidate !== null)
    .sort((left, right) => Date.parse(left.instant) - Date.parse(right.instant))

  if (candidates.length === 0) return { kind: 'nonexistent' }
  if (candidates.length === 1) {
    if (input.offset && input.offset !== candidates[0]!.offset) {
      return { kind: 'invalid', reason: 'offset' }
    }
    return { kind: 'resolved', candidate: candidates[0]! }
  }
  if (!input.offset) return { kind: 'ambiguous', candidates }
  const candidate = candidates.find(({ offset }) => offset === input.offset)
  return candidate
    ? { kind: 'resolved', candidate }
    : { kind: 'invalid', reason: 'offset' }
}

export function accountTimeZone(value?: string | null): string {
  if (!value) return DEFAULT_ACCOUNT_TIME_ZONE
  try {
    new Intl.DateTimeFormat('en', { timeZone: value }).format(0)
    return value
  } catch {
    return DEFAULT_ACCOUNT_TIME_ZONE
  }
}

export function formatInstantInZone(instant: string, timeZone: string, locale = 'es'): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium', timeStyle: 'short', timeZone,
    timeZoneName: 'short',
  }).format(new Date(instant))
}
