import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
process.env.NODE_ENV = 'test';
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'raghvyon-auth-'));
process.env.DATABASE_PATH = path.join(dir, 'test.db');
process.env.SESSION_SECRET = 'test-auth-flow-secret';
process.env.GOOGLE_CLIENT_ID = 'test-client';
process.env.GOOGLE_CLIENT_SECRET = 'test-secret';
const { createApp } = await import('../server');
const { db } = await import('../server/db');
const server = createApp().listen(0);
await new Promise<void>(resolve => server.on('listening', resolve));
const base = `http://127.0.0.1:${(server.address() as any).port}`;
const originalFetch = globalThis.fetch;
let verified: boolean | undefined = true;
globalThis.fetch = async (input, init) => {
  const url = String(input);
  if (url === 'https://oauth2.googleapis.com/token') return Response.json({ access_token: 'mock-token' });
  if (url === 'https://openidconnect.googleapis.com/v1/userinfo') return Response.json({ sub: 'mock-user', email: 'flow@example.com', email_verified: verified, name: 'Flow Student' });
  return originalFetch(input, init);
};
async function signIn(returnTo: string) {
  const start = await fetch(`${base}/api/auth/google?returnTo=${encodeURIComponent(returnTo)}`, { redirect: 'manual' });
  const cookie = start.headers.get('set-cookie')!.split(';')[0];
  const state = new URL(start.headers.get('location')!).searchParams.get('state')!;
  assert.match(state, /^[A-Za-z0-9_-]{43}$/);
  return { cookie, state };
}
try {
  let flow = await signIn('/courses');
  let res = await fetch(`${base}/api/auth/google/callback?code=mock&state=wrong`, { headers: { Cookie: flow.cookie }, redirect: 'manual' });
  assert.match(res.headers.get('location')!, /oauth_state/);
  res = await fetch(`${base}/api/auth/google/callback?code=mock&state=${flow.state}`, { headers: { Cookie: flow.cookie }, redirect: 'manual' });
  assert.equal(res.headers.get('location'), '/courses');
  const authenticatedCookie = res.headers.get('set-cookie')!.split(';')[0];
  assert.notEqual(authenticatedCookie, flow.cookie);
  const session = await fetch(`${base}/api/auth/session`, { headers: { Cookie: authenticatedCookie } }).then(r => r.json());
  assert.equal(session.user.role, 'student');
  const oldSession = await fetch(`${base}/api/auth/session`, { headers: { Cookie: flow.cookie } }).then(r => r.json());
  assert.equal(oldSession.user, null);
  for (const returnTo of ['//evil.example', '/\\evil.example']) {
    flow = await signIn(returnTo);
    res = await fetch(`${base}/api/auth/google/callback?code=mock&state=${flow.state}`, { headers: { Cookie: flow.cookie }, redirect: 'manual' });
    assert.equal(res.headers.get('location'), '/dashboard');
  }
  verified = undefined;
  flow = await signIn('/dashboard');
  res = await fetch(`${base}/api/auth/google/callback?code=mock&state=${flow.state}`, { headers: { Cookie: flow.cookie }, redirect: 'manual' });
  assert.match(res.headers.get('location')!, /google_email_unverified/);
  console.log('Google flow regression checks passed: state, redirect, session regeneration, verified email.');
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  globalThis.fetch = originalFetch;
  await new Promise<void>(resolve => server.close(() => resolve()));
  db.close();
  fs.rmSync(dir, { recursive: true, force: true });
  process.exit(process.exitCode || 0);
}
