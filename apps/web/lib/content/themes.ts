export type ThemeCategory = 'fashion' | 'electronics' | 'luxury' | 'food' | 'dtc'

export type ThemeLicense = {
  type: string
  price: number | 'custom'
  description: string
}

export type Theme = {
  slug: string
  name: string
  tagline: string
  description: string
  industries: string[]
  category: ThemeCategory
  price: number | 'custom'
  licenses?: ThemeLicense[]
  features: { category: string; items: string[] }[]
  highlights: string[]
  accent: string
  bg: string
  demoStoreNote?: string
  videoId?: string
  videoPlatform?: 'youtube' | 'loom' | 'vimeo'
  deliveryNotes?: string[]
}

export const THEMES: Theme[] = [
  {
    slug: 'cascade',
    name: 'Cascade',
    tagline: 'Minimal. Editorial. Built to sell.',
    description:
      'A lean Shopify theme for fashion, lifestyle, and beauty brands that want their product to do the talking. Zero visual noise, maximum conversion clarity. Every section earns its place through data.',
    industries: ['Fashion', 'Lifestyle', 'Beauty', 'Apparel'],
    category: 'fashion',
    price: 280,
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
    accent: '#b5a898',
    bg: 'bg-[#f0eeeb]',
    licenses: [
      { type: 'Single store', price: 280, description: 'One Shopify store. Unlimited use.' },
      { type: 'Multi-store', price: 560, description: 'Up to 5 stores under one brand.' },
      { type: 'Agency license', price: 1200, description: 'Unlimited client installs.' },
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
    industries: ['Electronics', 'Tech', 'Hardware', 'Sporting goods'],
    category: 'electronics',
    price: 320,
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
    accent: '#64748b',
    bg: 'bg-[#eaecf0]',
    licenses: [
      { type: 'Single store', price: 320, description: 'One Shopify store. Unlimited use.' },
      { type: 'Multi-store', price: 640, description: 'Up to 5 stores under one brand.' },
      { type: 'Agency license', price: 1400, description: 'Unlimited client installs.' },
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
    industries: ['Jewellery', 'Watches', 'Luxury goods', 'Homeware'],
    category: 'luxury',
    price: 'custom',
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
    accent: '#8b7355',
    bg: 'bg-[#f0edea]',
    licenses: [
      { type: 'Single store', price: 'custom', description: 'Scoped to your specific requirements.' },
      { type: 'Multi-store', price: 'custom', description: 'Multiple brand or market configurations.' },
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
      'For brands where the story sells the product — food, wellness, beauty, and artisan goods. Built-in editorial system with recipe and guide support, and a subscription-ready commerce layer.',
    industries: ['Food & Drink', 'Beauty', 'Wellness', 'Artisan'],
    category: 'food',
    price: 260,
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
    accent: '#5a6344',
    bg: 'bg-[#eef0eb]',
    licenses: [
      { type: 'Single store', price: 260, description: 'One Shopify store. Unlimited use.' },
      { type: 'Multi-store', price: 520, description: 'Up to 5 stores under one brand.' },
      { type: 'Agency license', price: 1100, description: 'Unlimited client installs.' },
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
      'An opinionated D2C theme built around one principle: every element either earns its place through conversion data or gets cut. For brands that measure everything and act on what they find.',
    industries: ['D2C', 'Health', 'Supplements', 'Consumer goods'],
    category: 'dtc',
    price: 340,
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
    accent: '#7c3f3f',
    bg: 'bg-[#f0eaea]',
    licenses: [
      { type: 'Single store', price: 340, description: 'One Shopify store. Unlimited use.' },
      { type: 'Multi-store', price: 680, description: 'Up to 5 stores under one brand.' },
      { type: 'Agency license', price: 1500, description: 'Unlimited client installs.' },
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
