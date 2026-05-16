/**
 * Seed script: migrate hardcoded content (themes.ts / work.ts) into the CMS tables.
 *
 * Run with: npx tsx src/modules/cms/cms.seed.ts
 *
 * Safe to run multiple times — uses ON CONFLICT (slug) DO UPDATE.
 */

import 'dotenv/config'
import { sql } from 'drizzle-orm'
import { db } from '../../db/client'
import { cmsThemes, cmsWork } from '../../db/schema'

// ─── Hardcoded theme data (mirrors themes.ts) ─────────────────────────────────

const THEMES = [
  {
    slug: 'cascade',
    name: 'Cascade',
    tagline: 'Minimal. Editorial. Built to sell.',
    description:
      'A lean Shopify theme for fashion, lifestyle, and beauty brands that want their product to do the talking. Zero visual noise, maximum conversion clarity.',
    category: 'fashion',
    priceCents: 28000,
    bgClass: 'bg-[#f0eeeb]',
    accentColor: '#b5a898',
    highlights: ['Quick buy', 'Bundles', 'Back-in-stock', 'Lookbook', 'No jQuery'],
    features: [
      {
        category: 'Commerce',
        items: [
          'Quick buy with full variant selector',
          'Sticky add-to-cart bar on scroll',
          'Back-in-stock email capture',
          'Product bundles support',
          'Recently viewed rail',
        ],
      },
      {
        category: 'Design',
        items: [
          '4 preset colour schemes',
          'Full typographic control',
          'Mega menu with image panels',
          'Lookbook and campaign sections',
          'Parallax hero',
        ],
      },
      {
        category: 'Performance',
        items: [
          '100 Lighthouse performance score',
          'Lazy-loaded images throughout',
          'Critical CSS inlined',
          'No jQuery dependency',
        ],
      },
    ],
    licenses: [
      { type: 'Single store', priceCents: 28000, description: 'One Shopify store. Unlimited use.' },
      { type: 'Multi-store', priceCents: 56000, description: 'Up to 5 stores under one brand.' },
      { type: 'Agency license', priceCents: 120000, description: 'Unlimited client installs.' },
    ],
    demoStoreNote: 'Development store preview available — typically set up within 2 business days of request.',
    deliveryNotes: [
      'Shopify .zip + full source (Liquid, CSS, JS)',
      'Written setup guide and section documentation',
      'One 60-minute onboarding call',
      '30 days of email support post-delivery',
    ],
  },
  {
    slug: 'grid',
    name: 'Grid',
    tagline: 'Product-first. Dense. Fast.',
    description:
      'Built for stores with large catalogues — electronics, tech, hardware, sporting goods. Optimised for category browsing, product comparison, and repeat purchase behaviour.',
    category: 'electronics',
    priceCents: 32000,
    bgClass: 'bg-[#eaecf0]',
    accentColor: '#64748b',
    highlights: ['Faceted search', 'Comparison', 'Bulk cart', 'Spec tables', 'Pre-order'],
    features: [
      {
        category: 'Commerce',
        items: [
          'Advanced filtering with faceted search',
          'Product comparison up to 4 items',
          'Bulk add to cart',
          'Pre-order support with messaging',
          'Loyalty points display',
        ],
      },
      {
        category: 'Design',
        items: [
          'Dense product grids (3/4/5 column)',
          'Spec table layout on PDP',
          'Tab-based product detail',
          'Category landing page template',
          'Sale and badge system',
        ],
      },
      {
        category: 'Performance',
        items: [
          'Predictive search with instant results',
          'Infinite scroll or pagination toggle',
          'Image CDN integration',
        ],
      },
    ],
    licenses: [
      { type: 'Single store', priceCents: 32000, description: 'One Shopify store. Unlimited use.' },
      { type: 'Multi-store', priceCents: 64000, description: 'Up to 5 stores under one brand.' },
      { type: 'Agency license', priceCents: 140000, description: 'Unlimited client installs.' },
    ],
    demoStoreNote: 'Development store preview available — configured with sample electronics catalogue.',
    deliveryNotes: [
      'Shopify .zip + full source (Liquid, CSS, JS)',
      'Written setup guide and section documentation',
      'One 60-minute onboarding call',
      '30 days of email support post-delivery',
    ],
  },
  {
    slug: 'crest',
    name: 'Crest',
    tagline: 'Luxury without compromise.',
    description:
      'A premium Shopify theme for jewellery, watches, and high-end brands. Editorial presentation, white-glove UX, and the conversion architecture that luxury retail requires.',
    category: 'luxury',
    priceCents: null, // custom
    bgClass: 'bg-[#f0edea]',
    accentColor: '#8b7355',
    highlights: ['Personalisation', 'Gifting suite', 'VIP pricing', 'Video hero', 'AR-ready'],
    features: [
      {
        category: 'Commerce',
        items: [
          'Custom engraving and personalisation',
          'Gifting suite — wrapping, notes, scheduling',
          'VIP and wholesale price tiers',
          'Request a quote flow',
          'Try-at-home integration ready',
        ],
      },
      {
        category: 'Design',
        items: [
          'Full-bleed editorial photography layout',
          'Video background hero',
          'Refined animation system',
          'Serif typographic system',
          'Multi-image zoom and 360 view',
        ],
      },
      {
        category: 'Performance',
        items: [
          'Video optimisation with poster frames',
          'AR product preview infrastructure',
          'Priority image loading on PDP',
        ],
      },
    ],
    licenses: [
      { type: 'Single store', priceCents: null, description: 'Scoped to your specific requirements.' },
      { type: 'Multi-store', priceCents: null, description: 'Multiple brand or market configurations.' },
    ],
    demoStoreNote: 'Development store with jewellery and watches catalogue available on request.',
    deliveryNotes: [
      'Shopify .zip + full source (Liquid, CSS, JS)',
      'Bespoke setup aligned to your catalogue structure',
      'Two onboarding calls included',
      '60 days of priority support post-delivery',
    ],
  },
  {
    slug: 'folio',
    name: 'Folio',
    tagline: 'Content and commerce, finally balanced.',
    description:
      'For brands where the story sells the product — food, wellness, beauty, and artisan goods. Built-in editorial system with recipe and guide support.',
    category: 'food',
    priceCents: 26000,
    bgClass: 'bg-[#eef0eb]',
    accentColor: '#5a6344',
    highlights: ['Subscriptions', 'Bundle builder', 'Recipe layouts', 'Before/after', 'Ingredient callouts'],
    features: [
      {
        category: 'Commerce',
        items: [
          'Subscription product support (Recharge ready)',
          'Bundle builder with live pricing',
          'Free gift with purchase logic',
          'Ingredient transparency layout',
          'Reorder shortcuts for repeat buyers',
        ],
      },
      {
        category: 'Content',
        items: [
          'Recipe and guide template',
          'Long-form article layout',
          'Ingredient callout blocks',
          'Expert quote and testimonial sections',
          'Before/after comparison section',
        ],
      },
      {
        category: 'Design',
        items: [
          'Warm editorial palette system',
          'Variable font support',
          'Pull quote sections',
          'Full-width campaign imagery',
        ],
      },
    ],
    licenses: [
      { type: 'Single store', priceCents: 26000, description: 'One Shopify store. Unlimited use.' },
      { type: 'Multi-store', priceCents: 52000, description: 'Up to 5 stores under one brand.' },
      { type: 'Agency license', priceCents: 110000, description: 'Unlimited client installs.' },
    ],
    demoStoreNote: 'Development store with food, wellness, and supplements catalogue on request.',
    deliveryNotes: [
      'Shopify .zip + full source (Liquid, CSS, JS)',
      'Written setup guide and section documentation',
      'One 60-minute onboarding call',
      '30 days of email support post-delivery',
    ],
  },
  {
    slug: 'vault',
    name: 'Vault',
    tagline: 'Every element earns its place.',
    description:
      'An opinionated D2C theme built around one principle: every element either earns its place through conversion data or gets cut.',
    category: 'dtc',
    priceCents: 34000,
    bgClass: 'bg-[#f0eaea]',
    accentColor: '#7c3f3f',
    highlights: ['Post-purchase upsell', 'Cart upsells', 'Quantity breaks', 'Review integration', 'A/B ready'],
    features: [
      {
        category: 'Conversion',
        items: [
          'One-click post-purchase upsell',
          'Cart drawer with upsell slots',
          'Quantity discount display',
          'Abandoned cart social proof block',
          'Urgency and scarcity system',
        ],
      },
      {
        category: 'Trust',
        items: [
          'Review imports — Okendo, Yotpo, Judge.me',
          'Trust badge system with custom icons',
          'Live visitor count widget',
          'Stock level display',
          'Guarantee and returns block',
        ],
      },
      {
        category: 'Analytics',
        items: [
          'GA4 and Meta Pixel ready',
          'Section-level A/B test infrastructure',
          'Heatmap-compatible markup (Hotjar, Microsoft Clarity)',
        ],
      },
    ],
    licenses: [
      { type: 'Single store', priceCents: 34000, description: 'One Shopify store. Unlimited use.' },
      { type: 'Multi-store', priceCents: 68000, description: 'Up to 5 stores under one brand.' },
      { type: 'Agency license', priceCents: 150000, description: 'Unlimited client installs.' },
    ],
    demoStoreNote: 'Development store configured with supplements and D2C catalogue — email flows pre-wired.',
    deliveryNotes: [
      'Shopify .zip + full source (Liquid, CSS, JS)',
      'Written setup guide and section documentation',
      'One 60-minute onboarding call',
      '30 days of email support post-delivery',
    ],
  },
]

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('Seeding CMS themes...')

  for (const theme of THEMES) {
    await db
      .insert(cmsThemes)
      .values({
        slug: theme.slug,
        name: theme.name,
        tagline: theme.tagline,
        description: theme.description,
        category: theme.category,
        priceCents: theme.priceCents,
        bgClass: theme.bgClass,
        accentColor: theme.accentColor,
        highlights: theme.highlights,
        features: theme.features,
        licenses: theme.licenses,
        deliveryNotes: theme.deliveryNotes,
        demoStoreNote: theme.demoStoreNote,
        status: 'published',
      })
      .onConflictDoUpdate({
        target: cmsThemes.slug,
        set: {
          name: sql`excluded.name`,
          tagline: sql`excluded.tagline`,
          description: sql`excluded.description`,
          category: sql`excluded.category`,
          priceCents: sql`excluded.price_cents`,
          bgClass: sql`excluded.bg_class`,
          accentColor: sql`excluded.accent_color`,
          highlights: sql`excluded.highlights`,
          features: sql`excluded.features`,
          licenses: sql`excluded.licenses`,
          deliveryNotes: sql`excluded.delivery_notes`,
          demoStoreNote: sql`excluded.demo_store_note`,
          status: sql`excluded.status`,
          updatedAt: sql`now()`,
        },
      })
    console.log(`  ✓ ${theme.name}`)
  }

  console.log('\nSeeding CMS work...')

  // Work items are not seeded here — they contain structured sub-data
  // that is better managed through the admin UI for accuracy.
  // To seed work, export from work.ts and adapt the proof/actions/etc. arrays.
  console.log('  (skipped — add work items via /admin/work/new)')

  console.log('\nSeed complete.')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
