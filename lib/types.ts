// =============================================================================
// ClearGuide — Shared TypeScript types matching the DB schema
// =============================================================================

// ---------------------------------------------------------------------------
// Enums (mirror pgEnum values)
// ---------------------------------------------------------------------------
export type ManualStatus = 'draft' | 'processing' | 'published' | 'archived'
export type ChatRole = 'user' | 'assistant'
export type ViewMode = 'web' | 'ar' | 'qr' | 'direct'

// ---------------------------------------------------------------------------
// Better Auth tables
// ---------------------------------------------------------------------------
export interface User {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image: string | null
  createdAt: string
  updatedAt: string
}

export interface Session {
  id: string
  expiresAt: string
  token: string
  createdAt: string
  updatedAt: string
  ipAddress: string | null
  userAgent: string | null
  userId: string
}

// ---------------------------------------------------------------------------
// App: manuals
// ---------------------------------------------------------------------------
export interface Manual {
  id: string
  userId: string
  productName: string
  productModel: string | null
  brand: string | null
  description: string | null
  status: ManualStatus
  languages: string[]
  coverImage: string | null
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

/** Lightweight list item used in dashboard cards */
export interface ManualListItem
  extends Pick<Manual, 'id' | 'productName' | 'productModel' | 'brand' | 'status' | 'languages' | 'coverImage' | 'createdAt' | 'updatedAt'> {
  sectionCount: number
  /** Total view events from the analytics table */
  viewCount: number
  /** Average time spent per view session, in seconds */
  avgTimeSeconds: number
}

// ---------------------------------------------------------------------------
// Dashboard-level analytics
// ---------------------------------------------------------------------------
export interface DashboardKPI {
  totalManuals: number
  publishedManuals: number
  totalViews: number
  activeUsers: number
  /** % change in views vs prior 30-day period */
  trendViews?: number
  /** % change in active users vs prior 30-day period */
  trendUsers?: number
}

export interface ActivityEvent {
  id: string
  manualName: string
  manualId: string
  mode: ViewMode
  timeSpentSeconds: number
  viewedAt: string
}

export interface DashboardAnalytics {
  kpi: DashboardKPI
  recentActivity: ActivityEvent[]
}

// ---------------------------------------------------------------------------
// App: manual_sections
// ---------------------------------------------------------------------------
export interface ManualSection {
  id: string
  manualId: string
  sectionNumber: number
  title: string
  content: string | null
  imageUrls: string[]
  videoUrls: string[]
  createdAt: string
  updatedAt: string
}

// ---------------------------------------------------------------------------
// App: translations
// ---------------------------------------------------------------------------
export interface Translation {
  id: string
  manualId: string
  sectionId: string
  language: string
  translatedContent: string
  createdAt: string
  updatedAt: string
}

// ---------------------------------------------------------------------------
// App: manual_knowledge_base
// ---------------------------------------------------------------------------
export interface KnowledgeBaseChunk {
  text: string
  embeddingId: string
  sectionId: string
}

export interface ManualKnowledgeBase {
  id: string
  manualId: string
  chunks: KnowledgeBaseChunk[]
  modelVersion: string | null
  indexedAt: string | null
  createdAt: string
  updatedAt: string
}

// ---------------------------------------------------------------------------
// App: analytics
// ---------------------------------------------------------------------------
export interface AnalyticsEvent {
  id: string
  manualId: string
  userSessionId: string
  mode: ViewMode
  timeSpentSeconds: number
  viewedAt: string
  createdAt: string
}

/** Aggregated stats returned for dashboard charts */
export interface ManualAnalyticsSummary {
  manualId: string
  totalViews: number
  uniqueSessions: number
  avgTimeSpentSeconds: number
  viewsByMode: Record<ViewMode, number>
  viewsLast30Days: number
}

// ---------------------------------------------------------------------------
// App: ai_chat_history
// ---------------------------------------------------------------------------
export interface AiChatMessage {
  id: string
  manualId: string
  userSessionId: string
  role: ChatRole
  message: string
  tokenCount: number
  createdAt: string
}

// ---------------------------------------------------------------------------
// Community — user roles
// ---------------------------------------------------------------------------
export type UserType = 'manufacturer' | 'end_user'

// ---------------------------------------------------------------------------
// Community — product reviews
// ---------------------------------------------------------------------------
export interface ProductReview {
  id: string
  manualId: string
  userId: string
  rating: 1 | 2 | 3 | 4 | 5
  title: string | null
  body: string
  helpfulCount: number
  createdAt: string
  updatedAt: string
  author?: { name: string; image: string | null }
}

// ---------------------------------------------------------------------------
// Community — forum threads
// ---------------------------------------------------------------------------
export interface ForumThread {
  id: string
  manualId: string
  userId: string
  title: string
  body: string
  isPinned: boolean
  isSolved: boolean
  replyCount: number
  createdAt: string
  updatedAt: string
  author?: { name: string; image: string | null }
  manualName?: string
  productBrand?: string
}

// ---------------------------------------------------------------------------
// Community — forum replies
// ---------------------------------------------------------------------------
export interface ForumReply {
  id: string
  threadId: string
  userId: string
  body: string
  isSolution: boolean
  createdAt: string
  updatedAt: string
  author?: { name: string; image: string | null }
}

// ---------------------------------------------------------------------------
// API response wrappers
// ---------------------------------------------------------------------------
export interface ApiSuccess<T> {
  data: T
  error: null
}

export interface ApiError {
  data: null
  error: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError
