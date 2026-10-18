import { q, json, fail, route, currentUser } from './_lib.js';

// A signed-in student adds or removes a course on their own dashboard.
const handler = (add: boolean) =>
  route(async (req) => {
    const user = await currentUser(req);
    if (!user) return fail('Not signed in', 401);
    const { course_id } = (await req.json().catch(() => ({}))) as { course_id?: number };
    if (!Number.isInteger(course_id)) return fail('Pick a course');
    if (add) await q('INSERT OR IGNORE INTO enrollments (student_user_id,course_id) SELECT ?,id FROM courses WHERE id=? AND active=1', [user.id, course_id]);
    else await q('DELETE FROM enrollments WHERE student_user_id=? AND course_id=?', [user.id, course_id]);
    return json({ ok: true });
  });

export const POST = handler(true);
export const DELETE = handler(false);
