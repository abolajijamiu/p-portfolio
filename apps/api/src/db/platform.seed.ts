/**
 * Platform seed — realistic business data for launch readiness
 *
 * Run with: npx tsx src/db/platform.seed.ts
 *
 * Requires:
 *  - At least one org in `organizations`
 *  - At least one admin/owner, one expert, one client membership
 *  - At least one published service with a package
 *
 * Safe to run multiple times — all inserts use ON CONFLICT DO NOTHING.
 */

import 'dotenv/config'
import { asc, eq, inArray } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { db } from './client'
import {
  organizations,
  memberships,
  users,
  services,
  servicePackages,
  serviceOrders,
  serviceOrderMessages,
  serviceOrderMilestones,
  serviceDeliverables,
  serviceDeliverableRevisions,
  supportTickets,
  supportTicketMessages,
  resources,
  resourceLicenses,
  resourcePurchases,
  bookingServices,
  bookingSlots,
  bookings,
} from './schema'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function daysAgo(n: number, hh = 10, mm = 0) {
  const d = new Date(Date.now() - n * 86_400_000)
  d.setHours(hh, mm, 0, 0)
  return d
}

function daysFromNow(n: number, hh = 10, mm = 0) {
  const d = new Date(Date.now() + n * 86_400_000)
  d.setHours(hh, mm, 0, 0)
  return d
}

function tok() {
  return `tok_${randomUUID().replace(/-/g, '')}`
}

function licKey(prefix: string, n: number) {
  return `${prefix}-${String(n).padStart(4, '0')}-${randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n📦 Platform seed starting…\n')

  // 1. Find org
  const [org] = await db.select().from(organizations).limit(1)
  if (!org) {
    console.error('No org found — run the CMS seed first.')
    process.exit(1)
  }

  // 2. Collect users by role
  const memberRows = await db
    .select({ userId: memberships.userId, role: memberships.role })
    .from(memberships)
    .where(eq(memberships.orgId, org.id))

  const byRole = (role: string) => memberRows.filter((m) => m.role === role).map((m) => m.userId)

  const adminIds = byRole('admin').concat(byRole('owner'))
  const expertIds = byRole('expert')
  const clientIds = byRole('client').concat(byRole('member'))

  if (!adminIds[0]) {
    console.error('No admin/owner found.')
    process.exit(1)
  }

  const adminId   = adminIds[0]
  const expertId  = expertIds[0]  ?? adminId
  const expertId2 = expertIds[1]  ?? expertId
  const clientId  = clientIds[0]  ?? adminId
  const clientId2 = clientIds[1]  ?? clientId
  const clientId3 = clientIds[2]  ?? clientId
  const clientId4 = clientIds[3]  ?? clientId2

  // 3. Find services
  const allServices = await db
    .select()
    .from(services)
    .where(eq(services.status, 'published'))

  if (!allServices.length) {
    console.error('No published services — run the services seed first.')
    process.exit(1)
  }

  // Get first package for each service
  const svcPackages = await Promise.all(
    allServices.map((svc) =>
      db
        .select()
        .from(servicePackages)
        .where(eq(servicePackages.serviceId, svc.id))
        .orderBy(asc(servicePackages.sortOrder))
        .limit(1)
        .then((r) => ({ svc, pkg: r[0] ?? null }))
    )
  )
  const validPairs = svcPackages.filter((p) => p.pkg !== null) as { svc: typeof allServices[0]; pkg: typeof svcPackages[0]['pkg'] & {} }[]

  if (!validPairs.length) {
    console.error('No service packages found.')
    process.exit(1)
  }

  const { svc: primarySvc, pkg: primaryPkg } = validPairs[0]
  const alt = validPairs[1] ?? validPairs[0]
  const alt2 = validPairs[2] ?? validPairs[0]

  console.log(`Org: ${org.name}`)
  console.log(`Services found: ${validPairs.map((p) => p.svc.title).join(', ')}`)

  // ─── Resources ──────────────────────────────────────────────────────────────

  const RESOURCE_SEEDS = [
    {
      id: randomUUID(),
      slug: 'shopify-cro-audit-prompt-pack',
      title: 'Shopify CRO Audit Prompt Pack',
      tagline: '47 expert prompts to audit and improve your Shopify conversion rate in hours.',
      description: 'A professional collection of 47 AI-ready prompts designed by our CRO team to systematically audit every element of your Shopify store — from product pages to checkout — and generate actionable improvement recommendations. Includes prompts for hero section, product photography, pricing psychology, urgency mechanisms, social proof, cart abandonment, and post-purchase flows.',
      category: 'tool' as const,
      status: 'published' as const,
      featured: true,
      tags: ['cro', 'shopify', 'ai', 'conversion', 'audit'],
      sortOrder: 1,
    },
    {
      id: randomUUID(),
      slug: 'ecommerce-email-flow-templates',
      title: 'Ecommerce Email Flow Templates',
      tagline: '12 battle-tested email flows for Klaviyo and Mailchimp — copy, paste, launch.',
      description: 'Complete email template bundles for the 12 highest-ROI ecommerce flows: Welcome Series, Abandoned Cart (5-step), Abandoned Browse, Post-Purchase (nurture + review), Win-Back, VIP Rewards, New Product Launch, Back-in-Stock, Sunset Flow, Holiday Campaign, Flash Sale, and Loyalty Tier Progression. Each flow includes subject line variants, preview text, and mobile-optimised HTML.',
      category: 'template' as const,
      status: 'published' as const,
      featured: true,
      tags: ['email', 'klaviyo', 'mailchimp', 'flows', 'templates'],
      sortOrder: 2,
    },
    {
      id: randomUUID(),
      slug: 'shopify-plus-launch-toolkit',
      title: 'Shopify Plus Launch Toolkit',
      tagline: 'Everything you need to launch or relaunch a Shopify Plus store — properly.',
      description: 'A comprehensive toolkit for Shopify Plus store launches and relaunches. Includes: 80-point pre-launch QA checklist, SEO migration checklist (WooCommerce or Magento to Shopify), GA4 + GTM setup guide, Klaviyo configuration checklist, performance optimisation SOP, post-launch monitoring dashboard template, and a Slack notification setup guide for real-time order and inventory alerts.',
      category: 'starter_kit' as const,
      status: 'published' as const,
      featured: false,
      tags: ['shopify', 'launch', 'checklist', 'ga4', 'seo'],
      sortOrder: 3,
    },
    {
      id: randomUUID(),
      slug: 'ecommerce-analytics-dashboard-templates',
      title: 'Ecommerce Analytics Dashboard Templates',
      tagline: 'Looker Studio and Google Sheets dashboards for GA4, Shopify, and Meta Ads.',
      description: 'Ready-to-use dashboard templates that connect directly to your GA4, Shopify, and Meta Ads accounts via Looker Studio. Includes: Executive KPI dashboard (revenue, ROAS, LTV, churn), GA4 ecommerce funnel dashboard, Meta Ads performance dashboard, Shopify inventory + AOV dashboard, and a weekly email report template in Google Sheets. Full setup guide included.',
      category: 'design_asset' as const,
      status: 'published' as const,
      featured: false,
      tags: ['analytics', 'looker', 'ga4', 'shopify', 'meta'],
      sortOrder: 4,
    },
    {
      id: randomUUID(),
      slug: 'seo-site-audit-sop-bundle',
      title: 'SEO Site Audit SOP Bundle',
      tagline: 'The exact SOPs our SEO team runs on every new client engagement.',
      description: 'Five detailed Standard Operating Procedures covering the full technical and content SEO audit process: (1) Technical SEO Audit SOP with Screaming Frog, (2) Core Web Vitals & PageSpeed audit, (3) Backlink profile analysis SOP, (4) Keyword gap analysis process, (5) Content audit and pruning framework. Each SOP includes Notion and Google Docs templates.',
      category: 'guide' as const,
      status: 'published' as const,
      featured: false,
      tags: ['seo', 'audit', 'sop', 'technical', 'content'],
      sortOrder: 5,
    },
    {
      id: randomUUID(),
      slug: 'marketing-campaign-templates-bundle',
      title: 'Marketing Campaign Templates Bundle',
      tagline: '28 campaign planning templates used by our marketing team every week.',
      description: 'A complete bundle of 28 marketing campaign templates for planning, executing, and reporting on campaigns across paid, organic, and email channels. Includes: Campaign brief template, creative brief, media plan, UTM tracking spreadsheet, weekly performance report, monthly CMO dashboard, post-campaign analysis template, A/B test tracker, influencer outreach tracker, and seasonal campaign calendar.',
      category: 'template' as const,
      status: 'published' as const,
      featured: false,
      tags: ['marketing', 'campaigns', 'templates', 'planning'],
      sortOrder: 6,
    },
    {
      id: randomUUID(),
      slug: 'ai-automation-blueprint-pack',
      title: 'AI Automation Blueprint Pack',
      tagline: 'Copy our exact AI automation setups for ecommerce and agency workflows.',
      description: 'Seven detailed automation blueprint documents for businesses using AI to scale operations. Covers: (1) AI-powered customer support triage with Intercom + GPT-4, (2) Automated product description generation pipeline, (3) SEO content brief generation workflow, (4) Social media repurposing automation, (5) Email personalisation at scale with Klaviyo + AI, (6) Lead scoring automation, (7) Reporting automation with n8n and AI summary generation.',
      category: 'tool' as const,
      status: 'published' as const,
      featured: false,
      tags: ['ai', 'automation', 'n8n', 'gpt', 'workflow'],
      sortOrder: 7,
    },
    {
      id: randomUUID(),
      slug: 'business-operations-sop-pack',
      title: 'Business Operations SOP Pack',
      tagline: 'The operational SOPs that let a 6-figure agency run without you.',
      description: 'A practical pack of 10 business operations SOPs built for digital agencies and ecommerce businesses: Onboarding new clients, Offboarding clients, Weekly team standup, Project scoping and estimation, Freelancer vetting and onboarding, Financial reporting (monthly), Cash flow forecasting, Contractor invoicing process, Performance review template, and Client satisfaction survey process.',
      category: 'guide' as const,
      status: 'published' as const,
      featured: false,
      tags: ['operations', 'sop', 'agency', 'business', 'process'],
      sortOrder: 8,
    },
  ]

  const RESOURCE_IDS: Record<string, string> = {}

  for (const res of RESOURCE_SEEDS) {
    RESOURCE_IDS[res.slug] = res.id
    await db.insert(resources).values(res).onConflictDoNothing()
  }

  // Licenses for each resource
  const LICENSE_SEEDS = RESOURCE_SEEDS.map((res, i) => [
    {
      id: randomUUID(),
      resourceId: res.id,
      name: 'Personal License',
      description: 'For a single individual or business. One active deployment.',
      priceCents: [2900, 3900, 4900, 3900, 2900, 3900, 3900, 2900][i],
      currency: 'USD',
      permissions: { commercial: false, teamUse: false, clientWork: false, resell: false },
      maxDownloads: 5,
      sortOrder: 0,
    },
    {
      id: randomUUID(),
      resourceId: res.id,
      name: 'Agency License',
      description: 'Unlimited use across your agency and all client projects.',
      priceCents: [7900, 9900, 12900, 9900, 7900, 9900, 9900, 7900][i],
      currency: 'USD',
      permissions: { commercial: true, teamUse: true, clientWork: true, resell: false },
      maxDownloads: null,
      sortOrder: 1,
    },
  ])

  const LICENSE_ID_BY_RESOURCE: Record<string, { personal: string; agency: string }> = {}

  for (let i = 0; i < RESOURCE_SEEDS.length; i++) {
    const [personal, agency] = LICENSE_SEEDS[i]
    await db.insert(resourceLicenses).values(personal).onConflictDoNothing()
    await db.insert(resourceLicenses).values(agency).onConflictDoNothing()
    LICENSE_ID_BY_RESOURCE[RESOURCE_SEEDS[i].slug] = { personal: personal.id, agency: agency.id }
  }

  console.log(`✓ Seeded ${RESOURCE_SEEDS.length} resources with personal + agency licenses`)

  // ─── Resource Purchases ──────────────────────────────────────────────────────

  const PURCHASE_SEEDS = [
    {
      id: randomUUID(),
      userId: clientId,
      resourceId: RESOURCE_IDS['shopify-cro-audit-prompt-pack'],
      licenseId: LICENSE_ID_BY_RESOURCE['shopify-cro-audit-prompt-pack'].personal,
      status: 'active' as const,
      pricePaidCents: 2900,
      currency: 'USD',
      downloadCount: 3,
      maxDownloads: 5,
      downloadToken: tok(),
      licenseKey: licKey('CRO-AUDIT', 1),
      activatedAt: daysAgo(12),
      createdAt: daysAgo(12),
      updatedAt: daysAgo(12),
    },
    {
      id: randomUUID(),
      userId: clientId,
      resourceId: RESOURCE_IDS['ecommerce-email-flow-templates'],
      licenseId: LICENSE_ID_BY_RESOURCE['ecommerce-email-flow-templates'].agency,
      status: 'active' as const,
      pricePaidCents: 9900,
      currency: 'USD',
      downloadCount: 1,
      maxDownloads: null,
      downloadToken: tok(),
      licenseKey: licKey('EMAIL-FLOW', 1),
      activatedAt: daysAgo(5),
      createdAt: daysAgo(5),
      updatedAt: daysAgo(5),
    },
    {
      id: randomUUID(),
      userId: clientId2,
      resourceId: RESOURCE_IDS['shopify-plus-launch-toolkit'],
      licenseId: LICENSE_ID_BY_RESOURCE['shopify-plus-launch-toolkit'].personal,
      status: 'active' as const,
      pricePaidCents: 4900,
      currency: 'USD',
      downloadCount: 2,
      maxDownloads: 5,
      downloadToken: tok(),
      licenseKey: licKey('LAUNCH-KIT', 1),
      activatedAt: daysAgo(8),
      createdAt: daysAgo(8),
      updatedAt: daysAgo(8),
    },
    {
      id: randomUUID(),
      userId: clientId3,
      resourceId: RESOURCE_IDS['ai-automation-blueprint-pack'],
      licenseId: LICENSE_ID_BY_RESOURCE['ai-automation-blueprint-pack'].agency,
      status: 'active' as const,
      pricePaidCents: 9900,
      currency: 'USD',
      downloadCount: 0,
      maxDownloads: null,
      downloadToken: tok(),
      licenseKey: licKey('AI-AUTO', 1),
      activatedAt: daysAgo(2),
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
    },
  ]

  for (const p of PURCHASE_SEEDS) {
    await db.insert(resourcePurchases).values(p).onConflictDoNothing()
  }

  console.log(`✓ Seeded ${PURCHASE_SEEDS.length} resource purchases`)

  // ─── Service Orders ──────────────────────────────────────────────────────────

  type OrderSeed = {
    id: string
    orderNumber: string
    serviceId: string
    packageId: string
    clientId: string
    assignedExpertId: string | null
    status: 'pending' | 'payment_received' | 'requirements_needed' | 'requirements_submitted' | 'assigned' | 'in_progress' | 'waiting_for_client' | 'delivered' | 'revision_requested' | 'approved' | 'completed' | 'cancelled'
    priceCents: number
    currency: string
    requirementsData: Record<string, string>
    requirementsSubmittedAt: Date | null
    assignedAt: Date | null
    dueDate: string | null
    deliveredAt: Date | null
    completedAt: Date | null
    revisionCount: number
    createdAt: Date
  }

  const ORDER_SEEDS: OrderSeed[] = [
    // ─── Completed orders (history) ──────────────────────────────────────────
    {
      id: randomUUID(),
      orderNumber: 'ORD-2026-0001',
      serviceId: primarySvc.id,
      packageId: primaryPkg.id,
      clientId: clientId,
      assignedExpertId: expertId,
      status: 'completed',
      priceCents: primaryPkg.priceCents,
      currency: 'USD',
      requirementsData: {
        projectGoals: 'Build a conversion-optimised Shopify store for our fashion brand. Target 3%+ conversion rate.',
        targetAudience: 'Women 25–40, fashion-forward, premium budget.',
        references: 'https://allbirds.com, https://gymshark.com — clean, minimal, high-trust.',
        timeline: '3 weeks',
      },
      requirementsSubmittedAt: daysAgo(42),
      assignedAt: daysAgo(41),
      dueDate: daysAgo(21).toISOString().slice(0, 10),
      deliveredAt: daysAgo(23),
      completedAt: daysAgo(21),
      revisionCount: 1,
      createdAt: daysAgo(45),
    },
    {
      id: randomUUID(),
      orderNumber: 'ORD-2026-0002',
      serviceId: alt.svc.id,
      packageId: alt.pkg.id,
      clientId: clientId2,
      assignedExpertId: expertId,
      status: 'completed',
      priceCents: alt.pkg.priceCents,
      currency: 'USD',
      requirementsData: {
        projectGoals: 'Full SEO audit for our Shopify store — we rank for nothing branded.',
        currentTraffic: '~800 sessions/month from direct only.',
        topCompetitors: 'Brand A, Brand B — both rank for our core terms.',
        priorities: 'Technical SEO first, then content gaps.',
      },
      requirementsSubmittedAt: daysAgo(35),
      assignedAt: daysAgo(34),
      dueDate: daysAgo(25).toISOString().slice(0, 10),
      deliveredAt: daysAgo(26),
      completedAt: daysAgo(25),
      revisionCount: 0,
      createdAt: daysAgo(38),
    },
    {
      id: randomUUID(),
      orderNumber: 'ORD-2026-0003',
      serviceId: alt2.svc.id,
      packageId: alt2.pkg.id,
      clientId: clientId3,
      assignedExpertId: expertId2,
      status: 'completed',
      priceCents: alt2.pkg.priceCents,
      currency: 'USD',
      requirementsData: {
        projectGoals: 'Complete brand identity for our new subscription coffee brand.',
        currentState: 'No brand assets exist yet — starting from scratch.',
        brandPersonality: 'Premium, minimal, artisan. Think Aesop meets Blue Bottle Coffee.',
        deliverables: 'Logo, typography, colour palette, brand guidelines PDF.',
      },
      requirementsSubmittedAt: daysAgo(28),
      assignedAt: daysAgo(27),
      dueDate: daysAgo(14).toISOString().slice(0, 10),
      deliveredAt: daysAgo(15),
      completedAt: daysAgo(13),
      revisionCount: 1,
      createdAt: daysAgo(30),
    },

    // ─── Active / in-progress orders ──────────────────────────────────────────
    {
      id: randomUUID(),
      orderNumber: 'ORD-2026-0004',
      serviceId: primarySvc.id,
      packageId: primaryPkg.id,
      clientId: clientId,
      assignedExpertId: expertId,
      status: 'in_progress',
      priceCents: primaryPkg.priceCents,
      currency: 'USD',
      requirementsData: {
        projectGoals: 'Migrate WooCommerce store to Shopify Plus. 4,200 products, 18,000 customer records.',
        currentPlatform: 'WooCommerce on WordPress — slow, broken checkout, poor mobile.',
        priorities: 'Zero data loss, preserve SEO rankings, fast launch.',
        budget: '$8,000–$12,000',
      },
      requirementsSubmittedAt: daysAgo(10),
      assignedAt: daysAgo(9),
      dueDate: daysFromNow(6).toISOString().slice(0, 10),
      deliveredAt: null,
      completedAt: null,
      revisionCount: 0,
      createdAt: daysAgo(12),
    },
    {
      id: randomUUID(),
      orderNumber: 'ORD-2026-0005',
      serviceId: alt.svc.id,
      packageId: alt.pkg.id,
      clientId: clientId4,
      assignedExpertId: expertId2,
      status: 'in_progress',
      priceCents: alt.pkg.priceCents,
      currency: 'USD',
      requirementsData: {
        projectGoals: 'Full marketing plan for Q3 2026 product launch — new skincare line.',
        channels: 'Meta Ads, TikTok, email (Klaviyo), influencer (micro, beauty niche).',
        budget: '£15,000 total media budget',
        kpi: 'Target 400 DTC customers in first 30 days post-launch.',
      },
      requirementsSubmittedAt: daysAgo(6),
      assignedAt: daysAgo(5),
      dueDate: daysFromNow(9).toISOString().slice(0, 10),
      deliveredAt: null,
      completedAt: null,
      revisionCount: 0,
      createdAt: daysAgo(8),
    },

    // ─── Revision + delivery stages ───────────────────────────────────────────
    {
      id: randomUUID(),
      orderNumber: 'ORD-2026-0006',
      serviceId: primarySvc.id,
      packageId: primaryPkg.id,
      clientId: clientId2,
      assignedExpertId: expertId,
      status: 'revision_requested',
      priceCents: primaryPkg.priceCents,
      currency: 'USD',
      requirementsData: {
        projectGoals: 'Redesign product detail pages — current pages convert at 1.1%, want 2.5%+.',
        topIssues: 'Images too small, no social proof above fold, add-to-cart hard to find on mobile.',
        references: 'https://gymshark.com/products — this layout is very close to what we want.',
      },
      requirementsSubmittedAt: daysAgo(22),
      assignedAt: daysAgo(20),
      dueDate: daysFromNow(2).toISOString().slice(0, 10),
      deliveredAt: daysAgo(7),
      completedAt: null,
      revisionCount: 1,
      createdAt: daysAgo(24),
    },
    {
      id: randomUUID(),
      orderNumber: 'ORD-2026-0007',
      serviceId: alt2.svc.id,
      packageId: alt2.pkg.id,
      clientId: clientId3,
      assignedExpertId: expertId2,
      status: 'delivered',
      priceCents: alt2.pkg.priceCents,
      currency: 'USD',
      requirementsData: {
        projectGoals: '90-day growth strategy for scaling from £300k to £1M ARR.',
        currentRevenue: '£320k ARR (£26k MRR)',
        mainChannel: 'Organic search (60%), direct (25%), email (15%)',
        constraints: 'Limited paid budget — max £3k/month until revenue grows.',
      },
      requirementsSubmittedAt: daysAgo(18),
      assignedAt: daysAgo(16),
      dueDate: daysFromNow(4).toISOString().slice(0, 10),
      deliveredAt: daysAgo(1),
      completedAt: null,
      revisionCount: 0,
      createdAt: daysAgo(20),
    },

    // ─── Requirements stage ───────────────────────────────────────────────────
    {
      id: randomUUID(),
      orderNumber: 'ORD-2026-0008',
      serviceId: primarySvc.id,
      packageId: primaryPkg.id,
      clientId: clientId4,
      assignedExpertId: null,
      status: 'requirements_submitted',
      priceCents: primaryPkg.priceCents,
      currency: 'USD',
      requirementsData: {
        projectGoals: 'Custom checkout with multi-step upsells and post-purchase flow.',
        currentAOV: '$48 — want to hit $65+ with upsells.',
        currentCheckout: 'Default Shopify checkout — no upsells at all.',
        integrations: 'ReConvert for post-purchase, Recharge for subscriptions.',
      },
      requirementsSubmittedAt: daysAgo(1),
      assignedAt: null,
      dueDate: null,
      deliveredAt: null,
      completedAt: null,
      revisionCount: 0,
      createdAt: daysAgo(2),
    },
    {
      id: randomUUID(),
      orderNumber: 'ORD-2026-0009',
      serviceId: alt.svc.id,
      packageId: alt.pkg.id,
      clientId: clientId,
      assignedExpertId: null,
      status: 'requirements_needed',
      priceCents: alt.pkg.priceCents,
      currency: 'USD',
      requirementsData: {},
      requirementsSubmittedAt: null,
      assignedAt: null,
      dueDate: null,
      deliveredAt: null,
      completedAt: null,
      revisionCount: 0,
      createdAt: daysAgo(0),
    },
  ]

  for (const order of ORDER_SEEDS) {
    await db.insert(serviceOrders).values(order).onConflictDoNothing()
  }

  console.log(`✓ Seeded ${ORDER_SEEDS.length} service orders (ORD-2026-0001 → ORD-2026-0009)`)

  // ─── Order Messages (conversations) ─────────────────────────────────────────

  // Helper: get order ID from number
  async function getOrder(num: string) {
    return db
      .select()
      .from(serviceOrders)
      .where(eq(serviceOrders.orderNumber, num))
      .limit(1)
      .then((r) => r[0] ?? null)
  }

  const ord1 = await getOrder('ORD-2026-0001')
  const ord4 = await getOrder('ORD-2026-0004')
  const ord6 = await getOrder('ORD-2026-0006')
  const ord7 = await getOrder('ORD-2026-0007')

  if (ord1) {
    const msgCount = await db.select().from(serviceOrderMessages).where(eq(serviceOrderMessages.orderId, ord1.id)).then((r) => r.length)
    if (msgCount === 0) {
      await db.insert(serviceOrderMessages).values([
        { id: randomUUID(), orderId: ord1.id, senderId: adminId, type: 'system', body: 'Your order has been received and an expert assigned. We\'ll be in touch within 24 hours to confirm the project brief.', isReadByClient: true, isReadByExpert: true, createdAt: daysAgo(44) },
        { id: randomUUID(), orderId: ord1.id, senderId: clientId, type: 'message', body: 'Thanks! I\'ve filled in all the requirements. Just to confirm — the store will support UK and EU customers. Do I need to worry about any tax settings at this stage?', isReadByClient: true, isReadByExpert: true, createdAt: daysAgo(42) },
        { id: randomUUID(), orderId: ord1.id, senderId: expertId, type: 'message', body: 'Hi! Great question. We\'ll configure UK VAT correctly in Shopify and set up country-based tax rules for EU. You\'ll just need to confirm your VAT registration number when we\'re near launch. Leave it with me.', isReadByClient: true, isReadByExpert: true, createdAt: daysAgo(41) },
        { id: randomUUID(), orderId: ord1.id, senderId: expertId, type: 'delivery', body: 'First delivery ready for review. I\'ve built the homepage, product page template, collection pages, and a custom cart drawer. A few things to check: (1) the hero section — does the copy feel right? (2) the colour palette — I matched your brand guide. (3) the mobile checkout flow. Happy to adjust anything!', isReadByClient: true, isReadByExpert: true, createdAt: daysAgo(30) },
        { id: randomUUID(), orderId: ord1.id, senderId: clientId, type: 'revision_request', body: 'Looks brilliant overall! The colour work is spot on. Two small things: the header needs to be sticky on scroll (it disappears when you scroll down), and on mobile the coupon field should sit above the order total in checkout. Can these be done in revision 1?', isReadByClient: true, isReadByExpert: true, createdAt: daysAgo(28) },
        { id: randomUUID(), orderId: ord1.id, senderId: expertId, type: 'revision_delivery', body: 'Revision 1 complete — sticky header and coupon field repositioned. Also took the liberty of improving the mobile tab bar to make the cart icon more prominent. Everything looks great. If you\'re happy, please mark as approved and I\'ll push the final assets.', isReadByClient: true, isReadByExpert: true, createdAt: daysAgo(25) },
        { id: randomUUID(), orderId: ord1.id, senderId: clientId, type: 'message', body: 'Approved! Looks perfect. Thank you so much — this is exactly what I wanted.', isReadByClient: true, isReadByExpert: true, createdAt: daysAgo(21) },
      ])
    }
  }

  if (ord4) {
    const msgCount = await db.select().from(serviceOrderMessages).where(eq(serviceOrderMessages.orderId, ord4.id)).then((r) => r.length)
    if (msgCount === 0) {
      await db.insert(serviceOrderMessages).values([
        { id: randomUUID(), orderId: ord4.id, senderId: adminId, type: 'system', body: 'Your order is confirmed. We\'re reviewing your requirements now and will have an expert assigned within 24 hours.', isReadByClient: true, isReadByExpert: true, createdAt: daysAgo(12) },
        { id: randomUUID(), orderId: ord4.id, senderId: expertId, type: 'message', body: 'Hi! I\'ve reviewed the brief. 4,200 products is a solid migration job — the main risk is product metafields and variant data. Could you export a sample of 20–30 products from WooCommerce so I can check the data structure before we start the full migration? This will prevent surprises mid-way.', isReadByClient: true, isReadByExpert: true, createdAt: daysAgo(9) },
        { id: randomUUID(), orderId: ord4.id, senderId: clientId, type: 'message', body: 'Done — sample export sent to the shared Drive folder. Also flagged: we have ~200 bundle products with custom metafields for ingredient lists. These need to transfer correctly for our PDP.', isReadByClient: true, isReadByExpert: true, createdAt: daysAgo(8) },
        { id: randomUUID(), orderId: ord4.id, senderId: expertId, type: 'message', body: 'Sample received and reviewed. The metafield structure is straightforward — I\'ll use a custom import script to preserve the ingredient metafields and map them to Shopify\'s native metafield system. Migration is underway. Estimated first deliverable by end of week: full product catalogue + customers migrated to staging.', isReadByClient: true, isReadByExpert: true, createdAt: daysAgo(7) },
      ])
    }
  }

  if (ord6) {
    const msgCount = await db.select().from(serviceOrderMessages).where(eq(serviceOrderMessages.orderId, ord6.id)).then((r) => r.length)
    if (msgCount === 0) {
      await db.insert(serviceOrderMessages).values([
        { id: randomUUID(), orderId: ord6.id, senderId: expertId, type: 'delivery', body: 'Product page redesign delivered. Key changes: sticky ATC bar on scroll, image gallery with zoom, social proof section above fold (reviews + UGC), size guide modal, delivery estimate badge, and improved mobile layout with larger images. All tested across iOS and Android.', isReadByClient: true, isReadByExpert: true, createdAt: daysAgo(7) },
        { id: randomUUID(), orderId: ord6.id, senderId: clientId2, type: 'revision_request', body: 'Love the social proof section and the mobile layout improvements! Revision request: (1) The sticky ATC bar is too tall on desktop — can it be slimmer? (2) Would it be possible to add a "View full description" toggle for longer product descriptions? The truncation on mobile looks a bit awkward right now.', isReadByClient: true, isReadByExpert: true, createdAt: daysAgo(4) },
        { id: randomUUID(), orderId: ord6.id, senderId: expertId, type: 'message', body: 'Totally agree on the ATC bar height — I\'ll slim it down to 56px on desktop and add the description toggle. Should have the revision ready by tomorrow.', isReadByClient: true, isReadByExpert: true, createdAt: daysAgo(3) },
      ])
    }
  }

  if (ord7) {
    const msgCount = await db.select().from(serviceOrderMessages).where(eq(serviceOrderMessages.orderId, ord7.id)).then((r) => r.length)
    if (msgCount === 0) {
      await db.insert(serviceOrderMessages).values([
        { id: randomUUID(), orderId: ord7.id, senderId: adminId, type: 'system', body: 'Your growth strategy engagement is confirmed. Your analyst will reach out shortly to schedule a discovery call.', isReadByClient: true, isReadByExpert: true, createdAt: daysAgo(20) },
        { id: randomUUID(), orderId: ord7.id, senderId: expertId2, type: 'message', body: 'Hi! I\'ve reviewed your brief and the revenue breakdown. Before I start the strategy doc, I\'d like to pull your Google Analytics data and Shopify reports for the last 12 months. Could you grant read access to GA4 and Shopify analytics? I\'ll send the specific permission instructions.', isReadByClient: true, isReadByExpert: true, createdAt: daysAgo(16) },
        { id: randomUUID(), orderId: ord7.id, senderId: clientId3, type: 'message', body: 'Access granted — you should be able to see both now. Also, we have a Klaviyo account with 14k subscribers if that\'s helpful. Let me know what else you need.', isReadByClient: true, isReadByExpert: true, createdAt: daysAgo(14) },
        { id: randomUUID(), orderId: ord7.id, senderId: expertId2, type: 'delivery', body: '90-Day Growth Strategy delivered. The report covers: (1) Revenue channel breakdown and attribution analysis, (2) 3 priority acquisition channels with specific tactics and budget allocation, (3) Email revenue opportunities — your Klaviyo flows are generating 8% of revenue vs an industry average of 25–30%, there\'s significant upside here, (4) 90-day action plan with weekly milestones, (5) KPI dashboard template. Executive summary: I believe £600k–£700k ARR is achievable in 90 days with the email optimisation alone. Let me know your thoughts!', isReadByClient: true, isReadByExpert: true, createdAt: daysAgo(1) },
      ])
    }
  }

  console.log('✓ Seeded order conversations')

  // ─── Service Order Milestones ─────────────────────────────────────────────

  if (ord4) {
    const milestoneCount = await db.select().from(serviceOrderMilestones).where(eq(serviceOrderMilestones.orderId, ord4.id)).then((r) => r.length)
    if (milestoneCount === 0) {
      await db.insert(serviceOrderMilestones).values([
        { id: randomUUID(), orderId: ord4.id, title: 'Data review & migration plan', description: 'Review WooCommerce export, map data to Shopify, confirm metafield strategy.', completedAt: daysAgo(8), sortOrder: 0, createdAt: daysAgo(9) },
        { id: randomUUID(), orderId: ord4.id, title: 'Products & variants migrated', description: 'Full product catalogue, images, variants, and metafields imported to Shopify staging.', completedAt: daysAgo(4), sortOrder: 1, createdAt: daysAgo(9) },
        { id: randomUUID(), orderId: ord4.id, title: 'Customers & orders migrated', description: '18,000 customer records and historical orders imported.', completedAt: null, sortOrder: 2, createdAt: daysAgo(9) },
        { id: randomUUID(), orderId: ord4.id, title: 'SEO redirects configured', description: 'All old WooCommerce URLs redirected to new Shopify URLs. Canonical tags verified.', completedAt: null, sortOrder: 3, createdAt: daysAgo(9) },
        { id: randomUUID(), orderId: ord4.id, title: 'QA & launch', description: 'Full 80-point QA checklist, final DNS cutover, post-launch monitoring.', completedAt: null, sortOrder: 4, createdAt: daysAgo(9) },
      ])
      console.log('✓ Seeded milestones for ORD-2026-0004')
    }
  }

  // ─── Service Deliverables (Deliverable Library) ──────────────────────────────

  const ord2 = await getOrder('ORD-2026-0002')
  const ord3 = await getOrder('ORD-2026-0003')
  const ord5 = await getOrder('ORD-2026-0005')

  const DEL_SEEDS = [
    // DEL-001: Completed custom Shopify theme
    ord1 && {
      id: randomUUID(),
      deliverableNumber: 'DEL-2026-0001',
      orderId: ord1.id,
      assignedExpertId: expertId,
      title: 'Custom Shopify Theme — Velour Studio',
      description: 'Fully bespoke Shopify 2.0 theme for Velour Studio. Mobile-first, performance score 98+, custom sections: hero, featured collections, lookbook, testimonials, FAQ, size guide modal, sticky cart drawer. Includes custom checkout CSS, brand fonts, and full documentation.',
      status: 'completed' as const,
      version: 2,
      files: [
        { key: 'deliverables/del-001/velour-theme-v2.zip', name: 'velour-theme-v2.zip', size: 4_250_000 },
        { key: 'deliverables/del-001/setup-guide.pdf', name: 'setup-guide.pdf', size: 380_000 },
        { key: 'deliverables/del-001/section-docs.pdf', name: 'section-customisation-guide.pdf', size: 210_000 },
      ],
      notes: 'Final version with sticky header, repositioned coupon field in checkout, and improved mobile cart. All QA checks passed. Lighthouse: Performance 98, Accessibility 96, Best Practices 100, SEO 100.',
      submittedAt: daysAgo(25),
      approvedAt: daysAgo(21),
      completedAt: daysAgo(21),
      createdAt: daysAgo(41),
    },

    // DEL-002: SEO Audit Report
    ord2 && {
      id: randomUUID(),
      deliverableNumber: 'DEL-2026-0002',
      orderId: ord2.id,
      assignedExpertId: expertId,
      title: 'SEO Audit Report — Bloom & Bark',
      description: 'Comprehensive SEO audit covering 847 URLs. Technical issues identified: 23 broken internal links, 14 pages with duplicate titles, 6 pages with missing meta descriptions, 3 canonical issues, and a critical Core Web Vitals failure on mobile (LCP 8.2s vs 2.5s target). Content gap analysis identified 47 high-value keywords with 0 current rankings. Priority fix list with implementation steps provided.',
      status: 'completed' as const,
      version: 1,
      files: [
        { key: 'deliverables/del-002/seo-audit-bloom-bark.pdf', name: 'SEO-Audit-Bloom-Bark-May2026.pdf', size: 2_840_000 },
        { key: 'deliverables/del-002/keyword-gap-analysis.xlsx', name: 'Keyword-Gap-Analysis.xlsx', size: 420_000 },
        { key: 'deliverables/del-002/technical-fix-list.csv', name: 'Technical-Fix-Priority-List.csv', size: 85_000 },
      ],
      notes: 'Critical finding: the site has 847 indexed pages but only 23 rank in positions 1–50. Root cause is thin content on 600+ collection/filter pages. Recommended immediate noindex on low-value filter pages and content investment in top 15 opportunity pages. Estimated traffic uplift: 250–400% in 6 months with implementation.',
      submittedAt: daysAgo(26),
      approvedAt: daysAgo(25),
      completedAt: daysAgo(25),
      createdAt: daysAgo(34),
    },

    // DEL-003: Brand Identity (completed)
    ord3 && {
      id: randomUUID(),
      deliverableNumber: 'DEL-2026-0003',
      orderId: ord3.id,
      assignedExpertId: expertId2,
      title: 'Brand Identity — Roast & Ritual Coffee',
      description: 'Complete brand identity system for Roast & Ritual. Primary logo (wordmark + icon), secondary logo variants, colour palette (5 colours with accessibility-compliant pairings), typography system (2 fonts: Display + Body), photography style guide, brand usage guidelines PDF, and a full icon set. Final files in SVG, PNG, and PDF formats.',
      status: 'completed' as const,
      version: 2,
      files: [
        { key: 'deliverables/del-003/roast-ritual-brand-kit.zip', name: 'Roast-Ritual-Brand-Kit-v2.zip', size: 18_400_000 },
        { key: 'deliverables/del-003/brand-guidelines.pdf', name: 'Brand-Guidelines.pdf', size: 6_200_000 },
        { key: 'deliverables/del-003/logo-files.zip', name: 'Logo-Files-All-Formats.zip', size: 4_100_000 },
      ],
      notes: 'Version 2 incorporates client feedback: logo mark adjusted to be less symmetrical (more artisan feel), brand colour warmed slightly (from #1A1A1A to #1C1612), and photography style guide expanded to include packaging photography direction. Brand is ready for Shopify implementation.',
      submittedAt: daysAgo(15),
      approvedAt: daysAgo(13),
      completedAt: daysAgo(13),
      createdAt: daysAgo(27),
    },

    // DEL-004: Product page redesign (revision_requested)
    ord6 && {
      id: randomUUID(),
      deliverableNumber: 'DEL-2026-0004',
      orderId: ord6.id,
      assignedExpertId: expertId,
      title: 'Product Page Redesign — Conversion Focus',
      description: 'Redesigned product pages with CRO-optimised layout. Sticky ATC bar on scroll, image gallery with zoom, social proof section (reviews + UGC grid) above fold, size guide modal, delivery estimate badge, improved variant selector, and fully redesigned mobile layout. Built as Shopify 2.0 sections for editor compatibility.',
      status: 'revision_requested' as const,
      version: 1,
      files: [
        { key: 'deliverables/del-004/product-page-redesign-v1.zip', name: 'product-page-redesign-v1.zip', size: 2_100_000 },
        { key: 'deliverables/del-004/implementation-notes.pdf', name: 'Implementation-Notes.pdf', size: 180_000 },
      ],
      notes: 'Version 1 delivered. Awaiting client revision: (1) slim down sticky ATC bar on desktop, (2) add description toggle for long copy. These are minor — revision 1 will be fast.',
      submittedAt: daysAgo(7),
      approvedAt: null,
      completedAt: null,
      createdAt: daysAgo(20),
    },

    // DEL-005: Growth Strategy (delivered, pending approval)
    ord7 && {
      id: randomUUID(),
      deliverableNumber: 'DEL-2026-0005',
      orderId: ord7.id,
      assignedExpertId: expertId2,
      title: '90-Day Growth Strategy — Verdant Wellness',
      description: '40-page growth strategy document covering revenue attribution analysis, channel prioritisation, Klaviyo email optimisation plan (identified £80k–£120k annual uplift opportunity), content & SEO 90-day sprint plan, paid acquisition budget allocation, and week-by-week implementation roadmap. Includes KPI dashboard template and monthly review framework.',
      status: 'submitted' as const,
      version: 1,
      files: [
        { key: 'deliverables/del-005/verdant-growth-strategy.pdf', name: 'Verdant-Wellness-90-Day-Growth-Strategy.pdf', size: 5_600_000 },
        { key: 'deliverables/del-005/kpi-dashboard-template.xlsx', name: 'KPI-Dashboard-Template.xlsx', size: 380_000 },
        { key: 'deliverables/del-005/klaviyo-email-audit.pdf', name: 'Klaviyo-Email-Flow-Audit.pdf', size: 1_200_000 },
      ],
      notes: 'Key finding: email flows generating 8% of revenue vs 25–30% industry benchmark. This is the biggest single lever. Klaviyo audit doc outlines the 6 flows to build immediately. Paid acquisition budget allocation assumes £3k/month budget — if this increases, I\'ve included a scaling model.',
      submittedAt: daysAgo(1),
      approvedAt: null,
      completedAt: null,
      createdAt: daysAgo(16),
    },

    // DEL-006: Marketing plan (in progress)
    ord5 && {
      id: randomUUID(),
      deliverableNumber: 'DEL-2026-0006',
      orderId: ord5.id,
      assignedExpertId: expertId2,
      title: 'Q3 2026 Marketing Plan — Soleil Skincare Launch',
      description: 'Full go-to-market marketing plan for Q3 Soleil skincare launch. Covering channel strategy (Meta, TikTok, email, micro-influencers), campaign calendar, creative brief templates, KPI targets, attribution framework, and post-launch optimisation plan.',
      status: 'in_progress' as const,
      version: 1,
      files: [],
      notes: null,
      submittedAt: null,
      approvedAt: null,
      completedAt: null,
      createdAt: daysAgo(5),
    },

    // DEL-007: Analytics Report (submitted)
    ord2 && {
      id: randomUUID(),
      deliverableNumber: 'DEL-2026-0007',
      orderId: ord2.id,
      assignedExpertId: expertId,
      title: 'Store Optimisation Report — Q1 2026',
      description: 'Quarterly store performance analysis covering revenue by channel, top performing products, AOV trends, checkout funnel drop-off analysis, session-to-purchase rate by device, and 15 prioritised optimisation recommendations. Data period: Jan 1 – Mar 31, 2026.',
      status: 'completed' as const,
      version: 1,
      files: [
        { key: 'deliverables/del-007/q1-2026-store-report.pdf', name: 'Store-Optimisation-Report-Q1-2026.pdf', size: 3_200_000 },
        { key: 'deliverables/del-007/data-appendix.xlsx', name: 'Data-Appendix-Q1-2026.xlsx', size: 540_000 },
      ],
      notes: 'Q1 highlights: Mobile now drives 68% of sessions but only 41% of revenue — checkout friction on mobile is the primary opportunity. AOV down 8% QoQ due to promotional activity in Feb. Recommendation: introduce product bundling to recover AOV without discounting.',
      submittedAt: daysAgo(27),
      approvedAt: daysAgo(25),
      completedAt: daysAgo(25),
      createdAt: daysAgo(34),
    },

    // DEL-008: Automation Blueprint (pending)
    ord3 && {
      id: randomUUID(),
      deliverableNumber: 'DEL-2026-0008',
      orderId: ord3.id,
      assignedExpertId: expertId2,
      title: 'Brand Audit — Roast & Ritual (Pre-Rebrand)',
      description: 'Pre-rebrand brand audit covering brand positioning, visual identity consistency analysis, competitor brand landscape, customer perception survey analysis, and brand strength scorecard. Used as the strategic foundation for the new brand identity delivered in DEL-2026-0003.',
      status: 'completed' as const,
      version: 1,
      files: [
        { key: 'deliverables/del-008/brand-audit-roast-ritual.pdf', name: 'Brand-Audit-Roast-Ritual-Pre-Rebrand.pdf', size: 2_900_000 },
      ],
      notes: 'Audit identified: no consistent visual language across touchpoints, packaging does not match website, logo has 4 different versions in use. Competitor analysis: premium coffee brands all use a warm, craft aesthetic — Roast & Ritual was the only brand in the set using corporate blue. Clear case for rebrand confirmed.',
      submittedAt: daysAgo(30),
      approvedAt: daysAgo(28),
      completedAt: daysAgo(28),
      createdAt: daysAgo(30),
    },
  ].filter((x): x is Exclude<typeof x, false | null | undefined> => Boolean(x))

  for (const del of DEL_SEEDS) {
    await db.insert(serviceDeliverables).values(del).onConflictDoNothing()
  }

  // Revision history for DEL-001
  const del1 = await db.select().from(serviceDeliverables).where(eq(serviceDeliverables.deliverableNumber, 'DEL-2026-0001')).limit(1).then((r) => r[0])
  if (del1) {
    const revCount = await db.select().from(serviceDeliverableRevisions).where(eq(serviceDeliverableRevisions.deliverableId, del1.id)).then((r) => r.length)
    if (revCount === 0) {
      await db.insert(serviceDeliverableRevisions).values([
        {
          id: randomUUID(), deliverableId: del1.id, version: 1, submittedBy: expertId,
          message: 'Initial delivery — homepage, product pages, collection pages, and cart drawer are complete. Please review on mobile and desktop. Focused on performance: all images WebP, lazy loaded, LCP under 2s on 4G.',
          files: [{ key: 'deliverables/del-001/velour-theme-v1.zip', name: 'velour-theme-v1.zip', size: 3_800_000 }],
          clientFeedback: 'This looks amazing! Really happy with the overall direction. Just two things: need the header to be sticky on scroll, and on mobile the coupon field should go above the order total in checkout.',
          createdAt: daysAgo(30),
        },
        {
          id: randomUUID(), deliverableId: del1.id, version: 2, submittedBy: expertId,
          message: 'Revision 1 complete. Sticky header implemented, coupon field repositioned in checkout, and I also improved the mobile navigation tab bar — cart icon is now more prominent and the active state is clearer.',
          files: [{ key: 'deliverables/del-001/velour-theme-v2.zip', name: 'velour-theme-v2.zip', size: 4_250_000 }],
          clientFeedback: null,
          createdAt: daysAgo(25),
        },
      ])
    }
  }

  // Revision history for DEL-003 (brand)
  const del3 = await db.select().from(serviceDeliverables).where(eq(serviceDeliverables.deliverableNumber, 'DEL-2026-0003')).limit(1).then((r) => r[0])
  if (del3) {
    const revCount = await db.select().from(serviceDeliverableRevisions).where(eq(serviceDeliverableRevisions.deliverableId, del3.id)).then((r) => r.length)
    if (revCount === 0) {
      await db.insert(serviceDeliverableRevisions).values([
        {
          id: randomUUID(), deliverableId: del3.id, version: 1, submittedBy: expertId2,
          message: 'Brand identity v1 delivered. Primary logo, colour palette (5 swatches), type system, and initial brand guidelines. The icon mark is inspired by a stylised coffee bean with a heat wave above — keeps it recognisable at small sizes.',
          files: [{ key: 'deliverables/del-003/roast-ritual-brand-kit-v1.zip', name: 'Roast-Ritual-Brand-Kit-v1.zip', size: 15_200_000 }],
          clientFeedback: 'We love it! The warmth of the palette is perfect. Two asks: the icon mark feels a bit too symmetrical — can you make it feel slightly more handcrafted? And can the dark colour be a touch warmer? It currently feels almost pure black.',
          createdAt: daysAgo(19),
        },
        {
          id: randomUUID(), deliverableId: del3.id, version: 2, submittedBy: expertId2,
          message: 'Version 2 — icon mark reworked with an intentional imperfection in the bean curve (feels more artisan/handmade), dark colour adjusted from #1A1A1A to #1C1612 (warm brown-black). Also expanded photography style guide to include packaging photography direction which I think will be very useful at your next photoshoot.',
          files: [{ key: 'deliverables/del-003/roast-ritual-brand-kit.zip', name: 'Roast-Ritual-Brand-Kit-v2.zip', size: 18_400_000 }],
          clientFeedback: null,
          createdAt: daysAgo(15),
        },
      ])
    }
  }

  // Revision for DEL-004 (product page - revision_requested)
  const del4 = await db.select().from(serviceDeliverables).where(eq(serviceDeliverables.deliverableNumber, 'DEL-2026-0004')).limit(1).then((r) => r[0])
  if (del4) {
    const revCount = await db.select().from(serviceDeliverableRevisions).where(eq(serviceDeliverableRevisions.deliverableId, del4.id)).then((r) => r.length)
    if (revCount === 0) {
      await db.insert(serviceDeliverableRevisions).values([
        {
          id: randomUUID(), deliverableId: del4.id, version: 1, submittedBy: expertId,
          message: 'Product page redesign v1. Sticky ATC bar triggers at 300px scroll, image gallery with pinch-zoom on mobile and hover-zoom on desktop, social proof section with Okendo integration placeholder, size guide modal, delivery estimate badge using Shopify\'s estimated delivery dates API.',
          files: [{ key: 'deliverables/del-004/product-page-redesign-v1.zip', name: 'product-page-redesign-v1.zip', size: 2_100_000 }],
          clientFeedback: 'Love the social proof section and mobile improvements! Two things: (1) the sticky ATC bar is too tall on desktop — it takes up too much viewport space. (2) For products with long descriptions, can we add a "Read more" toggle instead of showing it all?',
          createdAt: daysAgo(7),
        },
      ])
    }
  }

  console.log(`✓ Seeded ${DEL_SEEDS.length} deliverables (DEL-2026-0001 → DEL-2026-0008) with revision history`)

  // ─── Support Tickets ─────────────────────────────────────────────────────────

  const TICKET_SEEDS = [
    {
      id: randomUUID(), ticketNumber: 'SUP-2026-0001',
      userId: clientId, subject: 'ORD-2026-0004 — timeline update',
      category: 'orders' as const, status: 'in_progress' as const, priority: 'normal' as const,
      createdAt: daysAgo(9), updatedAt: daysAgo(6),
      messages: [
        { isStaff: false, body: 'Hi — just checking in on ORD-2026-0004 (Shopify migration). I know we\'re targeting end of next week for the first deliverable. Is that still on track? My developer has some availability this week if it\'s helpful to loop them in on anything.', daysAgo: 9 },
        { isStaff: true, body: 'Hi! Yes, still on track for end of week. We\'re currently working on the customer and order data import — products are done. Your developer is very welcome to join the Slack channel we\'ve shared — I\'ll send an invite now. Looping them in early is always a good idea.', daysAgo: 6 },
      ],
    },
    {
      id: randomUUID(), ticketNumber: 'SUP-2026-0002',
      userId: clientId2, subject: 'License key error — Shopify CRO Audit Prompt Pack',
      category: 'resources' as const, status: 'open' as const, priority: 'high' as const,
      createdAt: daysAgo(1), updatedAt: daysAgo(1),
      messages: [
        { isStaff: false, body: 'I purchased the CRO Audit Prompt Pack yesterday but the license key in my portal isn\'t matching — it says "Invalid key format" when I try to use it. Key starts with CRO-AUDIT-0001. Could you check?', daysAgo: 1 },
      ],
    },
    {
      id: randomUUID(), ticketNumber: 'SUP-2026-0003',
      userId: clientId3, subject: 'Invoice for ORD-2026-0003 (VAT receipt needed)',
      category: 'billing' as const, status: 'closed' as const, priority: 'normal' as const,
      closedAt: daysAgo(10),
      createdAt: daysAgo(14), updatedAt: daysAgo(10),
      messages: [
        { isStaff: false, body: 'Could you send me a formal VAT invoice for ORD-2026-0003? Company name: Roast & Ritual Ltd, VAT: GB987654321. My accountant needs it for the quarter-end filing.', daysAgo: 14 },
        { isStaff: true, body: 'Hi! I\'ve issued the formal VAT invoice to your registered email address with your company name and VAT number included. If you need any amendments (different company address etc), just reply here. I\'ve also added it to your portal documents section.', daysAgo: 12 },
        { isStaff: false, body: 'Received and perfect — exactly what we needed. Thank you!', daysAgo: 10 },
      ],
    },
    {
      id: randomUUID(), ticketNumber: 'SUP-2026-0004',
      userId: clientId4, subject: 'Access to analytics portal not working',
      category: 'technical' as const, status: 'closed' as const, priority: 'urgent' as const,
      closedAt: daysAgo(18),
      createdAt: daysAgo(20), updatedAt: daysAgo(18),
      messages: [
        { isStaff: false, body: 'I cannot log in to the portal — it says "invalid credentials" even though I reset my password twice. This is blocking the whole team. Please help urgently.', daysAgo: 20 },
        { isStaff: true, body: 'Hi — I can see the issue: there was a duplicate account created with a slightly different email spelling. I\'ve merged the accounts and the login should work now with your original email. Sorry for the frustration!', daysAgo: 19 },
        { isStaff: false, body: 'Works perfectly now. Thank you for the quick fix!', daysAgo: 18 },
      ],
    },
    {
      id: randomUUID(), ticketNumber: 'SUP-2026-0005',
      userId: clientId, subject: 'Question about revision scope — ORD-2026-0006',
      category: 'orders' as const, status: 'closed' as const, priority: 'normal' as const,
      closedAt: daysAgo(5),
      createdAt: daysAgo(7), updatedAt: daysAgo(5),
      messages: [
        { isStaff: false, body: 'Before I submit my revision request for ORD-2026-0006 — the sticky ATC bar change and description toggle, are those in scope for my 1 included revision? Just want to make sure I\'m not exceeding the package.', daysAgo: 7 },
        { isStaff: true, body: 'Yes — both are squarely in scope for your included revision. UI refinements like sizing adjustments and adding a disclosure widget are standard revision items. Submit away and we\'ll have it done quickly.', daysAgo: 6 },
        { isStaff: false, body: 'Great, thanks for confirming! Submitting the revision now.', daysAgo: 5 },
      ],
    },
    {
      id: randomUUID(), ticketNumber: 'SUP-2026-0006',
      userId: clientId2, subject: 'Can I upgrade to Agency license for the Email Flow Templates?',
      category: 'billing' as const, status: 'open' as const, priority: 'low' as const,
      createdAt: daysAgo(0), updatedAt: daysAgo(0),
      messages: [
        { isStaff: false, body: 'I bought the Personal license for the Email Flow Templates but I\'d like to use them for client work. Can I upgrade to the Agency license and just pay the difference? Or do I need to buy again from scratch?', daysAgo: 0 },
      ],
    },
  ]

  for (const ticket of TICKET_SEEDS) {
    const { messages, ...ticketData } = ticket
    await db.insert(supportTickets).values(ticketData).onConflictDoNothing()

    const [existing] = await db.select({ id: supportTickets.id }).from(supportTickets)
      .where(eq(supportTickets.ticketNumber, ticketData.ticketNumber)).limit(1)

    if (existing) {
      const msgCount = await db.select().from(supportTicketMessages).where(eq(supportTicketMessages.ticketId, existing.id)).then((r) => r.length)
      if (msgCount === 0) {
        for (const msg of messages) {
          const senderId = msg.isStaff ? adminId : ticketData.userId
          await db.insert(supportTicketMessages).values({
            id: randomUUID(), ticketId: existing.id, senderId,
            body: msg.body, isStaff: msg.isStaff, attachments: [],
            createdAt: daysAgo(msg.daysAgo),
          })
        }
      }
    }
  }

  console.log(`✓ Seeded ${TICKET_SEEDS.length} support tickets (SUP-2026-0001 → SUP-2026-0006)`)

  // ─── Bookings ───────────────────────────────────────────────────────────────

  const allBookingServices = await db.select().from(bookingServices).where(eq(bookingServices.active, true))

  if (allBookingServices.length) {
    const bSvc = allBookingServices[0]

    const BOOKING_SEEDS = [
      {
        slotOffset: 3, hour: 10, status: 'confirmed' as const, clientId: clientId,
        notes: 'I\'d like to discuss the strategy for scaling from £1M to £5M ARR. Happy to focus on paid ads, email retention, and international expansion.',
        meetingUrl: 'https://meet.google.com/abc-defg-hij', confirmedDaysAgo: 5,
      },
      {
        slotOffset: 7, hour: 14, status: 'confirmed' as const, clientId: clientId4,
        notes: 'Discovery call for ORD-2026-0005 (Soleil skincare launch). Want to talk through the TikTok strategy specifically — we\'ve never done TikTok ads before.',
        meetingUrl: 'https://meet.google.com/klm-nopq-rst', confirmedDaysAgo: 3,
      },
      {
        slotOffset: -5, hour: 11, status: 'completed' as const, clientId: clientId2,
        notes: 'Strategy session: product page CRO review before kicking off ORD-2026-0006.',
        meetingUrl: 'https://meet.google.com/uvw-xyz-123', confirmedDaysAgo: 10,
      },
    ]

    for (const b of BOOKING_SEEDS) {
      const slotId = randomUUID()
      const start = daysFromNow(b.slotOffset)
      start.setHours(b.hour, 0, 0, 0)
      const end = new Date(start.getTime() + bSvc.durationMinutes * 60_000)

      await db.insert(bookingSlots).values({
        id: slotId, bookingServiceId: bSvc.id,
        startsAt: start, endsAt: end, status: 'booked',
        createdAt: daysAgo(b.slotOffset < 0 ? Math.abs(b.slotOffset) + 2 : 7),
      }).onConflictDoNothing()

      await db.insert(bookings).values({
        id: randomUUID(), bookingServiceId: bSvc.id, slotId,
        clientId: b.clientId, status: b.status,
        priceCents: bSvc.priceCents, currency: 'USD',
        clientNotes: b.notes, meetingUrl: b.meetingUrl,
        confirmedAt: daysAgo(b.confirmedDaysAgo),
        createdAt: daysAgo(b.confirmedDaysAgo + 1),
        updatedAt: daysAgo(b.confirmedDaysAgo),
      }).onConflictDoNothing()
    }

    console.log(`✓ Seeded ${BOOKING_SEEDS.length} bookings`)
  } else {
    console.log('  ℹ No active booking service found — skipping booking seed')
  }

  console.log('\n✅ Platform seed complete.\n')
  console.log('Summary:')
  console.log(`  Resources: ${RESOURCE_SEEDS.length} with 2 license tiers each`)
  console.log(`  Resource purchases: ${PURCHASE_SEEDS.length}`)
  console.log(`  Service orders: ${ORDER_SEEDS.length} across 3 services`)
  console.log(`  Deliverables: ${DEL_SEEDS.length} (the Deliverable Library)`)
  console.log(`  Support tickets: ${TICKET_SEEDS.length}`)
  console.log('  Bookings: 3 (confirmed, confirmed, completed)')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
