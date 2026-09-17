/**
 * Token encryption at rest (AES-256-GCM).
 *
 * Used exclusively by the server to encrypt Google OAuth access/refresh tokens
 * before they are persisted in the database. The key is derived from
 * SESSION_SECRET (server-side only) and is NEVER exposed to the frontend.
 */
import crypto from 'crypto';

const ALGO = 'aes-256-gcm';

function getKey(): Buffer {
  const secret = process.env.SESSION_SECRET || '';
  if (!secret) {
    // Fail loudly in production; fall back to a dev-only key otherwise.
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SESSION_SECRET must be configured in production.');
    }
    return crypto.createHash('sha256').update('dev-only-insecure-fallback-key').digest();
  }
  // Derive a stable 32-byte key from the configured secret.
  return crypto.createHash('sha256').update(secret).digest();
}

export function encryptToken(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString('base64'), tag.toString('base64'), encrypted.toString('base64')].join('.');
}

export function decryptToken(payload: string): string {
  const [ivB64, tagB64, dataB64] = payload.split('.');
  if (!ivB64 || !tagB64 || !dataB64) throw new Error('Malformed encrypted token payload');
  const decipher = crypto.createDecipheriv(ALGO, getKey(), Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(dataB64, 'base64')), decipher.final()]).toString('utf8');
}

/** Cryptographically random string for OAuth `state` params and session ids. */
export function randomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('base64url');
}
