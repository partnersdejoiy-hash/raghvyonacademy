/**
 * RAGHVYON ACADEMY — SQLite persistence layer.
 *
 * Replaces the previous in-memory arrays with a durable relational database.
 * Uses `libsql` (better-sqlite3-compatible API, no native build needed on
 * install) so the app runs on any free/ephemeral Node host. Schema covers
 * users, verified parent-child links, courses, enrollments, assignments,
 * submissions, notes, certificates, Google OAuth accounts, per-student
 * Drive connections and audit logs.
 *
 * EPHEMERAL-HOST NOTE: on free hosts with no persistent disk the SQLite file
 * is wiped on every redeploy/restart. In production set ADMIN_EMAIL so the
 * owner's Google Sign-In always bootstraps back to admin; course catalog and
 * teacher profile are re-seeded automatically on boot.
 */
import Database from 'libsql';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { INITIAL_COURSES, INITIAL_TEACHER_PROFILE } from '../src/data/initialData';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const DB_PATH = process.env.DATABASE_PATH || path.join(DATA_DIR, 'raghvyon.db');

export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/* ------------------------------------------------------------------ */
/* SCHEMA                                                              */
/* ------------------------------------------------------------------ */
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT,
  role TEXT NOT NULL CHECK (role IN ('student','parent','admin')),
  google_sub TEXT,
  google_email TEXT,
  avatar_url TEXT,
  grade TEXT,
  student_code TEXT UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS parent_student_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  verified INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (parent_user_id, student_user_id)
);

CREATE TABLE IF NOT EXISTS courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  grade_level TEXT NOT NULL DEFAULT 'All Grades',
  duration TEXT NOT NULL DEFAULT 'Flexible',
  fee TEXT NOT NULL DEFAULT 'Contact us',
  image_url TEXT,
  demo_available INTEGER NOT NULL DEFAULT 1,
  active INTEGER NOT NULL DEFAULT 1,
  highlights TEXT NOT NULL DEFAULT '[]',
  syllabus_overview TEXT NOT NULL DEFAULT '[]',
  curriculum_outline TEXT NOT NULL DEFAULT '[]',
  instructor TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS teacher_profile (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  name TEXT NOT NULL,
  title TEXT,
  experience_years INTEGER NOT NULL DEFAULT 0,
  student_reach TEXT,
  bio TEXT,
  methodology TEXT NOT NULL DEFAULT '[]',
  subjects_taught TEXT NOT NULL DEFAULT '[]',
  contact_email TEXT,
  phone TEXT,
  address TEXT,
  photo_url TEXT
);

CREATE TABLE IF NOT EXISTS enrollments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (student_user_id, course_id)
);

CREATE TABLE IF NOT EXISTS assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  due_date TEXT NOT NULL,
  max_score INTEGER NOT NULL DEFAULT 100,
  created_by INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assignment_id INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('pending','submitted','graded')),
  submitted_at TEXT,
  score INTEGER,
  teacher_feedback TEXT,
  file_name TEXT,
  file_mime TEXT,
  file_size INTEGER,
  drive_file_id TEXT,
  drive_web_view_link TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (assignment_id, student_user_id)
);

CREATE TABLE IF NOT EXISTS study_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  drive_file_id TEXT,
  drive_web_view_link TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS certificates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  student_name TEXT NOT NULL,
  course_name TEXT NOT NULL,
  issue_date TEXT NOT NULL,
  grade_achieved TEXT NOT NULL,
  verification_code TEXT NOT NULL UNIQUE,
  drive_file_id TEXT,
  drive_web_view_link TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS oauth_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'google',
  provider_account_id TEXT,
  provider_email TEXT,
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  expires_at INTEGER,
  scope TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (user_id, provider)
);

CREATE TABLE IF NOT EXISTS drive_connections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  google_account_id TEXT,
  google_email TEXT,
  status TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected','disconnected','revoked')),
  root_folder_id TEXT,
  assignments_folder_id TEXT,
  notes_folder_id TEXT,
  certificates_folder_id TEXT,
  materials_folder_id TEXT,
  submissions_folder_id TEXT,
  connected_at TEXT,
  last_verified_at TEXT
);

CREATE TABLE IF NOT EXISTS enquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  student_grade TEXT,
  subject TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','converted','resolved')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS demo_bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  parent_name TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_grade TEXT,
  subject TEXT,
  preferred_date TEXT,
  preferred_time_slot TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','completed')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL,
  actor_user_id INTEGER,
  actor_label TEXT NOT NULL,
  details TEXT NOT NULL DEFAULT '',
  ip TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_submissions_student ON submissions(student_user_id);
CREATE INDEX IF NOT EXISTS idx_notes_student ON study_notes(student_user_id);
CREATE INDEX IF NOT EXISTS idx_links_parent ON parent_student_links(parent_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
`);

/* ------------------------------------------------------------------ */
/* MAPPERS                                                             */
/* ------------------------------------------------------------------ */
function courseRowToJson(row: any) {
  return {
    id: String(row.id),
    title: row.title,
    subject: row.subject,
    description: row.description,
    gradeLevel: row.grade_level,
    duration: row.duration,
    fee: row.fee,
    imageUrl: row.image_url ?? undefined,
    demoAvailable: !!row.demo_available,
    active: !!row.active,
    highlights: JSON.parse(row.highlights || '[]'),
    syllabusOverview: JSON.parse(row.syllabus_overview || '[]'),
    curriculumOutline: JSON.parse(row.curriculum_outline || '[]'),
    instructor: row.instructor ?? undefined,
  };
}

/** API-safe user shape — never contains tokens or password hashes. */
export function userRowToProfile(u: any) {
  return {
    id: `usr_${u.id}`,
    numericId: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatar: u.avatar_url ?? undefined,
    grade: u.grade ?? undefined,
    studentId: u.student_code ?? undefined,
    googleEmail: u.google_email ?? undefined,
  };
}

/* ------------------------------------------------------------------ */
/* COURSES + TEACHER                                                   */
/* ------------------------------------------------------------------ */
export function listCourses(): any[] {
  return db.prepare('SELECT * FROM courses WHERE active = 1 ORDER BY id').all().map(courseRowToJson);
}

export function listAllCoursesForAdmin(): any[] {
  return db.prepare('SELECT * FROM courses ORDER BY id').all().map(courseRowToJson);
}

export function getTeacherProfile(): any {
  const row = db.prepare('SELECT * FROM teacher_profile WHERE id = 1').get() as any;
  if (!row) return null;
  return {
    name: row.name,
    title: row.title,
    experienceYears: row.experience_years,
    studentReach: row.student_reach,
    bio: row.bio,
    methodology: JSON.parse(row.methodology || '[]'),
    subjectsTaught: JSON.parse(row.subjects_taught || '[]'),
    contactEmail: row.contact_email,
    phone: row.phone,
    address: row.address,
    photoUrl: row.photo_url ?? undefined,
  };
}

export function updateTeacherProfile(patch: any) {
  const current = getTeacherProfile() || {};
  const next = { ...current, ...patch };
  db.prepare(
    `UPDATE teacher_profile SET name=?, title=?, experience_years=?, student_reach=?, bio=?, methodology=?, subjects_taught=?, contact_email=?, phone=?, address=?, photo_url=? WHERE id=1`
  ).run(
    next.name,
    next.title,
    next.experienceYears ?? 0,
    next.studentReach,
    next.bio,
    JSON.stringify(next.methodology || []),
    JSON.stringify(next.subjectsTaught || []),
    next.contactEmail,
    next.phone,
    next.address,
    next.photoUrl ?? null
  );
  return getTeacherProfile();
}

/* ------------------------------------------------------------------ */
/* USERS                                                               */
/* ------------------------------------------------------------------ */
export function findUserById(id: number) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

export function findUserByEmail(email: string) {
  return db.prepare('SELECT * FROM users WHERE email = ? COLLATE NOCASE').get(String(email).trim().toLowerCase());
}

export function findUserByGoogleSub(sub: string) {
  return db.prepare('SELECT * FROM users WHERE google_sub = ?').get(sub);
}

export function createUser(input: {
  email: string;
  name: string;
  role: 'student' | 'parent' | 'admin';
  passwordHash?: string | null;
  googleSub?: string | null;
  googleEmail?: string | null;
  avatarUrl?: string | null;
  grade?: string | null;
}) {
  let studentCode: string | null = null;
  if (input.role === 'student') {
    const year = new Date().getFullYear();
    let n = Math.floor(Math.random() * 900) + 100;
    let code = '';
    do {
      code = `RAGH-${year}-${String(n).padStart(3, '0')}`;
      n = (n % 999) + 1;
    } while (db.prepare('SELECT 1 FROM users WHERE student_code = ?').get(code));
    studentCode = code;
  }
  const info = db.prepare(
    `INSERT INTO users (email, name, password_hash, role, google_sub, google_email, avatar_url, grade, student_code)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    input.email.trim().toLowerCase(),
    input.name,
    input.passwordHash ?? null,
    input.role,
    input.googleSub ?? null,
    input.googleEmail ?? null,
    input.avatarUrl ?? null,
    input.grade ?? null,
    studentCode
  );
  return findUserById(Number(info.lastInsertRowid));
}

export function linkGoogleIdentity(userId: number, googleSub: string, googleEmail: string, avatarUrl?: string | null) {
  db.prepare(
    `UPDATE users SET google_sub = ?, google_email = ?, avatar_url = COALESCE(?, avatar_url), updated_at = datetime('now') WHERE id = ?`
  ).run(googleSub, googleEmail, avatarUrl ?? null, userId);
}

/* ------------------------------------------------------------------ */
/* PARENT-CHILD LINKS                                                  */
/* ------------------------------------------------------------------ */
export function verifiedChildrenOf(parentUserId: number): any[] {
  return db.prepare(
    `SELECT u.* FROM parent_student_links l
     JOIN users u ON u.id = l.student_user_id
     WHERE l.parent_user_id = ? AND l.verified = 1
     ORDER BY u.name`
  ).all(parentUserId);
}

export function isVerifiedParentOf(parentUserId: number, studentUserId: number): boolean {
  return !!db.prepare(
    `SELECT 1 FROM parent_student_links WHERE parent_user_id = ? AND student_user_id = ? AND verified = 1`
  ).get(parentUserId, studentUserId);
}

/* ------------------------------------------------------------------ */
/* STUDENT ACADEMIC DATA                                               */
/* ------------------------------------------------------------------ */
export function getStudentAcademicData(studentUserId: number) {
  const student = findUserById(studentUserId) as any;

  const enrolledCourses = db.prepare(
    `SELECT c.* FROM enrollments e JOIN courses c ON c.id = e.course_id WHERE e.student_user_id = ? ORDER BY c.id`
  ).all(studentUserId).map(courseRowToJson);

  const assignments = db.prepare(
    `SELECT a.id, a.title, a.description, a.due_date AS dueDate, a.max_score AS maxScore, a.course_id AS courseId,
            c.title AS courseName,
            s.status, s.submitted_at AS submittedAt, s.score, s.teacher_feedback AS teacherFeedback,
            s.file_name AS fileName, s.drive_file_id AS driveFileId, s.drive_web_view_link AS driveFileLink
     FROM assignments a
     JOIN courses c ON c.id = a.course_id
     LEFT JOIN submissions s ON s.assignment_id = a.id AND s.student_user_id = ?
     WHERE a.course_id IN (SELECT course_id FROM enrollments WHERE student_user_id = ?)
     ORDER BY a.due_date`
  ).all(studentUserId, studentUserId).map((r: any) => ({
    id: String(r.id),
    courseId: String(r.courseId),
    courseName: r.courseName,
    title: r.title,
    description: r.description,
    dueDate: r.dueDate,
    status: r.status || 'pending',
    score: r.score ?? undefined,
    maxScore: r.maxScore,
    submittedAt: r.submittedAt ? String(r.submittedAt).slice(0, 10) : undefined,
    fileName: r.fileName ?? undefined,
    driveFileId: r.driveFileId ?? undefined,
    driveFileLink: r.driveFileLink ?? undefined,
    teacherFeedback: r.teacherFeedback ?? undefined,
  }));

  const notes = db.prepare(
    `SELECT * FROM study_notes WHERE student_user_id = ? ORDER BY created_at DESC`
  ).all(studentUserId).map((n: any) => ({
    id: String(n.id),
    title: n.title,
    subject: n.subject,
    summary: n.summary,
    content: n.content,
    updatedAt: String(n.updated_at).slice(0, 10),
    driveSaved: !!n.drive_file_id,
    driveFileLink: n.drive_web_view_link ?? undefined,
  }));

  const certificates = db.prepare(
    `SELECT * FROM certificates WHERE student_user_id = ? ORDER BY created_at DESC`
  ).all(studentUserId).map((c: any) => ({
    id: String(c.id),
    title: c.title,
    studentName: c.student_name,
    courseName: c.course_name,
    issueDate: c.issue_date,
    gradeAchieved: c.grade_achieved,
    verificationCode: c.verification_code,
  }));

  const progress = enrolledCourses.map((c: any) => {
    const asgs = assignments.filter((a: any) => a.courseId === c.id);
    const graded = asgs.filter((a: any) => a.status === 'graded' && typeof a.score === 'number');
    const scoreAvg = graded.length
      ? Math.round(graded.reduce((s: number, a: any) => s + (a.score! / a.maxScore!) * 100, 0) / graded.length)
      : 0;
    const submitted = asgs.filter((a: any) => a.status !== 'pending').length;
    return {
      subject: c.subject,
      completedLessons: submitted,
      totalLessons: Math.max(asgs.length, 1),
      scoreAvg,
      attendancePercentage: 100,
    };
  });

  const upcomingTasks = assignments
    .filter((a: any) => a.status === 'pending')
    .slice(0, 5)
    .map((a: any, i: number) => ({
      id: `task_${a.id}`,
      title: a.title,
      courseName: a.courseName,
      dueDate: a.dueDate,
      priority: i === 0 ? 'high' : 'medium',
      completed: false,
    }));

  return { student, enrolledCourses, assignments, notes, certificates, progress, upcomingTasks };
}

/* ------------------------------------------------------------------ */
/* ADMIN VIEWS                                                         */
/* ------------------------------------------------------------------ */
export function countAuditLogs(): number {
  return (db.prepare('SELECT COUNT(*) AS c FROM audit_logs').get() as any).c;
}

export function listAuditLogs(limit = 100) {
  return db.prepare('SELECT * FROM audit_logs ORDER BY id DESC LIMIT ?').all(limit).map((l: any) => ({
    id: String(l.id),
    action: l.action,
    actor: l.actor_label,
    details: l.details,
    timestamp: l.created_at,
  }));
}

export function listUsersForAdmin(): any[] {
  return db.prepare('SELECT * FROM users ORDER BY id').all().map((u: any) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    grade: u.grade,
    studentCode: u.student_code,
    googleLinked: !!u.google_sub,
    createdAt: u.created_at,
  }));
}

export function listDriveConnectionsForAdmin(): any[] {
  // Application-level metadata ONLY — no tokens are stored or returned here.
  return db.prepare(
    `SELECT dc.user_id, u.name, u.email AS academy_email, dc.google_email, dc.status, dc.root_folder_id, dc.connected_at
     FROM drive_connections dc JOIN users u ON u.id = dc.user_id ORDER BY dc.user_id`
  ).all();
}

/* ------------------------------------------------------------------ */
/* SEEDING (idempotent)                                                */
/* ------------------------------------------------------------------ */
export function seedDatabase() {
  const courseCount = (db.prepare('SELECT COUNT(*) AS c FROM courses').get() as any).c;
  if (courseCount === 0) {
    const insertCourse = db.prepare(`
      INSERT INTO courses (title, subject, description, grade_level, duration, fee, image_url, demo_available, active, highlights, syllabus_overview, instructor)
      VALUES (@title, @subject, @description, @gradeLevel, @duration, @fee, @imageUrl, @demoAvailable, 1, @highlights, @syllabusOverview, @instructor)
    `);
    for (const c of INITIAL_COURSES) {
      insertCourse.run({
        title: c.title,
        subject: c.subject,
        description: c.description,
        gradeLevel: c.gradeLevel,
        duration: c.duration,
        fee: c.fee,
        imageUrl: c.imageUrl ?? null,
        demoAvailable: c.demoAvailable === false ? 0 : 1,
        highlights: JSON.stringify(c.highlights || []),
        syllabusOverview: JSON.stringify(c.syllabusOverview || []),
        instructor: c.instructor ?? null,
      });
    }
  }

  const teacherCount = (db.prepare('SELECT COUNT(*) AS c FROM teacher_profile').get() as any).c;
  if (teacherCount === 0) {
    db.prepare(
      `INSERT INTO teacher_profile (id, name, title, experience_years, student_reach, bio, methodology, subjects_taught, contact_email, phone, address, photo_url)
       VALUES (1, @name, @title, @experienceYears, @studentReach, @bio, @methodology, @subjectsTaught, @contactEmail, @phone, @address, @photoUrl)`
    ).run({
      name: INITIAL_TEACHER_PROFILE.name,
      title: INITIAL_TEACHER_PROFILE.title,
      experienceYears: INITIAL_TEACHER_PROFILE.experienceYears,
      studentReach: INITIAL_TEACHER_PROFILE.studentReach,
      bio: INITIAL_TEACHER_PROFILE.bio,
      methodology: JSON.stringify(INITIAL_TEACHER_PROFILE.methodology),
      subjectsTaught: JSON.stringify(INITIAL_TEACHER_PROFILE.subjectsTaught),
      contactEmail: INITIAL_TEACHER_PROFILE.contactEmail,
      phone: INITIAL_TEACHER_PROFILE.phone,
      address: INITIAL_TEACHER_PROFILE.address,
      photoUrl: INITIAL_TEACHER_PROFILE.photoUrl ?? null,
    });
  }

  // Development demo accounts — ONLY seeded when NODE_ENV !== 'production'.
  const isDev = process.env.NODE_ENV !== 'production';
  if (isDev) {
    const insertUser = db.prepare(`
      INSERT OR IGNORE INTO users (email, name, password_hash, role, grade, student_code, avatar_url)
      VALUES (@email, @name, @passwordHash, @role, @grade, @studentCode, @avatar)
    `);
    const linkInsert = db.prepare(
      `INSERT OR IGNORE INTO parent_student_links (parent_user_id, student_user_id, verified) VALUES (?, ?, 1)`
    );
    const enroll = db.prepare(`INSERT OR IGNORE INTO enrollments (student_user_id, course_id) VALUES (?, ?)`);
    const firstCourses = db.prepare('SELECT id FROM courses ORDER BY id LIMIT 3').all();

    const demo = [
      { email: 'aarav.sharma@student.raghvyon.com', name: 'Aarav Sharma', role: 'student', grade: 'Grade 8', studentCode: 'RAGH-2026-081', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&h=200&q=80' },
      { email: 'ishita.verma@student.raghvyon.com', name: 'Ishita Verma', role: 'student', grade: 'Grade 6', studentCode: 'RAGH-2026-082', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' },
      { email: 'sunita.sharma@parent.raghvyon.com', name: 'Sunita Sharma', role: 'parent', grade: null, studentCode: null, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80' },
      { email: 'rajesh.mehra@parent.raghvyon.com', name: 'Rajesh Mehra', role: 'parent', grade: null, studentCode: null, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
      { email: 'admin@raghvyonacademy.com', name: 'Academy Administrator', role: 'admin', grade: null, studentCode: null, avatar: null },
    ];

    const created: Record<string, number> = {};
    for (const d of demo) {
      insertUser.run({
        email: d.email,
        name: d.name,
        passwordHash: bcrypt.hashSync('demo1234', 10),
        role: d.role,
        grade: d.grade,
        studentCode: d.studentCode,
        avatar: d.avatar,
      });
      const row = db.prepare('SELECT id FROM users WHERE email = ?').get(d.email) as any;
      created[d.email] = row.id;
    }

    // Explicit verified parent-child relationships (never email-based).
    linkInsert.run(created['sunita.sharma@parent.raghvyon.com'], created['aarav.sharma@student.raghvyon.com']);
    linkInsert.run(created['rajesh.mehra@parent.raghvyon.com'], created['ishita.verma@student.raghvyon.com']);

    // Assignments for the demo student's enrolled courses.
    const aaravId = created['aarav.sharma@student.raghvyon.com'];
    const insertAssignment = db.prepare(
      `INSERT OR IGNORE INTO assignments (course_id, title, description, due_date, max_score) VALUES (?, ?, ?, ?, ?)`
    );
    const mathId = (db.prepare(`SELECT id FROM courses WHERE subject = 'Mathematics'`).get() as any)?.id;
    const sciId = (db.prepare(`SELECT id FROM courses WHERE subject = 'Science'`).get() as any)?.id;
    const engId = (db.prepare(`SELECT id FROM courses WHERE subject = 'English'`).get() as any)?.id;
    const asgRows: Array<[number | undefined, string, string, string, number]> = [
      [mathId, 'Quadratic Equations & Geometric Area Models', 'Solve the 8 applied word problems showing complete derivation steps and diagrams.', '2026-09-22', 100],
      [sciId, 'Photosynthesis & Light Absorption Investigation', 'Summarize the light-dependent reaction stage and calculate chlorophyll absorption values.', '2026-09-25', 50],
      [engId, 'Persuasive Speech Analysis Essay', 'Write a 400-word analysis exploring rhetorical ethos, pathos, and logos.', '2026-09-18', 50],
    ];
    const createdAssignments: number[] = [];
    for (const [cid, title, desc, due, max] of asgRows) {
      if (!cid) continue;
      const info = insertAssignment.run(cid, title, desc, due, max);
      createdAssignments.push(Number(info.lastInsertRowid));
    }

    // A graded submission so the dashboard is not empty on first login.
    if (createdAssignments[0]) {
      db.prepare(
        `INSERT OR IGNORE INTO submissions (assignment_id, student_user_id, status, submitted_at, score, teacher_feedback, file_name)
         VALUES (?, ?, 'graded', ?, 94, 'Great application of factoring models. Note the sign adjustment on Problem 6!', 'Math_Assignment_Quadratic_Models.pdf')`
      ).run(createdAssignments[0], aaravId, '2026-09-15');
    }

    // Seed notes and a certificate for the demo student.
    db.prepare(
      `INSERT OR IGNORE INTO study_notes (student_user_id, title, subject, summary, content)
       VALUES (?, 'Linear Inequalities Quick Reference', 'Mathematics', 'Rules for flipping inequality signs with negative coefficients.', '1. Addition & Subtraction: never flip the sign.\n2. Multiplying/Dividing by a NEGATIVE number reverses the inequality.\n3. Graphing: open circle for < or >, closed for <= or >=.')`
    ).run(aaravId);
    db.prepare(
      `INSERT OR IGNORE INTO certificates (student_user_id, title, student_name, course_name, issue_date, grade_achieved, verification_code)
       VALUES (?, 'Excellence in Mathematical Logic', 'Aarav Sharma', 'Core Mathematics & Analytical Thinking', 'August 2026', 'Grade A+ (Distinction)', 'RAGH-2026-MATH-091')`
    ).run(aaravId);

    // Enroll both demo students.
    for (const email of ['aarav.sharma@student.raghvyon.com', 'ishita.verma@student.raghvyon.com']) {
      for (const c of firstCourses) enroll.run(created[email], (c as any).id);
    }
  }
}
