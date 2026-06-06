export type UserRole = 'owner' | 'admin' | 'member' | 'client'

export type User = {
  id: string
  email: string
  name: string
  avatarUrl?: string | null
  role?: UserRole
  orgId?: string
}

export type ContentStatus = 'draft' | 'published' | 'archived'

export type CmsThemeFeature = { category: string; items: string[] }
export type CmsThemeLicense = { type: string; priceCents: number | null; description: string }
export type CmsProofMetric = { metric: string; label: string; period?: string }
export type CmsWorkComparison = { label: string; before: string; after: string }
export type CmsAuditFinding = {
  item: string
  before: string
  after: string
  severity: 'critical' | 'high' | 'medium'
}

export type CmsTheme = {
  id: string
  slug: string
  name: string
  tagline?: string | null
  description?: string | null
  category: string
  priceCents?: number | null
  highlights: string[]
  features: CmsThemeFeature[]
  licenses: CmsThemeLicense[]
  deliveryNotes: string[]
  bgClass?: string | null
  accentColor?: string | null
  checkoutUrl?: string | null
  demoStoreUrl?: string | null
  demoStoreNote?: string | null
  videoId?: string | null
  videoPlatform?: string | null
  heroMediaId?: string | null
  seoTitle?: string | null
  seoDescription?: string | null
  status: ContentStatus
  createdAt: string
  updatedAt: string
}

export type CmsWorkItem = {
  id: string
  slug: string
  client: string
  headline: string
  situation?: string | null
  category: string
  industry?: string | null
  year?: number | null
  duration?: string | null
  featured: boolean
  accentColor?: string | null
  scope: string[]
  stack: string[]
  proof: CmsProofMetric[]
  proofNote?: string | null
  actions: string[]
  comparisons: CmsWorkComparison[]
  hasComparison: boolean
  auditFindings: CmsAuditFinding[]
  videoId?: string | null
  videoPlatform?: string | null
  heroMediaId?: string | null
  seoTitle?: string | null
  seoDescription?: string | null
  status: ContentStatus
  createdAt: string
  updatedAt: string
}

export type MediaAssetType = 'screenshot' | 'thumbnail' | 'before' | 'after' | 'logo' | 'video-thumbnail'

export type ArticleCategory = 'audit' | 'ux' | 'seo' | 'funnel' | 'commerce'

export const ARTICLE_CATEGORY_LABELS: Record<ArticleCategory, string> = {
  audit: 'Shopify Audit',
  ux: 'UX Teardown',
  seo: 'SEO Analysis',
  funnel: 'Funnel Breakdown',
  commerce: 'Commerce Optimization',
}

export type CmsArticle = {
  id: string
  slug: string
  title: string
  subtitle?: string | null
  category: ArticleCategory
  tags: string[]
  body?: string | null
  excerpt?: string | null
  client?: string | null
  workSlug?: string | null
  featured: boolean
  proof: CmsProofMetric[]
  comparisons: CmsWorkComparison[]
  heroMediaId?: string | null
  readingMinutes?: number | null
  seoTitle?: string | null
  seoDescription?: string | null
  status: ContentStatus
  publishedAt?: string | null
  createdAt: string
  updatedAt: string
}

export type CmsMedia = {
  id: string
  storageKey: string
  originalName?: string | null
  alt?: string | null
  caption?: string | null
  assetType: MediaAssetType
  mimeType?: string | null
  sizeBytes?: number | null
  width?: number | null
  height?: number | null
  createdAt: string
}

export type CmsTestimonial = {
  id: string
  client: string
  role?: string | null
  company?: string | null
  quote: string
  workSlug?: string | null
  featured: boolean
  status: ContentStatus
  createdAt: string
  updatedAt: string
}

export type InquiryStatus = 'new' | 'read' | 'replied' | 'archived'

export type CmsInquiry = {
  id: string
  name: string
  email: string
  company?: string | null
  budget?: string | null
  message: string
  inquiryType?: string | null
  themeSlug?: string | null
  intent?: string | null
  status: InquiryStatus
  createdAt: string
}

export type CampaignStatus    = 'draft' | 'scheduled' | 'active' | 'paused' | 'archived'
export type CampaignPlacement = 'announcement_bar' | 'inline' | 'sticky_footer' | 'exit_intent'

export type Campaign = {
  id: string
  name: string
  status: CampaignStatus
  priority: number
  placement: CampaignPlacement
  inlineHook?: string | null
  heading?: string | null
  body?: string | null
  ctaLabel?: string | null
  ctaUrl?: string | null
  ctaNewTab: boolean
  secondaryCtaLabel?: string | null
  secondaryCtaUrl?: string | null
  dismissible: boolean
  themeStyle?: string | null
  animation?: string | null
  audience: string
  pagePattern?: string | null
  deviceTarget: string
  startAt?: string | null
  endAt?: string | null
  impressionCap?: number | null
  frequencyCapHours?: number | null
  // Trigger
  triggerType: string
  triggerDelay?: number | null
  triggerScrollDepth?: number | null
  // Behavior
  duration?: number | null
  collapseToWidget: boolean
  position: string
  oncePerSession: boolean
  untilConversion: boolean
  // Sequences
  sequenceId?: string | null
  sequencePosition?: number | null
  sequenceCondition?: string | null
  createdAt: string
  updatedAt: string
}

export type CampaignAnalytics = {
  impressions: number
  uniqueViewers: number
  clicks: number
  dismissals: number
  conversions: number
  clickRate: number
  dismissRate: number
  conversionRate: number
}

export type ProjectStatus = 'draft' | 'active' | 'review' | 'complete' | 'archived'

export type Project = {
  id: string
  name: string
  description?: string | null
  status: ProjectStatus
  dueDate?: string | null
  createdAt: string
}

export type Message = {
  id: string
  body: string
  parentId?: string | null
  createdAt: string
  sender: { id: string; name: string; avatarUrl?: string | null }
}

export type ProjectFile = {
  id: string
  name: string
  mimeType?: string | null
  sizeBytes?: number | null
  createdAt: string
  uploadedBy: { id: string; name: string }
}

export type NotificationType =
  | 'message_received'
  | 'file_uploaded'
  | 'project_status_changed'
  | 'mention'
  | 'invite_accepted'

export type Notification = {
  id: string
  type: NotificationType
  title: string
  body?: string | null
  read: boolean
  link?: string | null
  createdAt: string
}
