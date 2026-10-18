// Shared helpers for the API. Files starting with "_" are not routes.
import crypto from 'node:crypto';

export const env = (k: string) => {
  const v = process.env[k]?.trim(); // pasted dashboard values often carry a trailing space
  if (!v) throw new Error(`Missing env var ${k}`);
  return v;
};

/** Run one statement on Cloudflare D1 over its REST API. */
export async function q<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${env('CF_ACCOUNT_ID')}/d1/database/${env('CF_D1_DATABASE_ID')}/query`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${env('CF_API_TOKEN')}`, 'content-type': 'application/json' },
      body: JSON.stringify({ sql, params }),
    },
  );
  const body = (await res.json()) as { success: boolean; errors?: { message: string }[]; result?: { results: T[] }[] };
  if (!body.success) throw new Error(`D1: ${body.errors?.map((e) => e.message).join('; ') || res.status}`);
  return body.result?.[0]?.results ?? [];
}

export const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', ...headers } });

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
export const fail = (message: string, status = 400) => json({ error: message }, status);

/** Public origin of this deployment, for OAuth redirects. */
export const origin = (req: Request) => {
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || new URL(req.url).host;
  return `${host.startsWith('localhost') ? 'http' : 'https'}://${host}`;
};

export const readJson = async <T>(req: Request): Promise<Partial<T>> => (await req.json().catch(() => ({}))) as Partial<T>;

/* ---------------- cookies & sessions ---------------- */

export const cookie = (req: Request, name: string) =>
  (req.headers.get('cookie') || '').split(/;\s*/).find((c) => c.startsWith(`${name}=`))?.slice(name.length + 1);

export const setCookie = (name: string, value: string, maxAge: number) =>
  `${name}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;

const SESSION = 'rv_session';
const SESSION_AGE = 60 * 60 * 24 * 30;

export const sign = (payload: string, secret = env('SESSION_SECRET')) => crypto.createHmac('sha256', secret).update(payload).digest('base64url');

export function makeToken(userId: number, secret: string, now = Date.now()) {
  const payload = `${userId}.${now + SESSION_AGE * 1000}`;
  return `${payload}.${sign(payload, secret)}`;
}

export function readToken(token: string | undefined, secret: string, now = Date.now()): number | null {
  const [id, exp, sig] = (token || '').split('.');
  if (!id || !exp || !sig) return null;
  const expected = sign(`${id}.${exp}`, secret);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  if (Number(exp) < now) return null;
  return Number(id) || null;
}

export const sessionCookie = (userId: number) => setCookie(SESSION, makeToken(userId, env('SESSION_SECRET')), SESSION_AGE);
export const clearSessionCookie = () => setCookie(SESSION, '', 0);

export type Role = 'student' | 'parent' | 'teacher' | 'admin';
export type User = { id: number; email: string; name: string; role: Role; avatar_url: string | null; grade: string | null };

export async function currentUser(req: Request): Promise<User | null> {
  const id = readToken(cookie(req, SESSION), env('SESSION_SECRET'));
  if (!id) return null;
  const [user] = await q<User>('SELECT id,email,name,role,avatar_url,grade FROM users WHERE id=?', [id]);
  return user ?? null;
}

export async function requireUser(req: Request, roles?: Role[]) {
  const user = await currentUser(req);
  if (!user) throw new HttpError(401, 'Not signed in');
  if (roles && !roles.includes(user.role)) throw new HttpError(403, 'You do not have access to this');
  return user;
}

export const isAdminEmail = (email: string) => email.trim().toLowerCase() === (process.env.ADMIN_EMAIL || '').trim().toLowerCase();

/* ---------------- encryption for stored refresh tokens (AES-256-GCM) ---------------- */

const key = () => crypto.createHash('sha256').update(env('SESSION_SECRET')).digest();

export function encrypt(text: string) {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const enc = Buffer.concat([c.update(text, 'utf8'), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), enc]).toString('base64url');
}

export function decrypt(b64: string) {
  const buf = Buffer.from(b64, 'base64url');
  const d = crypto.createDecipheriv('aes-256-gcm', key(), buf.subarray(0, 12));
  d.setAuthTag(buf.subarray(12, 28));
  return Buffer.concat([d.update(buf.subarray(28)), d.final()]).toString('utf8');
}
