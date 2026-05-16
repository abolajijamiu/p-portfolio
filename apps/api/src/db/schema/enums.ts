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
