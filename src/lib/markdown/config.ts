import type { Root, RootContent } from 'mdast'
import type { Plugin } from 'unified'
import { gfmStrikethrough } from 'micromark-extension-gfm-strikethrough'
import { gfmStrikethroughFromMarkdown } from 'mdast-util-gfm-strikethrough'
import { remarkSpoilers } from './remark-spoilers'

/** The comment grammar enables only GFM's two-marker strikethrough construct. */
export const remarkStrikethrough: Plugin = function () {
  const data = this.data()
  const micromarkExtensions = (data.micromarkExtensions ??= [])
  const fromMarkdownExtensions = (data.fromMarkdownExtensions ??= [])
  micromarkExtensions.push(gfmStrikethrough({ singleTilde: false }))
  fromMarkdownExtensions.push(gfmStrikethroughFromMarkdown())
}

/**
 * Unsupported constructs that the Markdown parser recognizes (raw HTML and
 * image syntax) are turned back into ordinary text using exact source offsets.
 * ReactMarkdown then escapes that text; it never creates HTML or image requests.
 */
export const remarkUnsupportedLiteral: Plugin<[], Root> = function () {
  return (tree, file) => {
    const source = String(file)
    const visit = (parent: { children: RootContent[] }) => {
      parent.children = parent.children.map((node) => {
        if (node.type === 'html' || node.type === 'image') {
          const start = node.position?.start.offset
          const end = node.position?.end.offset
          const literal = start === undefined || end === undefined ? getLiteral(node) : source.slice(start, end)
          return { type: 'text', value: literal, position: node.position }
        }
        if ('children' in node) visit(node as typeof parent)
        return node
      })
    }
    visit(tree as unknown as { children: RootContent[] })
  }
}

function getLiteral(node: RootContent): string {
  if ('value' in node && typeof node.value === 'string') return node.value
  return ''
}

export const commentRemarkPlugins = [remarkUnsupportedLiteral, remarkStrikethrough, remarkSpoilers]

export function commentUrlTransform(url: string, key: string): string {
  if (key !== 'href') return ''
  const value = url.trim()
  if (!value || hasControlCharacterOrBackslash(value) || value.startsWith('//')) return ''

  try {
    const resolved = new URL(value, 'https://modofrikia.invalid/')
    if (resolved.protocol !== 'http:' && resolved.protocol !== 'https:') return ''
    if (resolved.origin === 'https://modofrikia.invalid') return value
    return resolved.href
  } catch {
    return ''
  }
}

function hasControlCharacterOrBackslash(value: string) {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index)
    if (code <= 31 || code === 127 || code === 92) return true
  }
  return false
}

const allowedTags = ['p', 'br', 'strong', 'em', 'del', 'a', 'blockquote', 'ul', 'ol', 'li', 'code', 'pre', 'span']

export const commentSanitizeSchema = {
  tagNames: allowedTags,
  attributes: {
    a: ['href', 'title'],
    span: [['dataSpoiler', 'true'], ['dataSpoilerId', /^\d+$/]],
  },
  protocols: { href: ['http', 'https'] },
}
