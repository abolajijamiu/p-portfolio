import { and, asc, eq } from 'drizzle-orm'
import { db } from '../../db/client'
import { messages } from '../../db/schema'
import type { AccessTokenPayload } from '../../lib/tokens'
import { assertProjectAccess } from '../projects/projects.service'
import type { SendMessageInput } from './messages.schema'

export async function list(ctx: AccessTokenPayload, projectId: string) {
  await assertProjectAccess(ctx.orgId, projectId)

  return db.query.messages.findMany({
    where: and(eq(messages.projectId, projectId), eq(messages.orgId, ctx.orgId)),
    columns: { id: true, body: true, parentId: true, createdAt: true },
    with: {
      sender: { columns: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: (m) => asc(m.createdAt),
  })
}

export async function send(
  ctx: AccessTokenPayload,
  projectId: string,
  input: SendMessageInput,
) {
  await assertProjectAccess(ctx.orgId, projectId)

  const [message] = await db
    .insert(messages)
    .values({
      orgId: ctx.orgId,
      projectId,
      senderId: ctx.sub,
      body: input.body,
      parentId: input.parentId,
    })
    .returning()
  return message
}
