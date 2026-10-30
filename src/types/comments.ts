import type { CommentTargetType } from './index'

export type CommentDraftStatus = 'idle' | 'submitting' | 'conflict' | 'error'

export interface CommentDraft {
  ownerScope: string
  targetType: CommentTargetType
  targetId: string
  parentCommentId?: string
  commentId?: string
  baseRevision?: number
  source: string
  status: CommentDraftStatus
}
