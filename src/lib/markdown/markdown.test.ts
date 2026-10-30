import { describe, expect, it } from 'vitest'
import { commentSanitizeSchema, commentUrlTransform } from './config'

describe('comment Markdown security policy', () => {
  it('allows only web and internal destinations for explicit links', () => {
    expect(commentUrlTransform('https://example.test/page', 'href')).toBe('https://example.test/page')
    expect(commentUrlTransform('http://example.test/page', 'href')).toBe('http://example.test/page')
    expect(commentUrlTransform('/series/42', 'href')).toBe('/series/42')
    expect(commentUrlTransform('../series/42', 'href')).toBe('../series/42')
    expect(commentUrlTransform('#comentarios', 'href')).toBe('#comentarios')
  })

  it('rejects executable, protocol-relative, unknown and non-link destinations', () => {
    for (const url of [
      'javascript:alert(1)',
      'data:text/html,<script>alert(1)</script>',
      '//example.test/path',
      'ftp://example.test/file',
      '\\\\example.test\\path',
    ]) {
      expect(commentUrlTransform(url, 'href')).toBe('')
    }
    expect(commentUrlTransform('https://example.test/image.png', 'src')).toBe('')
  })

  it('sanitizes to the comment formatting subset without image or executable tags', () => {
    expect(commentSanitizeSchema.tagNames).toEqual([
      'p',
      'br',
      'strong',
      'em',
      'del',
      'a',
      'blockquote',
      'ul',
      'ol',
      'li',
      'code',
      'pre',
      'span',
    ])
    expect(commentSanitizeSchema.tagNames).not.toContain('img')
    expect(commentSanitizeSchema.tagNames).not.toContain('script')
  })
})
