import { asc, and, eq } from 'drizzle-orm'
import { Router } from 'express'
import { db } from '../../db/client'
import { memberships, users } from '../../db/schema'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'
import { hashPassword, verifyPassword } from '../../lib/crypto'
import { AppError } from '../../lib/errors'

export const usersRouter = Router()

usersRouter.use(authenticate)

// ─── Self ─────────────────────────────────────────────────────────────────────

// GET /api/v1/users/me
usersRouter.get('/me', async (req, res, next) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.auth.userId),
      columns: { id: true, email: true, name: true, avatarUrl: true },
    })
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ ...user, orgId: req.auth.orgId, role: req.auth.role })
  } catch (err) {
    next(err)
  }
})

// PATCH /api/v1/users/me
usersRouter.patch('/me', async (req, res, next) => {
  try {
    const { name, email } = req.body as { name?: string; email?: string }
    if (!name && !email) return res.status(400).json({ error: 'Nothing to update' })

    const updates: Partial<typeof users.$inferInsert> = {}
    if (name) {
      if (name.trim().length < 2) throw new AppError('Name must be at least 2 characters', 400)
      updates.name = name.trim()
    }
    if (email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AppError('Invalid email address', 400)
      // Check uniqueness
      const existing = await db.query.users.findFirst({ where: eq(users.email, email.toLowerCase().trim()) })
      if (existing && existing.id !== req.auth.userId) throw new AppError('Email already in use', 409)
      updates.email = email.toLowerCase().trim()
    }

    const [updated] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, req.auth.userId))
      .returning({ id: users.id, email: users.email, name: users.name, avatarUrl: users.avatarUrl })

    res.json(updated)
  } catch (err) {
    next(err)
  }
})

// PATCH /api/v1/users/me/password
usersRouter.patch('/me/password', async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string }
    if (!currentPassword || !newPassword) throw new AppError('currentPassword and newPassword are required', 400)
    if (newPassword.length < 8) throw new AppError('New password must be at least 8 characters', 400)

    const user = await db.query.users.findFirst({
      where: eq(users.id, req.auth.userId),
      columns: { passwordHash: true },
    })

    if (!user?.passwordHash) throw new AppError('Password change not available for this account', 400)

    const valid = await verifyPassword(currentPassword, user.passwordHash)
    if (!valid) throw new AppError('Current password is incorrect', 401)

    const hash = await hashPassword(newPassword)
    await db.update(users).set({ passwordHash: hash, updatedAt: new Date() }).where(eq(users.id, req.auth.userId))

    res.status(204).end()
  } catch (err) {
    next(err)
  }
})

// ─── Admin: user management ───────────────────────────────────────────────────

const guard = [authorize('admin')]

// GET /api/v1/users  (admin)
usersRouter.get('/', ...guard, async (req, res, next) => {
  try {
    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatarUrl: users.avatarUrl,
        role: memberships.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .innerJoin(memberships, eq(users.id, memberships.userId))
      .where(eq(memberships.orgId, req.auth.orgId))
      .orderBy(asc(users.name))
    res.json(rows)
  } catch (err) {
    next(err)
  }
})

// PATCH /api/v1/users/:id/role  (admin)
usersRouter.patch('/:id/role', ...guard, async (req, res, next) => {
  try {
    const { id } = req.params as { id: string }
    const { role } = req.body as { role?: string }
    const validRoles = ['admin', 'expert', 'member', 'client'] as const
    if (!role || !validRoles.includes(role as (typeof validRoles)[number])) {
      throw new AppError(`Role must be one of: ${validRoles.join(', ')}`, 400)
    }
    if (id === req.auth.userId) throw new AppError('Cannot change your own role', 400)

    const [updated] = await db
      .update(memberships)
      .set({ role: role as (typeof validRoles)[number] })
      .where(and(eq(memberships.userId, id), eq(memberships.orgId, req.auth.orgId)))
      .returning({ role: memberships.role })

    if (!updated) throw new AppError('User not found', 404)
    res.json(updated)
  } catch (err) {
    next(err)
  }
})
