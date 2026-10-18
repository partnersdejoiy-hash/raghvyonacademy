// The whole API in one Vercel function: a small router over Web-standard Request/Response.
import crypto from 'node:crypto';
import { z } from 'zod';
import {
  q, json, fail, HttpError, origin, readJson, cookie, setCookie, sign,
  sessionCookie, clearSessionCookie, currentUser, requireUser, isAdminEmail, type User, type Role,
} from './_lib.js';
import { authUrl, exchangeCode, idTokenPayload, storeTokens, grantedScopes, hasClassroom, classroom, calendar, roleToScope } from './_google.js';
import { PERMISSIONS, allPerms, effectivePerms, isSuperAdmin, type Perm } from './_perms.js';

/** Load the user and check one permission. */
async function allowed(req: Request, perm: Perm) {
  const user = await requireUser(req);
  const perms = await effectivePerms(user);
  if (!perms.includes(perm)) throw new HttpError(403, 'Your role does not have permission for this. Ask the academy.');
  return { user, perms };
}

/* ---------------- passwords (scrypt, no extra dependency) ---------------- */
const hashPassword = (pw: string) => {
  const salt = crypto.randomBytes(16).toString('base64url');
  return `scrypt$${salt}$${crypto.scryptSync(pw, salt, 64).toString('base64url')}`;
};
const checkPassword = (pw: string, stored: string | null) => {
  const [, salt, hash] = (stored || '').split('$');
  if (!salt || !hash) return false;
  const a = crypto.scryptSync(pw, salt, 64);
  const b = Buffer.from(hash, 'base64url');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

type Ctx = { req: Request; params: Record<string, string>; url: URL };
type Handler = (c: Ctx) => Promise<Response>;
const routes: { method: string; re: RegExp; keys: string[]; fn: Handler }[] = [];
const on = (method: string, pattern: string, fn: Handler) => {
  const keys: string[] = [];
  const re = new RegExp('^' + pattern.replace(/:(\w+)/g, (_, k) => (keys.push(k), '([^/]+)')) + '/?$');
  routes.push({ method, re, keys, fn });
};

async function handle(req: Request) {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api/, '') || '/';
  try {
    for (const r of routes) {
      const m = r.method === req.method && path.match(r.re);
      if (!m) continue;
      const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
      return await r.fn({ req, params, url });
    }
    return fail('Not found', 404);
  } catch (err) {
    if (err instanceof HttpError) return fail(err.message, err.status);
    console.error(err);
    return fail('Something went wrong. Please try again.', 500);
  }
}
export const GET = handle, POST = handle, PUT = handle, PATCH = handle, DELETE = handle;

/* ---------------- public ---------------- */

type CourseRow = { id: number; slug: string; title: string; subject: string; description: string; grade_level: string; duration: string; fee: string; highlights: string; syllabus: string };
on('GET', '/courses', async () => {
  const rows = await q<CourseRow>('SELECT id,slug,title,subject,description,grade_level,duration,fee,highlights,syllabus FROM courses WHERE active=1 ORDER BY sort');
  return json(rows.map((r) => ({ ...r, highlights: JSON.parse(r.highlights), syllabus: JSON.parse(r.syllabus) })), 200, { 'cache-control': 'public, s-maxage=300, stale-while-revalidate=86400' });
});

const text = (max: number) => z.string().trim().max(max);
const Demo = z.object({
  parent_name: text(80).min(2, 'Please add your name'),
  student_name: text(80).min(1, "Please add the student's name"),
  student_grade: text(40).optional(),
  subject: text(60).optional(),
  phone: text(20).regex(/^[+\d][\d\s-]{6,18}$/, 'Please add a phone number we can call'),
  email: z.union([z.literal(''), z.string().trim().email('That email does not look right').max(120)]).optional(),
  preferred_date: text(20).optional(),
  preferred_time_slot: text(40).optional(),
  message: text(600).optional(),
  website: z.string().max(0).optional(), // honeypot
});
on('POST', '/demo', async ({ req }) => {
  const parsed = Demo.safeParse(await readJson(req));
  if (!parsed.success) throw new HttpError(400, parsed.error.issues[0]?.message || 'Please check the form');
  const d = parsed.data;
  await q(
    `INSERT INTO demo_bookings (parent_name,student_name,student_grade,subject,phone,email,preferred_date,preferred_time_slot,message) VALUES (?,?,?,?,?,?,?,?,?)`,
    [d.parent_name, d.student_name, d.student_grade || null, d.subject || null, d.phone, d.email || null, d.preferred_date || null, d.preferred_time_slot || null, d.message || null],
  );
  return json({ ok: true }, 201);
});

/* ---------------- auth (Google OAuth code flow) ---------------- */

const OAUTH_COOKIE = 'rv_oauth';
const redirectUri = (req: Request) => `${origin(req)}/api/auth/google/callback`;

on('GET', '/auth/google/start', async ({ req, url }) => {
  const connect = (['student', 'teacher'] as const).find((c) => c === url.searchParams.get('connect'));
  const next = (url.searchParams.get('next') || '/portal').replace(/[^\w/?=&#-]/g, '');
  const nonce = crypto.randomBytes(16).toString('base64url');
  const state = `${nonce}.${connect || ''}.${Buffer.from(next).toString('base64url')}`;
  return new Response(null, {
    status: 302,
    headers: { location: authUrl(redirectUri(req), `${state}.${sign(state)}`, connect), 'set-cookie': setCookie(OAUTH_COOKIE, nonce, 600) },
  });
});

on('GET', '/auth/google/callback', async ({ req, url }) => {
  const back = (to: string, msg?: string) =>
    new Response(null, { status: 302, headers: { location: msg ? `${to}${to.includes('?') ? '&' : '?'}error=${encodeURIComponent(msg)}` : to } });
  const err = url.searchParams.get('error');
  if (err) return back('/portal', err === 'access_denied' ? 'Sign-in was cancelled.' : `Google said: ${err}`);
  const [nonce, connect, nextB64, sig] = (url.searchParams.get('state') || '').split('.');
  const state = `${nonce}.${connect}.${nextB64}`;
  if (!sig || sign(state) !== sig || cookie(req, OAUTH_COOKIE) !== nonce) return back('/portal', 'Sign-in expired. Please try again.');
  const next = Buffer.from(nextB64, 'base64url').toString('utf8') || '/portal';

  const tokens = await exchangeCode(url.searchParams.get('code') || '', redirectUri(req));
  if (!tokens.id_token) return back('/portal', 'Google did not return an identity.');
  const p = idTokenPayload(tokens.id_token);
  if (!p.email_verified) return back('/portal', 'Your Google email is not verified.');
  const email = p.email.toLowerCase();
  const role: Role = isAdminEmail(email) ? 'admin' : 'student';
  const [user] = await q<User>(
    `INSERT INTO users (email,name,role,google_sub,avatar_url) VALUES (?,?,?,?,?)
     ON CONFLICT(email) DO UPDATE SET name=excluded.name, google_sub=excluded.google_sub, avatar_url=excluded.avatar_url,
       role=CASE WHEN excluded.role='admin' THEN 'admin' ELSE users.role END
     RETURNING id,email,name,role,avatar_url,grade`,
    [email, p.name || email.split('@')[0], role, p.sub, p.picture || null],
  );
  if (connect || tokens.refresh_token) await storeTokens(user.id, tokens);
  return new Response(null, { status: 302, headers: { location: next, 'set-cookie': sessionCookie(user.id) } });
});

const Email = z.string().trim().toLowerCase().email('That email does not look right').max(120);
const Password = z.string().min(8, 'Use at least 8 characters').max(200);

on('POST', '/auth/register', async ({ req }) => {
  const parsed = z.object({ name: text(80).min(2, 'Please add your name'), email: Email, password: Password }).safeParse(await readJson(req));
  if (!parsed.success) throw new HttpError(400, parsed.error.issues[0]?.message || 'Please check the form');
  const { name, email, password } = parsed.data;
  const [existing] = await q<{ id: number; password_hash: string | null }>('SELECT id,password_hash FROM users WHERE email=?', [email]);
  if (existing?.password_hash) throw new HttpError(409, 'An account with this email already exists. Sign in instead.');
  const role: Role = isAdminEmail(email) ? 'admin' : 'student';
  const [user] = existing
    ? await q<User>('UPDATE users SET password_hash=?, name=COALESCE(NULLIF(name,\'\'),?) WHERE id=? RETURNING id,email,name,role,avatar_url,grade', [hashPassword(password), name, existing.id])
    : await q<User>('INSERT INTO users (email,name,role,password_hash) VALUES (?,?,?,?) RETURNING id,email,name,role,avatar_url,grade', [email, name, role, hashPassword(password)]);
  return json({ user }, 201, { 'set-cookie': sessionCookie(user.id) });
});

on('POST', '/auth/login', async ({ req }) => {
  const parsed = z.object({ email: Email, password: z.string().min(1, 'Enter your password').max(200) }).safeParse(await readJson(req));
  if (!parsed.success) throw new HttpError(400, parsed.error.issues[0]?.message || 'Please check the form');
  const [row] = await q<User & { password_hash: string | null }>('SELECT id,email,name,role,avatar_url,grade,password_hash FROM users WHERE email=?', [parsed.data.email]);
  if (!row?.password_hash) throw new HttpError(401, row ? 'This account signs in with Google. Use "Continue with Google".' : 'No account with this email. Create one first.');
  if (!checkPassword(parsed.data.password, row.password_hash)) throw new HttpError(401, 'Wrong password.');
  const { password_hash: _ph, ...user } = row;
  return json({ user }, 200, { 'set-cookie': sessionCookie(user.id) });
});

on('POST', '/auth/logout', async () => json({ ok: true }, 200, { 'set-cookie': clearSessionCookie() }));

/* ---------------- me & enrolments ---------------- */

type Child = { id: number; name: string; email: string; avatar_url: string | null };

on('GET', '/me', async ({ req }) => {
  const user = await currentUser(req);
  if (!user) throw new HttpError(401, 'Not signed in');
  const scopes = await grantedScopes(user.id);
  const [enrollments, children] = await Promise.all([
    q<{ course_id: number }>('SELECT course_id FROM enrollments WHERE student_user_id=?', [user.id]),
    user.role === 'parent'
      ? q<Child & { connected: number }>(
          `SELECT u.id,u.name,u.email,u.avatar_url, EXISTS(SELECT 1 FROM google_tokens t WHERE t.user_id=u.id) AS connected
           FROM parent_links l JOIN users u ON u.id=l.student_user_id WHERE l.parent_user_id=? ORDER BY u.name`,
          [user.id],
        )
      : Promise.resolve([]),
  ]);
  const perms = await effectivePerms(user);
  return json({
    user,
    perms,
    superAdmin: isSuperAdmin(user),
    courseIds: enrollments.map((e) => e.course_id),
    classroom: { connected: hasClassroom(scopes, roleToScope(user.role)), as: roleToScope(user.role) },
    children: children.map((c) => ({ ...c, connected: !!c.connected })),
  });
});

const enroll = (add: boolean): Handler => async ({ req }) => {
  const { user } = await allowed(req, 'academy.enroll');
  const { course_id } = await readJson<{ course_id: number }>(req);
  if (!Number.isInteger(course_id)) throw new HttpError(400, 'Pick a course');
  if (add) await q('INSERT OR IGNORE INTO enrollments (student_user_id,course_id) SELECT ?,id FROM courses WHERE id=? AND active=1', [user.id, course_id]);
  else await q('DELETE FROM enrollments WHERE student_user_id=? AND course_id=?', [user.id, course_id]);
  return json({ ok: true });
};
on('POST', '/enroll', enroll(true));
on('DELETE', '/enroll', enroll(false));

/* ---------------- Classroom ---------------- */

/** Whose Classroom are we reading? Students read their own; parents read a linked child; teachers/admins read their own. */
async function classroomSubject(req: Request, url: URL) {
  const { user } = await allowed(req, 'classroom.view');
  const studentParam = Number(url.searchParams.get('student'));
  if (user.role === 'parent') {
    if (!studentParam) throw new HttpError(400, 'Choose a child first');
    const [link] = await q('SELECT 1 FROM parent_links WHERE parent_user_id=? AND student_user_id=?', [user.id, studentParam]);
    if (!link) throw new HttpError(403, 'This student is not linked to you');
    return { user, subjectId: studentParam, as: 'student' as const };
  }
  return { user, subjectId: user.id, as: roleToScope(user.role) };
}

type GCourse = { id: string; name: string; section?: string; descriptionHeading?: string; alternateLink: string; courseState: string };
type GWork = { id: string; title: string; description?: string; dueDate?: { year: number; month: number; day: number }; dueTime?: { hours?: number; minutes?: number }; maxPoints?: number; alternateLink: string; workType: string; state: string; creationTime: string };
type GSub = { id: string; courseWorkId: string; userId: string; state: string; late?: boolean; assignedGrade?: number; draftGrade?: number; alternateLink: string };
type GAnn = { id: string; text: string; creationTime: string; alternateLink: string };
type GStudent = { userId: string; profile: { name: { fullName: string }; emailAddress?: string; photoUrl?: string } };

on('GET', '/classroom/courses', async ({ req, url }) => {
  const { subjectId, as } = await classroomSubject(req, url);
  const who = as === 'teacher' ? 'teacherId=me' : 'studentId=me';
  const data = await classroom<{ courses?: GCourse[] }>(subjectId, `courses?${who}&courseStates=ACTIVE&pageSize=50`);
  return json((data.courses || []).map(({ id, name, section, descriptionHeading, alternateLink }) => ({ id, name, section, descriptionHeading, alternateLink })));
});

on('GET', '/classroom/courses/:id/work', async ({ req, url, params }) => {
  const { subjectId, as } = await classroomSubject(req, url);
  const cid = params.id;
  const [work, subs, anns, roster] = await Promise.all([
    classroom<{ courseWork?: GWork[] }>(subjectId, `courses/${cid}/courseWork?courseWorkStates=PUBLISHED&orderBy=dueDate%20desc&pageSize=50`),
    classroom<{ studentSubmissions?: GSub[] }>(subjectId, `courses/${cid}/courseWork/-/studentSubmissions?${as === 'student' ? 'userId=me&' : ''}pageSize=200`),
    classroom<{ announcements?: GAnn[] }>(subjectId, `courses/${cid}/announcements?announcementStates=PUBLISHED&orderBy=updateTime%20desc&pageSize=5`),
    as === 'teacher' ? classroom<{ students?: GStudent[] }>(subjectId, `courses/${cid}/students?pageSize=100`) : Promise.resolve({ students: [] as GStudent[] }),
  ]);
  const bySubWork = new Map<string, GSub[]>();
  for (const s of subs.studentSubmissions || []) bySubWork.set(s.courseWorkId, [...(bySubWork.get(s.courseWorkId) || []), s]);
  const items = (work.courseWork || []).map((w) => {
    const mine = bySubWork.get(w.id) || [];
    const due = w.dueDate ? new Date(Date.UTC(w.dueDate.year, w.dueDate.month - 1, w.dueDate.day, w.dueTime?.hours ?? 23, w.dueTime?.minutes ?? 59)).toISOString() : null;
    return {
      id: w.id, title: w.title, description: w.description || '', due, maxPoints: w.maxPoints ?? null, link: w.alternateLink, type: w.workType,
      // student view: own submission; teacher view: counts
      submission: as === 'student' ? mine[0] ? { state: mine[0].state, late: !!mine[0].late, grade: mine[0].assignedGrade ?? null, link: mine[0].alternateLink } : null : undefined,
      counts: as === 'teacher' ? { total: mine.length, turnedIn: mine.filter((s) => s.state === 'TURNED_IN' || s.state === 'RETURNED').length, graded: mine.filter((s) => s.assignedGrade != null).length } : undefined,
    };
  });
  return json({
    work: items,
    announcements: (anns.announcements || []).map((a) => ({ id: a.id, text: a.text, at: a.creationTime, link: a.alternateLink })),
    students: (roster.students || []).map((s) => ({ id: s.userId, name: s.profile.name.fullName, email: s.profile.emailAddress || '', photo: s.profile.photoUrl || null })),
  });
});

const teacher = async (req: Request) => (await allowed(req, 'classroom.manage')).user;

on('POST', '/classroom/courses', async ({ req }) => {
  const user = await teacher(req);
  const b = await readJson<{ name: string; section: string; description: string }>(req);
  if (!b.name?.trim()) throw new HttpError(400, 'Give the class a name');
  const c = await classroom<GCourse>(user.id, 'courses', { method: 'POST', body: { name: b.name.trim().slice(0, 120), section: b.section?.trim().slice(0, 80) || undefined, descriptionHeading: b.description?.trim().slice(0, 300) || undefined, ownerId: 'me', courseState: 'ACTIVE' } });
  return json({ id: c.id, name: c.name, section: c.section, alternateLink: c.alternateLink }, 201);
});

on('POST', '/classroom/courses/:id/work', async ({ req, params }) => {
  const user = await teacher(req);
  const b = await readJson<{ title: string; description: string; due: string; dueTime: string; maxPoints: number }>(req);
  if (!b.title?.trim()) throw new HttpError(400, 'Give the assignment a title');
  const body: Record<string, unknown> = { title: b.title.trim().slice(0, 200), description: b.description?.trim().slice(0, 2000) || undefined, workType: 'ASSIGNMENT', state: 'PUBLISHED' };
  if (b.due) {
    const [y, m, d] = b.due.split('-').map(Number);
    const [hh, mm] = (b.dueTime || '23:59').split(':').map(Number);
    // Classroom wants the due moment in UTC; the form is filled in India time.
    const utc = new Date(Date.UTC(y, m - 1, d, hh, mm) - 5.5 * 3600 * 1000);
    body.dueDate = { year: utc.getUTCFullYear(), month: utc.getUTCMonth() + 1, day: utc.getUTCDate() };
    body.dueTime = { hours: utc.getUTCHours(), minutes: utc.getUTCMinutes() };
  }
  if (b.maxPoints && Number(b.maxPoints) > 0) body.maxPoints = Number(b.maxPoints);
  const w = await classroom<GWork>(user.id, `courses/${params.id}/courseWork`, { method: 'POST', body });
  return json({ id: w.id, title: w.title, link: w.alternateLink }, 201);
});

on('POST', '/classroom/courses/:id/invite', async ({ req, params }) => {
  const user = await teacher(req);
  const { email } = await readJson<{ email: string }>(req);
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new HttpError(400, "Enter the student's Google email");
  await classroom(user.id, 'invitations', { method: 'POST', body: { courseId: params.id, userId: email.trim().toLowerCase(), role: 'STUDENT' } });
  return json({ ok: true }, 201);
});

on('POST', '/classroom/courses/:id/announce', async ({ req, params }) => {
  const user = await teacher(req);
  const { text: t } = await readJson<{ text: string }>(req);
  if (!t?.trim()) throw new HttpError(400, 'Write the announcement first');
  const a = await classroom<GAnn>(user.id, `courses/${params.id}/announcements`, { method: 'POST', body: { text: t.trim().slice(0, 4000), state: 'PUBLISHED' } });
  return json({ id: a.id, link: a.alternateLink }, 201);
});

/* ---------------- Calendar + Meet ---------------- */

type GEvent = { id: string; summary?: string; description?: string; start: { dateTime?: string; date?: string }; end: { dateTime?: string; date?: string }; hangoutLink?: string; htmlLink: string; attendees?: { email: string; responseStatus?: string }[]; organizer?: { email: string; displayName?: string } };

const eventOut = (e: GEvent) => ({
  id: e.id, title: e.summary || '(no title)', description: e.description || '', start: e.start.dateTime || e.start.date, end: e.end.dateTime || e.end.date,
  allDay: !e.start.dateTime, meet: e.hangoutLink || null, link: e.htmlLink, organizer: e.organizer?.displayName || e.organizer?.email || '', attendees: (e.attendees || []).length,
});

on('GET', '/calendar/upcoming', async ({ req, url }) => {
  const { user } = await allowed(req, 'calendar.view');
  let subjectId = user.id;
  const studentParam = Number(url.searchParams.get('student'));
  if (user.role === 'parent' && studentParam) {
    const [link] = await q('SELECT 1 FROM parent_links WHERE parent_user_id=? AND student_user_id=?', [user.id, studentParam]);
    if (!link) throw new HttpError(403, 'This student is not linked to you');
    subjectId = studentParam;
  }
  const now = new Date();
  const until = new Date(now.getTime() + 14 * 86400000);
  const p = new URLSearchParams({ timeMin: now.toISOString(), timeMax: until.toISOString(), singleEvents: 'true', orderBy: 'startTime', maxResults: '30' });
  const data = await calendar<{ items?: GEvent[] }>(subjectId, `calendars/primary/events?${p}`);
  return json((data.items || []).filter((e) => e.start.dateTime).map(eventOut));
});

on('POST', '/calendar/class', async ({ req }) => {
  const { user } = await allowed(req, 'calendar.manage');
  const b = await readJson<{ title: string; description: string; date: string; time: string; minutes: number; attendees: string[]; weekly: boolean; weeks: number }>(req);
  if (!b.title?.trim() || !b.date || !b.time) throw new HttpError(400, 'Give the class a title, a date and a time');
  const start = `${b.date}T${b.time}:00`;
  const [h, m] = b.time.split(':').map(Number);
  const mins = Math.min(Math.max(Number(b.minutes) || 60, 15), 240);
  const endDate = new Date(Date.UTC(2000, 0, 1, h, m + mins));
  const end = `${b.date}T${String(endDate.getUTCHours()).padStart(2, '0')}:${String(endDate.getUTCMinutes()).padStart(2, '0')}:00`;
  const attendees = (Array.isArray(b.attendees) ? b.attendees : []).map((e) => String(e).trim().toLowerCase()).filter((e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)).slice(0, 100);
  const body: Record<string, unknown> = {
    summary: b.title.trim().slice(0, 200),
    description: (b.description || '').trim().slice(0, 2000) || undefined,
    start: { dateTime: start, timeZone: 'Asia/Kolkata' },
    end: { dateTime: end, timeZone: 'Asia/Kolkata' },
    attendees: attendees.map((email) => ({ email })),
    conferenceData: { createRequest: { requestId: crypto.randomUUID(), conferenceSolutionKey: { type: 'hangoutsMeet' } } },
    reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 10 }, { method: 'email', minutes: 60 }] },
  };
  if (b.weekly) body.recurrence = [`RRULE:FREQ=WEEKLY;COUNT=${Math.min(Math.max(Number(b.weeks) || 12, 1), 52)}`];
  const e = await calendar<GEvent>(user.id, `calendars/primary/events?conferenceDataVersion=1&sendUpdates=${attendees.length ? 'all' : 'none'}`, { method: 'POST', body });
  return json(eventOut(e), 201);
});

/* ---------------- admin ---------------- */

on('GET', '/admin', async ({ req }) => {
  const user = await requireUser(req);
  const perms = await effectivePerms(user);
  if (!perms.includes('desk.demos') && !perms.includes('desk.people')) throw new HttpError(403, 'Your role does not have desk access.');
  const [demos, people, links] = await Promise.all([
    q('SELECT * FROM demo_bookings ORDER BY created_at DESC LIMIT 200'),
    q(`SELECT u.id,u.name,u.email,u.role,u.avatar_url,u.created_at,
         EXISTS(SELECT 1 FROM google_tokens t WHERE t.user_id=u.id) AS connected,
         (SELECT group_concat(c.subject, ', ') FROM enrollments e JOIN courses c ON c.id=e.course_id WHERE e.student_user_id=u.id) AS courses
       FROM users u ORDER BY u.created_at DESC LIMIT 500`),
    q<{ parent_user_id: number; student_user_id: number }>('SELECT parent_user_id,student_user_id FROM parent_links'),
  ]);
  return json({ demos, people, links });
});

const STATUSES = ['pending', 'confirmed', 'completed'];
const ROLES: Role[] = ['student', 'parent', 'teacher', 'admin'];
on('PATCH', '/admin', async ({ req }) => {
  const { kind, id, value } = await readJson<{ kind: string; id: number; value: string }>(req);
  if (!Number.isInteger(id) || !value) throw new HttpError(400, 'Nothing to change');
  if (kind === 'demo' && STATUSES.includes(value)) {
    await allowed(req, 'desk.demos');
    await q('UPDATE demo_bookings SET status=? WHERE id=?', [value, id]);
  } else if (kind === 'role' && ROLES.includes(value as Role)) {
    const { user: me } = await allowed(req, 'desk.people');
    const [target] = await q<{ email: string }>('SELECT email FROM users WHERE id=?', [id]);
    if (target && isAdminEmail(target.email) && value !== 'admin') throw new HttpError(400, 'The super admin stays admin');
    if (id === me.id && value !== 'admin') throw new HttpError(400, 'You cannot remove your own admin role');
    await q('UPDATE users SET role=? WHERE id=?', [value, id]);
  } else throw new HttpError(400, 'Unknown change');
  return json({ ok: true });
});

on('GET', '/admin/permissions', async ({ req }) => {
  await requireUser(req, ['admin']);
  return json({ catalog: PERMISSIONS, roles: await allPerms() });
});

on('PUT', '/admin/permissions', async ({ req }) => {
  const user = await requireUser(req);
  if (!isSuperAdmin(user)) throw new HttpError(403, 'Only the super admin can change permissions');
  const { role, perms } = await readJson<{ role: Role; perms: string[] }>(req);
  if (!ROLES.includes(role as Role) || !Array.isArray(perms)) throw new HttpError(400, 'Pick a role and its permissions');
  const clean = perms.filter((p) => PERMISSIONS.some((x) => x.id === p));
  await q(`INSERT INTO role_permissions (role,perms,updated_at) VALUES (?,?,datetime('now')) ON CONFLICT(role) DO UPDATE SET perms=excluded.perms, updated_at=datetime('now')`, [role, JSON.stringify(clean)]);
  return json({ ok: true, perms: clean });
});

on('POST', '/admin/link', async ({ req }) => {
  await allowed(req, 'desk.people');
  const { parent_id, student_id } = await readJson<{ parent_id: number; student_id: number }>(req);
  if (!Number.isInteger(parent_id) || !Number.isInteger(student_id) || parent_id === student_id) throw new HttpError(400, 'Pick a parent and a student');
  await q('INSERT OR IGNORE INTO parent_links (parent_user_id,student_user_id) VALUES (?,?)', [parent_id, student_id]);
  return json({ ok: true }, 201);
});

on('DELETE', '/admin/link', async ({ req }) => {
  await allowed(req, 'desk.people');
  const { parent_id, student_id } = await readJson<{ parent_id: number; student_id: number }>(req);
  await q('DELETE FROM parent_links WHERE parent_user_id=? AND student_user_id=?', [parent_id, student_id]);
  return json({ ok: true });
});
