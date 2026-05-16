import { NextFunction, Request, Response } from 'express'
import { AppError } from '../lib/errors'

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: err.message,
      ...(err.code ? { code: err.code } : {}),
    })
  }

  // Structured error log — captured by platform log aggregators in production
  const isDev = process.env.NODE_ENV !== 'production'
  const message = err instanceof Error ? err.message : String(err)
  const stack = err instanceof Error ? err.stack : undefined

  if (isDev) {
    console.error('[error handler]', err)
  } else {
    console.error(JSON.stringify({ level: 'error', msg: message, stack }))
  }

  res.status(500).json({
    error: 'Internal server error',
    ...(isDev ? { detail: message, stack } : {}),
  })
}
