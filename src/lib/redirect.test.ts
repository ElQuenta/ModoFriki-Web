import { beforeEach, describe, expect, it } from 'vitest'
import { safeRedirect } from './redirect'

describe('safeRedirect', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/')
  })

  it('preserves a same-origin path, query, and hash', () => {
    expect(safeRedirect('/profile?tab=reading#history')).toBe(
      '/profile?tab=reading#history',
    )
  })

  it('rejects external and protocol-relative URLs', () => {
    expect(safeRedirect('https://attacker.example/path')).toBe('/')
    expect(safeRedirect('//attacker.example/path')).toBe('/')
  })

  it('rejects slash and backslash paths after repeated decoding', () => {
    expect(safeRedirect('/%2f%2fattacker.example')).toBe('/')
    expect(safeRedirect('/%252f%252fattacker.example')).toBe('/')
    expect(safeRedirect('/%255c%255cattacker.example')).toBe('/')
  })

  it('uses the fallback for malformed encodings', () => {
    expect(safeRedirect('/%E0%A4%A', '/catalog')).toBe('/catalog')
  })
})
