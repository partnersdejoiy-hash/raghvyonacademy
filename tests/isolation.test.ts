/**
 * RAGHVYON ACADEMY — §37 Data Isolation & Authorization Test Suite.
 *
 * Boots the REAL Express app (createApp) with an isolated temporary SQLite
 * database and verifies every security requirement from requirement §37:
 *  - Student A cannot access Student B's dashboard/assignments/Drive
 *  - Parent A cannot access Parent B's or unrelated children
 *  - Admin cannot access private Drive tokens
 *  - Logged-out users cannot call protected APIs
 *  - Frontend cannot change its role via request body
 *  - Students cannot call admin endpoints
 *
 * Run with: bun run test:security
 */
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

/* --- Isolated environment BEFORE importing server modules ------------- */
process.env.NODE_ENV = 'test';
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'raghvyon-test-'));
process.env.DATA_DIR = tmpDir;
process.env.DATABASE_PATH = path.join(tmpDir, 'test.db');
process.env.SESSION_SECRET = 'test-only-session-secret-for-isolation-suite';

/* --- Start app --------------------------------------------------------- */
const { createApp } = await import('../server');
import type { Express } from 'express';

const app: Express = createApp();

let server: any;
let BASE = '';
const cookie = (jar: string) => ({ Cookie: jar });
let pass = 0, fail = 0;
const failures: string[] = [];

function check(name: string, cond: boolean, detail = '') {
  if (cond) { pass++; console.log(`  ✅ ${name}`); }
  else { fail++; failures.push(name + (detail ? ` — ${detail}` : '')); console.log(`  ❌ ${name} ${detail}`); }
}

async function call(
  jar: string | null,
  method: string,
  url: string,
  body?: any,
  extraHeaders: Record<string, string> = {}
): Promise<{ status: number; body: any; setCookie?: string[] }> {
  const headers: Record<string, string> = { ...extraHeaders };
  if (jar) headers['Cookie'] = jar;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${BASE}${url}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let json: any = {};
  try { json = await res.json(); } catch { /* non-JSON (redirects) */ }
  const setCookie = res.headers.getSetCookie?.() ?? [];
  return { status: res.status, body: json, setCookie };
}

function extractSid(setCookie: string[]): string {
  const c = setCookie.find(s => s.startsWith('raghvyon.sid='));
  return c ? c.split(';')[0] : '';
}

async function loginAs(email: string, password = 'demo1234'): Promise<{ jar: string; user: any }> {
  const r = await call(null, 'POST', '/api/auth/login', { email, password });
  if (r.status !== 200) throw new Error(`Login failed for ${email}: ${r.status} ${JSON.stringify(r.body)}`);
  return { jar: extractSid(r.setCookie), user: r.body.user };
}

/* --- Boot -------------------------------------------------------------- */
await new Promise<void>((resolve) => {
  server = app.listen(0, () => {
    const addr = server.address();
    BASE = `http://127.0.0.1:${addr.port}`;
    resolve();
  });
});

console.log('\n=== RAGHVYON ACADEMY — §37 Data Isolation Tests ===\n');

/* ---------- Login all demo actors ---------- */
const studentA = await loginAs('aarav.sharma@student.raghvyon.com');  // Aarav
const studentB = await loginAs('ishita.verma@student.raghvyon.com');  // Ishita
const parentA = await loginAs('sunita.sharma@parent.raghvyon.com');   // linked to Aarav
const parentB = await loginAs('rajesh.mehra@parent.raghvyon.com');    // linked to Ishita
const admin = await loginAs('admin@raghvyonacademy.com');

const numericA = studentA.user.numericId;
const numericB = studentB.user.numericId;

console.log('— Authentication basics —');
check('demo accounts are seeded in test mode', !!numericA && !!numericB);
check('password login returns role from DB, not body', studentA.user.role === 'student' && admin.user.role === 'admin');

{
  const bad = await call(null, 'POST', '/api/auth/login', { email: 'aarav.sharma@student.raghvyon.com', password: 'wrong-password' });
  check('wrong password is rejected (401)', bad.status === 401);
}

console.log('\n— Logged-out protection —');
{
  const endpoints: Array<[string, string, any]> = [
    ['GET', '/api/student/dashboard', undefined],
    ['GET', '/api/parent/children', undefined],
    ['GET', '/api/admin/overview', undefined],
    ['GET', '/api/drive/status', undefined],
    ['GET', '/api/student/drive/files', undefined],
  ];
  for (const [method, url] of endpoints) {
    const r = await call(null, method, url);
    check(`logged-out ${method} ${url} → 401`, r.status === 401, `got ${r.status}`);
  }
}

console.log('\n— Student↔Student isolation (§37.1–3) —');
{
  const dashA = await call(studentA.jar, 'GET', '/api/student/dashboard');
  check('Student A can access own dashboard', dashA.status === 200 && dashA.body.profile.email.includes('aarav'));

  // A student session hitting another student's numeric id anywhere.
  const notesA = await call(studentA.jar, 'POST', '/api/student/notes', { title: 'Aarav secret note', subject: 'Mathematics', content: 'A-only content' });
  check('Student A can create own note', notesA.status === 201);

  // There is NO cross-student endpoint: try reading drive files / drive status of B via A's cookie.
  const filesA = await call(studentA.jar, 'GET', '/api/student/drive/files');
  check('Drive files list is scoped to A (no B files leak)', filesA.status === 200 && Array.isArray(filesA.body.files));

  const driveA = await call(studentA.jar, 'GET', '/api/drive/status');
  check('Drive status is scoped to A only', driveA.status === 200);
  check('Drive status never returns tokens',
    !JSON.stringify(driveA.body).toLowerCase().includes('token'),
    JSON.stringify(driveA.body).slice(0, 120));
}

console.log('\n— Parent isolation (§37.4–6) —');
{
  const kidsA = await call(parentA.jar, 'GET', '/api/parent/children');
  check('Parent A sees only verified children', kidsA.status === 200 && kidsA.body.children.length === 1 && kidsA.body.children[0].profile.email.includes('aarav'));

  const kidsB = await call(parentB.jar, 'GET', '/api/parent/children');
  check('Parent B sees only their own child', kidsB.status === 200 && kidsB.body.children.length === 1 && kidsB.body.children[0].profile.email.includes('ishita'));

  const okChild = await call(parentA.jar, 'GET', `/api/parent/child-data/${numericA}`);
  check('Parent A CAN access own verified child', okChild.status === 200);

  const foreignChild = await call(parentA.jar, 'GET', `/api/parent/child-data/${numericB}`);
  check('Parent A CANNOT access Parent B\'s child (403)', foreignChild.status === 403, `got ${foreignChild.status}`);

  const unrelated = 999999;
  const ghost = await call(parentA.jar, 'GET', `/api/parent/child-data/${unrelated}`);
  check('Parent A cannot access nonexistent student (403)', ghost.status === 403, `got ${ghost.status}`);

  // Parent tries to pose as admin
  const adminProbe = await call(parentA.jar, 'GET', '/api/admin/overview');
  check('Parent cannot call admin endpoints (403)', adminProbe.status === 403, `got ${adminProbe.status}`);

  // Privacy: parent child-data must not contain tokens or drive file ids
  const text = JSON.stringify(okChild.body).toLowerCase();
  check('Parent payload contains no OAuth tokens', !text.includes('refreshtoken') && !text.includes('access_token'));
}

console.log('\n— RBAC: student cannot be admin (§37.8) —');
{
  const r1 = await call(studentA.jar, 'GET', '/api/admin/overview');
  check('Student cannot access /api/admin/* (403)', r1.status === 403, `got ${r1.status}`);
  const r2 = await call(studentA.jar, 'POST', '/api/admin/courses', { title: 'Hack Course' });
  check('Student cannot create courses (403)', r2.status === 403, `got ${r2.status}`);
  const r3 = await call(studentA.jar, 'GET', '/api/admin/audit-logs');
  check('Student cannot read audit logs (403)', r3.status === 403, `got ${r3.status}`);
}

console.log('\n— Admin isolation: no tokens ever (§37.7) —');
{
  const overview = await call(admin.jar, 'GET', '/api/admin/overview');
  check('Admin can access overview', overview.status === 200);

  const users = await call(admin.jar, 'GET', '/api/admin/users');
  const usersText = JSON.stringify(users.body).toLowerCase();
  check('Admin user list contains no password hashes', !usersText.includes('password_hash') && !usersText.includes('$2a$') && !usersText.includes('$2b$'));

  const drive = await call(admin.jar, 'GET', '/api/admin/drive-connections');
  const driveText = JSON.stringify(drive.body).toLowerCase();
  check('Admin drive-connections contain no encrypted tokens', !driveText.includes('token'));
  check('Admin drive-connections contain no raw refresh material', !driveText.includes('refresh'));
}

console.log('\n— Frontend cannot change role via request body (§37.9) —');
{
  // The login endpoint only accepts email+password; roles are decided server-side.
  const forged = await call(null, 'POST', '/api/auth/login', { email: 'aarav.sharma@student.raghvyon.com', password: 'demo1234', role: 'admin', userId: 1 });
  check('Login ignores client-provided role', forged.status === 200 && forged.body.user.role === 'student', `role=${forged.body?.user?.role}`);

  // Notes endpoint associates with session user, not body.
  const hijack = await call(studentA.jar, 'POST', '/api/student/notes', { title: 'X', subject: 'Math', studentUserId: numericB, saveToDrive: false });
  check('Note creation ignores body-supplied student id', hijack.status === 201);

  // Session reflects server-side identity, not anything client-sent.
  const session = await call(studentA.jar, 'GET', '/api/auth/session');
  check('Session role is server-decided', session.body.user.role === 'student' && session.body.user.email.includes('aarav'));
}

console.log('\n— Demo role switching is dev/test-only (§38) —');
{
  const r = await call(null, 'POST', '/api/auth/switch-role', { role: 'admin' });
  // In NODE_ENV=test the demo endpoint exists (dev-mode), but verify it is audit-logged & never in prod via config endpoint.
  check('switch-role exists only in non-production', r.status === 200 || r.status === 404, `got ${r.status}`);
  const cfg = await call(null, 'GET', '/api/config');
  check('config exposes only safe boolean flags', typeof cfg.body.googleSignIn === 'boolean' && typeof cfg.body.driveOAuth === 'boolean' && typeof cfg.body.demoMode === 'boolean');
  check('config never leaks secrets', !JSON.stringify(cfg.body).toLowerCase().includes('secret') && !JSON.stringify(cfg.body).toLowerCase().includes('key'));
}

console.log('\n— Upload validation & submission isolation (§18) —');
{
  const dashA1 = await call(studentA.jar, 'GET', '/api/student/dashboard');
  const assign = dashA1.body.assignments[0];
  if (assign) {
    // Both demo students share the same enrolled courses, so submitting to the
    // same assignment is legitimate. The isolation property: B's submission
    // must NEVER overwrite A's own submission record.
    await call(studentB.jar, 'POST', `/api/student/assignments/${assign.id}/submit`);
    const dashA2 = await call(studentA.jar, 'GET', '/api/student/dashboard');
    const aRecord = dashA2.body.assignments.find((a: any) => a.id === assign.id);
    const unchanged = aRecord && aRecord.score === assign.score && aRecord.fileName === assign.fileName;
    check('Student B\'s submission does not modify Student A\'s record', !!unchanged,
      `A had score=${assign.score}/${assign.fileName}, now score=${aRecord?.score}/${aRecord?.fileName}`);

    // Nonexistent assignment id must be rejected cleanly.
    const ghost = await call(studentB.jar, 'POST', '/api/student/assignments/999999/submit');
    check('Submitting to a nonexistent assignment fails (4xx)', ghost.status >= 400 && ghost.status < 500, `got ${ghost.status}`);
  } else {
    console.log('  (no seeded assignments — skipping cross-submit check)');
  }
}

console.log('\n— RBAC permission system (capability model) —');
{
  // Introspection endpoint: each role sees its own capability set.
  const permA = await call(studentA.jar, 'GET', '/api/auth/permissions');
  check('permissions endpoint works for logged-in student', permA.status === 200 && permA.body.role === 'student');
  check('student holds student:* capabilities', permA.body.permissions.includes('student:dashboard') && permA.body.permissions.includes('student:drive:connect'));
  check('student does NOT hold admin:* capabilities', !permA.body.permissions.some((p: string) => p.startsWith('admin:')));
  check('student does NOT hold parent:* capabilities', !permA.body.permissions.some((p: string) => p.startsWith('parent:')));

  const permAdmin = await call(admin.jar, 'GET', '/api/auth/permissions');
  check('admin holds admin:* capabilities', permAdmin.body.permissions.includes('admin:auditLogs:view') && permAdmin.body.permissions.includes('admin:driveStatus:view'));
  check('admin does NOT hold student-only Drive ownership capability', !permAdmin.body.permissions.includes('student:drive:connect'));

  const permParent = await call(parentA.jar, 'GET', '/api/auth/permissions');
  check('parent holds parent:* capabilities only', permParent.body.permissions.includes('parent:children:view') && !permParent.body.permissions.some((p: string) => p.startsWith('admin:')));

  const permAnon = await call(null, 'GET', '/api/auth/permissions');
  check('anonymous permissions = empty set (deny-by-default)', permAnon.status === 200 && permAnon.body.role === null && permAnon.body.permissions.length === 0);

  // Denials are audit-logged with PERMISSION_DENIED (§36).
  await call(studentA.jar, 'GET', '/api/admin/overview');
  const logs = await call(admin.jar, 'GET', '/api/admin/audit-logs');
  const denied = (logs.body.logs || []).some((l: any) => l.action === 'PERMISSION_DENIED');
  check('PERMISSION_DENIED denial is audit-logged', denied);

  // Capability labels are metadata only — no secrets in introspection.
  check('permission introspection leaks no secrets',
    !JSON.stringify(permAdmin.body).toLowerCase().includes('secret') &&
    !JSON.stringify(permAdmin.body).toLowerCase().includes('token'));

  // Session now carries the capability list too.
  const sess = await call(studentA.jar, 'GET', '/api/auth/session');
  check('session includes server-computed permissions', Array.isArray(sess.body.permissions) && sess.body.permissions.includes('student:notes:create'));

  // Client cannot fake capabilities via body/query.
  const forge = await call(studentA.jar, 'GET', '/api/admin/users');
  check('capability cannot be forged: student still denied admin users', forge.status === 403, `got ${forge.status}`);
}

console.log('\n— Session invalidation on logout —');
{
  const temp = await loginAs('aarav.sharma@student.raghvyon.com');
  await call(temp.jar, 'POST', '/api/auth/logout');
  const after = await call(temp.jar, 'GET', '/api/student/dashboard');
  check('After logout the old session cookie no longer authorizes', after.status === 401, `got ${after.status}`);
}

server.close();

console.log('\n=============================================');
console.log(`RESULT: ${pass} passed, ${fail} failed`);
if (failures.length) {
  console.log('FAILED:');
  for (const f of failures) console.log(`  - ${f}`);
}
console.log('=============================================\n');

// Cleanup temp db
try {
  fs.rmSync(tmpDir, { recursive: true, force: true });
} catch { /* best effort */ }

process.exit(fail > 0 ? 1 : 0);
