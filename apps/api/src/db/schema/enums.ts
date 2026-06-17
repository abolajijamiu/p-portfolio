import { pgEnum } from 'drizzle-orm/pg-core'

export const memberRoleEnum = pgEnum('member_role', [
  'owner',
  'admin',
  'member',
  'client',
])

export const projectStatusEnum = pgEnum('project_status', [
  'draft',
  'active',
  'review',
  'complete',
  'archived',
])

export const notificationTypeEnum = pgEnum('notification_type', [
  'message_received',
  'file_uploaded',
  'project_status_changed',
  'mention',
  'invite_accepted',
  'order_received',
])

export const contentStatusEnum = pgEnum('content_status', [
  'draft',
  'published',
  'archived',
])

export const mediaAssetTypeEnum = pgEnum('media_asset_type', [
  'screenshot',
  'thumbnail',
  'before',
  'after',
  'logo',
  'video-thumbnail',
])

export const inquiryStatusEnum = pgEnum('inquiry_status', [
  'new',
  'read',
  'replied',
  'archived',
])

export const articleCategoryEnum = pgEnum('article_category', [
  'audit',
  'ux',
  'seo',
  'funnel',
  'commerce',
])

export const commerceOrderStatusEnum = pgEnum('commerce_order_status', [
  'pending',
  'processing',
  'completed',
  'cancelled',
  'refunded',
  'failed',
])

export const deliverableStatusEnum = pgEnum('deliverable_status', [
  'pending',
  'in_progress',
  'completed',
  'cancelled',
])

export const deliverableCategoryEnum = pgEnum('deliverable_category', [
  'theme',
  'support',
  'custom_project',
  'license',
  'service',
])
