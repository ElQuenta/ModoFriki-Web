export type SeriesType = string

export type SeriesStatus = 'En emisión' | 'Finalizado' | 'En pausa' | 'Cancelado'

export type ReleaseStatus = 'ONGOING' | 'COMPLETED' | 'HIATUS' | 'CANCELLED'

export type PublicationStatus = 'DRAFT' | 'PUBLISHED'

export type ChapterKind = 'NORMAL' | 'EXTRA' | 'ANNOUNCEMENT'

export type ReadingMode = 'cascade' | 'paginated'

export type UserRole = 'BASIC' | 'EDITOR' | 'ADMIN'

export interface ChapterPage {
  id: string
  pageNumber: number
  imageUrl: string
  caption?: string
  dialogue?: string
}

export interface Chapter {
  id: string
  seriesId: string
  /** Decimal serializado por el backend ("12.5"). */
  number: string
  title: string
  kind?: ChapterKind
  status?: PublicationStatus
  version?: number
  releaseDate: string
  views?: number
  pages: ChapterPage[]
}

export interface Taxonomy {
  id: string
  name: string
  slug: string
}

export interface Series {
  id: string
  slug: string
  title: string
  alternativeTitles: string[]
  coverUrl: string
  bannerUrl: string
  type: SeriesType
  typeId?: string
  status?: SeriesStatus
  releaseStatus?: ReleaseStatus
  publicationStatus?: PublicationStatus
  rating?: number
  ratingCount?: number
  views?: number
  synopsis: string
  genres: string[]
  genreItems?: Taxonomy[]
  updatedAt?: string
  totalChapters?: number
  isFeatured?: boolean
  accent?: string
  author?: string
  artist?: string
  scanlationGroup?: string
  tags?: string[]
}

export interface LatestChapterItem {
  chapter: Chapter
  series: Series
}

export type CommentTargetType = 'WORK' | 'CHAPTER'

export type ReportReason = 'SPAM' | 'HARASSMENT' | 'HATE' | 'SPOILER' | 'OTHER'

export type ReportStatus = 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'DISMISSED'

export interface Comment {
  id: string
  author: { id: string; username: string } | null
  targetType: CommentTargetType
  targetId: string
  parentCommentId: string | null
  rootCommentId: string
  bodyMarkdown: string | null
  status: 'ACTIVE' | 'DELETED'
  revision: number
  createdAt: string
  editedAt: string | null
  votes: { upvotes: number; downvotes: number; score: number }
}

export interface Cursor {
  createdAt: string
  id: string
}

export interface CursorPage<T> {
  items: T[]
  hasMore: boolean
  nextCursor: Cursor | null
}

export interface UserPreferences {
  readerMode: ReadingMode
  readingWidth: 'compact' | 'normal' | 'wide'
  reduceMotion: boolean
}

export interface User {
  id: string
  username: string
  email: string
  role: UserRole
  timezone: string
  createdAt: string
}

export interface AuthSession {
  user: User
  token: string
}

export interface FavoriteItem {
  seriesId: string
  addedAt: string
  series: Series
}

export interface ReadingProgress {
  seriesId: string
  chapterId: string
  chapterNumber: string
  page: number
  totalPages: number
  percentage: number
  updatedAt: string
}

export interface ReaderSettings {
  mode: ReadingMode
  width: 'compact' | 'normal' | 'wide'
  zoom: number
}

export type SortOption = 'recent' | 'views'
