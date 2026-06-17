import 'dotenv/config'
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { router } from './router'
import { errorHandler } from './middleware/error'
import { pool } from './db/client'
import { wcWebhookHandler } from './modules/woocommerce/woocommerce.webhooks'

const app = express()

// Trust the first proxy hop — required for correct req.ip behind Railway / Render / Fly
app.set('trust proxy', 1)

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

// Webhook route must be registered BEFORE express.json() so we receive the raw
// body buffer needed for HMAC-SHA256 signature verification.
app.post(
  '/api/v1/commerce/webhooks/woocommerce',
  express.raw({ type: 'application/json' }),
  wcWebhookHandler,
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
