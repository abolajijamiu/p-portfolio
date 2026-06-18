import jwt from 'jsonwebtoken'
import { randomToken, sha256 } from './crypto'

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!
const ACCESS_EXPIRY = '15m'
const REFRESH_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000

export type AccessTokenPayload = {
  sub: string
  userId: string
  orgId: string
  role: string
}

export function signAccessToken(payload: { sub: string; userId: string; orgId: string; role: string }): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY })
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, ACCESS_SECRET) as AccessTokenPayload
}

export function generateRefreshToken(): { raw: string; hash: string; expiresAt: Date } {
  const raw = randomToken(40)
  return {
    raw,
    hash: sha256(raw),
    expiresAt: new Date(Date.now() + REFRESH_EXPIRY_MS),
  }
}

export function generateInviteToken(): { raw: string; hash: string } {
  const raw = randomToken(32)
  return { raw, hash: sha256(raw) }
}

export type PendingTotpPayload = {
  sub: string
  userId: string
  orgId: string
  role: string
  type: 'totp_pending'
}

export function signPendingTotpToken(payload: Omit<PendingTotpPayload, 'type' | 'userId'>): string {
  return jwt.sign({ ...payload, userId: payload.sub, type: 'totp_pending' }, ACCESS_SECRET, { expiresIn: '5m' })
}

export function verifyPendingTotpToken(token: string): PendingTotpPayload {
  const payload = jwt.verify(token, ACCESS_SECRET) as PendingTotpPayload
  if (payload.type !== 'totp_pending') throw new Error('Invalid token type')
  return payload
}
