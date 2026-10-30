import type { ComponentProps, HTMLAttributes } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import { commentRemarkPlugins, commentSanitizeSchema, commentUrlTransform } from '@/lib/markdown/config'
import { Spoiler } from './Spoiler'

type SpanProps = ComponentProps<'span'> & { node?: unknown }

export function CommentMarkdown({
  source,
  resetKey,
}: {
  source: string
  resetKey?: string
}) {
  const scope = `${resetKey ?? ''}:${source}`

  const components: Components = {
    p: ({ children }) => <p className="my-2 whitespace-pre-wrap break-words">{children}</p>,
    a: ({ children, href, title }) => (
      <a
        href={href}
        title={title}
        className="text-accent underline decoration-accent/50 underline-offset-2 hover:decoration-accent"
      >
        {children}
      </a>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-line-strong my-2 border-l-2 pl-3 text-secondary">
        {children}
      </blockquote>
    ),
    ul: ({ children }) => <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>,
    ol: ({ children }) => <ol className="my-2 list-decimal space-y-1 pl-5">{children}</ol>,
    li: ({ children }) => <li className="pl-0.5">{children}</li>,
    pre: ({ children }) => (
      <pre className="bg-raised my-2 overflow-x-auto rounded-lg p-3 text-xs">{children}</pre>
    ),
    code: ({ children, className }) =>
      className ? (
        <code className="font-mono text-xs">{children}</code>
      ) : (
        <code className="bg-raised rounded px-1 py-0.5 font-mono text-xs">{children}</code>
      ),
    span: (props) => renderSpan(props, scope),
  }

  return (
    <div className="comment-markdown leading-relaxed break-words">
      <ReactMarkdown
        remarkPlugins={commentRemarkPlugins}
        rehypePlugins={[[rehypeSanitize, commentSanitizeSchema]]}
        urlTransform={commentUrlTransform}
        components={components}
      >
        {source}
      </ReactMarkdown>
    </div>
  )
}

function renderSpan(props: SpanProps, scope: string) {
  const attributes = props as SpanProps & Record<string, unknown>
  const marker = attributes['data-spoiler'] ?? attributes.dataSpoiler
  const spoilerId = String(attributes['data-spoiler-id'] ?? attributes.dataSpoilerId ?? '0')
  const { children, node, ...spanProps } = props
  void node

  if (marker === 'true') {
    const resetKey = `${scope}:${spoilerId}`
    return (
      <Spoiler key={resetKey} resetKey={resetKey}>
        {children}
      </Spoiler>
    )
  }

  return <span {...(spanProps as HTMLAttributes<HTMLSpanElement>)}>{children}</span>
}
