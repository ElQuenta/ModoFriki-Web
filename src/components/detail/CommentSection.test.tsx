import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Comment, CursorPage } from '@/types'
import { CommentSection } from './CommentSection'

const mocks = vi.hoisted(() => ({
  createComment: vi.fn(),
  listComments: vi.fn(),
  listReplies: vi.fn(),
  toastSuccess: vi.fn(),
  userId: 'user-1',
  restrictionBlocked: false,
  restrictionMessage: undefined as string | undefined,
}))

vi.mock('@/services/community', () => ({
  createComment: mocks.createComment,
  listComments: mocks.listComments,
  listReplies: mocks.listReplies,
}))

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: mocks.userId, username: 'lector', role: 'BASIC' },
  }),
}))

vi.mock('@/hooks/useCommentRestriction', () => ({
  useCommentRestriction: () => ({
    blocked: mocks.restrictionBlocked,
    message: mocks.restrictionMessage,
  }),
}))

vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), { success: mocks.toastSuccess, error: vi.fn() }),
}))

vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ alt }: { alt: string }) => <span aria-label={alt} />,
}))

vi.mock('@/components/detail/CommentEditor', () => ({
  CommentEditor: ({
    source,
    onSourceChange,
    onSubmit,
    pending,
    submitDisabled,
    error,
    label,
  }: {
    source: string
    onSourceChange: (value: string) => void
    onSubmit: (value: string) => void | Promise<void>
    pending: boolean
    submitDisabled?: boolean
    error?: string
    label: string
  }) => (
    <div>
      <textarea
        aria-label={label}
        value={source}
        onChange={(event) => onSourceChange(event.target.value)}
      />
      <button type="button" disabled={pending || submitDisabled} onClick={() => void onSubmit(source)}>
        Enviar comentario
      </button>
      {error ? <p role="alert">{error}</p> : null}
    </div>
  ),
}))

vi.mock('@/components/detail/CommentItem', () => ({
  CommentItem: ({ comment }: { comment: Comment }) => (
    <article data-testid="comment" data-comment-id={comment.id}>
      {comment.bodyMarkdown}
    </article>
  ),
}))

const comment = (id: string, bodyMarkdown = `body-${id}`): Comment => ({
  id,
  author: { id: 'user-2', username: 'autor' },
  targetType: 'WORK',
  targetId: 'work-1',
  parentCommentId: null,
  rootCommentId: id,
  bodyMarkdown,
  status: 'ACTIVE',
  revision: 1,
  createdAt: '2026-01-01T00:00:00.000Z',
  editedAt: null,
  votes: { upvotes: 0, downvotes: 0, score: 0 },
})

const page = (items: Comment[], hasMore = false, nextCursor: CursorPage<Comment>['nextCursor'] = null) => ({
  items,
  hasMore,
  nextCursor,
})

function renderSection() {
  return render(
    <MemoryRouter>
      <CommentSection targetType="WORK" targetId="work-1" />
    </MemoryRouter>,
  )
}

describe('CommentSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.userId = 'user-1'
    mocks.restrictionBlocked = false
    mocks.restrictionMessage = undefined
    mocks.listComments.mockResolvedValue(page([]))
    mocks.createComment.mockResolvedValue(comment('created'))
  })

  it('envía la fuente sin recortarla y conserva el borrador si falla la publicación', async () => {
    mocks.createComment.mockRejectedValueOnce(new Error('fallo de red'))
    renderSection()

    const editor = await screen.findByRole('textbox', { name: 'Escribe un comentario' })
    const source = '  **texto y espacios**  '
    fireEvent.change(editor, { target: { value: source } })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar comentario' }))

    await waitFor(() => expect(mocks.createComment).toHaveBeenCalledWith(
      { targetType: 'WORK', targetId: 'work-1' },
      source,
    ))
    expect(await screen.findByRole('alert')).toHaveTextContent('Tu borrador sigue aquí')
    expect(screen.getByRole('textbox', { name: 'Escribe un comentario' })).toHaveValue(source)
  })

  it('fusiona páginas por ID y ofrece reintento tras un error de continuación', async () => {
    const first = comment('first')
    mocks.listComments
      .mockResolvedValueOnce(page([first], true, { createdAt: '2026-01-01T00:00:00.000Z', id: 'first' }))
      .mockRejectedValueOnce(new Error('sin conexión'))
      .mockResolvedValueOnce(page([first, comment('second')]))
    renderSection()

    await screen.findByTestId('comment')
    fireEvent.click(screen.getByRole('button', { name: 'Cargar más comentarios' }))
    expect(await screen.findByRole('status')).toHaveTextContent('No pudimos cargar más comentarios')
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))

    await waitFor(() => expect(screen.getAllByTestId('comment')).toHaveLength(2))
    expect(screen.getAllByTestId('comment').map((node) => node.getAttribute('data-comment-id')))
      .toEqual(['first', 'second'])
    expect(mocks.listComments).toHaveBeenCalledTimes(3)
  })

  it('bloquea doble envío de forma síncrona y descarta una respuesta tardía de otro destino', async () => {
    let resolveCreate!: (result: Comment) => void
    mocks.createComment.mockReturnValueOnce(
      new Promise<Comment>((resolve) => {
        resolveCreate = resolve
      }),
    )
    const view = renderSection()
    const editor = await screen.findByRole('textbox', { name: 'Escribe un comentario' })
    fireEvent.change(editor, { target: { value: 'texto del primer destino' } })
    const submit = screen.getByRole('button', { name: 'Enviar comentario' })
    fireEvent.click(submit)
    fireEvent.click(submit)

    expect(mocks.createComment).toHaveBeenCalledTimes(1)
    view.rerender(
      <MemoryRouter>
        <CommentSection targetType="WORK" targetId="work-2" />
      </MemoryRouter>,
    )
    await screen.findByRole('textbox', { name: 'Escribe un comentario' })
    resolveCreate(comment('late', 'respuesta tardía'))

    await waitFor(() => expect(screen.queryByText('respuesta tardía')).not.toBeInTheDocument())
    expect(screen.getByRole('textbox', { name: 'Escribe un comentario' })).toHaveValue('')
  })

  it('no reutiliza el borrador al cambiar la cuenta en el mismo destino', async () => {
    const view = renderSection()
    const editor = await screen.findByRole('textbox', { name: 'Escribe un comentario' })
    fireEvent.change(editor, { target: { value: 'borrador privado de la primera cuenta' } })

    mocks.userId = 'user-2'
    view.rerender(
      <MemoryRouter>
        <CommentSection targetType="WORK" targetId="work-1" />
      </MemoryRouter>,
    )

    expect(screen.getByRole('textbox', { name: 'Escribe un comentario' })).toHaveValue('')
  })

  it('bloquea publicar solo cuando hay una sanción activa confirmada', async () => {
    mocks.restrictionBlocked = true
    mocks.restrictionMessage = 'No puedes comentar hasta mañana.'
    renderSection()

    expect(await screen.findByRole('status')).toHaveTextContent('No puedes comentar hasta mañana.')
    expect(screen.getByRole('button', { name: 'Enviar comentario' })).toBeDisabled()
    expect(mocks.createComment).not.toHaveBeenCalled()
  })
})
