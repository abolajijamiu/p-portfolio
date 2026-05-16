import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 15_000, // Neon serverless cold starts can take 4-10s
})

// Without this listener, a stale connection error from Neon crashes the process
pool.on('error', (err) => {
  console.error('[pool] idle client error:', err.message)
})

export const db = drizzle(pool, { schema })

export type DB = typeof db
