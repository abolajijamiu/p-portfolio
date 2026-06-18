import { eq, asc, and, inArray } from 'drizzle-orm'
import { db } from '../../db/client'
import {
  services,
  servicePackages,
  serviceFaqs,
  serviceRequirements,
} from '../../db/schema'
import { AppError } from '../../lib/errors'
import type { AccessTokenPayload } from '../../lib/tokens'

// ─── Public ───────────────────────────────────────────────────────────────────

export async function listPublished() {
  return db
    .select()
    .from(services)
    .where(eq(services.status, 'published'))
    .orderBy(asc(services.sortOrder), asc(services.category))
}

export async function listPublishedWithPackages() {
  const svcs = await db
    .select()
    .from(services)
    .where(eq(services.status, 'published'))
    .orderBy(asc(services.sortOrder), asc(services.category))

  if (svcs.length === 0) return []

  const ids = svcs.map((s) => s.id)
  const pkgs = await db
    .select()
    .from(servicePackages)
    .where(and(inArray(servicePackages.serviceId, ids), eq(servicePackages.active, true)))
    .orderBy(asc(servicePackages.sortOrder))

  const pkgMap = new Map<string, typeof pkgs>()
  for (const pkg of pkgs) {
    if (!pkgMap.has(pkg.serviceId)) pkgMap.set(pkg.serviceId, [])
    pkgMap.get(pkg.serviceId)!.push(pkg)
  }

  return svcs.map((s) => ({ ...s, packages: pkgMap.get(s.id) ?? [] }))
}

export async function getBySlug(slug: string) {
  const [service] = await db
    .select()
    .from(services)
    .where(and(eq(services.slug, slug), eq(services.status, 'published')))
    .limit(1)

  if (!service) throw new AppError('Service not found', 404)

  const [pkgs, faqs, reqs] = await Promise.all([
    db
      .select()
      .from(servicePackages)
      .where(and(eq(servicePackages.serviceId, service.id), eq(servicePackages.active, true)))
      .orderBy(asc(servicePackages.sortOrder)),
    db
      .select()
      .from(serviceFaqs)
      .where(eq(serviceFaqs.serviceId, service.id))
      .orderBy(asc(serviceFaqs.sortOrder)),
    db
      .select()
      .from(serviceRequirements)
      .where(eq(serviceRequirements.serviceId, service.id))
      .orderBy(asc(serviceRequirements.sortOrder)),
  ])

  return { ...service, packages: pkgs, faqs, requirements: reqs }
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function listAll(_auth: AccessTokenPayload) {
  return db
    .select()
    .from(services)
    .orderBy(asc(services.sortOrder), asc(services.category))
}

export async function create(_auth: AccessTokenPayload, data: typeof services.$inferInsert) {
  const [row] = await db.insert(services).values(data).returning()
  return row
}

export async function update(_auth: AccessTokenPayload, id: string, data: Partial<typeof services.$inferInsert>) {
  const [row] = await db
    .update(services)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(services.id, id))
    .returning()
  if (!row) throw new AppError('Service not found', 404)
  return row
}

export async function remove(_auth: AccessTokenPayload, id: string) {
  const [row] = await db.delete(services).where(eq(services.id, id)).returning()
  if (!row) throw new AppError('Service not found', 404)
}

// ─── Packages ─────────────────────────────────────────────────────────────────

export async function listPackages(serviceId: string) {
  return db
    .select()
    .from(servicePackages)
    .where(eq(servicePackages.serviceId, serviceId))
    .orderBy(asc(servicePackages.sortOrder))
}

export async function createPackage(serviceId: string, data: Omit<typeof servicePackages.$inferInsert, 'serviceId'>) {
  const [row] = await db
    .insert(servicePackages)
    .values({ ...data, serviceId })
    .returning()
  return row
}

export async function updatePackage(id: string, data: Partial<typeof servicePackages.$inferInsert>) {
  const [row] = await db
    .update(servicePackages)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(servicePackages.id, id))
    .returning()
  if (!row) throw new AppError('Package not found', 404)
  return row
}

export async function removePackage(id: string) {
  await db.delete(servicePackages).where(eq(servicePackages.id, id))
}

// ─── FAQs ─────────────────────────────────────────────────────────────────────

export async function createFaq(serviceId: string, data: Omit<typeof serviceFaqs.$inferInsert, 'serviceId'>) {
  const [row] = await db.insert(serviceFaqs).values({ ...data, serviceId }).returning()
  return row
}

export async function removeFaq(id: string) {
  await db.delete(serviceFaqs).where(eq(serviceFaqs.id, id))
}

// ─── Requirements ─────────────────────────────────────────────────────────────

export async function createRequirement(serviceId: string, data: Omit<typeof serviceRequirements.$inferInsert, 'serviceId'>) {
  const [row] = await db.insert(serviceRequirements).values({ ...data, serviceId }).returning()
  return row
}

export async function removeRequirement(id: string) {
  await db.delete(serviceRequirements).where(eq(serviceRequirements.id, id))
}
