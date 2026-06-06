import { boolean, index, integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { id, timestamps } from './common'
import { users } from './users'

export const campaignStatusEnum = pgEnum('campaign_status', [
  'draft', 'scheduled', 'active', 'paused', 'archived',
])

export const campaignPlacementEnum = pgEnum('campaign_placement', [
  'announcement_bar', 'inline', 'sticky_footer', 'exit_intent',
])

export const campaignEventTypeEnum = pgEnum('campaign_event_type', [
  'impression', 'click', 'dismiss', 'convert',
])

export const campaigns = pgTable('campaigns', {
  ...id,

  name:     text('name').notNull(),
  status:   campaignStatusEnum('status').notNull().default('draft'),
  priority: integer('priority').notNull().default(50),

  // Placement
  placement:  campaignPlacementEnum('placement').notNull().default('announcement_bar'),
  inlineHook: text('inline_hook'),

  // Content
  heading:           text('heading'),
  body:              text('body'),
  ctaLabel:          text('cta_label'),
  ctaUrl:            text('cta_url'),
  ctaNewTab:         boolean('cta_new_tab').notNull().default(false),
  secondaryCtaLabel: text('secondary_cta_label'),
  secondaryCtaUrl:   text('secondary_cta_url'),
  dismissible:       boolean('dismissible').notNull().default(true),

  // Display
  themeStyle: text('theme_style').default('default'),  // default | minimal | emphasis
  animation:  text('animation').default('none'),       // none | fade | slide
  bgColor:    text('bg_color'),                        // hex e.g. #1dbf73
  textColor:  text('text_color'),                      // hex e.g. #ffffff

  // Targeting
  audience:     text('audience').notNull().default('all'),    // all | authenticated | anonymous
  pagePattern:  text('page_pattern'),                         // glob, null = everywhere
  deviceTarget: text('device_target').notNull().default('all'), // all | mobile | desktop

  // Scheduling
  startAt: timestamp('start_at', { withTimezone: true }),
  endAt:   timestamp('end_at',   { withTimezone: true }),

  // Frequency
  impressionCap:     integer('impression_cap'),      // null = unlimited
  frequencyCapHours: integer('frequency_cap_hours'), // null = no cooldown

  // Trigger
  triggerType:       text('trigger_type').notNull().default('immediate'), // immediate | time_delay | scroll_depth | exit_intent | returning_visitor
  triggerDelay:      integer('trigger_delay'),        // seconds after page load
  triggerScrollDepth: integer('trigger_scroll_depth'), // 0–100 percent

  // Behavior
  duration:         integer('duration'),              // auto-dismiss after N seconds; null = persistent
  collapseToWidget: boolean('collapse_to_widget').notNull().default(false),
  position:         text('position').notNull().default('bottom-right'), // top | bottom-left | bottom-right | bottom-center
  oncePerSession:   boolean('once_per_session').notNull().default(false),
  untilConversion:  boolean('until_conversion').notNull().default(false),

  // Sequences
  sequenceId:        uuid('sequence_id'),
  sequencePosition:  integer('sequence_position'),
  sequenceCondition: text('sequence_condition').default('seen'), // seen | dismissed | clicked | converted | not_converted

  // Analytics
  conversionValue: integer('conversion_value'), // cents; null = revenue not tracked

  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  ...timestamps,
}, (t) => ({
  statusIdx:    index('campaigns_status_idx').on(t.status),
  placementIdx: index('campaigns_placement_idx').on(t.placement),
  priorityIdx:  index('campaigns_priority_idx').on(t.priority),
}))

export const campaignEvents = pgTable('campaign_events', {
  id:         uuid('id').defaultRandom().primaryKey(),
  campaignId: uuid('campaign_id').notNull().references(() => campaigns.id, { onDelete: 'cascade' }),
  eventType:  campaignEventTypeEnum('event_type').notNull(),
  userKey:    text('user_key').notNull(),
  page:       text('page'),
  device:     text('device'),
  createdAt:  timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  campaignIdx:  index('campaign_events_campaign_idx').on(t.campaignId),
  userKeyIdx:   index('campaign_events_user_key_idx').on(t.userKey),
  typeIdx:      index('campaign_events_type_idx').on(t.eventType),
  createdAtIdx: index('campaign_events_created_at_idx').on(t.createdAt),
}))

export type Campaign      = typeof campaigns.$inferSelect
export type NewCampaign   = typeof campaigns.$inferInsert
export type CampaignEvent = typeof campaignEvents.$inferSelect
