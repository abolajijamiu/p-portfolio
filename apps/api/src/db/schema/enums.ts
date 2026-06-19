import { pgEnum } from 'drizzle-orm/pg-core'

export const memberRoleEnum = pgEnum('member_role', [
  'owner',
  'admin',
  'expert',
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
  'order_placed',
  'order_delivered',
  'order_completed',
  'order_assigned',
  'booking_confirmed',
  'support_reply',
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
  'consultation',
  'analytics',
])

export const serviceCategoryEnum = pgEnum('service_category', [
  'development',
  'marketing',
  'branding',
  'ai_analytics',
  'ecommerce',
  'consulting',
  'publishing',
  'technical',
  'premium',
])

export const serviceOrderStatusEnum = pgEnum('service_order_status', [
  'pending',
  'payment_received',
  'requirements_needed',
  'requirements_submitted',
  'assigned',
  'in_progress',
  'waiting_for_client',
  'delivered',
  'revision_requested',
  'approved',
  'completed',
  'cancelled',
])

export const orderMessageTypeEnum = pgEnum('order_message_type', [
  'message',
  'system',
  'delivery',
  'revision_request',
  'revision_delivery',
])

export const resourceCategoryEnum = pgEnum('resource_category', [
  'template',
  'plugin',
  'guide',
  'tool',
  'starter_kit',
  'design_asset',
  'course',
  'font',
])

export const resourcePurchaseStatusEnum = pgEnum('resource_purchase_status', [
  'pending_payment',
  'active',
  'expired',
  'refunded',
])

export const bookingStatusEnum = pgEnum('booking_status', [
  'pending',
  'confirmed',
  'cancelled',
  'completed',
  'no_show',
])

export const bookingSlotStatusEnum = pgEnum('booking_slot_status', [
  'available',
  'booked',
  'blocked',
])

export const bookingCategoryEnum = pgEnum('booking_category', [
  'consultation',
  'strategy',
  'design_review',
  'technical',
  'onboarding',
  'other',
])

export const supportTicketStatusEnum = pgEnum('support_ticket_status', [
  'open',
  'in_progress',
  'closed',
])

export const supportTicketPriorityEnum = pgEnum('support_ticket_priority', [
  'low',
  'normal',
  'high',
  'urgent',
])

export const supportTicketCategoryEnum = pgEnum('support_ticket_category', [
  'general',
  'billing',
  'technical',
  'orders',
  'resources',
  'analytics',
  'consultations',
])

export const serviceDeliverableStatusEnum = pgEnum('service_deliverable_status', [
  'pending',
  'in_progress',
  'submitted',
  'revision_requested',
  'approved',
  'completed',
])
