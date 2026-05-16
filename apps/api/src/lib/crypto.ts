import bcrypt from 'bcrypt'
import crypto from 'crypto'

const COST_FACTOR = 12

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, COST_FACTOR)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function sha256(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex')
}

export function randomToken(byteLength = 32): string {
  return crypto.randomBytes(byteLength).toString('hex')
}
