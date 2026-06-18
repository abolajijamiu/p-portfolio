import { eq } from 'drizzle-orm'
import QRCode from 'qrcode'
import { db } from '../../db/client'
import { users } from '../../db/schema'
import { AppError } from '../../lib/errors'
import { generateSecret, verifyTotp, keyUri } from '../../lib/totp'
import type { AccessTokenPayload } from '../../lib/tokens'
import { log } from '../audit/audit.service'

const APP_NAME = 'E-Tech OS'

export async function setup2FA(auth: AccessTokenPayload) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, auth.userId),
    columns: { email: true, totpEnabled: true },
  })
  if (!user) throw new AppError('User not found', 404)
  if (user.totpEnabled) throw new AppError('2FA is already enabled', 400)

  const secret = generateSecret()
  const otpauthUrl = keyUri(user.email, APP_NAME, secret)
  const qrDataUrl = await QRCode.toDataURL(otpauthUrl)

  await db.update(users).set({ totpSecret: secret }).where(eq(users.id, auth.userId))

  return { secret, otpauthUrl, qrDataUrl }
}

export async function enable2FA(auth: AccessTokenPayload, code: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, auth.userId),
    columns: { totpSecret: true, totpEnabled: true },
  })
  if (!user?.totpSecret) throw new AppError('Run setup first', 400)
  if (user.totpEnabled) throw new AppError('2FA already enabled', 400)

  if (!verifyTotp(code, user.totpSecret)) throw new AppError('Invalid code', 400)

  await db.update(users).set({ totpEnabled: true }).where(eq(users.id, auth.userId))
  await log({ actorId: auth.userId, action: 'auth.2fa.enable', entityType: 'user', entityId: auth.userId })
}

export async function disable2FA(auth: AccessTokenPayload, code: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, auth.userId),
    columns: { totpSecret: true, totpEnabled: true },
  })
  if (!user?.totpEnabled || !user.totpSecret) throw new AppError('2FA is not enabled', 400)

  if (!verifyTotp(code, user.totpSecret)) throw new AppError('Invalid code', 400)

  await db.update(users).set({ totpEnabled: false, totpSecret: null }).where(eq(users.id, auth.userId))
  await log({ actorId: auth.userId, action: 'auth.2fa.disable', entityType: 'user', entityId: auth.userId })
}

export async function get2FAStatus(auth: AccessTokenPayload) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, auth.userId),
    columns: { totpEnabled: true },
  })
  return { enabled: user?.totpEnabled ?? false }
}

export function verifyTotpCode(secret: string, code: string): boolean {
  return verifyTotp(code, secret)
}
