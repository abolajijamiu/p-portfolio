import { type Response, Router } from 'express'
import { authenticate } from '../../middleware/authenticate'
import { authorize } from '../../middleware/authorize'
import { validate } from '../../middleware/validate'
import * as authService from './auth.service'
import * as twoFAService from './auth.2fa.service'
import { verifyPendingTotpToken } from '../../lib/tokens'
import { AppError } from '../../lib/errors'
import {
  acceptInviteSchema,
  clientRegisterSchema,
  forgotPasswordSchema,
  inviteSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
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

// POST /api/v1/auth/register  (owner — creates a new org)
authRouter.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const { accessToken, refreshToken, user } = await authService.register(req.body)
    setRefreshCookie(res, refreshToken)
    res.status(201).json({ accessToken, user })
  } catch (err) {
    next(err)
  }
})

// POST /api/v1/auth/client-register  (client — joins the platform org)
authRouter.post('/client-register', validate(clientRegisterSchema), async (req, res, next) => {
  try {
    const { accessToken, refreshToken, user } = await authService.clientRegister(req.body)
    setRefreshCookie(res, refreshToken)
    res.status(201).json({ accessToken, user })
  } catch (err) {
    next(err)
  }
})

// POST /api/v1/auth/login
authRouter.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const result = await authService.login(req.body)
    if ('requires2FA' in result) {
      return res.json(result)
    }
    setRefreshCookie(res, result.refreshToken)
    res.json({ accessToken: result.accessToken, user: result.user })
  } catch (err) {
    next(err)
  }
})

// POST /api/v1/auth/2fa/verify  (complete login with TOTP code)
authRouter.post('/2fa/verify', async (req, res, next) => {
  try {
    const { pendingToken, code } = req.body
    if (!pendingToken || !code) throw new AppError('pendingToken and code are required', 400)
    let payload: ReturnType<typeof verifyPendingTotpToken>
    try { payload = verifyPendingTotpToken(pendingToken) } catch {
      throw new AppError('Invalid or expired pending token', 401)
    }
    const { accessToken, refreshToken, user } = await authService.verifyTotpLogin(payload, code)
    setRefreshCookie(res, refreshToken)
    res.json({ accessToken, user })
  } catch (err) {
    next(err)
  }
})

// GET /api/v1/auth/2fa/status
authRouter.get('/2fa/status', authenticate, async (req, res, next) => {
  try { res.json(await twoFAService.get2FAStatus(req.auth)) } catch (err) { next(err) }
})

// POST /api/v1/auth/2fa/setup  (generate secret + QR)
authRouter.post('/2fa/setup', authenticate, async (req, res, next) => {
  try { res.json(await twoFAService.setup2FA(req.auth)) } catch (err) { next(err) }
})

// POST /api/v1/auth/2fa/enable  (confirm code to activate)
authRouter.post('/2fa/enable', authenticate, async (req, res, next) => {
  try {
    await twoFAService.enable2FA(req.auth, req.body.code)
    res.json({ ok: true })
  } catch (err) { next(err) }
})

// POST /api/v1/auth/2fa/disable
authRouter.post('/2fa/disable', authenticate, async (req, res, next) => {
  try {
    await twoFAService.disable2FA(req.auth, req.body.code)
    res.json({ ok: true })
  } catch (err) { next(err) }
})

// POST /api/v1/auth/refresh
authRouter.post('/refresh', async (req, res, next) => {
  try {
    const token = req.cookies[COOKIE_NAME]
    if (!token) return res.status(401).json({ error: 'Unauthorized' })
    const { accessToken, refreshToken } = await authService.refresh(token)
    setRefreshCookie(res, refreshToken)
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

// POST /api/v1/auth/forgot-password
authRouter.post('/forgot-password', validate(forgotPasswordSchema), async (req, res, next) => {
  try {
    await authService.forgotPassword(req.body.email)
    // Always 200 — never reveal whether the email exists
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

// POST /api/v1/auth/reset-password
authRouter.post('/reset-password', validate(resetPasswordSchema), async (req, res, next) => {
  try {
    await authService.resetPassword(req.body.token, req.body.password)
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})
