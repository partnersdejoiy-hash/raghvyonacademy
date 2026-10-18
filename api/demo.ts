import { z } from 'zod';
import { q, json, fail, route } from './_lib.js';

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
  website: z.string().max(0).optional(), // honeypot: real people never fill it
});

export const POST = route(async (req) => {
  const parsed = Demo.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message || 'Please check the form');
  const d = parsed.data;
  await q(
    `INSERT INTO demo_bookings (parent_name,student_name,student_grade,subject,phone,email,preferred_date,preferred_time_slot,message)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [d.parent_name, d.student_name, d.student_grade || null, d.subject || null, d.phone, d.email || null, d.preferred_date || null, d.preferred_time_slot || null, d.message || null],
  );
  return json({ ok: true }, 201);
});
