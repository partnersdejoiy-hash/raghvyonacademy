-- RAGHVYON Academy — Cloudflare D1 schema (core backend, round 1).
-- Drive, Classroom, fees and payments stay in the old server/ code for round 2.

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student','parent','admin')),
  google_sub TEXT UNIQUE,
  avatar_url TEXT,
  grade TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  grade_level TEXT NOT NULL DEFAULT 'All grades',
  duration TEXT NOT NULL DEFAULT 'Flexible',
  fee TEXT NOT NULL DEFAULT 'On consultation',
  highlights TEXT NOT NULL DEFAULT '[]',
  syllabus TEXT NOT NULL DEFAULT '[]',
  active INTEGER NOT NULL DEFAULT 1,
  sort INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS enrollments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (student_user_id, course_id)
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
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  message TEXT
);

CREATE INDEX IF NOT EXISTS idx_enroll_student ON enrollments(student_user_id);
CREATE INDEX IF NOT EXISTS idx_demos_created ON demo_bookings(created_at);
