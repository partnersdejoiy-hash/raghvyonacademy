/**
 * Audit logging — records security-relevant events to the database.
 *
 * PRIVACY RULE: never log passwords, OAuth tokens, client secrets,
 * SESSION_SECRET, or API keys. Only event names + non-sensitive context.
 */
/** Minimal structural type — works with better-sqlite3 AND libsql. */
interface AuditDatabase {
  prepare(sql: string): { run(...params: any[]): unknown };
}

export type AuditAction =
  | 'LOGIN'
  | 'GOOGLE_LOGIN'
  | 'LOGOUT'
  | 'DRIVE_CONNECT'
  | 'DRIVE_DISCONNECT'
  | 'DRIVE_FILE_CREATE'
  | 'DRIVE_FILE_UPLOAD'
  | 'ASSIGNMENT_SUBMISSION'
  | 'NOTE_CREATED'
  | 'CERTIFICATE_CREATED'
  | 'PROFILE_UPDATED'
  | 'ROLE_CHANGE'
  | 'ACCOUNT_DELETION_REQUEST'
  | 'ADMIN_ACTION'
  | 'PERMISSION_DENIED'
  | 'AUTH_FAILED'
  | 'RATE_LIMITED'
  | 'NEW_ENQUIRY'
  | 'DEMO_CLASS_BOOKED'
  | 'SYSTEM_BOOT';

let insertStmt: any = null;

export function initAuditLogger(db: AuditDatabase) {
  insertStmt = db.prepare(
    `INSERT INTO audit_logs (action, actor_user_id, actor_label, details, ip) VALUES (?, ?, ?, ?, ?)`
  );
}

export function logAudit(
  action: AuditAction,
  actorUserId: number | null,
  actorLabel: string,
  details: string,
  ip?: string
) {
  if (!insertStmt) return;
  try {
    insertStmt.run(action, actorUserId ?? null, actorLabel, details, ip ?? null);
  } catch (err) {
    // Audit logging must never crash request handling.
    console.error('audit log failure', err);
  }
}
