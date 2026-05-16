import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { verifyAccessToken, type AccessTokenPayload } from '../lib/tokens'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth: AccessTokenPayload
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    req.auth = verifyAccessToken(header.slice(7))
    next()
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' })
    }
    res.status(401).json({ error: 'Unauthorized' })
  }
}
