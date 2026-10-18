-- v2: four roles (student, parent, teacher, admin), Google tokens, parent links.
-- Run once in the Cloudflare dashboard: D1 → raghvyon-academy → Console.
-- Old tables are renamed, not dropped; delete the *_v1_unused tables later if you like.
ALTER TABLE enrollments RENAME TO enrollments_v1_unused;
ALTER TABLE users RENAME TO users_v1_unused;
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student','parent','teacher','admin')),
  google_sub TEXT UNIQUE,
  avatar_url TEXT,
  grade TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE enrollments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (student_user_id, course_id)
);
CREATE INDEX IF NOT EXISTS idx_enroll_student2 ON enrollments(student_user_id);
CREATE TABLE IF NOT EXISTS google_tokens (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_enc TEXT NOT NULL,
  access_token TEXT,
  expires_at INTEGER NOT NULL DEFAULT 0,
  scopes TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS parent_links (
  parent_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (parent_user_id, student_user_id)
);
CREATE INDEX IF NOT EXISTS idx_links_student ON parent_links(student_user_id);

-- v3: attendance and leave (applied 19 Oct 2026)
CREATE TABLE IF NOT EXISTS attendance (id INTEGER PRIMARY KEY AUTOINCREMENT, course_id TEXT NOT NULL, course_name TEXT NOT NULL DEFAULT '', student_email TEXT NOT NULL, student_name TEXT NOT NULL DEFAULT '', date TEXT NOT NULL, status TEXT NOT NULL CHECK (status IN ('present','absent','late','leave')), marked_by INTEGER REFERENCES users(id) ON DELETE SET NULL, updated_at TEXT NOT NULL DEFAULT (datetime('now')), UNIQUE (course_id, student_email, date));
CREATE TABLE IF NOT EXISTS leaves (id INTEGER PRIMARY KEY AUTOINCREMENT, student_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, start_date TEXT NOT NULL, end_date TEXT NOT NULL, reason TEXT NOT NULL, course_id TEXT, course_name TEXT, status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','cancelled')), decided_by INTEGER REFERENCES users(id) ON DELETE SET NULL, decided_at TEXT, parent_note TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS role_permissions (role TEXT PRIMARY KEY, perms TEXT NOT NULL DEFAULT '[]', updated_at TEXT NOT NULL DEFAULT (datetime('now')));
