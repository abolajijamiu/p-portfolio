import { and, eq, gt } from 'drizzle-orm'
import crypto from 'crypto'
import { db } from '../../db/client'
import { invites, memberships, organizations, sessions, users } from '../../db/schema'
import { hashPassword, sha256, verifyPassword } from '../../lib/crypto'
import { sendInviteEmail } from '../../lib/email'
import { AppError } from '../../lib/errors'
import { generateInviteToken, generateRefreshToken, signAccessToken } from '../../lib/tokens'
import type { AccessTokenPayload } from '../../lib/tokens'
import type {
  AcceptInviteInput,
  InviteInput,
  LoginInput,
  RegisterInput,
} from './auth.schema'

type AuthResult = {
  accessToken: string
  refreshToken: string
  user: { id: string; email: string; name: string }
}

// ─── register ────────────────────────────────────────────────────────────────

export async function register(input: RegisterInput): Promise<AuthResult> {
  const existing = await db.query.users.findFirst({
    where: eq(users.email, input.email),
    columns: { id: true },
  })
  if (existing) throw new AppError('Email already in use', 409)

  const passwordHash = await hashPassword(input.password)

  // Append random suffix to guarantee slug uniqueness without a round-trip check
  const baseSlug = input.orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const slug = `${baseSlug}-${crypto.randomBytes(4).toString('hex')}`

  const { user, org } = await db.transaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({ name: input.name, email: input.email, passwordHash, acceptedAt: new Date() })
      .returning({ id: users.id, email: users.email, name: users.name })

    const [org] = await tx
      .insert(organizations)
      .values({ name: input.orgName, slug })
      .returning({ id: organizations.id })

    await tx.insert(memberships).values({ userId: user.id, orgId: org.id, role: 'owner' })

    return { user, org }
  })

  return issueSession({ sub: user.id, orgId: org.id, role: 'owner' }, user)
}

// ─── login ───────────────────────────────────────────────────────────────────

export async function login(input: LoginInput): Promise<AuthResult> {
  const user = await db.query.users.findFirst({
    where: eq(users.email, input.email),
    with: { memberships: { columns: { orgId: true, role: true } } },
  })

  // Run bcrypt even on miss to prevent timing-based email enumeration
  if (!user?.passwordHash) {
    await hashPassword('_timing_guard_')
    throw new AppError('Invalid credentials', 401)
  }

  const valid = await verifyPassword(input.password, user.passwordHash)
  if (!valid) throw new AppError('Invalid credentials', 401)

  const membership = user.memberships[0]
  if (!membership) throw new AppError('Account has no organization', 403)

  return issueSession(
    { sub: user.id, orgId: membership.orgId, role: membership.role },
    { id: user.id, email: user.email, name: user.name },
  )
}

// ─── refresh ─────────────────────────────────────────────────────────────────

export async function refresh(rawToken: string): Promise<{ accessToken: string }> {
  const session = await db.query.sessions.findFirst({
    where: and(
      eq(sessions.tokenHash, sha256(rawToken)),
      gt(sessions.expiresAt, new Date()),
    ),
    columns: { userId: true, orgId: true, role: true },
  })

  if (!session) throw new AppError('Invalid or expired session', 401)

  const accessToken = signAccessToken({
    sub: session.userId,
    orgId: session.orgId,
    role: session.role,
  })

  return { accessToken }
}

// ─── logout ──────────────────────────────────────────────────────────────────

export async function logout(rawToken: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.tokenHash, sha256(rawToken)))
}

// ─── sendInvite ──────────────────────────────────────────────────────────────

export async function sendInvite(ctx: AccessTokenPayload, input: InviteInput): Promise<void> {
  const { raw: tokenRaw, hash: tokenHash } = generateInviteToken()
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000)

  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, ctx.orgId),
    columns: { name: true },
  })
  if (!org) throw new AppError('Organization not found', 404)

  await db.transaction(async (tx) => {
    let invitedUser = await tx.query.users.findFirst({
      where: eq(users.email, input.email),
      columns: { id: true },
    })

    if (!invitedUser) {
      const [created] = await tx
        .insert(users)
        .values({ email: input.email, name: input.name, invitedAt: new Date() })
        .returning({ id: users.id })
      invitedUser = created
    }

    // Idempotent — silently skips if membership already exists
    await tx
      .insert(memberships)
      .values({ userId: invitedUser.id, orgId: ctx.orgId, role: input.role })
      .onConflictDoNothing()

    await tx.insert(invites).values({
      tokenHash,
      userId: invitedUser.id,
      orgId: ctx.orgId,
      invitedBy: ctx.sub,
      role: input.role,
      expiresAt,
    })
  })

  // Outside the transaction — a failed email doesn't roll back DB state.
  // Move this to a job queue (BullMQ) when you need retry logic.
  await sendInviteEmail({ to: input.email, name: input.name, token: tokenRaw, orgName: org.name })
}

// ─── acceptInvite ─────────────────────────────────────────────────────────────

export async function acceptInvite(input: AcceptInviteInput): Promise<AuthResult> {
  const invite = await db.query.invites.findFirst({
    where: and(
      eq(invites.tokenHash, sha256(input.token)),
      gt(invites.expiresAt, new Date()),
    ),
  })

  if (!invite || invite.usedAt) throw new AppError('Invalid or expired invite', 400)

  const passwordHash = await hashPassword(input.password)

  const user = await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(users)
      .set({
        passwordHash,
        acceptedAt: new Date(),
        ...(input.name ? { name: input.name } : {}),
      })
      .where(eq(users.id, invite.userId))
      .returning({ id: users.id, email: users.email, name: users.name })

    await tx
      .update(invites)
      .set({ usedAt: new Date() })
      .where(eq(invites.tokenHash, sha256(input.token)))

    return updated
  })

  return issueSession({ sub: user.id, orgId: invite.orgId, role: invite.role }, user)
}

// ─── private helpers ─────────────────────────────────────────────────────────

async function issueSession(
  payload: AccessTokenPayload,
  user: { id: string; email: string; name: string },
): Promise<AuthResult> {
  const { raw, hash, expiresAt } = generateRefreshToken()

  await db.insert(sessions).values({
    userId: payload.sub,
    orgId: payload.orgId,
    role: payload.role as 'owner' | 'admin' | 'member' | 'client',
    tokenHash: hash,
    expiresAt,
  })

  return {
    accessToken: signAccessToken(payload),
    refreshToken: raw,
    user,
  }
}
