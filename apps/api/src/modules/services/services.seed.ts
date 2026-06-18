import 'dotenv/config'
import { eq } from 'drizzle-orm'
import { db } from '../../db/client'
import { services, servicePackages, serviceFaqs, serviceRequirements } from '../../db/schema'

const SEED_SERVICES = [
  {
    slug: 'shopify-store-development',
    title: 'Shopify Store Development',
    tagline: 'Custom Shopify stores built to convert and scale.',
    description: 'We design and build Shopify stores from scratch — bespoke themes, custom sections, app integrations, and conversion-optimised UX. Every store is performance-tested and mobile-first.',
    category: 'development' as const,
    status: 'published' as const,
    featured: true,
    sortOrder: 1,
    packages: [
      {
        name: 'Starter',
        description: 'Theme customisation + product setup for small catalogues.',
        priceCents: 79900,
        deliveryDays: 7,
        revisions: 2,
        includes: ['Theme customisation', 'Up to 20 products setup', 'Mobile responsive', 'Basic SEO setup', '1 payment gateway'],
        sortOrder: 0,
      },
      {
        name: 'Standard',
        description: 'Full custom Shopify store with bespoke sections and integrations.',
        priceCents: 199900,
        deliveryDays: 14,
        revisions: 3,
        includes: ['Custom theme design', 'Unlimited products', 'Custom sections', 'App integrations (up to 5)', 'Conversion optimisation', 'Analytics setup', 'Post-launch support'],
        sortOrder: 1,
      },
      {
        name: 'Premium',
        description: 'Headless or complex Shopify Plus builds with full brand experience.',
        priceCents: 499900,
        deliveryDays: 30,
        revisions: 5,
        includes: ['Everything in Standard', 'Shopify Plus features', 'B2B portal', 'Custom checkout', 'Subscription flows', 'Performance audit', '60-day support'],
        sortOrder: 2,
      },
    ],
    faqs: [
      { question: 'Do I need to provide a design?', answer: 'No. We handle both design and development. If you have brand assets (logo, fonts, colours), great — if not, we can develop them for you.', sortOrder: 0 },
      { question: 'Will the store be mobile optimised?', answer: 'Yes, every store we build is mobile-first and thoroughly tested across devices.', sortOrder: 1 },
      { question: 'Can I edit the store myself after launch?', answer: 'Absolutely. We build on Shopify\'s native editor so you can manage products, content, and settings without touching code.', sortOrder: 2 },
    ],
    requirements: [
      { label: 'Your brand website or reference URLs', fieldType: 'url' as const, required: true, sortOrder: 0 },
      { label: 'Logo files and brand assets', description: 'Attach zip or share a Drive link', fieldType: 'text' as const, required: false, sortOrder: 1 },
      { label: 'Products and catalogue details', description: 'Number of products, product categories, any existing CSV', fieldType: 'textarea' as const, required: true, sortOrder: 2 },
      { label: 'Design references or inspiration', fieldType: 'text' as const, required: false, sortOrder: 3 },
    ],
  },
  {
    slug: 'seo-strategy-and-execution',
    title: 'SEO Strategy & Execution',
    tagline: 'Organic growth that compounds month over month.',
    description: 'Full-stack SEO from technical auditing to content production. We identify your biggest growth opportunities and execute the work to capture them — keyword research, on-page, link building, and technical fixes.',
    category: 'marketing' as const,
    status: 'published' as const,
    featured: true,
    sortOrder: 2,
    packages: [
      {
        name: 'Audit',
        description: 'Comprehensive SEO audit with prioritised action plan.',
        priceCents: 49900,
        deliveryDays: 5,
        revisions: 1,
        includes: ['Technical SEO audit', 'Keyword gap analysis', 'Competitor benchmark', 'Priority action plan', 'PDF report'],
        sortOrder: 0,
      },
      {
        name: 'Growth',
        description: '3-month hands-on SEO execution programme.',
        priceCents: 149900,
        deliveryDays: 90,
        revisions: 2,
        includes: ['Full audit', 'Technical fixes', '8 optimised pages/month', 'Link building (10 links)', 'Monthly reporting', 'Slack access'],
        sortOrder: 1,
      },
      {
        name: 'Authority',
        description: '6-month intensive SEO programme for competitive niches.',
        priceCents: 299900,
        deliveryDays: 180,
        revisions: 3,
        includes: ['Everything in Growth', '15 pages/month', 'Digital PR (20 links/month)', 'Content cluster strategy', 'Weekly check-ins', 'GA4 dashboard'],
        sortOrder: 2,
      },
    ],
    faqs: [
      { question: 'How long until I see results?', answer: 'SEO is a 3–6 month game. Technical fixes show results fastest; content and authority building take longer but compound over time.', sortOrder: 0 },
      { question: 'Do you guarantee rankings?', answer: 'We don\'t promise specific positions — no ethical agency can. We promise data-driven strategy, rigorous execution, and transparent reporting.', sortOrder: 1 },
    ],
    requirements: [
      { label: 'Website URL', fieldType: 'url' as const, required: true, sortOrder: 0 },
      { label: 'Google Search Console access', description: 'Add hello@deempiretech.com as a viewer', fieldType: 'text' as const, required: false, sortOrder: 1 },
      { label: 'Top 3 competitors', fieldType: 'text' as const, required: true, sortOrder: 2 },
      { label: 'Target keywords or topics (if known)', fieldType: 'textarea' as const, required: false, sortOrder: 3 },
    ],
  },
  {
    slug: 'brand-identity-design',
    title: 'Brand Identity Design',
    tagline: 'Identity systems that command trust and recognition.',
    description: 'We create brand identities from strategy to execution — logos, colour systems, typography, voice guidelines, and the brand toolkit your team needs to stay consistent across every surface.',
    category: 'branding' as const,
    status: 'published' as const,
    featured: true,
    sortOrder: 3,
    packages: [
      {
        name: 'Essentials',
        description: 'Core logo and colour palette for new businesses.',
        priceCents: 89900,
        deliveryDays: 7,
        revisions: 3,
        includes: ['3 logo concepts', 'Colour palette', 'Typography selection', 'Brand usage guide (PDF)', 'All source files'],
        sortOrder: 0,
      },
      {
        name: 'Identity',
        description: 'Complete brand system for established or scaling businesses.',
        priceCents: 249900,
        deliveryDays: 14,
        revisions: 5,
        includes: ['Brand strategy workshop', 'Full logo suite (primary + variants)', 'Extended colour system', 'Typography system', 'Brand voice guide', 'Social templates', 'Stationery design', 'Brand guidelines PDF'],
        sortOrder: 1,
      },
      {
        name: 'Enterprise',
        description: 'Rebrand programme for enterprise and funded companies.',
        priceCents: 599900,
        deliveryDays: 45,
        revisions: 10,
        includes: ['Everything in Identity', 'Brand audit', 'Naming workshop', 'Motion guidelines', 'Brand rollout plan', 'Agency handover pack'],
        sortOrder: 2,
      },
    ],
    faqs: [
      { question: 'What files will I receive?', answer: 'All source files in AI/EPS (vector), PNG and SVG formats, plus a usage guide PDF.', sortOrder: 0 },
      { question: 'Can I request changes after delivery?', answer: 'Yes — revisions are included per package. After that, additional rounds are billed at an hourly rate.', sortOrder: 1 },
    ],
    requirements: [
      { label: 'Business name and description', fieldType: 'textarea' as const, required: true, sortOrder: 0 },
      { label: 'Target audience', description: 'Who are your customers?', fieldType: 'textarea' as const, required: true, sortOrder: 1 },
      { label: 'Brand references (brands you admire)', fieldType: 'text' as const, required: false, sortOrder: 2 },
      { label: 'Colours to avoid (if any)', fieldType: 'text' as const, required: false, sortOrder: 3 },
    ],
  },
  {
    slug: 'analytics-reporting-service',
    title: 'Analytics Reporting Service',
    tagline: 'Data that drives decisions, delivered on a schedule.',
    description: 'We connect to your platforms, build dashboards, generate AI-powered insights reports, and deliver everything to your inbox on a cadence you control. Stop drowning in data and start acting on it.',
    category: 'ai_analytics' as const,
    status: 'published' as const,
    featured: true,
    sortOrder: 4,
    packages: [
      {
        name: 'Snapshot',
        description: 'One-off analytics audit and report.',
        priceCents: 29900,
        deliveryDays: 3,
        revisions: 1,
        includes: ['Connect up to 3 platforms', 'Performance snapshot report', 'Top 5 recommendations', 'PDF delivery'],
        sortOrder: 0,
      },
      {
        name: 'Monthly',
        description: 'Monthly analytics reporting with actionable insights.',
        priceCents: 49900,
        deliveryDays: 30,
        revisions: 2,
        includes: ['Up to 6 platforms', 'Monthly PDF report', 'AI-generated insights', 'KPI dashboard (Looker Studio)', 'Email delivery', 'One review call/month'],
        sortOrder: 1,
      },
      {
        name: 'Weekly',
        description: 'Weekly pulse reports for high-growth businesses.',
        priceCents: 149900,
        deliveryDays: 7,
        revisions: 3,
        includes: ['Unlimited platforms', 'Weekly pulse + monthly deep-dive', 'Competitor tracking', 'Anomaly alerts', 'Slack delivery option', 'Dedicated analyst'],
        sortOrder: 2,
      },
    ],
    faqs: [
      { question: 'Which platforms do you support?', answer: 'GA4, Google Ads, Meta Ads, TikTok Ads, Shopify, WooCommerce, Klaviyo, Google Search Console, Google Business Profile, and custom data sources.', sortOrder: 0 },
      { question: 'How do you access my accounts?', answer: 'We use read-only access only. We\'ll provide instructions for granting viewer permissions — we never need admin access.', sortOrder: 1 },
    ],
    requirements: [
      { label: 'Website URL', fieldType: 'url' as const, required: true, sortOrder: 0 },
      { label: 'Platforms to include', description: 'e.g. GA4, Meta Ads, Shopify', fieldType: 'textarea' as const, required: true, sortOrder: 1 },
      { label: 'Key business goals', fieldType: 'textarea' as const, required: true, sortOrder: 2 },
    ],
  },
  {
    slug: 'ecommerce-conversion-optimisation',
    title: 'E-commerce Conversion Optimisation',
    tagline: 'More revenue from the traffic you already have.',
    description: 'We analyse your funnel end-to-end and implement CRO changes across product pages, cart, checkout, and post-purchase — backed by heatmaps, session recordings, and A/B test data.',
    category: 'ecommerce' as const,
    status: 'published' as const,
    featured: false,
    sortOrder: 5,
    packages: [
      {
        name: 'CRO Audit',
        description: 'Full funnel analysis with prioritised recommendations.',
        priceCents: 59900,
        deliveryDays: 5,
        revisions: 1,
        includes: ['Heatmap analysis', 'Session recording review', 'Checkout friction audit', 'Priority fix list', 'Implementation guide'],
        sortOrder: 0,
      },
      {
        name: 'CRO Sprint',
        description: '4-week hands-on optimisation sprint.',
        priceCents: 179900,
        deliveryDays: 28,
        revisions: 2,
        includes: ['Full audit', 'Up to 20 implementation changes', 'A/B test setup (2 tests)', 'Monthly review call', 'Results report'],
        sortOrder: 1,
      },
    ],
    faqs: [
      { question: 'What\'s the average conversion lift?', answer: 'We see 20–80% uplift across most projects. Results depend on baseline CRO maturity and traffic volume.', sortOrder: 0 },
    ],
    requirements: [
      { label: 'Store URL', fieldType: 'url' as const, required: true, sortOrder: 0 },
      { label: 'Current conversion rate (if known)', fieldType: 'text' as const, required: false, sortOrder: 1 },
      { label: 'Monthly traffic volume', fieldType: 'text' as const, required: false, sortOrder: 2 },
    ],
  },
]

async function seed() {
  console.log('Seeding services...')

  for (const svc of SEED_SERVICES) {
    const { packages, faqs, requirements, ...serviceData } = svc

    const [existing] = await db
      .select({ id: services.id })
      .from(services)
      .where(eq(services.slug, serviceData.slug))
      .limit(1)

    let serviceId: string

    if (existing) {
      console.log(`  Skipping existing: ${serviceData.slug}`)
      serviceId = existing.id
    } else {
      const [inserted] = await db.insert(services).values(serviceData).returning({ id: services.id })
      serviceId = inserted.id
      console.log(`  Created service: ${serviceData.slug}`)
    }

    // Only insert sub-records if no packages exist yet
    const [existingPkg] = await db
      .select({ id: servicePackages.id })
      .from(servicePackages)
      .where(eq(servicePackages.serviceId, serviceId))
      .limit(1)

    if (!existingPkg) {
      await db.insert(servicePackages).values(packages.map((p) => ({ ...p, serviceId })))
      await db.insert(serviceFaqs).values(faqs.map((f) => ({ ...f, serviceId })))
      await db.insert(serviceRequirements).values(requirements.map((r) => ({ ...r, serviceId })))
      console.log(`  Inserted packages + FAQs + requirements for: ${serviceData.slug}`)
    }
  }

  console.log('Services seed complete.')
}

seed().catch(console.error).finally(() => process.exit(0))
