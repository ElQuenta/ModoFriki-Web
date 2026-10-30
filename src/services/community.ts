import { request } from '@/lib/api'
import type {
  Comment,
  CommentTargetType,
  Cursor,
  CursorPage,
  ReportReason,
  ReportStatus,
} from '@/types'

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'SPAM', label: 'Spam' },
  { value: 'HARASSMENT', label: 'Acoso' },
  { value: 'HATE', label: 'Discurso de odio' },
  { value: 'SPOILER', label: 'Spoiler' },
  { value: 'OTHER', label: 'Otro motivo' },
]

const cursorQuery = (cursor?: Cursor | null) => ({
  cursorCreatedAt: cursor?.createdAt,
  cursorId: cursor?.id,
})

export function listComments(
  targetType: CommentTargetType,
  targetId: string,
  cursor?: Cursor | null,
  limit = 20,
  signal?: AbortSignal,
) {
  return request<CursorPage<Comment>>('/comments', {
    query: { targetType, targetId, limit, ...cursorQuery(cursor) },
    signal,
  })
}

export function listReplies(
  parentCommentId: string,
  cursor?: Cursor | null,
  limit = 20,
  signal?: AbortSignal,
) {
  return request<CursorPage<Comment>>('/comments', {
    query: { parentCommentId, limit, ...cursorQuery(cursor) },
    signal,
  })
}

export function createComment(
  target:
    { targetType: CommentTargetType; targetId: string } | { parentCommentId: string },
  bodyMarkdown: string,
) {
  return request<Comment>('/comments', {
    method: 'POST',
    body: { ...target, bodyMarkdown },
  })
}

export function editComment(id: string, bodyMarkdown: string, expectedRevision: number) {
  return request<Comment>(`/comments/${id}`, {
    method: 'PATCH',
    body: { bodyMarkdown, expectedRevision },
  })
}

export function deleteComment(id: string) {
  return request<void>(`/comments/${id}`, { method: 'DELETE' })
}

export function voteComment(id: string, value: 1 | -1) {
  return request<Comment['votes']>(`/comments/${id}/vote`, {
    method: 'PUT',
    body: { value },
  })
}

export function removeVote(id: string) {
  return request<void>(`/comments/${id}/vote`, { method: 'DELETE' })
}

export function reportComment(id: string, reason: ReportReason, details?: string) {
  return request<unknown>(`/comments/${id}/reports`, {
    method: 'POST',
    body: { reason, ...(details ? { details } : {}) },
  })
}

export interface ModerationReport {
  id: string
  commentId: string
  reporterId: string
  reason: ReportReason
  details: string | null
  status: ReportStatus
  createdAt: string
  reviewedAt: string | null
  resolution: string | null
}

export function listReports(status?: ReportStatus, cursor?: Cursor | null, limit = 20) {
  return request<CursorPage<ModerationReport>>('/comment-reports', {
    query: { status, limit, ...cursorQuery(cursor) },
  })
}

export function resolveReport(
  id: string,
  status: 'RESOLVED' | 'DISMISSED',
  resolution: string,
) {
  return request<ModerationReport>(`/comment-reports/${id}`, {
    method: 'PATCH',
    body: { status, resolution },
  })
}
