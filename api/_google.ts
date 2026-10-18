// Google OAuth (authorization code flow) and the Classroom REST API.
import { env, q, encrypt, decrypt, HttpError, type Role } from './_lib.js';

const BASE_SCOPES = ['openid', 'email', 'profile'];
const CLASSROOM = 'https://www.googleapis.com/auth/classroom.';
const CAL = 'https://www.googleapis.com/auth/calendar.';
export const SCOPES: Record<'student' | 'teacher', string[]> = {
  // Students and parents read: their classes, their own work, announcements and their class schedule.
  student: [...['courses.readonly', 'coursework.me.readonly', 'announcements.readonly'].map((s) => CLASSROOM + s), CAL + 'events.readonly'],
  // Teachers manage classes, assignments, rosters, announcements, and schedule classes with Meet links.
  teacher: [...['courses', 'coursework.students', 'rosters', 'announcements', 'profile.emails'].map((s) => CLASSROOM + s), CAL + 'events'],
};

export function authUrl(redirectUri: string, state: string, connect?: 'student' | 'teacher') {
  const scope = [...BASE_SCOPES, ...(connect ? SCOPES[connect] : [])].join(' ');
  const p = new URLSearchParams({
    client_id: env('GOOGLE_CLIENT_ID'),
    redirect_uri: redirectUri,
    response_type: 'code',
    scope,
    state,
    access_type: 'offline',
    include_granted_scopes: 'true',
    // A refresh token is only issued on a consent screen, so force it when Classroom access is requested.
    prompt: connect ? 'consent' : 'select_account',
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${p}`;
}

type TokenResponse = { access_token: string; expires_in: number; refresh_token?: string; scope: string; id_token?: string; error?: string; error_description?: string };

async function tokenRequest(params: Record<string, string>) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: env('GOOGLE_CLIENT_ID'), client_secret: env('GOOGLE_CLIENT_SECRET'), ...params }),
  });
  const body = (await res.json()) as TokenResponse;
  if (!res.ok || body.error) throw new HttpError(401, `Google: ${body.error_description || body.error || res.status}`);
  return body;
}

export const exchangeCode = (code: string, redirectUri: string) => tokenRequest({ code, redirect_uri: redirectUri, grant_type: 'authorization_code' });

/** The id_token came straight from Google's token endpoint over TLS, so its payload can be read without re-verifying. */
export function idTokenPayload(idToken: string) {
  const payload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64url').toString('utf8'));
  return payload as { sub: string; email: string; email_verified: boolean; name?: string; picture?: string };
}

export async function storeTokens(userId: number, t: TokenResponse) {
  const expiresAt = Date.now() + (t.expires_in - 60) * 1000;
  if (t.refresh_token) {
    await q(
      `INSERT INTO google_tokens (user_id,refresh_token_enc,access_token,expires_at,scopes,updated_at) VALUES (?,?,?,?,?,datetime('now'))
       ON CONFLICT(user_id) DO UPDATE SET refresh_token_enc=excluded.refresh_token_enc, access_token=excluded.access_token,
         expires_at=excluded.expires_at, scopes=excluded.scopes, updated_at=datetime('now')`,
      [userId, encrypt(t.refresh_token), t.access_token, expiresAt, t.scope],
    );
  } else {
    await q(`UPDATE google_tokens SET access_token=?, expires_at=?, scopes=?, updated_at=datetime('now') WHERE user_id=?`, [t.access_token, expiresAt, t.scope, userId]);
  }
}

type TokenRow = { refresh_token_enc: string; access_token: string | null; expires_at: number; scopes: string };

export async function grantedScopes(userId: number) {
  const [row] = await q<TokenRow>('SELECT scopes FROM google_tokens WHERE user_id=?', [userId]);
  return row?.scopes.split(' ').filter(Boolean) ?? [];
}

export const hasClassroom = (scopes: string[], as: 'student' | 'teacher') => SCOPES[as].every((s) => scopes.includes(s));

async function accessToken(userId: number) {
  const [row] = await q<TokenRow>('SELECT refresh_token_enc,access_token,expires_at,scopes FROM google_tokens WHERE user_id=?', [userId]);
  if (!row) throw new HttpError(428, 'Google Classroom is not connected yet');
  if (row.access_token && row.expires_at > Date.now()) return row.access_token;
  const t = await tokenRequest({ refresh_token: decrypt(row.refresh_token_enc), grant_type: 'refresh_token' }).catch((e) => {
    throw new HttpError(428, `Google Classroom needs to be reconnected (${e.message})`);
  });
  await storeTokens(userId, { ...t, scope: t.scope || row.scopes });
  return t.access_token;
}

/** Call a Google API as a user. */
export async function gapi<T = Record<string, unknown>>(userId: number, url: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const token = await accessToken(userId);
  const res = await fetch(url, {
    method: init?.method || 'GET',
    headers: { Authorization: `Bearer ${token}`, ...(init?.body ? { 'content-type': 'application/json' } : {}) },
    body: init?.body ? JSON.stringify(init.body) : undefined,
  });
  const body = (await res.json().catch(() => ({}))) as T & { error?: { message?: string; status?: string } };
  if (!res.ok) {
    const msg = body.error?.message || res.statusText;
    if (res.status === 403 && /insufficient|scope/i.test(msg)) throw new HttpError(428, 'Google needs more permissions for this. Reconnect Google from your dashboard.');
    if (res.status === 403 && /not been used|is disabled/i.test(msg)) throw new HttpError(502, 'This Google API is not enabled for the project yet.');
    throw new HttpError(res.status === 404 ? 404 : 502, `Google: ${msg}`);
  }
  return body;
}

/** Classroom API; `path` is relative to /v1. */
export const classroom = <T = Record<string, unknown>>(userId: number, path: string, init?: { method?: string; body?: unknown }) =>
  gapi<T>(userId, `https://classroom.googleapis.com/v1/${path}`, init);

/** Calendar API; `path` is relative to /calendar/v3. */
export const calendar = <T = Record<string, unknown>>(userId: number, path: string, init?: { method?: string; body?: unknown }) =>
  gapi<T>(userId, `https://www.googleapis.com/calendar/v3/${path}`, init);

export const roleToScope = (role: Role): 'student' | 'teacher' => (role === 'teacher' || role === 'admin' ? 'teacher' : 'student');
