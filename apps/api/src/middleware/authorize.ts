import { NextFunction, Request, Response } from 'express'

type Role = 'owner' | 'admin' | 'member' | 'client'

// Higher number = more access. authorize('admin') passes for owner and admin.
const ROLE_RANK: Record<Role, number> = {
  owner: 4,
  admin: 3,
  member: 2,
  client: 1,
}

export function authorize(minimum: Role) {
  return (req: Request, res: Response, next: NextFunction) => {
    const rank = ROLE_RANK[req.auth.role as Role] ?? 0
    if (rank < ROLE_RANK[minimum]) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    next()
  }
}
