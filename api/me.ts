import { q, json, fail, route, currentUser } from './_lib.js';

export const GET = route(async (req) => {
  const user = await currentUser(req);
  if (!user) return fail('Not signed in', 401);
  const enrollments = await q<{ course_id: number }>('SELECT course_id FROM enrollments WHERE student_user_id=?', [user.id]);
  return json({ user, courseIds: enrollments.map((e) => e.course_id) });
});
