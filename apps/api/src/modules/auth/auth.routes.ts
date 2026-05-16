import { type Response, Router } from 'express'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'
import { validate } from '../../middleware/validate'
import * as authService from './auth.service'
import {
  acceptInviteSchema,
  inviteSchema,
  loginSchema,
  registerSchema,
} from './auth.schema'

export const authRouter = Router()

const COOKIE_NAME = 'refresh_token'

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/api/v1/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

function setRefreshCookie(res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, cookieOptions)
}

// POST /api/v1/auth/register
authRouter.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const { accessToken, refreshToken, user } = await authService.register(req.body)
    setRefreshCookie(res, refreshToken)
    res.status(201).json({ accessToken, user })
  } catch (err) {
    next(err)
  }
})

// POST /api/v1/auth/login
authRouter.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { accessToken, refreshToken, user } = await authService.login(req.body)
    setRefreshCookie(res, refreshToken)
    res.json({ accessToken, user })
  } catch (err) {
    next(err)
  }
})

// POST /api/v1/auth/refresh
authRouter.post('/refresh', async (req, res, next) => {
  try {
    const token = req.cookies[COOKIE_NAME]
    if (!token) return res.status(401).json({ error: 'Unauthorized' })
    const { accessToken } = await authService.refresh(token)
    res.json({ accessToken })
  } catch (err) {
    next(err)
  }
})

// POST /api/v1/auth/logout
authRouter.post('/logout', async (req, res, next) => {
  try {
    const token = req.cookies[COOKIE_NAME]
    if (token) await authService.logout(token)
    res.clearCookie(COOKIE_NAME, { path: cookieOptions.path }).status(204).send()
  } catch (err) {
    next(err)
  }
})

// POST /api/v1/auth/invite  (admin or owner only)
authRouter.post(
  '/invite',
  authenticate,
  authorize('admin'),
  validate(inviteSchema),
  async (req, res, next) => {
    try {
      await authService.sendInvite(req.auth, req.body)
      res.status(202).json({ message: 'Invite sent' })
    } catch (err) {
      next(err)
    }
  },
)

// POST /api/v1/auth/accept-invite
authRouter.post('/accept-invite', validate(acceptInviteSchema), async (req, res, next) => {
  try {
    const { accessToken, refreshToken, user } = await authService.acceptInvite(req.body)
    setRefreshCookie(res, refreshToken)
    res.status(201).json({ accessToken, user })
  } catch (err) {
    next(err)
  }
})
