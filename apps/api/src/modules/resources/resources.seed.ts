import 'dotenv/config'
import { eq } from 'drizzle-orm'
import { db } from '../../db/client'
import { resources, resourceLicenses, resourceFiles } from '../../db/schema'

type LicenseSeed = Omit<typeof resourceLicenses.$inferInsert, 'id' | 'resourceId'>

const SEED = [
  {
    slug: 'nextjs-ecommerce-starter-kit',
    title: 'Next.js E-commerce Starter Kit',
    tagline: 'Production-ready Next.js 15 storefront with cart, auth, and Stripe.',
    description:
      'A fully wired Next.js 15 App Router starter with Tailwind CSS, Drizzle ORM, NextAuth, Stripe Checkout, and a complete product/cart/order flow. Ship a production storefront in days, not months.',
    category: 'starter_kit' as const,
    status: 'published' as const,
    featured: true,
    tags: ['Next.js', 'TypeScript', 'Stripe', 'Drizzle', 'Tailwind'],
    sortOrder: 1,
    licenses: [
      {
        name: 'Personal',
        description: 'For personal projects and learning. Cannot be used for client work.',
        priceCents: 7900,
        permissions: { personal_use: true, commercial_use: false, client_projects: false, resell: false },
        sortOrder: 0,
      },
      {
        name: 'Commercial',
        description: 'For one commercial project or client.',
        priceCents: 14900,
        permissions: { personal_use: true, commercial_use: true, client_projects: true, resell: false },
        sortOrder: 1,
      },
      {
        name: 'Extended',
        description: 'Unlimited projects, including SaaS products and client work.',
        priceCents: 29900,
        permissions: { personal_use: true, commercial_use: true, client_projects: true, resell: false, unlimited_projects: true },
        sortOrder: 2,
      },
    ],
    files: [
      { name: 'nextjs-ecommerce-starter.zip', key: 'starters/nextjs-ecommerce-starter-v1.zip', size: 4200000, mimeType: 'application/zip' },
      { name: 'README.md', key: 'starters/nextjs-ecommerce-starter-readme.md', size: 8192, mimeType: 'text/markdown' },
    ],
  },
  {
    slug: 'brand-identity-design-system',
    title: 'Brand Identity Design System',
    tagline: 'Complete Figma design system for building cohesive brand identities.',
    description:
      'A comprehensive Figma library with 200+ components, colour system templates, typography scales, icon sets, logo construction grids, and brand guideline templates. Built for designers who need to move fast without sacrificing quality.',
    category: 'design_asset' as const,
    status: 'published' as const,
    featured: true,
    tags: ['Figma', 'Brand', 'Design System', 'Identity'],
    sortOrder: 2,
    licenses: [
      {
        name: 'Personal',
        description: 'For personal and learning projects only.',
        priceCents: 4900,
        permissions: { personal_use: true, commercial_use: false, client_projects: false, resell: false },
        sortOrder: 0,
      },
      {
        name: 'Commercial',
        description: 'For unlimited client branding projects.',
        priceCents: 9900,
        permissions: { personal_use: true, commercial_use: true, client_projects: true, resell: false },
        sortOrder: 1,
      },
    ],
    files: [
      { name: 'brand-identity-design-system.fig', key: 'design/brand-identity-system-v2.fig', size: 18000000, mimeType: 'application/octet-stream' },
      { name: 'usage-guide.pdf', key: 'design/brand-identity-usage-guide.pdf', size: 2100000, mimeType: 'application/pdf' },
    ],
  },
  {
    slug: 'seo-audit-strategy-workbook',
    title: 'SEO Audit & Strategy Workbook',
    tagline: 'A structured 90-day SEO playbook used by our in-house team.',
    description:
      'The exact process our SEO team uses for every client engagement — technical audit checklist, keyword research templates, content gap analysis framework, link building tracker, and monthly reporting templates. 47 pages, fully editable.',
    category: 'guide' as const,
    status: 'published' as const,
    featured: false,
    tags: ['SEO', 'Strategy', 'Audit', 'Templates'],
    sortOrder: 3,
    licenses: [
      {
        name: 'Standard',
        description: 'Single user licence. Use for yourself or one client at a time.',
        priceCents: 2900,
        permissions: { personal_use: true, commercial_use: true, client_projects: false, resell: false },
        sortOrder: 0,
      },
      {
        name: 'Agency',
        description: 'Unlimited use across your whole team and all your clients.',
        priceCents: 7900,
        permissions: { personal_use: true, commercial_use: true, client_projects: true, resell: false, unlimited_projects: true },
        sortOrder: 1,
      },
    ],
    files: [
      { name: 'seo-audit-workbook.pdf', key: 'guides/seo-audit-workbook-v3.pdf', size: 5800000, mimeType: 'application/pdf' },
      { name: 'seo-templates.xlsx', key: 'guides/seo-templates-v3.xlsx', size: 320000, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
    ],
  },
  {
    slug: 'analytics-dashboard-templates',
    title: 'Analytics Dashboard Templates',
    tagline: 'Ready-to-use Looker Studio & Google Sheets dashboard templates.',
    description:
      'Eight plug-and-play dashboard templates covering e-commerce, SEO, paid ads, social media, email marketing, and executive overview. Connect your data sources, customise the branding, and you\'re live in under an hour.',
    category: 'template' as const,
    status: 'published' as const,
    featured: true,
    tags: ['Looker Studio', 'Google Sheets', 'Analytics', 'Dashboard'],
    sortOrder: 4,
    licenses: [
      {
        name: 'Personal',
        description: 'Use for your own business or one project.',
        priceCents: 5900,
        permissions: { personal_use: true, commercial_use: false, client_projects: false, resell: false },
        sortOrder: 0,
      },
      {
        name: 'Agency',
        description: 'Unlimited client projects and white-label use.',
        priceCents: 11900,
        permissions: { personal_use: true, commercial_use: true, client_projects: true, resell: false, unlimited_projects: true },
        sortOrder: 1,
      },
    ],
    files: [
      { name: 'analytics-dashboards.zip', key: 'templates/analytics-dashboards-v1.zip', size: 3200000, mimeType: 'application/zip' },
      { name: 'setup-guide.pdf', key: 'templates/analytics-dashboards-setup.pdf', size: 1400000, mimeType: 'application/pdf' },
    ],
  },
  {
    slug: 'shopify-conversion-checklist',
    title: 'Shopify Conversion Rate Optimisation Checklist',
    tagline: '127-point CRO checklist for Shopify stores, fully annotated.',
    description:
      'Every item we check on a CRO audit — homepage, collection pages, product pages, cart, checkout, and post-purchase. Each item includes a priority score, implementation difficulty rating, and estimated revenue impact. Available as PDF and Notion template.',
    category: 'guide' as const,
    status: 'published' as const,
    featured: false,
    tags: ['Shopify', 'CRO', 'E-commerce', 'Checklist'],
    sortOrder: 5,
    licenses: [
      {
        name: 'Standard',
        description: 'Single licence for personal or client use.',
        priceCents: 1900,
        permissions: { personal_use: true, commercial_use: true, client_projects: false, resell: false },
        sortOrder: 0,
      },
    ],
    files: [
      { name: 'shopify-cro-checklist.pdf', key: 'guides/shopify-cro-checklist-v2.pdf', size: 2400000, mimeType: 'application/pdf' },
      { name: 'shopify-cro-checklist.notion', key: 'guides/shopify-cro-checklist-v2.notion', size: 512000, mimeType: 'application/octet-stream' },
    ],
  },
]

async function seed() {
  console.log('Seeding resources...')

  for (const item of SEED) {
    const { licenses, files, ...resourceData } = item

    const [existing] = await db
      .select({ id: resources.id })
      .from(resources)
      .where(eq(resources.slug, resourceData.slug))
      .limit(1)

    let resourceId: string

    if (existing) {
      console.log(`  Skipping existing: ${resourceData.slug}`)
      resourceId = existing.id
    } else {
      const [inserted] = await db.insert(resources).values(resourceData).returning({ id: resources.id })
      resourceId = inserted.id
      console.log(`  Created resource: ${resourceData.slug}`)
    }

    const [existingLicense] = await db
      .select({ id: resourceLicenses.id })
      .from(resourceLicenses)
      .where(eq(resourceLicenses.resourceId, resourceId))
      .limit(1)

    if (!existingLicense) {
      await db.insert(resourceLicenses).values((licenses as LicenseSeed[]).map((l) => ({ ...l, resourceId })))
      await db.insert(resourceFiles).values(files.map((f, i) => ({ ...f, resourceId, sortOrder: i })))
      console.log(`  Inserted licenses + files for: ${resourceData.slug}`)
    }
  }

  console.log('Resources seed complete.')
}

seed().catch(console.error).finally(() => process.exit(0))
