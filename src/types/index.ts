export type SeriesType = 'Manhwa' | 'Manga' | 'Manhua' | 'Novela'

export type SeriesStatus = 'En emisión' | 'Finalizado' | 'En pausa'

export type ReadingMode = 'cascade' | 'paginated'

export type FavoriteStatus = 'Leyendo' | 'Por leer' | 'Completado' | 'En pausa'

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
  number: number
  title: string
  releaseDate: string
  views: number
  pages: ChapterPage[]
}

export interface Series {
  id: string
  slug: string
  title: string
  alternativeTitles: string[]
  coverUrl: string
  bannerUrl: string
  type: SeriesType
  status: SeriesStatus
  rating: number
  ratingCount: number
  views: number
  synopsis: string
  author: string
  artist: string
  scanlationGroup: string
  genres: string[]
  tags: string[]
  isFeatured: boolean
  totalChapters: number
  updatedAt: string
  accent: string
}

export interface CommentReply {
  id: string
  userName: string
  userAvatar: string
  content: string
  createdAt: string
}

export interface UserComment {
  id: string
  seriesId: string
  chapterNumber?: number
  userName: string
  userAvatar: string
  content: string
  createdAt: string
  likes: number
  spoiler: boolean
  replies: CommentReply[]
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
  status: FavoriteStatus
  addedAt: string
}

export interface ReadingProgress {
  seriesId: string
  chapterId: string
  chapterNumber: number
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

export type SortOption = 'recent' | 'rating' | 'views' | 'title'
