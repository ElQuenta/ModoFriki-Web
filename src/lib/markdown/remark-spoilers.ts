import type { Nodes, Parent, Root as MdastRoot, PhrasingContent } from 'mdast'
import type { CompileContext, Extension as FromMarkdownExtension } from 'mdast-util-from-markdown'
import type { Construct, Effects, Extension as MicromarkExtension, Event, State, Token, TokenizeContext } from 'micromark-util-types'
import type { Plugin } from 'unified'
import type { Position } from 'unist'

declare module 'unified' {
  interface Data {
    micromarkExtensions?: MicromarkExtension[]
    fromMarkdownExtensions?: FromMarkdownExtension[]
  }
}

declare module 'micromark-util-types' {
  interface TokenTypeMap {
    spoilerSequenceTemporary: 'spoilerSequenceTemporary'
    spoilerSequence: 'spoilerSequence'
    spoiler: 'spoiler'
    spoilerText: 'spoilerText'
  }
}

type SpoilerNode = Parent & {
  type: 'spoiler'
  children: PhrasingContent[]
}

declare module 'mdast' {
  interface PhrasingContentMap {
    spoiler: SpoilerNode
  }
}

/** Adds `||spoiler||` as a non-nesting phrasing construct. */
export const remarkSpoilers: Plugin<[], MdastRoot> = function () {
  const data = this.data()
  const micromarkExtensions = (data.micromarkExtensions ??= []) as MicromarkExtension[]
  const fromMarkdownExtensions = (data.fromMarkdownExtensions ??= []) as FromMarkdownExtension[]
  micromarkExtensions.push(spoilerSyntax())
  fromMarkdownExtensions.push(spoilerFromMarkdown())
  return (tree) => {
    assignSpoilerProperties(tree)
  }
}

function spoilerSyntax(): MicromarkExtension {
  const tokenizer: Construct = {
    name: 'spoiler',
    tokenize: tokenizeSpoiler,
    resolveAll: resolveAllSpoilers,
  }

  return {
    text: { [124]: tokenizer },
    insideSpan: { null: [tokenizer] },
    attentionMarkers: { null: [124] },
  }

  function resolveAllSpoilers(events: Event[], context: TokenizeContext): Event[] {
    let index = -1

    while (++index < events.length) {
      const current = events[index][1] as DelimiterToken
      if (events[index][0] !== 'enter' || current.type !== 'spoilerSequenceTemporary' || !current._close) continue

      let open = index
      while (open--) {
        const candidate = events[open][1] as DelimiterToken
        if (
          events[open][0] !== 'exit' ||
          candidate.type !== 'spoilerSequenceTemporary' ||
          !candidate._open ||
          candidate.end.offset === current.start.offset
        ) continue

        // One opener closes at the first valid closer. Later bars stay literal.
        candidate.type = 'spoilerSequence'
        current.type = 'spoilerSequence'
        const spoiler: Token = {
          type: 'spoiler',
          start: { ...candidate.start },
          end: { ...current.end },
        }
        const text: Token = {
          type: 'spoilerText',
          start: { ...candidate.end },
          end: { ...current.start },
        }
        const next: Event[] = [
          ['enter', spoiler, context],
          ['enter', candidate, context],
          ['exit', candidate, context],
          ['enter', text, context],
        ]
        const inside = context.parser.constructs.insideSpan.null
        if (inside) next.push(...resolveAll(inside, events.slice(open + 1, index), context))
        next.push(['exit', text, context], ['enter', current, context], ['exit', current, context], ['exit', spoiler, context])

        events.splice(open - 1, index - open + 3, ...next)
        index = open + next.length - 2
        break
      }
    }

    // Unpaired or empty delimiters are ordinary text, never a disclosure.
    for (const [, token] of events) {
      if (token.type === 'spoilerSequenceTemporary') token.type = 'data'
    }
    return events
  }

  function tokenizeSpoiler(this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
    const previous = this.previous
    const events = this.events
    let size = 0

    return start

    function start(code: number | null): State | undefined {
      // Do not parse escaped pipes or start halfway through a run of bars.
      if (previous === 124 || events.at(-1)?.[1].type === 'characterEscape') return nok(code)
      effects.enter('spoilerSequenceTemporary')
      return more(code)
    }

    function more(code: number | null): State | undefined {
      if (code === 124 && size < 2) {
        effects.consume(code)
        size += 1
        return more
      }
      if (size !== 2) return nok(code)

      const token = effects.exit('spoilerSequenceTemporary') as DelimiterToken
      const next = code === null ? undefined : String.fromCodePoint(code)
      const before = previous === null ? '' : String.fromCodePoint(previous)
      // Require visible content adjacent to the marker. Whitespace-only pairs
      // remain literal as well, avoiding an empty disclosure.
      const canOpen = Boolean(next && next !== '|' && !/\s/.test(next))
      const canClose = Boolean(before && before !== '|' && !/\s/.test(before))
      token._open = canOpen
      token._close = canClose
      return ok(code)
    }
  }
}

function resolveAll(constructs: Array<Pick<Construct, 'resolveAll'>> | undefined, events: Event[], context: TokenizeContext) {
  let result = events
  for (const construct of constructs ?? []) {
    if (construct.resolveAll) result = construct.resolveAll(result, context)
  }
  return result
}

type DelimiterToken = Token & { _open?: boolean; _close?: boolean }

function spoilerFromMarkdown(): FromMarkdownExtension {
  return {
    enter: { spoiler: enterSpoiler },
    exit: { spoiler: exitSpoiler },
  }
}

function enterSpoiler(this: CompileContext, token: Token) {
  this.enter(
    { type: 'spoiler', children: [], position: undefined } as unknown as Nodes,
    token,
  )
}

function exitSpoiler(this: CompileContext, token: Token) {
  this.exit(token)
}

function assignSpoilerProperties(tree: MdastRoot) {
  type VisitNode = {
    type: string
    position?: Position
    children?: VisitNode[]
    data?: { hName?: string; hProperties?: Record<string, unknown> }
  }
  const visit = (node: VisitNode) => {
    if (node.type === 'spoiler') {
      node.data = {
        hName: 'span',
        hProperties: {
          dataSpoiler: 'true',
          dataSpoilerId: String(node.position?.start.offset ?? 0),
        },
      }
    }
    node.children?.forEach(visit)
  }
  visit(tree as unknown as VisitNode)
}

