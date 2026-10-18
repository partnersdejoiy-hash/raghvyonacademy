import { q, json, fail, route, currentUser } from './_lib.js';

const requireAdmin = async (req: Request) => (await currentUser(req))?.role === 'admin';

export const GET = route(async (req) => {
  if (!(await requireAdmin(req))) return fail('Admins only', 403);
  const [demos, students] = await Promise.all([
    q('SELECT * FROM demo_bookings ORDER BY created_at DESC LIMIT 200'),
    q(`SELECT u.id,u.name,u.email,u.role,u.created_at,
         (SELECT group_concat(c.subject, ', ') FROM enrollments e JOIN courses c ON c.id=e.course_id WHERE e.student_user_id=u.id) AS courses
       FROM users u ORDER BY u.created_at DESC LIMIT 500`),
  ]);
  return json({ demos, students });
});

const STATUSES = ['pending', 'confirmed', 'completed'];
const ROLES = ['student', 'parent', 'admin'];

export const PATCH = route(async (req) => {
  if (!(await requireAdmin(req))) return fail('Admins only', 403);
  const { kind, id, value } = (await req.json().catch(() => ({}))) as { kind?: string; id?: number; value?: string };
  if (!Number.isInteger(id) || !value) return fail('Nothing to change');
  if (kind === 'demo' && STATUSES.includes(value)) await q('UPDATE demo_bookings SET status=? WHERE id=?', [value, id]);
  else if (kind === 'role' && ROLES.includes(value)) await q('UPDATE users SET role=? WHERE id=?', [value, id]);
  else return fail('Unknown change');
  return json({ ok: true });
});
