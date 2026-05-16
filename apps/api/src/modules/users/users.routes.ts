import { eq } from 'drizzle-orm'
import { Router } from 'express'
import { db } from '../../db/client'
import { users } from '../../db/schema'
import { authenticate } from '../../middleware/authenticate'

export const usersRouter = Router()

// GET /api/v1/users/me
usersRouter.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.auth.sub),
      columns: { id: true, email: true, name: true, avatarUrl: true },
    })
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ ...user, orgId: req.auth.orgId, role: req.auth.role })
  } catch (err) {
    next(err)
  }
})
