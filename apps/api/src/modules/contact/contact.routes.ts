import { type Request, Router } from 'express'
import { sendContactEmail } from '../../lib/email'
import { AppError } from '../../lib/errors'
import { db } from '../../db/client'
import { cmsInquiries } from '../../db/schema'

export const contactRouter = Router()

// Simple in-memory rate limiter: 5 submissions per IP per 15 minutes.
// No external dependency; sufficient for a low-traffic agency contact form.
const RATE_WINDOW_MS = 15 * 60 * 1000
const RATE_MAX = 5
const ipLog = new Map<string, { count: number; resetAt: number }>()

function getIp(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ??
    req.ip ??
    'unknown'
  )
}

function isRateLimited(req: Request): boolean {
  const key = getIp(req)
  const now = Date.now()
  const entry = ipLog.get(key)

  if (!entry || now > entry.resetAt) {
    ipLog.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return false
  }
  if (entry.count >= RATE_MAX) return true
  entry.count++
  return false
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// POST /api/v1/contact — public, no auth required
contactRouter.post('/', async (req, res, next) => {
  if (isRateLimited(req)) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' })
  }
  try {
    const { name, email, company, budget, message, inquiryType, theme, intent } = req.body as {
      name?: string
      email?: string
      company?: string
      budget?: string
      message?: string
      inquiryType?: string
      theme?: string
      intent?: string
    }

    if (!name?.trim() || name.trim().length < 2) {
      throw new AppError('Name is required', 400)
    }
    if (!email?.trim() || !validateEmail(email.trim())) {
      throw new AppError('Valid email is required', 400)
    }
    if (!message?.trim() || message.trim().length < 20) {
      throw new AppError('Message must be at least 20 characters', 400)
    }

    const [trimmedName, trimmedEmail, trimmedMessage] = [
      name.trim(),
      email.trim(),
      message.trim(),
    ]

    await Promise.all([
      sendContactEmail({
        name: trimmedName,
        email: trimmedEmail,
        company: company?.trim(),
        budget: budget?.trim(),
        message: trimmedMessage,
        inquiryType: inquiryType?.trim(),
        theme: theme?.trim(),
        intent: intent?.trim(),
      }),
      db.insert(cmsInquiries).values({
        name: trimmedName,
        email: trimmedEmail,
        company: company?.trim() ?? null,
        budget: budget?.trim() ?? null,
        message: trimmedMessage,
        inquiryType: inquiryType?.trim() ?? null,
        themeSlug: theme?.trim() ?? null,
        intent: intent?.trim() ?? null,
        status: 'new',
      }),
    ])

    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})
