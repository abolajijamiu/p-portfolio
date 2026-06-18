import crypto from 'node:crypto'
import { and, asc, eq, sql } from 'drizzle-orm'
import { db } from '../../db/client'
import {
  resources,
  resourceLicenses,
  resourceFiles,
  resourcePurchases,
} from '../../db/schema'
import type { AccessTokenPayload } from '../../lib/tokens'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateDownloadToken() {
  return crypto.randomBytes(32).toString('hex')
}

function generateLicenseKey() {
  const seg = () => crypto.randomBytes(2).toString('hex').toUpperCase()
  return `ETECH-${seg()}${seg()}-${seg()}${seg()}-${seg()}${seg()}-${seg()}${seg()}`
}

function assertAdmin(auth: AccessTokenPayload) {
  if (auth.role !== 'admin' && auth.role !== 'owner') {
    throw Object.assign(new Error('Forbidden'), { status: 403 })
  }
}

// ─── Public ───────────────────────────────────────────────────────────────────

export async function listPublished() {
  const rows = await db
    .select()
    .from(resources)
    .where(eq(resources.status, 'published'))
    .orderBy(asc(resources.sortOrder), asc(resources.createdAt))

  const ids = rows.map((r) => r.id)
  if (!ids.length) return []

  const licenses = await db
    .select()
    .from(resourceLicenses)
    .where(sql`${resourceLicenses.resourceId} = ANY(${sql.raw(`ARRAY[${ids.map((id) => `'${id}'`).join(',')}]::uuid[]`)})`)
    .orderBy(asc(resourceLicenses.sortOrder))

  return rows.map((r) => ({
    ...r,
    licenses: licenses.filter((l) => l.resourceId === r.id),
  }))
}

export async function getBySlug(slug: string) {
  const [resource] = await db
    .select()
    .from(resources)
    .where(and(eq(resources.slug, slug), eq(resources.status, 'published')))
    .limit(1)

  if (!resource) throw Object.assign(new Error('Not found'), { status: 404 })

  const [licenses, files] = await Promise.all([
    db.select().from(resourceLicenses).where(eq(resourceLicenses.resourceId, resource.id)).orderBy(asc(resourceLicenses.sortOrder)),
    db.select({ id: resourceFiles.id, name: resourceFiles.name, size: resourceFiles.size, mimeType: resourceFiles.mimeType }).from(resourceFiles).where(eq(resourceFiles.resourceId, resource.id)).orderBy(asc(resourceFiles.sortOrder)),
  ])

  return { ...resource, licenses, files }
}

// ─── Purchases (portal) ───────────────────────────────────────────────────────

export async function placePurchase(auth: AccessTokenPayload, licenseId: string) {
  const [license] = await db
    .select()
    .from(resourceLicenses)
    .where(eq(resourceLicenses.id, licenseId))
    .limit(1)

  if (!license) throw Object.assign(new Error('License not found'), { status: 404 })

  const [existing] = await db
    .select({ id: resourcePurchases.id, status: resourcePurchases.status })
    .from(resourcePurchases)
    .where(
      and(
        eq(resourcePurchases.userId, auth.userId),
        eq(resourcePurchases.resourceId, license.resourceId),
        eq(resourcePurchases.licenseId, licenseId),
      ),
    )
    .limit(1)

  if (existing && existing.status === 'active') {
    throw Object.assign(new Error('You already own this license'), { status: 409 })
  }

  const [purchase] = await db
    .insert(resourcePurchases)
    .values({
      userId: auth.userId,
      resourceId: license.resourceId,
      licenseId,
      pricePaidCents: license.priceCents,
      currency: license.currency,
      maxDownloads: license.maxDownloads,
      downloadToken: generateDownloadToken(),
      licenseKey: generateLicenseKey(),
    })
    .returning()

  return purchase
}

export async function listMyPurchases(auth: AccessTokenPayload) {
  const rows = await db
    .select({
      id: resourcePurchases.id,
      status: resourcePurchases.status,
      pricePaidCents: resourcePurchases.pricePaidCents,
      currency: resourcePurchases.currency,
      downloadCount: resourcePurchases.downloadCount,
      maxDownloads: resourcePurchases.maxDownloads,
      licenseKey: resourcePurchases.licenseKey,
      activatedAt: resourcePurchases.activatedAt,
      createdAt: resourcePurchases.createdAt,
      resource: {
        id: resources.id,
        title: resources.title,
        slug: resources.slug,
        category: resources.category,
        coverImageUrl: resources.coverImageUrl,
      },
      license: {
        name: resourceLicenses.name,
      },
    })
    .from(resourcePurchases)
    .innerJoin(resources, eq(resourcePurchases.resourceId, resources.id))
    .innerJoin(resourceLicenses, eq(resourcePurchases.licenseId, resourceLicenses.id))
    .where(eq(resourcePurchases.userId, auth.userId))
    .orderBy(asc(resourcePurchases.createdAt))

  return rows
}

export async function downloadPurchase(auth: AccessTokenPayload, purchaseId: string) {
  const [purchase] = await db
    .select()
    .from(resourcePurchases)
    .where(and(eq(resourcePurchases.id, purchaseId), eq(resourcePurchases.userId, auth.userId)))
    .limit(1)

  if (!purchase) throw Object.assign(new Error('Purchase not found'), { status: 404 })
  if (purchase.status !== 'active') {
    throw Object.assign(new Error('Purchase is not yet activated. Please wait for payment confirmation.'), { status: 403 })
  }
  if (purchase.maxDownloads !== null && purchase.downloadCount >= purchase.maxDownloads) {
    throw Object.assign(new Error('Download limit reached'), { status: 403 })
  }

  const files = await db
    .select()
    .from(resourceFiles)
    .where(eq(resourceFiles.resourceId, purchase.resourceId))
    .orderBy(asc(resourceFiles.sortOrder))

  await db
    .update(resourcePurchases)
    .set({ downloadCount: purchase.downloadCount + 1 })
    .where(eq(resourcePurchases.id, purchaseId))

  const CDN = process.env.RESOURCE_CDN_URL ?? 'https://cdn.deempiretech.com/resources'

  return {
    licenseKey: purchase.licenseKey,
    files: files.map((f) => ({
      name: f.name,
      size: f.size,
      url: `${CDN}/${f.key}`,
    })),
  }
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function listAll(auth: AccessTokenPayload) {
  assertAdmin(auth)
  return db.select().from(resources).orderBy(asc(resources.sortOrder), asc(resources.createdAt))
}

export async function getById(auth: AccessTokenPayload, id: string) {
  assertAdmin(auth)

  const [resource] = await db.select().from(resources).where(eq(resources.id, id)).limit(1)
  if (!resource) throw Object.assign(new Error('Not found'), { status: 404 })

  const [licenses, files] = await Promise.all([
    db.select().from(resourceLicenses).where(eq(resourceLicenses.resourceId, id)).orderBy(asc(resourceLicenses.sortOrder)),
    db.select().from(resourceFiles).where(eq(resourceFiles.resourceId, id)).orderBy(asc(resourceFiles.sortOrder)),
  ])

  return { ...resource, licenses, files }
}

export async function create(auth: AccessTokenPayload, data: typeof resources.$inferInsert) {
  assertAdmin(auth)
  const [row] = await db.insert(resources).values(data).returning()
  return row
}

export async function update(auth: AccessTokenPayload, id: string, data: Partial<typeof resources.$inferInsert>) {
  assertAdmin(auth)
  const [row] = await db.update(resources).set({ ...data, updatedAt: new Date() }).where(eq(resources.id, id)).returning()
  if (!row) throw Object.assign(new Error('Not found'), { status: 404 })
  return row
}

export async function remove(auth: AccessTokenPayload, id: string) {
  assertAdmin(auth)
  await db.delete(resources).where(eq(resources.id, id))
}

export async function addLicense(auth: AccessTokenPayload, resourceId: string, data: typeof resourceLicenses.$inferInsert) {
  assertAdmin(auth)
  const [row] = await db.insert(resourceLicenses).values({ ...data, resourceId }).returning()
  return row
}

export async function removeLicense(auth: AccessTokenPayload, licenseId: string) {
  assertAdmin(auth)
  await db.delete(resourceLicenses).where(eq(resourceLicenses.id, licenseId))
}

export async function addFile(auth: AccessTokenPayload, resourceId: string, data: typeof resourceFiles.$inferInsert) {
  assertAdmin(auth)
  const [row] = await db.insert(resourceFiles).values({ ...data, resourceId }).returning()
  return row
}

export async function removeFile(auth: AccessTokenPayload, fileId: string) {
  assertAdmin(auth)
  await db.delete(resourceFiles).where(eq(resourceFiles.id, fileId))
}

// ─── Admin purchase management ────────────────────────────────────────────────

export async function listAllPurchases(auth: AccessTokenPayload) {
  assertAdmin(auth)
  return db
    .select({
      id: resourcePurchases.id,
      status: resourcePurchases.status,
      pricePaidCents: resourcePurchases.pricePaidCents,
      currency: resourcePurchases.currency,
      downloadCount: resourcePurchases.downloadCount,
      licenseKey: resourcePurchases.licenseKey,
      createdAt: resourcePurchases.createdAt,
      activatedAt: resourcePurchases.activatedAt,
      resource: { title: resources.title, slug: resources.slug },
      license: { name: resourceLicenses.name },
    })
    .from(resourcePurchases)
    .innerJoin(resources, eq(resourcePurchases.resourceId, resources.id))
    .innerJoin(resourceLicenses, eq(resourcePurchases.licenseId, resourceLicenses.id))
    .orderBy(asc(resourcePurchases.createdAt))
}

export async function activatePurchase(auth: AccessTokenPayload, purchaseId: string) {
  assertAdmin(auth)
  const [row] = await db
    .update(resourcePurchases)
    .set({ status: 'active', activatedAt: new Date() })
    .where(eq(resourcePurchases.id, purchaseId))
    .returning()
  if (!row) throw Object.assign(new Error('Purchase not found'), { status: 404 })
  return row
}

export async function refundPurchase(auth: AccessTokenPayload, purchaseId: string) {
  assertAdmin(auth)
  const [row] = await db
    .update(resourcePurchases)
    .set({ status: 'refunded' })
    .where(eq(resourcePurchases.id, purchaseId))
    .returning()
  if (!row) throw Object.assign(new Error('Purchase not found'), { status: 404 })
  return row
}
