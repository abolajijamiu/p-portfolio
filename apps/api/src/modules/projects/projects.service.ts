import { and, eq } from 'drizzle-orm'
import { db } from '../../db/client'
import { projects } from '../../db/schema'
import { AppError } from '../../lib/errors'
import type { AccessTokenPayload } from '../../lib/tokens'
import type { CreateProjectInput, UpdateProjectStatusInput } from './projects.schema'

// Exported so files and messages services can reuse it without duplicating the query.
export async function assertProjectAccess(orgId: string, projectId: string): Promise<void> {
  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, projectId), eq(projects.orgId, orgId)),
    columns: { id: true },
  })
  if (!project) throw new AppError('Project not found', 404)
}

export async function list(ctx: AccessTokenPayload) {
  return db.query.projects.findMany({
    where: eq(projects.orgId, ctx.orgId),
    columns: { id: true, name: true, status: true, dueDate: true, createdAt: true },
    orderBy: (p, { desc }) => desc(p.createdAt),
  })
}

export async function getById(ctx: AccessTokenPayload, id: string) {
  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, id), eq(projects.orgId, ctx.orgId)),
  })
  if (!project) throw new AppError('Project not found', 404)
  return project
}

export async function create(ctx: AccessTokenPayload, input: CreateProjectInput) {
  const [project] = await db
    .insert(projects)
    .values({
      orgId: ctx.orgId,
      createdBy: ctx.sub,
      name: input.name,
      description: input.description,
      dueDate: input.dueDate,
    })
    .returning()
  return project
}

export async function updateStatus(
  ctx: AccessTokenPayload,
  id: string,
  input: UpdateProjectStatusInput,
) {
  const [updated] = await db
    .update(projects)
    .set({ status: input.status, updatedAt: new Date() })
    .where(and(eq(projects.id, id), eq(projects.orgId, ctx.orgId)))
    .returning()
  if (!updated) throw new AppError('Project not found', 404)
  return updated
}
