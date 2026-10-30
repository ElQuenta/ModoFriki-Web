import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Comment, CursorPage } from '@/types'
import { ApiError } from '@/lib/api'
import { CommentItem } from './CommentItem'

const mocks = vi.hoisted(() => ({
  createComment: vi.fn(),
  deleteComment: vi.fn(),
  editComment: vi.fn(),
  listReplies: vi.fn(),
  removeVote: vi.fn(),
  reportComment: vi.fn(),
  resolveReport: vi.fn(),
  voteComment: vi.fn(),
  toastSuccess: vi.fn(),
  userId: 'user-1',
}))

vi.mock('@/services/community', () => ({
  REPORT_REASONS: [],
  createComment: mocks.createComment,
  deleteComment: mocks.deleteComment,
  editComment: mocks.editComment,
  listReplies: mocks.listReplies,
  removeVote: mocks.removeVote,
  reportComment: mocks.reportComment,
  resolveReport: mocks.resolveReport,
  voteComment: mocks.voteComment,
}))

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: mocks.userId, username: 'lector', role: 'BASIC' } }),
}))

vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), { success: mocks.toastSuccess, error: vi.fn() }),
}))

vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ alt }: { alt: string }) => <span aria-label={alt} />,
}))

vi.mock('@/components/ui/confirm-dialog', () => ({
  ConfirmDialog: ({ open, onConfirm }: { open: boolean; onConfirm: () => void }) =>
    open ? <button type="button" onClick={() => void onConfirm()}>Confirmar eliminación</button> : null,
}))

vi.mock('@/components/detail/ReportDialog', () => ({
  ReportDialog: ({ open, onSuccess }: { open: boolean; onSuccess?: () => void }) =>
    open ? <button type="button" onClick={() => onSuccess?.()}>Enviar reporte de prueba</button> : null,
}))

vi.mock('@/components/detail/CommentEditor', () => ({
  CommentEditor: ({
    source,
    onSourceChange,
    onSubmit,
    onCancel,
    label,
    pending,
    error,
  }: {
    source: string
    onSourceChange: (value: string) => void
    onSubmit: (value: string) => void | Promise<void>
    onCancel?: () => void
    label: string
    pending: boolean
    error?: string
  }) => (
    <div>
      <textarea
        aria-label={label}
        value={source}
        onChange={(event) => onSourceChange(event.target.value)}
      />
      <button type="button" disabled={pending} onClick={() => void onSubmit(source)}>
        Guardar comentario
      </button>
      {onCancel ? <button type="button" onClick={onCancel}>Cancelar editor</button> : null}
      {error ? <p role="alert">{error}</p> : null}
    </div>
  ),
}))

vi.mock('@/components/detail/CommentMarkdown', () => ({
  CommentMarkdown: ({ source }: { source: string }) => <div>{source}</div>,
}))

const makeComment = (overrides: Partial<Comment> = {}): Comment => ({
  id: 'comment-1',
  author: { id: 'user-1', username: 'lector' },
  targetType: 'WORK',
  targetId: 'work-1',
  parentCommentId: null,
  rootCommentId: 'comment-1',
  bodyMarkdown: 'contenido inicial',
  status: 'ACTIVE',
  revision: 2,
  createdAt: '2026-01-01T00:00:00.000Z',
  editedAt: null,
  votes: { upvotes: 1, downvotes: 0, score: 1 },
  ...overrides,
})

const page = (items: Comment[], hasMore = false, nextCursor: CursorPage<Comment>['nextCursor'] = null) => ({
  items,
  hasMore,
  nextCursor,
})

function renderItem(comment = makeComment(), onRefreshComment = vi.fn()) {
  const onChange = vi.fn()
  const result = render(
    <CommentItem
      comment={comment}
      onChange={onChange}
      targetType="WORK"
      targetId="work-1"
      onRefreshComment={onRefreshComment}
    />,
  )
  return { ...result, onChange, onRefreshComment }
}

describe('CommentItem', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.voteComment.mockResolvedValue({ upvotes: 2, downvotes: 0, score: 2 })
    mocks.userId = 'user-1'
    mocks.createComment.mockResolvedValue(makeComment({
      id: 'reply-1',
      parentCommentId: 'comment-1',
      bodyMarkdown: 'respuesta creada',
    }))
    mocks.editComment.mockImplementation(async (id: string, bodyMarkdown: string, expectedRevision: number) =>
      makeComment({ id, bodyMarkdown, revision: expectedRevision + 1 }),
    )
    mocks.listReplies.mockResolvedValue(page([]))
  })

  it('no inventa una revisión al votar y vuelve a leer el comentario antes de editar', async () => {
    const latest = makeComment({ bodyMarkdown: 'versión actual', revision: 8 })
    const { onChange, onRefreshComment } = renderItem(
      makeComment(),
      vi.fn().mockResolvedValue(latest),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Votar a favor' }))

    await waitFor(() => expect(onChange).toHaveBeenCalled())
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({
      revision: 2,
      votes: { upvotes: 2, downvotes: 0, score: 2 },
    }))
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }))

    await waitFor(() => expect(onRefreshComment).toHaveBeenCalledWith('comment-1', null))
    expect(await screen.findByRole('textbox', { name: 'Editar comentario' })).toHaveValue('versión actual')
    fireEvent.change(screen.getByRole('textbox', { name: 'Editar comentario' }), {
      target: { value: '  **borrador sin recortar**  ' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar comentario' }))

    await waitFor(() => expect(mocks.editComment).toHaveBeenCalledWith(
      'comment-1',
      '  **borrador sin recortar**  ',
      8,
    ))
  })

  it('publica respuestas con fuente literal y no incrementa localmente la revisión padre', async () => {
    const { onChange } = renderItem()
    fireEvent.click(screen.getByRole('button', { name: 'Responder' }))
    const source = '  respuesta `con espacios`  '
    fireEvent.change(screen.getByRole('textbox', { name: 'Responder a lector' }), {
      target: { value: source },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar comentario' }))

    await waitFor(() => expect(mocks.createComment).toHaveBeenCalledWith(
      { parentCommentId: 'comment-1' },
      source,
    ))
    expect(onChange).not.toHaveBeenCalled()
    expect(await screen.findByText('respuesta creada')).toBeInTheDocument()
  })

  it('conserva el borrador tras conflicto y permite revisar la versión vigente antes de reintentar', async () => {
    const latest = makeComment({ bodyMarkdown: 'versión servidor', revision: 5 })
    const refresh = vi.fn().mockResolvedValue(latest)
    mocks.editComment
      .mockRejectedValueOnce(new ApiError('Conflict', 409))
      .mockResolvedValueOnce(makeComment({ bodyMarkdown: 'borrador propio', revision: 6 }))
    renderItem(makeComment(), refresh)

    fireEvent.click(screen.getByRole('button', { name: 'Editar' }))
    const editor = await screen.findByRole('textbox', { name: 'Editar comentario' })
    const draft = 'mi cambio que no se debe perder'
    fireEvent.change(editor, { target: { value: draft } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar comentario' }))

    expect(await screen.findByText('Versión vigente en el servidor')).toBeInTheDocument()
    expect(screen.getByText('versión servidor')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Editar comentario' })).toHaveValue(draft)
    expect(await screen.findByRole('alert')).toHaveTextContent('Tu borrador se conserva')
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar con mi borrador' }))

    await waitFor(() => expect(mocks.editComment).toHaveBeenLastCalledWith(
      'comment-1',
      draft,
      5,
    ))
    expect(refresh).toHaveBeenCalledWith('comment-1', null)
  })

  it('vuelve a consultar la revisión tras reportar antes de permitir la edición', async () => {
    const current = makeComment({ author: { id: 'user-2', username: 'otro' } })
    const refresh = vi.fn().mockResolvedValue(current)
    const { rerender } = renderItem(current, refresh)
    fireEvent.click(screen.getByRole('button', { name: 'Reportar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Enviar reporte de prueba' }))

    mocks.userId = 'user-2'
    rerender(
      <CommentItem
        comment={current}
        onChange={vi.fn()}
        targetType="WORK"
        targetId="work-1"
        onRefreshComment={refresh}
      />,
    )
    fireEvent.click(await screen.findByRole('button', { name: 'Editar' }))

    await waitFor(() => expect(refresh).toHaveBeenCalledWith('comment-1', null))
    expect(await screen.findByRole('textbox', { name: 'Editar comentario' })).toHaveValue('contenido inicial')
  })

  it('mantiene el indicador de borrado y deja consultar las respuestas sin restaurar texto', async () => {
    mocks.listReplies.mockResolvedValueOnce(page([
      makeComment({
        id: 'reply-1',
        author: null,
        parentCommentId: 'comment-1',
        rootCommentId: 'comment-1',
        bodyMarkdown: 'respuesta conservada',
      }),
    ]))
    renderItem(makeComment({ author: null, status: 'DELETED', bodyMarkdown: null }))

    expect(screen.getByText('Este comentario fue eliminado.')).toBeInTheDocument()
    expect(screen.getByText('Autor no disponible')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Ver respuestas' }))

    expect(await screen.findByText('respuesta conservada')).toBeInTheDocument()
    expect(screen.queryByText('contenido inicial')).not.toBeInTheDocument()
  })

  it('deduplica respuestas repetidas entre cursores y conserva el orden recibido', async () => {
    const firstReply = makeComment({
      id: 'reply-1',
      parentCommentId: 'comment-1',
      bodyMarkdown: 'primera respuesta',
    })
    const secondReply = makeComment({
      id: 'reply-2',
      parentCommentId: 'comment-1',
      bodyMarkdown: 'segunda respuesta',
    })
    mocks.listReplies
      .mockResolvedValueOnce(page([firstReply], true, {
        createdAt: '2026-01-01T00:00:00.000Z',
        id: 'reply-1',
      }))
      .mockResolvedValueOnce(page([firstReply, secondReply]))
    renderItem()

    fireEvent.click(screen.getByRole('button', { name: 'Ver respuestas' }))
    await screen.findByText('primera respuesta')
    fireEvent.click(screen.getByRole('button', { name: 'Ver más respuestas' }))

    await screen.findByText('segunda respuesta')
    expect(screen.getAllByText('primera respuesta')).toHaveLength(1)
    expect(mocks.listReplies).toHaveBeenNthCalledWith(
      2,
      'comment-1',
      { createdAt: '2026-01-01T00:00:00.000Z', id: 'reply-1' },
      20,
      expect.any(AbortSignal),
    )
  })
})
