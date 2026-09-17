/**
 * RAGHVYON ACADEMY — API routes.
 *
 * SECURITY MODEL
 *  - Identity always comes from the server-side session. Request bodies can
 *    NEVER set role, userId or parent-child linkage.
 *  - Students see only their own data; parents only verified children;
 *    admins only application-level metadata (no OAuth tokens, ever).
 *  - Files uploaded by a student are stored in THAT student's own Google Drive
 *    via their own OAuth authorization (drive.file scope).
 *  - All write endpoints validate input with zod.
 */
import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { db } from './db';
import {
  listCourses,
  listAllCoursesForAdmin,
  getTeacherProfile,
  updateTeacherProfile,
  getStudentAcademicData,
  isVerifiedParentOf,
  verifiedChildrenOf,
  userRowToProfile,
  listAuditLogs,
  listUsersForAdmin,
  listDriveConnectionsForAdmin,
  countAuditLogs,
} from './db';
import {
  getSessionUser,
  requireAuth,
  requireRole,
  buildSignInAuthUrl,
  exchangeSignInCode,
  resolveAccountForGoogleIdentity,
  verifyPasswordLogin,
  isGoogleSignInConfigured,
} from './lib/auth';
import { logAudit } from './lib/audit';
import { rateLimit } from './lib/rateLimit';
import {
  isDriveConfigured,
  buildAuthUrl as buildDriveAuthUrl,
  completeDriveConnection,
  getOrCreateStudentFolders,
  uploadStudentFile,
  createStudentNote,
  getConnectionStatus,
  verifyDriveConnection,
  disconnectDrive,
  getValidAccessToken,
  DRIVE_SCOPE,
  FOLDER_NAMES,
} from './lib/googleDriveService';
import { GoogleGenAI } from '@google/genai';

export const api = Router();

/* ------------------------------------------------------------------ */
/* Upload handling (memory storage → streamed to the student's Drive)  */
/* ------------------------------------------------------------------ */
const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/markdown',
  'text/csv',
]);
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
});

/* Small helpers ----------------------------------------------------- */
function bad(res: Response, msg: string, code = 400) {
  return res.status(code).json({ error: msg });
}

/**
 * Where the SPA frontend is served from. On a single-host deployment this is
 * empty and OAuth callbacks redirect to relative paths on the same origin.
 * When frontend and API are split (static host + API host), set FRONTEND_URL
 * so users are sent back to the real site after Google OAuth.
 */
function frontendUrl(): string {
  return (process.env.FRONTEND_URL || '').replace(/\/$/, '');
}
function redirectAfterOAuth(res: Response, path: string): void {
  res.redirect(frontendUrl() + path);
}

function publicOrigin(req: Request): string {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '');
  const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'http';
  const host = (req.headers['x-forwarded-host'] as string) || req.get('host') || 'localhost:3000';
  return `${proto}://${host}`;
}
function safeErrorMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  const map: Record<string, string> = {
    NOT_CONNECTED: 'Google Drive is not connected yet. Please connect it from your dashboard.',
    REFRESH_TOKEN_INVALID: 'Google Drive authorization has expired or was revoked. Please reconnect your Drive.',
    NO_REFRESH_TOKEN: 'Google Drive could not be connected. Your Academy account is still active — please try again.',
    DRIVE_QUOTA_EXCEEDED: 'Your Google Drive storage is full. Free up space and try again.',
    TOKEN_EXPIRED: 'Your Google session expired while uploading. Please retry.',
  };
  return map[raw] ?? 'Google Drive request failed. Please try again in a moment.';
}

/* ================================================================== */
/* PUBLIC ENDPOINTS                                                   */
/* ================================================================== */

api.get('/health', (_req, res) => {
  res.json({ status: 'ok', brand: 'RAGHVYON ACADEMY', timestamp: new Date().toISOString() });
});

// Public runtime capability flags (safe to expose — no secrets).
api.get('/config', (_req, res) => {
  res.json({
    googleSignIn: isGoogleSignInConfigured(),
    driveOAuth: isDriveConfigured(),
    gemini: !!process.env.GEMINI_API_KEY,
    demoMode: process.env.NODE_ENV !== 'production',
  });
});

api.get('/courses', (_req, res) => {
  res.json({ courses: listCourses() });
});

api.get('/teacher-profile', (_req, res) => {
  res.json({ teacherProfile: getTeacherProfile() });
});

/* --- Public lead capture: enquiries & demo bookings ---------------- */
const enquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(6).max(24),
  studentGrade: z.string().trim().max(60).optional(),
  subject: z.string().trim().max(120).optional(),
  message: z.string().trim().max(2000).optional(),
});
const bookingSchema = z.object({
  parentName: z.string().trim().min(2).max(120),
  studentName: z.string().trim().min(2).max(120),
  studentGrade: z.string().trim().max(60).optional(),
  subject: z.string().trim().max(120).optional(),
  preferredDate: z.string().trim().max(40).optional(),
  preferredTimeSlot: z.string().trim().max(80).optional(),
  phone: z.string().trim().min(6).max(24),
  email: z.string().trim().email().max(200),
});

api.post('/enquiries', rateLimit({ windowMs: 60_000, max: 5 }), (req, res) => {
  const parsed = enquirySchema.safeParse(req.body);
  if (!parsed.success) return bad(res, 'Please provide a valid name, email, and phone number.');
  const d = parsed.data;
  db.prepare(
    `INSERT INTO enquiries (name, email, phone, student_grade, subject, message) VALUES (?, ?, ?, ?, ?, ?)`
  ).run(d.name, d.email, d.phone, d.studentGrade ?? 'Not specified', d.subject ?? 'General Consultation', d.message ?? '');
  logAudit('NEW_ENQUIRY', null, d.name, `Enquiry submitted (${d.subject ?? 'General'})`, req.ip);
  res.status(201).json({ success: true, message: 'Enquiry received. Our academic counsellor will reach out shortly.' });
});

api.post('/demo-bookings', rateLimit({ windowMs: 60_000, max: 5 }), (req, res) => {
  const parsed = bookingSchema.safeParse(req.body);
  if (!parsed.success) return bad(res, 'Please provide parent name, student name, phone, and email.');
  const d = parsed.data;
  db.prepare(
    `INSERT INTO demo_bookings (parent_name, student_name, student_grade, subject, preferred_date, preferred_time_slot, phone, email)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    d.parentName, d.studentName,
    d.studentGrade ?? 'Not specified', d.subject ?? 'Core Mathematics',
    d.preferredDate ?? new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    d.preferredTimeSlot ?? '5:00 PM IST',
    d.phone, d.email
  );
  logAudit('DEMO_CLASS_BOOKED', null, d.parentName, `Demo booked for ${d.studentName} (${d.subject ?? 'General'})`, req.ip);
  res.status(201).json({ success: true, message: 'Free demo class requested! We will confirm your session via WhatsApp.' });
});

/* ================================================================== */
/* AUTHENTICATION                                                      */
/* ================================================================== */

// Step 1: redirect the browser to Google's consent screen (identity scopes only).
api.get('/auth/google', rateLimit({ windowMs: 60_000, max: 20 }), (req, res) => {
  if (!isGoogleSignInConfigured()) {
    return bad(res, 'Google Sign-In is not configured on this server. Please use email sign-in or contact the Academy.', 503);
  }
  const state = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  (req.session as any).oauthState = state;
  (req.session as any).oauthIntent = 'signin';
  (req.session as any).oauthReturnTo = typeof req.query.returnTo === 'string' ? req.query.returnTo : '/dashboard';
  res.redirect(buildSignInAuthUrl(publicOrigin(req) + '/api/auth/google/callback', state));
});

// Step 2: Google redirects back; validate state, exchange code, verify identity.
api.get('/auth/google/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query as Record<string, string>;
    if (error) return redirectAfterOAuth(res, `/auth?error=${encodeURIComponent('google_cancelled')}`);
    if (!code || !state || state !== (req.session as any).oauthState) {
      return redirectAfterOAuth(res, '/auth?error=' + encodeURIComponent('oauth_state'));
    }
    (req.session as any).oauthState = undefined;

    const identity = await exchangeSignInCode(code, publicOrigin(req) + '/api/auth/google/callback');
    if (!identity.emailVerified) {
      return redirectAfterOAuth(res, '/auth?error=' + encodeURIComponent('google_email_unverified'));
    }
    const user = resolveAccountForGoogleIdentity(identity);

    // Session fixation protection: regenerate before login.
    await new Promise<void>((resolve) => (req.session as any).regenerate(() => resolve()));
    (req.session as any).userId = user.id;
    logAudit('GOOGLE_LOGIN', user.id, user.email, 'Signed in via Google identity', req.ip);

    const returnTo = (req.session as any).oauthReturnTo || '/dashboard';
    (req.session as any).oauthReturnTo = undefined;
    redirectAfterOAuth(res, returnTo.startsWith('/') ? returnTo : '/dashboard');
  } catch {
    redirectAfterOAuth(res, '/auth?error=' + encodeURIComponent('google_failed'));
  }
});

// Email + password login.
api.post('/auth/login', rateLimit({ windowMs: 5 * 60_000, max: 10 }), async (req, res) => {
  const schema = z.object({ email: z.string().trim().email(), password: z.string().min(1).max(200) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return bad(res, 'Please provide a valid email and password.');
  const { email, password } = parsed.data;

  const user = await verifyPasswordLogin(email, password, req.ip);
  if (!user) return bad(res, 'Incorrect email or password.', 401);

  await new Promise<void>((resolve) => (req.session as any).regenerate(() => resolve()));
  (req.session as any).userId = user.id;
  logAudit('LOGIN', user.id, user.email, 'Password login', req.ip);
  res.json({ success: true, user: userRowToProfile(user) });
});

api.post('/auth/logout', (req, res) => {
  const user = getSessionUser(req);
  if (user) logAudit('LOGOUT', user.id, user.email, 'Signed out', req.ip);
  req.session.destroy(() => {
    res.clearCookie('raghvyon.sid');
    res.json({ success: true });
  });
});

api.get('/auth/session', (req, res) => {
  const user = getSessionUser(req);
  res.json({ user: user ? { ...user, profile: userRowToProfile(db.prepare('SELECT * FROM users WHERE id = ?').get(user.id)) } : null });
});

/**
 * Demo role switching — EXPLICITLY development-only (requirement §38).
 * Returns 404 in production so the endpoint does not even exist there.
 */
api.post('/auth/switch-role', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return bad(res, 'Demo mode is disabled in production.', 404);
  }
  const role = String(req.body?.role || 'student');
  const emailByRole: Record<string, string> = {
    student: 'aarav.sharma@student.raghvyon.com',
    parent: 'sunita.sharma@parent.raghvyon.com',
    admin: 'admin@raghvyonacademy.com',
  };
  const email = emailByRole[role];
  if (!email) return bad(res, 'Unknown demo role.');
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (!user) return bad(res, 'Demo accounts are not seeded.', 404);
  (req.session as any).userId = user.id;
  logAudit('LOGIN', user.id, user.email, `DEMO role switch to ${role}`, req.ip);
  res.json({ success: true, demo: true, user: userRowToProfile(user) });
});

/* ================================================================== */
/* STUDENT PORTAL                                                      */
/* ================================================================== */

api.get('/student/dashboard', requireRole('student'), (req, res) => {
  const user = (req as any).user as { id: number; email: string };
  const data = getStudentAcademicData(user.id);
  const drive = getConnectionStatus(user.id);
  res.json({
    profile: userRowToProfile(data.student),
    enrolledCourses: data.enrolledCourses,
    assignments: data.assignments,
    notes: data.notes,
    certificates: data.certificates,
    progress: data.progress,
    upcomingTasks: data.upcomingTasks,
    driveStatus: {
      isConnected: drive.isConnected,
      connectedEmail: drive.email,
      folderName: FOLDER_NAMES.root,
      scope: DRIVE_SCOPE,
      isConfigured: isDriveConfigured(),
    },
  });
});

const noteSchema = z.object({
  title: z.string().trim().min(1).max(150),
  subject: z.string().trim().min(1).max(60),
  summary: z.string().trim().max(300).optional(),
  content: z.string().max(20_000).optional(),
  saveToDrive: z.boolean().optional(),
});

// Create a note. Optional Drive copy goes to THE STUDENT'S OWN Drive folder.
api.post('/student/notes', requireRole('student'), async (req, res) => {
  const parsed = noteSchema.safeParse(req.body);
  if (!parsed.success) return bad(res, 'Please provide a title and subject for your note.');
  const d = parsed.data;
  const user = (req as any).user as { id: number; email: string };

  const info = db.prepare(
    `INSERT INTO study_notes (student_user_id, title, subject, summary, content) VALUES (?, ?, ?, ?, ?)`
  ).run(user.id, d.title, d.subject, d.summary ?? '', d.content ?? '');

  let driveResult = null;
  if (d.saveToDrive) {
    try {
      driveResult = await createStudentNote(user.id, d.title, `${d.summary ? d.summary + '\n\n' : ''}${d.content ?? ''}`);
      db.prepare(`UPDATE study_notes SET drive_file_id = ?, drive_web_view_link = ? WHERE id = ?`)
        .run(driveResult.driveFileId, driveResult.driveWebViewLink, Number(info.lastInsertRowid));
      logAudit('DRIVE_FILE_CREATE', user.id, user.email, `Note "${d.title}" saved to student's own Google Drive`, req.ip);
    } catch (err) {
      return res.status(502).json({ error: safeErrorMessage(err), noteId: String(info.lastInsertRowid) });
    }
  }

  logAudit('NOTE_CREATED', user.id, user.email, `Note "${d.title}" created`, req.ip);
  res.status(201).json({
    success: true,
    note: {
      id: String(info.lastInsertRowid),
      title: d.title,
      subject: d.subject,
      summary: d.summary ?? '',
      content: d.content ?? '',
      updatedAt: new Date().toISOString().slice(0, 10),
      driveSaved: !!driveResult,
      driveFileLink: driveResult?.driveWebViewLink,
    },
  });
});

// Submit an assignment. If saveToDrive → real upload into the student's
// Submissions folder in THEIR Drive, using THEIR OAuth credentials.
api.post('/student/assignments/:assignmentId/submit', requireRole('student'), upload.single('file'), async (req, res) => {
  const user = (req as any).user as { id: number; email: string };
  const assignmentId = Number(req.params.assignmentId);
  if (!Number.isInteger(assignmentId) || assignmentId <= 0) return bad(res, 'Invalid assignment id.');

  // Ownership check: the assignment must belong to an enrolled course.
  const assignment = db.prepare(
    `SELECT a.* FROM assignments a
     WHERE a.id = ? AND a.course_id IN (SELECT course_id FROM enrollments WHERE student_user_id = ?)`
  ).get(assignmentId, user.id) as any;
  if (!assignment) return bad(res, 'Assignment not found among your enrolled courses.', 404);

  const file = req.file;
  if (file) {
    if (!ALLOWED_MIME.has(file.mimetype)) return bad(res, 'Unsupported file type. Please upload PDF, images, or Office documents.');
    if (file.size > MAX_UPLOAD_BYTES) return bad(res, 'File is too large. Maximum size is 10 MB.');
  }

  const saveToDrive = req.body?.saveToDrive === 'true' || req.body?.saveToDrive === true;
  const existing = db.prepare(
    `SELECT id FROM submissions WHERE assignment_id = ? AND student_user_id = ?`
  ).get(assignmentId, user.id) as any;

  let driveResult = null;
  if (file && saveToDrive) {
    try {
      driveResult = await uploadStudentFile(user.id, 'submissions', {
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      });
      logAudit('DRIVE_FILE_UPLOAD', user.id, user.email, `Assignment file "${file.originalname}" uploaded to student's own Drive`, req.ip);
    } catch (err) {
      return res.status(502).json({ error: safeErrorMessage(err) });
    }
  }

  const now = new Date().toISOString();
  const common = {
    status: 'submitted' as const,
    submittedAt: now.slice(0, 10),
    fileName: file ? file.originalname : (existing as any)?.file_name ?? null,
    fileMime: file ? file.mimetype : null,
    fileSize: file ? file.size : null,
    driveFileId: driveResult?.driveFileId ?? (existing as any)?.drive_file_id ?? null,
    driveLink: driveResult?.driveWebViewLink ?? (existing as any)?.drive_web_view_link ?? null,
  };

  if (existing) {
    db.prepare(
      `UPDATE submissions SET status=@status, submitted_at=@submittedAt, file_name=@fileName, file_mime=@fileMime,
        file_size=@fileSize, drive_file_id=@driveFileId, drive_web_view_link=@driveLink, updated_at=datetime('now')
       WHERE id=@id`
    ).run({ ...common, id: existing.id });
  } else {
    db.prepare(
      `INSERT INTO submissions (assignment_id, student_user_id, status, submitted_at, file_name, file_mime, file_size, drive_file_id, drive_web_view_link)
       VALUES (@assignmentId, @studentId, @status, @submittedAt, @fileName, @fileMime, @fileSize, @driveFileId, @driveLink)`
    ).run({ ...common, assignmentId, studentId: user.id });
  }

  logAudit('ASSIGNMENT_SUBMISSION', user.id, user.email, `Submitted "${assignment.title}"`, req.ip);
  res.json({ success: true, driveFileId: driveResult?.driveFileId, driveLink: driveResult?.driveWebViewLink });
});

// List files the app created in THIS student's Drive (metadata cached in DB rows).
api.get('/student/drive/files', requireRole('student'), (req, res) => {
  const user = (req as any).user as { id: number; email: string };
  const submissionFiles = db.prepare(
    `SELECT s.file_name, s.drive_file_id, s.drive_web_view_link, s.updated_at
     FROM submissions s WHERE s.student_user_id = ? AND s.drive_file_id IS NOT NULL`
  ).all(user.id).map((r: any) => ({
    kind: 'submission', name: r.file_name, driveFileId: r.drive_file_id, link: r.drive_web_view_link, date: r.updated_at,
  }));
  const noteFiles = db.prepare(
    `SELECT title, drive_file_id, drive_web_view_link, updated_at FROM study_notes
     WHERE student_user_id = ? AND drive_file_id IS NOT NULL`
  ).all(user.id).map((r: any) => ({
    kind: 'note', name: r.title, driveFileId: r.drive_file_id, link: r.drive_web_view_link, date: r.updated_at,
  }));
  res.json({ files: [...submissionFiles, ...noteFiles] });
});

/* ================================================================== */
/* GOOGLE DRIVE — per-student OAuth (drive.file scope ONLY)            */
/* ================================================================== */

// "Connect Google Drive" — separate explicit authorization.
api.get('/drive/connect', requireAuth, rateLimit({ windowMs: 60_000, max: 10 }), (req, res) => {
  if (!isDriveConfigured()) {
    return bad(res, 'Google Drive integration is not configured on this server. Please contact the Academy.', 503);
  }
  const state = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  (req.session as any).oauthState = state;
  (req.session as any).oauthIntent = 'drive';
  res.redirect(buildDriveAuthUrl(publicOrigin(req) + '/api/drive/oauth2callback', state));
});

api.get('/drive/oauth2callback', async (req, res) => {
  try {
    const { code, state, error } = req.query as Record<string, string>;
    const user = getSessionUser(req);
    if (error) return redirectAfterOAuth(res, '/dashboard?drive=cancelled');
    if (!user || (req.session as any).oauthIntent !== 'drive') {
      return redirectAfterOAuth(res, '/auth?error=' + encodeURIComponent('session_expired'));
    }
    if (!code || !state || state !== (req.session as any).oauthState) {
      return redirectAfterOAuth(res, '/dashboard?drive=state_error');
    }
    (req.session as any).oauthState = undefined;
    (req.session as any).oauthIntent = undefined;

    await completeDriveConnection(user.id, code, publicOrigin(req) + '/api/drive/oauth2callback');
    logAudit('DRIVE_CONNECT', user.id, user.email, `Drive connected (drive.file scope) for ${user.email}`, req.ip);
    redirectAfterOAuth(res, '/dashboard?drive=connected');
  } catch (err) {
    const user = getSessionUser(req);
    logAudit('DRIVE_CONNECT', user?.id ?? null, user?.email ?? 'unknown', `Drive connection failed: ${err instanceof Error ? err.message : 'error'}`, req.ip);
    redirectAfterOAuth(res, '/dashboard?drive=failed');
  }
});

api.post('/drive/disconnect', requireAuth, (req, res) => {
  const user = (req as any).user as { id: number; email: string };
  const revoke = req.body?.revoke !== false;
  disconnectDrive(user.id, revoke).then(() => {
    logAudit('DRIVE_DISCONNECT', user.id, user.email, 'Drive disconnected; tokens removed from Academy servers', req.ip);
    res.json({
      success: true,
      message: 'Google Drive disconnected. Tokens were removed from Academy servers. Files already saved in your Drive remain yours.',
    });
  }).catch(() => bad(res, 'Could not disconnect Google Drive. Please try again.', 500));
});

api.get('/drive/status', requireAuth, async (req, res) => {
  const user = (req as any).user as { id: number; email: string };
  const status = getConnectionStatus(user.id);
  if (!status.isConnected) {
    return res.json({ isConnected: false, isConfigured: isDriveConfigured(), scope: DRIVE_SCOPE, folderName: FOLDER_NAMES.root });
  }
  // Occasional health check against Google (at most once per 10 min).
  const conn = db.prepare('SELECT last_verified_at FROM drive_connections WHERE user_id = ?').get(user.id) as any;
  const lastCheck = conn?.last_verified_at ? Date.parse((conn.last_verified_at as string).replace(' ', 'T') + 'Z') : 0;
  if (Date.now() - lastCheck > 10 * 60 * 1000) {
    await verifyDriveConnection(user.id);
  }
  const folders = await getOrCreateStudentFolders(user.id).catch(() => null);
  res.json({
    isConnected: true,
    isConfigured: isDriveConfigured(),
    connectedEmail: getConnectionStatus(user.id).email,
    storageLocation: 'Your own Google Drive (files are owned by your Google account)',
    folderName: FOLDER_NAMES.root,
    rootFolderId: folders?.root_folder_id,
    scope: DRIVE_SCOPE,
    connectedAt: status.connectedAt,
    lastVerifiedAt: status.lastVerifiedAt,
  });
});

// Open the student's own Academy folder in Drive.
api.get('/drive/folder-link', requireAuth, async (req, res) => {
  const user = (req as any).user as { id: number; email: string };
  try {
    const folders = await getOrCreateStudentFolders(user.id);
    if (!folders?.root_folder_id) return bad(res, 'Drive folders are not ready yet. Please reconnect Google Drive.', 400);
    res.json({ url: `https://drive.google.com/drive/folders/${folders.root_folder_id}` });
  } catch (err) {
    res.status(502).json({ error: safeErrorMessage(err) });
  }
});

/* ================================================================== */
/* PARENT PORTAL — verified links only                                 */
/* ================================================================== */

api.get('/parent/children', requireRole('parent'), (req, res) => {
  const user = (req as any).user as { id: number };
  const children = verifiedChildrenOf(user.id).map((c: any) => ({
    id: c.id,
    profile: userRowToProfile(c),
    driveConnected: !!db.prepare(
      `SELECT 1 FROM drive_connections WHERE user_id = ? AND status = 'connected'`
    ).get(c.id),
  }));
  // Parents never receive tokens, folder ids, or Drive credentials — only a boolean.
  res.json({ children });
});

api.get('/parent/child-data/:studentId', requireRole('parent'), (req, res) => {
  const parent = (req as any).user as { id: number; email: string };
  const studentId = Number(req.params.studentId);
  if (!Number.isInteger(studentId)) return bad(res, 'Invalid student id.');

  // CRITICAL: explicit verified parent-child relationship (DB-enforced).
  if (!isVerifiedParentOf(parent.id, studentId)) {
    logAudit('AUTH_FAILED', parent.id, parent.email, `Blocked access to unlinked student ${studentId}`, req.ip);
    return bad(res, 'You are not authorized to view this student.', 403);
  }

  const data = getStudentAcademicData(studentId);
  res.json({
    child: {
      profile: userRowToProfile(data.student),
      enrolledCourses: data.enrolledCourses,
      assignments: data.assignments,
      progress: data.progress,
      upcomingTasks: data.upcomingTasks,
      certificates: data.certificates,
    },
  });
});

/* ================================================================== */
/* ADMIN PORTAL                                                        */
/* ================================================================== */

api.get('/admin/overview', requireRole('admin'), (_req, res) => {
  const stats = {
    activeCourses: (db.prepare('SELECT COUNT(*) AS c FROM courses WHERE active = 1').get() as any).c,
    totalEnquiries: (db.prepare('SELECT COUNT(*) AS c FROM enquiries').get() as any).c,
    pendingDemoBookings: (db.prepare(`SELECT COUNT(*) AS c FROM demo_bookings WHERE status = 'pending'`).get() as any).c,
    students: (db.prepare(`SELECT COUNT(*) AS c FROM users WHERE role = 'student'`).get() as any).c,
    parents: (db.prepare(`SELECT COUNT(*) AS c FROM users WHERE role = 'parent'`).get() as any).c,
    driveConnected: (db.prepare(`SELECT COUNT(*) AS c FROM drive_connections WHERE status = 'connected'`).get() as any).c,
    auditLogCount: countAuditLogs(),
  };
  res.json({ stats });
});

api.get('/admin/enquiries', requireRole('admin'), (_req, res) => {
  const rows = db.prepare('SELECT * FROM enquiries ORDER BY id DESC LIMIT 200').all();
  res.json({
    enquiries: rows.map((e: any) => ({
      id: String(e.id), name: e.name, email: e.email, phone: e.phone,
      studentGrade: e.student_grade, subject: e.subject, message: e.message,
      createdAt: e.created_at, status: e.status,
    })),
  });
});

api.get('/admin/demo-bookings', requireRole('admin'), (_req, res) => {
  const rows = db.prepare('SELECT * FROM demo_bookings ORDER BY id DESC LIMIT 200').all();
  res.json({
    demoBookings: rows.map((b: any) => ({
      id: String(b.id), parentName: b.parent_name, studentName: b.student_name,
      studentGrade: b.student_grade, subject: b.subject, preferredDate: b.preferred_date,
      preferredTimeSlot: b.preferred_time_slot, phone: b.phone, email: b.email,
      status: b.status, createdAt: b.created_at,
    })),
  });
});

api.patch('/admin/enquiries/:id/status', requireRole('admin'), (req, res) => {
  const status = String(req.body?.status);
  if (!['new', 'contacted', 'converted', 'resolved'].includes(status)) return bad(res, 'Invalid status.');
  db.prepare('UPDATE enquiries SET status = ? WHERE id = ?').run(status, Number(req.params.id));
  const user = (req as any).user as { id: number; email: string };
  logAudit('ADMIN_ACTION', user.id, user.email, `Enquiry #${req.params.id} → ${status}`, req.ip);
  res.json({ success: true });
});

api.patch('/admin/demo-bookings/:id/status', requireRole('admin'), (req, res) => {
  const status = String(req.body?.status);
  if (!['pending', 'confirmed', 'completed'].includes(status)) return bad(res, 'Invalid status.');
  db.prepare('UPDATE demo_bookings SET status = ? WHERE id = ?').run(status, Number(req.params.id));
  const user = (req as any).user as { id: number; email: string };
  logAudit('ADMIN_ACTION', user.id, user.email, `Demo booking #${req.params.id} → ${status}`, req.ip);
  res.json({ success: true });
});

const courseSchema = z.object({
  title: z.string().trim().min(2).max(150),
  subject: z.string().trim().min(2).max(60),
  description: z.string().trim().max(2000).optional(),
  gradeLevel: z.string().trim().max(80).optional(),
  duration: z.string().trim().max(80).optional(),
  fee: z.string().trim().max(80).optional(),
  highlights: z.array(z.string().trim().max(160)).max(10).optional(),
});

api.post('/admin/courses', requireRole('admin'), (req, res) => {
  const parsed = courseSchema.safeParse(req.body);
  if (!parsed.success) return bad(res, 'Please provide a valid course title and subject.');
  const d = parsed.data;
  const info = db.prepare(
    `INSERT INTO courses (title, subject, description, grade_level, duration, fee, highlights)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(d.title, d.subject, d.description ?? '', d.gradeLevel ?? 'All Grades', d.duration ?? 'Flexible', d.fee ?? 'Contact us', JSON.stringify(d.highlights ?? []));
  const user = (req as any).user as { id: number; email: string };
  logAudit('ADMIN_ACTION', user.id, user.email, `Created course "${d.title}"`, req.ip);
  res.status(201).json({ success: true, courseId: String(info.lastInsertRowid) });
});

api.patch('/admin/courses/:id/status', requireRole('admin'), (req, res) => {
  const course = db.prepare('SELECT id, active FROM courses WHERE id = ?').get(Number(req.params.id)) as any;
  if (!course) return bad(res, 'Course not found.', 404);
  db.prepare('UPDATE courses SET active = ? WHERE id = ?').run(course.active ? 0 : 1, course.id);
  const user = (req as any).user as { id: number; email: string };
  logAudit('ADMIN_ACTION', user.id, user.email, `Course #${course.id} ${course.active ? 'deactivated' : 'activated'}`, req.ip);
  res.json({ success: true, active: !course.active });
});

api.put('/admin/teacher-profile', requireRole('admin'), (req, res) => {
  const schema = z.object({
    bio: z.string().trim().max(3000).optional(),
    phone: z.string().trim().max(40).optional(),
    address: z.string().trim().max(200).optional(),
    title: z.string().trim().max(120).optional(),
    name: z.string().trim().max(120).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return bad(res, 'Invalid profile fields.');
  updateTeacherProfile(parsed.data);
  const user = (req as any).user as { id: number; email: string };
  logAudit('PROFILE_UPDATED', user.id, user.email, 'Teacher profile updated by admin', req.ip);
  res.json({ success: true, teacherProfile: getTeacherProfile() });
});

api.get('/admin/users', requireRole('admin'), (_req, res) => {
  res.json({ users: listUsersForAdmin() });
});

api.get('/admin/parent-links', requireRole('admin'), (_req, res) => {
  const rows = db.prepare(
    `SELECT l.id, p.name AS parent_name, p.email AS parent_email, s.name AS student_name, s.email AS student_email, l.verified
     FROM parent_student_links l
     JOIN users p ON p.id = l.parent_user_id
     JOIN users s ON s.id = l.student_user_id
     ORDER BY l.id`
  ).all();
  res.json({ links: rows });
});

api.get('/admin/drive-connections', requireRole('admin'), (_req, res) => {
  // Application-level metadata ONLY (connected yes/no + masked email). No tokens.
  const rows = listDriveConnectionsForAdmin().map((r: any) => ({
    userId: r.user_id,
    studentName: r.name,
    academyEmail: r.academy_email,
    googleEmail: r.google_email ? r.google_email.replace(/^(.{2}).*(@.*)$/, '$1***$2') : null,
    status: r.status,
    connectedAt: r.connected_at,
  }));
  res.json({ connections: rows });
});

api.get('/admin/audit-logs', requireRole('admin'), (_req, res) => {
  res.json({ logs: listAuditLogs(150) });
});

/* Account deletion (student-initiated, immediate for platform records) */
api.post('/student/delete-account', requireRole('student'), (req, res) => {
  const user = (req as any).user as { id: number; email: string };
  // Remove OAuth artifacts first (tokens must not outlive the account).
  disconnectDrive(user.id, true).catch(() => {});
  db.prepare('DELETE FROM oauth_accounts WHERE user_id = ?').run(user.id);
  db.prepare('DELETE FROM study_notes WHERE student_user_id = ?').run(user.id);
  db.prepare('DELETE FROM submissions WHERE student_user_id = ?').run(user.id);
  db.prepare('DELETE FROM certificates WHERE student_user_id = ?').run(user.id);
  db.prepare('DELETE FROM enrollments WHERE student_user_id = ?').run(user.id);
  db.prepare('DELETE FROM parent_student_links WHERE student_user_id = ?').run(user.id);
  db.prepare('DELETE FROM drive_connections WHERE user_id = ?').run(user.id);
  logAudit('ACCOUNT_DELETION_REQUEST', user.id, user.email, 'Student account deleted from platform records', req.ip);
  req.session.destroy(() => {
    res.clearCookie('raghvyon.sid');
    res.json({ success: true, message: 'Your Academy account and learning records were deleted. Files in your own Google Drive remain yours to manage.' });
  });
});

/* ================================================================== */
/* AI STUDY ASSISTANT (Gemini, server-side only)                       */
/* ================================================================== */
const aiLimiter = rateLimit({ windowMs: 60_000, max: 12, message: 'You are sending questions too quickly. Please wait a moment.' });

api.post('/ai/ask', requireAuth, aiLimiter, async (req, res) => {
  const schema = z.object({
    question: z.string().trim().min(3).max(2000),
    subject: z.string().trim().max(60).optional(),
    gradeLevel: z.string().trim().max(40).optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return bad(res, 'Please provide your question (3–2000 characters).');
  const { question, subject = 'General', gradeLevel = 'Middle School' } = parsed.data;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'The AI assistant is not configured right now. Your teachers remain available for questions!',
      fallbackExplanation: `For "${question}": start by identifying what is given and what is asked, write down the relevant definitions, then work step-by-step. Bring this to your next RAGHVYON session for personalized review.`,
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const systemPrompt = `You are the RAGHVYON ACADEMY AI Study Assistant for school students.
Brand: RAGHVYON ACADEMY — "Learn Today. Lead Tomorrow."
Teaching rules:
1. Concept-first: explain the intuition ("why") BEFORE formulas or procedures.
2. Age-appropriate for a ${gradeLevel} student; warm, encouraging, never condescending.
3. Structure: short intro, numbered steps, key terms highlighted, one small practice question at the end.
4. Subjects supported: Mathematics, Science, English, Social Studies, Computer & Skills, Spoken English, Exam Preparation.
5. Academic integrity: guide with hints and worked examples — do not simply output full homework answers when asked to "do my homework".
6. Be concise (under 300 words) and end by reminding the student that AI supports — but never replaces — their human RAGHVYON mentor.
Current subject context: ${subject}.`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: question,
      config: { systemInstruction: systemPrompt, temperature: 0.6 },
    });
    res.json({
      success: true,
      explanation: response.text || 'I could not generate an answer just now — please ask your RAGHVYON mentor.',
      disclaimer: 'AI-generated study help. It complements — but does not replace — your human teachers.',
    });
  } catch (err) {
    console.error('Gemini error', err);
    res.status(502).json({ error: 'The AI assistant is unavailable right now. Please try again shortly.' });
  }
});

/* Error sanitizer for the whole API --------------------------------- */
api.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File is too large. Maximum size is 10 MB.' });
  }
  console.error('API error:', err);
  res.status(500).json({ error: 'Something went wrong on our side. Please try again.' });
});
