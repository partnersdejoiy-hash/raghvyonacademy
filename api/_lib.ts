// Shared helpers for the Vercel Functions. Files starting with "_" are not routes.
import crypto from 'node:crypto';

const env = (k: string) => {
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

export const fail = (message: string, status = 400) => json({ error: message }, status);

/** Wrap a handler so thrown errors become a 500 without leaking internals. */
export const route = (fn: (req: Request) => Promise<Response>) => async (req: Request) => {
  try {
    return await fn(req);
  } catch (err) {
    console.error(err);
    return fail('Something went wrong. Please try again.', 500);
  }
};

/* ---------------- session: "<userId>.<expiresAt>.<hmac>" in an HttpOnly cookie ---------------- */

const COOKIE = 'rv_session';
const MAX_AGE = 60 * 60 * 24 * 30;

const sign = (payload: string, secret: string) => crypto.createHmac('sha256', secret).update(payload).digest('base64url');

export function makeToken(userId: number, secret: string, now = Date.now()) {
  const payload = `${userId}.${now + MAX_AGE * 1000}`;
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

export const sessionCookie = (userId: number) =>
  `${COOKIE}=${makeToken(userId, env('SESSION_SECRET'))}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE}`;

export const clearCookie = () => `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;

export type User = { id: number; email: string; name: string; role: 'student' | 'parent' | 'admin'; avatar_url: string | null; grade: string | null };

export async function currentUser(req: Request): Promise<User | null> {
  const cookie = req.headers.get('cookie') || '';
  const token = cookie.split(/;\s*/).find((c) => c.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
  const id = readToken(token, env('SESSION_SECRET'));
  if (!id) return null;
  const [user] = await q<User>('SELECT id,email,name,role,avatar_url,grade FROM users WHERE id=?', [id]);
  return user ?? null;
}

export const isAdminEmail = (email: string) => email.trim().toLowerCase() === (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
