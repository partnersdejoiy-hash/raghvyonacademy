/**
 * RAGHVYON ACADEMY — Authentication & RBAC.
 *
 * Two SEPARATE Google flows:
 *  1. Google Sign-In (identity): scopes openid + email + profile ONLY.
 *  2. Google Drive (storage):    scope drive.file ONLY, explicit user action.
 *
 * Identity is ALWAYS derived from the server-side session (httpOnly cookie).
 * The frontend never decides role, user id, or student/parent linkage.
 */
import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { db, findUserByEmail, findUserByGoogleSub, createUser, linkGoogleIdentity, userRowToProfile } from '../db';
import { logAudit } from './audit';

/* ------------------------------------------------------------------ */
/* Session typing                                                      */
/* ------------------------------------------------------------------ */
export interface SessionUser {
  id: number;
  email: string;
  name: string;
  role: 'student' | 'parent' | 'admin';
}

declare module 'express-session' {
  interface SessionData {
    userId?: number;
    oauthState?: string;
    oauthReturnTo?: string;
    oauthIntent?: 'signin' | 'drive';
  }
}

export function getSessionUser(req: Request): SessionUser | null {
  const userId = (req.session as any)?.userId;
  if (!userId) return null;
  const row = db.prepare('SELECT id, email, name, role FROM users WHERE id = ?').get(userId) as any;
  if (!row) return null;
  return { id: row.id, email: row.email, name: row.name, role: row.role };
}

export function requireAuth(req: Request, res: any, next: NextFunction) {
  const user = getSessionUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
  }
  (req as any).user = user;
  next();
}

export function requireRole(...roles: Array<'student' | 'parent' | 'admin'>) {
  return (req: Request, res: any, next: NextFunction) => {
    const user = getSessionUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
    }
    if (!roles.includes(user.role)) {
      return res.status(403).json({ error: 'You do not have permission to access this resource.' });
    }
    (req as any).user = user;
    next();
  };
}

/* ------------------------------------------------------------------ */
/* GOOGLE SIGN-IN (identity scopes only)                               */
/* ------------------------------------------------------------------ */
const SIGNIN_SCOPES = 'openid email profile';
const SIGNIN_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const SIGNIN_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SIGNIN_USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo';

export function isGoogleSignInConfigured(): boolean {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function buildSignInAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || '',
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: SIGNIN_SCOPES,
    access_type: 'online',
    state,
  });
  return `${SIGNIN_AUTH_URL}?${params.toString()}`;
}

export interface GoogleIdentity {
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string;
  picture?: string;
}

/** Exchange sign-in code and fetch verified identity from Google's userinfo endpoint. */
export async function exchangeSignInCode(code: string, redirectUri: string): Promise<GoogleIdentity> {
  const res = await fetch(SIGNIN_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });
  if (!res.ok) throw new Error('GOOGLE_TOKEN_EXCHANGE_FAILED');
  const tokens = (await res.json()) as { access_token: string };

  const uiRes = await fetch(SIGNIN_USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  if (!uiRes.ok) throw new Error('GOOGLE_IDENTITY_FAILED');
  const ui = (await uiRes.json()) as { sub: string; email?: string; email_verified?: boolean; name?: string; picture?: string };
  if (!ui.sub || !ui.email) throw new Error('GOOGLE_IDENTITY_INCOMPLETE');
  return {
    sub: ui.sub,
    email: ui.email.toLowerCase(),
    emailVerified: ui.email_verified !== false,
    name: ui.name || ui.email.split('@')[0],
    picture: ui.picture,
  };
}

/**
 * Find or provision the RAGHVYON account for a verified Google identity.
 * - Existing account (matched by google_sub, else by email) is linked & reused.
 * - New Google users become students by default.
 */
export function resolveAccountForGoogleIdentity(identity: GoogleIdentity) {
  let user = findUserByGoogleSub(identity.sub) as any;
  if (!user) {
    const byEmail = findUserByEmail(identity.email) as any;
    if (byEmail) {
      // Verified Google email matches an existing account → link identity.
      linkGoogleIdentity(byEmail.id, identity.sub, identity.email, identity.picture);
      user = findUserByEmail(identity.email);
    } else {
      user = createUser({
        email: identity.email,
        name: identity.name,
        role: 'student',
        googleSub: identity.sub,
        googleEmail: identity.email,
        avatarUrl: identity.picture ?? null,
      });
    }
  }
  // OWNER BOOTSTRAP: the Academy owner designates their own Google email via
  // the ADMIN_EMAIL env var. Signing in with that email always resolves to
  // the admin account — no other path can grant this role.
  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  if (adminEmail && identity.email.toLowerCase() === adminEmail && user.role !== 'admin') {
    db.prepare(`UPDATE users SET role = 'admin', email = COALESCE(?, email) WHERE id = ?`).run(identity.email, user.id);
    user = findUserByGoogleSub(identity.sub) as any;
    logAudit('ROLE_CHANGE', user.id, user.email, 'Elevated to admin via ADMIN_EMAIL bootstrap', undefined);
  }
  return user;
}

/* ------------------------------------------------------------------ */
/* PASSWORD LOGIN                                                      */
/* ------------------------------------------------------------------ */
export async function verifyPasswordLogin(email: string, password: string, ip?: string) {
  const user = findUserByEmail(email) as any;
  const ok = user?.password_hash ? await bcrypt.compare(password, user.password_hash) : false;
  if (!ok) {
    logAudit('AUTH_FAILED', user?.id ?? null, email, 'Password login failed', ip);
    return null;
  }
  return user;
}

export function establishSession(res: any, userId: number) {
  // express-session regenerates the cookie when `regenerate` is called by the
  // caller; we simply set the userId here.
  (res.req as any).session.userId = userId;
}

export { userRowToProfile };
