import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CommentMarkdown } from './CommentMarkdown'

describe('CommentMarkdown', () => {
  it('reveals spoilers independently and keeps hidden text out of the accessible tree', () => {
    render(<CommentMarkdown source="Uno ||secreto uno|| y ||secreto dos||" />)

    const buttons = screen.getAllByRole('button', { name: 'Revelar spoiler' })
    expect(screen.queryByText('secreto uno')).not.toBeInTheDocument()
    expect(screen.queryByText('secreto dos')).not.toBeInTheDocument()

    fireEvent.click(buttons[0])
    expect(screen.getByText('secreto uno')).toBeInTheDocument()
    expect(screen.queryByText('secreto dos')).not.toBeInTheDocument()
    expect(buttons[1]).toHaveAttribute('aria-expanded', 'false')
  })

  it('keeps unsupported HTML and image syntax as visible escaped source', () => {
    const source = '<b>literal</b> ![portada](https://example.test/cover.png)'
    const { container } = render(<CommentMarkdown source={source} />)

    expect(container.textContent).toContain('<b>literal</b>')
    expect(container.textContent).toContain('![portada](https://example.test/cover.png)')
    expect(container.querySelector('b, img')).toBeNull()
  })

  it('does not create unsafe links or parse spoiler delimiters in code', () => {
    const { container } = render(
      <CommentMarkdown source={'[peligroso](javascript:alert(1)) `||literal||`'} />,
    )

    expect(container.querySelector('a')?.getAttribute('href')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Revelar spoiler' })).not.toBeInTheDocument()
    expect(container.textContent).toContain('||literal||')
  })

  it('keeps empty, escaped and unclosed delimiters literal while formatting valid spoiler contents', () => {
    const source = '|||| \\|\\|escapado\\|\\| ||sin cerrar y `||código||` ||**texto fuerte**||'
    render(<CommentMarkdown source={source} />)

    expect(screen.getAllByRole('button', { name: 'Revelar spoiler' })).toHaveLength(1)
    expect(screen.queryByText('texto fuerte')).not.toBeInTheDocument()
    expect(screen.getByText(/escapado/)).toBeInTheDocument()
    expect(screen.getByText(/sin cerrar/)).toBeInTheDocument()
    expect(screen.getByText('||código||')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Revelar spoiler' }))
    expect(screen.getByText('texto fuerte').tagName).toBe('STRONG')
  })

  it('renders the supported inline, link, quote, list and code formats', () => {
    const { container } = render(
      <CommentMarkdown
        source={'**fuerte** *cursiva* ~~tachado~~ [enlace](https://example.test)\n\n> cita\n\n- uno\n- dos\n\n`inline`\n\n```\nbloque\n```'}
      />,
    )

    expect(container.querySelector('strong')).toHaveTextContent('fuerte')
    expect(container.querySelector('em')).toHaveTextContent('cursiva')
    expect(container.querySelector('del')).toHaveTextContent('tachado')
    expect(container.querySelector('a')).toHaveAttribute('href', 'https://example.test/')
    expect(container.querySelector('blockquote')).toHaveTextContent('cita')
    expect(container.querySelectorAll('li')).toHaveLength(2)
    expect(container.querySelector('code')).toHaveTextContent('inline')
    expect(container.querySelector('pre')).toHaveTextContent('bloque')
  })
})
