import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import { router } from './router'
import { errorHandler } from './middleware/error'
import { pool } from './db/client'
import { wcWebhookHandler } from './modules/woocommerce/woocommerce.webhooks'
import { stripeWebhookHandler } from './modules/stripe/stripe.webhooks'

// Fail fast if required env vars are absent — catches misconfigured deployments at startup
const REQUIRED_ENV = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'] as const
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) throw new Error(`Missing required env var: ${key}`)
}

const app = express()

// Trust the first proxy hop — required for correct req.ip behind Railway / Render / Fly
app.set('trust proxy', 1)

app.use(helmet({
  crossOriginEmbedderPolicy: false, // relaxed — portal loads external images/fonts
  contentSecurityPolicy: false,     // configure per route if needed; default blocks inline scripts
}))

// Parse WEB_URL as a comma-separated list to support apex + www in production
const allowedOrigins = (process.env.WEB_URL ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

app.use(
  cors({
    origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
    credentials: true,
  }),
)

// Global rate limit — 300 req / 15 min per IP
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
  }),
)

// Strict limit on auth endpoints — 5 req / 15 min per IP (brute-force protection)
app.use(
  '/api/v1/auth',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many auth attempts, please try again later.' },
    skip: (req) => req.path === '/refresh', // refresh is safe to call often
  }),
)

// Webhook routes must be registered BEFORE express.json() to receive the raw body buffer.
app.post(
  '/api/v1/commerce/webhooks/woocommerce',
  express.raw({ type: 'application/json' }),
  wcWebhookHandler,
)
app.post(
  '/api/v1/stripe/webhook',
  express.raw({ type: 'application/json' }),
  stripeWebhookHandler,
)

app.use(express.json({ limit: '256kb' }))
app.use(cookieParser())

app.get('/health', (_req, res) => res.json({ ok: true, ts: new Date().toISOString() }))

app.use('/api/v1', router)
app.use(errorHandler)

process.on('unhandledRejection', (reason) => {
  console.error(JSON.stringify({ level: 'error', msg: 'Unhandled rejection', reason: String(reason) }))
})

process.on('uncaughtException', (err) => {
  console.error(JSON.stringify({ level: 'fatal', msg: 'Uncaught exception', error: err.message }))
  process.exit(1)
})

const PORT = process.env.PORT ?? 3001

app.listen(PORT, async () => {
  console.log(JSON.stringify({ level: 'info', msg: `API listening`, port: PORT, env: process.env.NODE_ENV }))

  // Warm the connection pool so the first real request doesn't pay cold-start cost
  try {
    const client = await pool.connect()
    client.release()
    console.log(JSON.stringify({ level: 'info', msg: 'DB connection pool warmed' }))
  } catch (err) {
    console.error(JSON.stringify({ level: 'error', msg: 'DB pool warm failed', error: String(err) }))
  }
})
