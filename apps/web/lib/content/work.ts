export type WorkCategory =
  | 'redesign'
  | 'theme'
  | 'seo'
  | 'funnel'
  | 'management'
  | 'addon'
  | 'performance'
  | 'platform'
  | 'brand'

export type Proof = {
  metric: string
  label: string
  direction?: 'up' | 'down'
  period?: string
}

export type AuditFinding = {
  item: string
  before: string
  after: string
  severity: 'critical' | 'high' | 'medium'
}

export type WorkItem = {
  slug: string
  client: string
  category: WorkCategory
  industry: string
  year: string
  scope: string[]
  headline: string
  situation: string
  actions: string[]
  proof: Proof[]
  proofNote?: string
  stack?: string[]
  duration?: string
  auditFindings?: AuditFinding[]
  videoId?: string
  videoPlatform?: 'youtube' | 'loom' | 'vimeo'
  accent: string
  featured?: boolean
  hasComparison?: boolean
  comparisons?: { before: string; after: string; label: string }[]
}

const CATEGORY_LABEL: Record<WorkCategory, string> = {
  redesign: 'Store Redesign',
  theme: 'Theme Development',
  seo: 'Commerce SEO',
  funnel: 'Funnel Systems',
  management: 'Store Management',
  addon: 'Custom Add-on',
  performance: 'Performance',
  platform: 'Platform Build',
  brand: 'Brand & Digital',
}

export { CATEGORY_LABEL }

export const WORK: WorkItem[] = [
  // ── eCommerce ──────────────────────────────────────────────────────────────
  {
    slug: 'velo',
    client: 'Velo',
    category: 'redesign',
    industry: 'E-Commerce · Cycling',
    year: '2025',
    scope: ['Brand', 'Store design', 'Checkout rebuild'],
    headline: 'Sixty percent of customers were leaving before they paid.',
    situation:
      "Velo made exceptional hardware — carbon-frame bikes at a price point that required the digital experience to justify it. Session recordings showed users losing confidence at the payment step, not from friction but because the brand hadn't earned their trust before they got there. The checkout flow was technically functional. The brand was not doing its job.",
    actions: [
      'Exit surveys and session recordings at every drop-off point before touching any design',
      'Rebuilt the brand language from the ground up to match the premium tier of the product',
      'Redesigned checkout as a single-page flow with cart context and trust signals visible throughout',
      'Rebuilt the storefront on a headless architecture to support catalogue growth',
    ],
    proof: [
      { metric: '38%', label: 'drop in cart abandonment', direction: 'down', period: '90 days post-launch' },
      { metric: '12%', label: 'increase in average order value', direction: 'up', period: '90 days post-launch' },
      { metric: '2.1×', label: 'conversion rate improvement', direction: 'up' },
    ],
    proofNote: 'Cart abandonment and AOV from Shopify Analytics. Conversion rate from 90-day pre/post comparison in GA4. Baseline period: same 90 days prior year.',
    stack: ['Shopify Plus', 'Hydrogen (headless)', 'Klaviyo', 'Attentive SMS', 'GA4'],
    duration: '14 weeks',
    accent: 'bg-[#eceaf0]',
    featured: true,
    hasComparison: true,
    comparisons: [
      { before: 'Cluttered checkout — 4 pages, no trust signals', after: 'Single-page checkout with AOV, guarantee, and cart summary visible', label: 'Checkout flow' },
      { before: 'Generic lifestyle photography, no brand language', after: 'Premium editorial system — typography, photography direction, colour', label: 'Brand expression' },
    ],
  },
  {
    slug: 'carve',
    client: 'Carve',
    category: 'theme',
    industry: 'E-Commerce · Outdoor & Surf',
    year: '2025',
    scope: ['Shopify theme', 'Mobile UX', 'Performance'],
    headline: "Their existing theme was costing them 40% of mobile revenue.",
    situation:
      'Carve sells premium outdoor and surf equipment. Mobile accounted for 68% of their traffic but only 42% of revenue — a 26-point gap that analytics traced directly to the theme. Load time on 4G averaged 8.2 seconds. The product page required 5 taps to reach the cart. We built them a custom Shopify theme from scratch.',
    actions: [
      'Full mobile UX audit across 12 device types before writing a line of code',
      'Custom Shopify theme built on Dawn architecture, stripped to under 180kb initial load',
      'Single-tap add-to-cart on mobile with persistent sticky bar',
      'Image pipeline delivering WebP at correct breakpoints with no layout shift',
      'Offline-first PWA shell for repeat visitors',
    ],
    proof: [
      { metric: '1.8s', label: 'mobile load time (from 8.2s)', direction: 'down', period: 'After launch' },
      { metric: '34%', label: 'increase in mobile conversion rate', direction: 'up', period: '60 days' },
      { metric: '99', label: 'Lighthouse performance score', period: 'Mobile' },
    ],
    proofNote: 'Load time measured via WebPageTest from London on 4G throttled connection. Conversion rate from Shopify Analytics, mobile segment, 60-day pre/post. Lighthouse score via Chrome DevTools.',
    stack: ['Shopify', 'Dawn (custom build)', 'Cloudflare CDN', 'WebP image pipeline', 'PWA shell'],
    duration: '8 weeks',
    auditFindings: [
      { item: 'Mobile load time', before: '8.2s on 4G — industry benchmark is under 3s', after: '1.8s on 4G', severity: 'critical' },
      { item: 'Add-to-cart path', before: '5 taps to reach cart on mobile', after: '1 tap — persistent sticky bar, always visible', severity: 'critical' },
      { item: 'Image delivery', before: 'JPEG only, no srcset, no lazy loading, layout shift on load', after: 'WebP at correct breakpoints, lazy-loaded, zero CLS', severity: 'high' },
      { item: 'Lighthouse mobile score', before: '34 / 100', after: '99 / 100', severity: 'high' },
      { item: 'jQuery dependency', before: '87 KB jQuery — blocking main thread on every page load', after: 'Removed entirely — zero jQuery in final build', severity: 'high' },
      { item: 'Font loading', before: 'Render-blocking FOIT on two custom font faces', after: 'font-display: swap with preloaded subsets', severity: 'medium' },
    ],
    accent: 'bg-[#eaeff0]',
    featured: true,
  },
  {
    slug: 'northfield',
    client: 'Northfield Supply',
    category: 'seo',
    industry: 'E-Commerce · Garden & Home',
    year: '2025',
    scope: ['Commerce SEO', 'Content architecture', 'Technical audit'],
    headline: "£180k of annual revenue sitting in page-2 search results.",
    situation:
      'Northfield had a 12-year-old garden supply store with a loyal customer base, strong product margins, and 4,000 SKUs. They were ranking on page 2 for 340 commercial-intent keywords with high monthly search volume. No one had ever done a proper technical SEO audit. The opportunity cost was calculable and significant.',
    actions: [
      'Full technical audit — crawl budget, indexation, cannibalization, Core Web Vitals',
      'Category page architecture rebuilt from scratch with proper hierarchy and internal linking',
      'Product schema and review markup implemented across all 4,000 SKUs',
      'Content strategy for 18 category-level buyer guides targeting commercial intent',
      'Google Merchant Centre feed rebuilt and submitted clean',
    ],
    proof: [
      { metric: '340', label: 'keywords moved from page 2 to page 1', direction: 'up', period: '6 months' },
      { metric: '£180k', label: 'estimated additional annual revenue from organic', direction: 'up' },
      { metric: '4.1×', label: 'increase in organic sessions', direction: 'up', period: 'Year-on-year' },
    ],
    proofNote: 'Keyword positions tracked via Ahrefs weekly. Revenue estimate based on keyword search volume, average CTR for position 1–3, and site conversion rate. Organic sessions from Google Search Console, year-on-year.',
    stack: ['Shopify', 'Screaming Frog', 'Ahrefs', 'Google Search Console', 'Google Merchant Centre'],
    duration: '6 months (ongoing)',
    auditFindings: [
      { item: 'Crawl budget waste', before: '4,200 non-canonical URLs being crawled — diluting budget from real pages', after: 'Canonical map implemented, crawl budget redirected to 2,800 product pages', severity: 'critical' },
      { item: 'Orphaned category pages', before: '12 category pages with zero internal links — invisible to crawlers', after: 'Hierarchical architecture with breadcrumb schema and cross-links', severity: 'critical' },
      { item: 'Google Merchant Centre', before: '340 products disapproved — missing GTIN, price, and availability', after: 'Full feed rebuilt, all 4,000 SKUs approved and serving Shopping ads', severity: 'critical' },
      { item: 'Core Web Vitals — CLS', before: 'CLS 0.42 (failing) — layout shift on image and font load', after: 'CLS 0.02 (passing) — reserved dimensions, font-display: swap', severity: 'high' },
      { item: 'Core Web Vitals — LCP', before: 'LCP 6.8s (failing) — hero image unoptimised, no preload', after: 'LCP 1.9s (passing) — WebP, preload hint, CDN delivery', severity: 'high' },
      { item: 'Product structured data', before: 'No schema markup on 4,000 SKUs — ineligible for rich results', after: 'Product + Review schema on all SKUs, rich results appearing in 6 weeks', severity: 'high' },
      { item: 'Duplicate title tags', before: '220 product variant pages with identical page titles', after: 'Template-generated unique titles for every variant', severity: 'medium' },
      { item: 'Missing meta descriptions', before: '1,800 category and product pages with no meta description', after: 'Template system generating descriptions for all non-editorial pages', severity: 'medium' },
    ],
    accent: 'bg-[#eaeeec]',
    featured: true,
    hasComparison: true,
    comparisons: [
      { before: '12 orphaned category pages, no internal linking structure', after: 'Hierarchical category architecture with breadcrumb schema and cross-links', label: 'Category architecture' },
      { before: 'Core Web Vitals failing — CLS 0.42, LCP 6.8s', after: 'All Core Web Vitals passing — CLS 0.02, LCP 1.9s', label: 'Technical health' },
    ],
  },
  {
    slug: 'ember',
    client: 'Ember',
    category: 'funnel',
    industry: 'E-Commerce · D2C Candles',
    year: '2024',
    scope: ['Email flows', 'Post-purchase funnel', 'Subscription setup'],
    headline: "They had 40,000 customers and no post-purchase system.",
    situation:
      'Ember made exceptional candles with a strong brand. They had 40,000 customers, an average repeat purchase rate of 12%, and no automated post-purchase communication. No welcome series, no replenishment flow, no abandoned cart sequence. Klaviyo was installed but had never been configured properly. We audited their list, built the full funnel, and launched in three weeks.',
    actions: [
      'Full Klaviyo audit — list health, segment structure, existing flow review',
      'Built 7-flow email funnel: welcome, abandoned cart, post-purchase, replenishment, winback, VIP, sunset',
      'Subscription product configured via Recharge with bundle incentive',
      'A/B tested subject lines and send times across 3 cohort segments',
      'Monthly reporting dashboard with revenue attribution per flow',
    ],
    proof: [
      { metric: '28%', label: 'repeat purchase rate (from 12%)', direction: 'up', period: '90 days' },
      { metric: '£6,200', label: 'average monthly email-attributed revenue', direction: 'up' },
      { metric: '34%', label: 'subscription attach rate on replenishment products', direction: 'up' },
    ],
    proofNote: 'Repeat purchase rate from Shopify customer cohort report. Email revenue and subscription rate attributed via Klaviyo UTM tracking, 90-day post-launch window.',
    stack: ['Shopify', 'Klaviyo', 'Recharge Subscriptions', 'Postscript SMS'],
    duration: '3 weeks setup, 90 days optimisation',
    accent: 'bg-[#f0eeea]',
    featured: false,
  },
  {
    slug: 'stackd',
    client: 'Stackd',
    category: 'performance',
    industry: 'E-Commerce · Streetwear',
    year: '2024',
    scope: ['Headless commerce', 'Checkout speed', 'Infrastructure'],
    headline: "Drop-day traffic was crashing their store. Every time.",
    situation:
      "Stackd runs limited streetwear drops — 500 units, 20,000 concurrent users, sold out in 8 minutes when it works. Their Shopify Plus store was collapsing under load. Three consecutive drops had crashed at peak. They were losing sales and, worse, customer trust. The problem wasn't Shopify — it was the theme architecture, which was making 140 synchronous API calls on page load.",
    actions: [
      'Performance audit tracing every network request on the product and cart pages',
      'Rebuilt product page as a headless component — static shell, dynamic inventory via edge function',
      'Custom queue system built in Cloudflare Workers to throttle checkout entry without error pages',
      'Checkout experience rebuilt to pre-populate customer data via cookie for repeat buyers',
      'Load tested to 50,000 concurrent sessions before the next drop',
    ],
    proof: [
      { metric: '0', label: 'store outages in 6 drops since rebuild', direction: 'up' },
      { metric: '140ms', label: 'time-to-interactive on product page (from 4.2s)', direction: 'down' },
      { metric: '100%', label: 'of drop inventory sold within 12 minutes', direction: 'up' },
    ],
    proofNote: 'TTI measured via Cloudflare Workers analytics and WebPageTest. Drop sell-through and outage data from Shopify Plus order reports. Load testing conducted via k6 at 50,000 concurrent sessions.',
    stack: ['Shopify Plus', 'Cloudflare Workers', 'Edge functions', 'k6 load testing'],
    duration: '6 weeks',
    auditFindings: [
      { item: 'Synchronous API calls', before: '140 blocking requests fired on every product page load', after: '12 async edge-cached requests — inventory fetched post-paint', severity: 'critical' },
      { item: 'Time-to-interactive', before: '4.2s on 4G — store unusable during drop traffic spikes', after: '140ms — static shell served from edge, JS hydrates async', severity: 'critical' },
      { item: 'Initial page weight', before: '4.2 MB payload — all JS loaded synchronously on PDP', after: '180 KB initial bundle — remainder loaded on interaction', severity: 'critical' },
      { item: 'Checkout under concurrent load', before: 'Shopify checkout erroring at ~2,000 concurrent users', after: 'Cloudflare queue throttles entry, zero checkout errors at 50k concurrent', severity: 'high' },
      { item: 'JS main thread block', before: '2.8s main thread blocked — no interaction possible during load', after: '0ms main thread block — all heavy work moved to edge function', severity: 'high' },
      { item: 'Inventory sync accuracy', before: 'Polling every 30s — inventory could show as available after sell-out', after: 'Cloudflare Durable Objects — inventory state updated in real-time during drops', severity: 'medium' },
    ],
    accent: 'bg-[#eeecea]',
    featured: true,
  },
  {
    slug: 'luxe',
    client: 'Luxe Atelier',
    category: 'management',
    industry: 'E-Commerce · Luxury Fashion',
    year: '2024',
    scope: ['Store operations', 'Systems integration', 'Fulfilment'],
    headline: "Growing fast with no operational infrastructure to support it.",
    situation:
      "Luxe Atelier had scaled from £200k to £1.4m in two years on the back of strong product and word of mouth. Their operational infrastructure hadn't moved. Orders were being processed manually, returns were tracked in a spreadsheet, and their 3PL didn't integrate with Shopify. They were spending 40% of staff time on tasks that should have been automated.",
    actions: [
      'Full operations audit — order flow, returns, stock, fulfilment, customer service',
      'Shopify integrated with 3PL via a custom middleware layer built in Node.js',
      'Returns portal built on Loop with automatic credit and restock triggers',
      'Customer service templated across 14 scenarios with Gorgias macros',
      'Stock forecasting dashboard pulling from Shopify, 3PL, and supplier lead times',
    ],
    proof: [
      { metric: '82%', label: 'reduction in manual order processing time', direction: 'down' },
      { metric: '£40k', label: 'estimated annual staff cost saved', direction: 'down' },
      { metric: '4.8★', label: 'Trustpilot score (from 3.9★)', direction: 'up', period: '4 months' },
    ],
    proofNote: 'Processing time measured via internal time-tracking pre/post. Staff cost estimate based on hourly rate and time saved per order, annualised. Trustpilot score from public profile, 4-month comparison.',
    stack: ['Shopify', 'Loop Returns', 'Gorgias', 'Xero', 'Node.js middleware', 'Mintsoft 3PL'],
    duration: '10 weeks',
    accent: 'bg-[#f0eef0]',
    featured: false,
  },
  {
    slug: 'harrow',
    client: 'Harrow',
    category: 'addon',
    industry: 'E-Commerce · Home Goods',
    year: '2024',
    scope: ['Shopify app', 'Custom pricing engine', 'B2B portal'],
    headline: "Their B2B customers were ordering by email. In 2024.",
    situation:
      'Harrow sells premium home goods direct to consumer and wholesale to 180 interior design studios. Their wholesale operation ran entirely through email. Account managers were manually applying discounts, creating draft orders, and emailing invoices. The process took 3 days per order and was the leading cause of staff attrition. We built them a custom B2B Shopify app.',
    actions: [
      'Scoped and specced the B2B portal with 6 key account managers over two weeks',
      'Built a custom Shopify app — net terms, volume pricing tiers, order history, and invoice download',
      'Pricing engine applying customer-specific discounts at line-item level without draft orders',
      'Purchase order upload and reference number tracking built into checkout',
      'Integration with Xero for automatic invoice generation on order placement',
    ],
    proof: [
      { metric: '3 days', label: 'order processing time reduced to 8 minutes', direction: 'down' },
      { metric: '22%', label: 'increase in wholesale order volume in 60 days', direction: 'up' },
      { metric: '180', label: 'B2B accounts migrated from email to portal', direction: 'up' },
    ],
    proofNote: 'Processing time from account manager time-tracking during transition. Order volume from Shopify wholesale reports, 60-day post-launch vs prior 60 days. Account migration count from CRM export.',
    stack: ['Shopify Plus', 'Custom Shopify app (React + Node.js)', 'Xero API', 'Shopify B2B APIs'],
    duration: '12 weeks',
    accent: 'bg-[#eceef0]',
    featured: false,
  },
  // ── Non-eCommerce ──────────────────────────────────────────────────────────
  {
    slug: 'meridian',
    client: 'Meridian',
    category: 'platform',
    industry: 'SaaS Platform',
    year: '2025',
    scope: ['Strategy', 'Product design', 'Engineering'],
    headline: "When your own team can't navigate the product.",
    situation:
      'Four years of feature additions without a unifying design language had made the platform genuinely hard to use — even for the engineers who built it. Navigation operated under three separate conventions. Data arrived without hierarchy or primary action. Churn in the first two weeks was at a level the business could not sustain.',
    actions: [
      'Rebuilt the information architecture from first principles, not from the existing structure',
      'Established a data hierarchy model giving every view a single primary action',
      'Created a 60-component design system covering every product surface',
      'Shipped in three phases to avoid disrupting the existing user base',
    ],
    proof: [
      { metric: '60%', label: 'reduction in time-to-first-insight', direction: 'down' },
      { metric: '44%', label: 'improvement in onboarding completion', direction: 'up', period: 'First month' },
    ],
    proofNote: 'Time-to-first-insight measured via session recording median (FullStory). Onboarding completion rate from product analytics (Amplitude), first month post-launch vs prior month.',
    stack: ['Figma', 'React', 'TypeScript', 'Storybook', 'Amplitude', 'FullStory'],
    duration: '16 weeks (phased)',
    accent: 'bg-[#eeecea]',
    featured: false,
  },
  {
    slug: 'arklen',
    client: 'Arklen',
    category: 'brand',
    industry: 'B2B SaaS',
    year: '2024',
    scope: ['Strategy', 'Brand', 'Design'],
    headline: 'Eight weeks from nameless to Series A ready.',
    situation:
      'Arklen had working technology and a founding team that understood exactly what they were building. They had a term sheet pending and no brand — no name, no visual identity, no way to explain themselves to investors. Their Series A close was eight weeks away.',
    actions: [
      'Named the company and developed the complete verbal identity',
      'Built the brand system — logo, typography, colour, motion — in five weeks',
      'Designed and shipped the marketing site in three weeks, parallel to brand delivery',
      'Created pitch deck templates and investor materials as part of the final handoff',
    ],
    proof: [
      { metric: 'Series A', label: 'closed three weeks after launch' },
      { metric: '5 weeks', label: 'from blank page to complete brand system' },
    ],
    stack: ['Figma', 'Framer (marketing site)', 'Lottie (motion)', 'Notion (brand documentation)'],
    duration: '8 weeks',
    accent: 'bg-[#eaeeec]',
    featured: false,
  },
  {
    slug: 'tessera',
    client: 'Tessera',
    category: 'platform',
    industry: 'Product Design',
    year: '2024',
    scope: ['Design systems', 'Product design'],
    headline: 'Eleven engineers shipping product with no shared design language.',
    situation:
      "Tessera's design and engineering teams had scaled faster than their tooling. Every new feature was built from scratch. There was no component library, no naming convention, no shared source of truth. Feature development was slowing because designers were reinventing the same patterns every sprint.",
    actions: [
      'Audited every UI pattern across four product surfaces before writing a single component',
      'Built a library of 80 components, documented with usage guidance and anti-patterns',
      'Established design tokens for colour, type, spacing, and elevation across Figma and code',
      'Shipped a new admin dashboard as the first product built entirely within the new system',
    ],
    proof: [
      { metric: '4×', label: 'faster feature design cycles', direction: 'up', period: 'Within 2 sprints' },
      { metric: '60%', label: 'reduction in designer-to-engineer handoff time', direction: 'down' },
    ],
    proofNote: 'Design cycle time from Linear sprint data, 2 sprints pre/post. Handoff time from internal Notion tracking by design leads.',
    stack: ['Figma', 'Storybook', 'React', 'TypeScript', 'Linear', 'design tokens (CSS variables)'],
    duration: '10 weeks',
    accent: 'bg-[#f0eeec]',
    featured: false,
  },
]

export const ECOMMERCE_CATEGORIES: WorkCategory[] = [
  'redesign', 'theme', 'seo', 'funnel', 'management', 'addon', 'performance',
]
