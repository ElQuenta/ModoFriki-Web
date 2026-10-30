import { describe, expect, it } from 'vitest'
import { COMMENT_SOURCE_MAX_LENGTH, validateCommentSource } from './comments'

describe('comment source validation', () => {
  it('rejects empty and whitespace-only source without normalizing it', () => {
    expect(validateCommentSource('')).toBeTruthy()
    expect(validateCommentSource(' \n\t')).toBeTruthy()
    expect(validateCommentSource('  text  ')).toBeUndefined()
  })

  it('accepts 10,000 UTF-16 code units and rejects 10,001', () => {
    expect(validateCommentSource('x'.repeat(COMMENT_SOURCE_MAX_LENGTH))).toBeUndefined()
    expect(validateCommentSource('x'.repeat(COMMENT_SOURCE_MAX_LENGTH + 1))).toBeTruthy()
    expect('😀'.repeat(5_000)).toHaveLength(10_000)
    expect(validateCommentSource('😀'.repeat(5_000))).toBeUndefined()
  })
})
