import crypto from 'crypto'
import { and, eq } from 'drizzle-orm'
import { db } from '../../db/client'
import { files } from '../../db/schema'
import { getPresignedDownloadUrl, getPresignedUploadUrl } from '../../lib/storage'
import { AppError } from '../../lib/errors'
import type { AccessTokenPayload } from '../../lib/tokens'
import { assertProjectAccess } from '../projects/projects.service'
import type { GetUploadUrlInput, RegisterFileInput } from './files.schema'

export async function getUploadUrl(
  ctx: AccessTokenPayload,
  projectId: string,
  input: GetUploadUrlInput,
) {
  await assertProjectAccess(ctx.orgId, projectId)

  const ext = input.name.includes('.') ? input.name.split('.').pop() : ''
  const storageKey = `${ctx.orgId}/${projectId}/${crypto.randomUUID()}${ext ? `.${ext}` : ''}`
  const uploadUrl = await getPresignedUploadUrl(storageKey, input.mimeType)

  return { uploadUrl, storageKey }
}

export async function register(
  ctx: AccessTokenPayload,
  projectId: string,
  input: RegisterFileInput,
) {
  await assertProjectAccess(ctx.orgId, projectId)

  const [file] = await db
    .insert(files)
    .values({
      orgId: ctx.orgId,
      projectId,
      uploadedBy: ctx.sub,
      name: input.name,
      storageKey: input.storageKey,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
    })
    .returning()
  return file
}

export async function getDownloadUrl(ctx: AccessTokenPayload, projectId: string, fileId: string) {
  await assertProjectAccess(ctx.orgId, projectId)

  const file = await db.query.files.findFirst({
    where: and(eq(files.id, fileId), eq(files.projectId, projectId), eq(files.orgId, ctx.orgId)),
    columns: { storageKey: true, name: true },
  })

  if (!file) throw new AppError('File not found', 404)

  const url = await getPresignedDownloadUrl(file.storageKey, file.name)
  return { url }
}

export async function list(ctx: AccessTokenPayload, projectId: string) {
  await assertProjectAccess(ctx.orgId, projectId)

  return db.query.files.findMany({
    where: and(eq(files.projectId, projectId), eq(files.orgId, ctx.orgId)),
    columns: {
      id: true,
      name: true,
      mimeType: true,
      sizeBytes: true,
      createdAt: true,
    },
    with: {
      uploadedBy: { columns: { id: true, name: true } },
    },
    orderBy: (f, { desc }) => desc(f.createdAt),
  })
}
