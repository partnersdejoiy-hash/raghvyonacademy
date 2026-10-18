import { q, json, route } from './_lib.js';

type Row = { id: number; slug: string; title: string; subject: string; description: string; grade_level: string; duration: string; fee: string; highlights: string; syllabus: string };

export const GET = route(async () => {
  const rows = await q<Row>('SELECT id,slug,title,subject,description,grade_level,duration,fee,highlights,syllabus FROM courses WHERE active=1 ORDER BY sort');
  const courses = rows.map((r) => ({ ...r, highlights: JSON.parse(r.highlights), syllabus: JSON.parse(r.syllabus) }));
  return json(courses, 200, { 'cache-control': 'public, s-maxage=300, stale-while-revalidate=86400' });
});
