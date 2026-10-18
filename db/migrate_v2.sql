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
