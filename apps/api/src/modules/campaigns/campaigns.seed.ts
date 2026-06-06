/**
 * Seed starter campaigns.
 * Run with: npx tsx src/modules/campaigns/campaigns.seed.ts
 * Safe to run multiple times — skips campaigns whose name already exists.
 */

import 'dotenv/config'
import { eq } from 'drizzle-orm'
import { db } from '../../db/client'
import { campaigns } from '../../db/schema'

const CAMPAIGNS = [
  // ─── 1. Fiverr Starter Offer ─────────────────────────────────────────────
  {
    name:     'Fiverr Starter Offer',
    status:   'active' as const,
    priority: 20,
    placement: 'inline' as const,

    heading:    'Launch Your Shopify Store for $5',
    body:       'Professional store setup by a vetted Shopify developer. No hidden fees, no back-and-forth — just a clean, working store.',
    ctaLabel:   'Message on Fiverr',
    ctaUrl:     'https://www.fiverr.com/deempiretech',
    ctaNewTab:  true,
    dismissible: true,

    triggerType:  'time_delay',
    triggerDelay: 12,
    position:     'bottom-right',
    duration:     20,
    collapseToWidget: true,
    oncePerSession:   true,
    untilConversion:  true,
  },

  // ─── 2. Free Store Audit ─────────────────────────────────────────────────
  {
    name:     'Free Store Audit',
    status:   'active' as const,
    priority: 30,
    placement: 'inline' as const,

    heading:    'Get a Free Shopify Audit',
    body:       "Share your store URL. We'll review your setup and pinpoint what's holding back performance — no strings, no pitch.",
    ctaLabel:   'Request Your Audit',
    ctaUrl:     '/contact',
    ctaNewTab:  false,
    dismissible: true,

    triggerType:        'scroll_depth',
    triggerScrollDepth: 70,
    position:           'bottom-right',
    oncePerSession:     true,
    untilConversion:    true,
  },

  // ─── 3. Theme Customisation ───────────────────────────────────────────────
  {
    name:     'Theme Customisation',
    status:   'active' as const,
    priority: 40,
    placement: 'inline' as const,

    heading:    'Want This Theme Your Way?',
    body:       'We adapt any theme to your brand — colours, layout, typography, or a full rework. Tell us what you need.',
    ctaLabel:   'Request Customisation',
    ctaUrl:     '/contact',
    ctaNewTab:  false,
    dismissible: true,

    triggerType:    'time_delay',
    triggerDelay:   8,
    pagePattern:    '/themes',    // shown only on /themes and /themes/* pages
    position:       'bottom-right',
    oncePerSession: true,
    untilConversion: true,
  },

  // ─── 4. Strategy Consultation ────────────────────────────────────────────
  {
    name:     'Strategy Consultation',
    status:   'active' as const,
    priority: 50,
    placement: 'inline' as const,

    heading:    'Ready to Take It Further?',
    body:       "A focused 30-minute call to map out what's next for your business. No pitch — just direction.",
    ctaLabel:   'Book a Consultation',
    ctaUrl:     '/contact',
    ctaNewTab:  false,
    dismissible: true,

    triggerType:       'returning_visitor',
    triggerDelay:      3,
    position:          'bottom-right',
    frequencyCapHours: 72,
    oncePerSession:    false,
    untilConversion:   true,
  },

  // ─── 5. Black Friday Promotion ────────────────────────────────────────────
  {
    name:     'Black Friday — 30% Off All Themes',
    status:   'scheduled' as const,
    priority: 1,
    placement: 'announcement_bar' as const,

    heading:    'Black Friday: 30% Off All Themes',
    body:       'Our biggest discount of the year. Valid through the weekend — use code BF30 at checkout.',
    ctaLabel:   'View Themes',
    ctaUrl:     '/themes',
    ctaNewTab:  false,
    dismissible: true,

    triggerType:      'immediate',
    position:         'top',
    oncePerSession:   false,
    untilConversion:  false,
    startAt:          new Date('2026-11-27T00:00:00Z'),
    endAt:            new Date('2026-12-01T23:59:59Z'),
  },
]

async function seed() {
  console.log('Seeding campaigns...\n')

  for (const data of CAMPAIGNS) {
    const existing = await db.query.campaigns.findFirst({
      where: eq(campaigns.name, data.name),
    })

    if (existing) {
      console.log(`  – ${data.name} (already exists, skipping)`)
      continue
    }

    await db.insert(campaigns).values(data as any)
    console.log(`  ✓ ${data.name}`)
  }

  console.log('\nSeed complete.')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
