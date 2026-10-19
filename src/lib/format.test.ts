import { describe, expect, it } from 'vitest'
import { clamp, formatViews, percent, slugify } from './format'

describe('format', () => {
  it('formats large view counts', () => {
    expect(formatViews(2480000)).toBe('2.5M')
    expect(formatViews(12480)).toBe('12.5K')
    expect(formatViews(42)).toBe('42')
  })

  it('clamps values inside a range', () => {
    expect(clamp(12, 0, 10)).toBe(10)
    expect(clamp(-3, 0, 10)).toBe(0)
  })

  it('calculates a safe percentage', () => {
    expect(percent(3, 5)).toBe(60)
    expect(percent(1, 0)).toBe(0)
  })

  it('creates url friendly slugs', () => {
    expect(slugify('Cazador de Sombras')).toBe('cazador-de-sombras')
    expect(slugify('  Neón y Ceniza  ')).toBe('neon-y-ceniza')
  })
})
