import { q, json, fail, route, sessionCookie, isAdminEmail, type User } from '../_lib.js';

type TokenInfo = { aud: string; email: string; email_verified: string; name?: string; picture?: string; sub: string; exp: string };

// Google Identity Services posts an ID token; Google's tokeninfo endpoint checks signature and expiry for us.
// shortcut: one HTTP call per sign-in, fine at academy scale; switch to local JWKS verification if sign-ins get busy.
export const POST = route(async (req) => {
  const { credential } = (await req.json().catch(() => ({}))) as { credential?: string };
  if (!credential) return fail('Missing Google credential');

  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
  if (!res.ok) return fail('Google could not verify this sign-in', 401);
  const info = (await res.json()) as TokenInfo;
  if (info.aud !== process.env.GOOGLE_CLIENT_ID || info.email_verified !== 'true') return fail('Google could not verify this sign-in', 401);

  const email = info.email.toLowerCase();
  const role = isAdminEmail(email) ? 'admin' : 'student';
  const [user] = await q<User>(
    `INSERT INTO users (email,name,role,google_sub,avatar_url) VALUES (?,?,?,?,?)
     ON CONFLICT(email) DO UPDATE SET name=excluded.name, google_sub=excluded.google_sub, avatar_url=excluded.avatar_url,
       role=CASE WHEN excluded.role='admin' THEN 'admin' ELSE users.role END
     RETURNING id,email,name,role,avatar_url,grade`,
    [email, info.name || email.split('@')[0], role, info.sub, info.picture || null],
  );
  return json({ user }, 200, { 'set-cookie': sessionCookie(user.id) });
});
