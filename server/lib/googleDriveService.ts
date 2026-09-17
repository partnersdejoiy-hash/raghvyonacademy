/**
 * RAGHVYON ACADEMY — Google Drive service (per-student OAuth ownership).
 *
 * ARCHITECTURAL CONTRACT (non-negotiable):
 *  - Every Drive request is made with THE STUDENT'S OWN OAuth credentials.
 *  - Files/folders created through this service are OWNED by that student's
 *    Google account and consume that student's Drive storage.
 *  - There is no global/central Academy Drive and NO service account fallback.
 *  - Scope is limited to https://www.googleapis.com/auth/drive.file — the app
 *    can only see files it created through this authorization.
 *  - Tokens are AES-256-GCM encrypted at rest and never sent to the browser.
 */
import { OAuth2Client } from 'google-auth-library';
import { db } from '../db';
import { encryptToken, decryptToken } from './crypto';

const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';
const TOKEN_API = 'https://oauth2.googleapis.com/token';

export const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';

export const FOLDER_NAMES = {
  root: 'RAGHVYON Academy',
  assignments: 'Assignments',
  notes: 'Study Notes',
  certificates: 'Certificates',
  materials: 'Course Materials',
  submissions: 'Submissions',
} as const;

export type FolderKey = keyof typeof FOLDER_NAMES;

export function isDriveConfigured(): boolean {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function buildRedirectUri(origin: string): string {
  if (process.env.GOOGLE_REDIRECT_URI) return process.env.GOOGLE_REDIRECT_URI;
  return `${origin}/api/drive/oauth2callback`;
}

/* ------------------------------------------------------------------ */
/* OAuth URL + code exchange                                           */
/* ------------------------------------------------------------------ */

export function buildAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || '',
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: DRIVE_SCOPE,
    access_type: 'offline',          // persistent refresh token
    prompt: 'consent',               // guarantee refresh token issuance
    include_granted_scopes: 'false',
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
  id_token?: string;
}

async function exchangeCodeForTokens(code: string, redirectUri: string): Promise<TokenResponse> {
  const res = await fetch(TOKEN_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google token exchange failed (${res.status}): ${body.slice(0, 300)}`);
  }
  return res.json();
}

/** Decode the JWT id_token payload locally to read sub/email (Drive flow). */
function decodeIdTokenPayload(idToken: string): { sub: string; email?: string; picture?: string } {
  const payloadB64 = idToken.split('.')[1];
  const json = Buffer.from(payloadB64, 'base64url').toString('utf8');
  return JSON.parse(json);
}

/* ------------------------------------------------------------------ */
/* Token persistence + refresh                                         */
/* ------------------------------------------------------------------ */

function loadAccount(userId: number): any {
  return db.prepare('SELECT * FROM oauth_accounts WHERE user_id = ? AND provider = ?').get(userId, 'google');
}

function loadConnection(userId: number): any {
  return db.prepare('SELECT * FROM drive_connections WHERE user_id = ?').get(userId);
}

/** Refresh the stored access token if expired. Returns a valid access token. */
export async function getValidAccessToken(userId: number): Promise<string> {
  const account = loadAccount(userId);
  if (!account || !account.refresh_token_encrypted) {
    throw new Error('NOT_CONNECTED');
  }

  // Refresh 60s early to avoid races.
  if (account.expires_at && account.expires_at > Date.now() + 60_000) {
    return decryptToken(account.access_token_encrypted);
  }

  const refreshToken = decryptToken(account.refresh_token_encrypted);
  const res = await fetch(TOKEN_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    const bodyText = await res.text();
    if (bodyText.includes('invalid_grant')) {
      // Refresh token revoked or expired by the user from their Google account.
      markDisconnected(userId, 'revoked');
      throw new Error('REFRESH_TOKEN_INVALID');
    }
    throw new Error(`Google token refresh failed (${res.status})`);
  }

  const tokens = (await res.json()) as TokenResponse;
  const expiresAt = Date.now() + (tokens.expires_in ?? 3600) * 1000;
  db.prepare(
    `UPDATE oauth_accounts SET access_token_encrypted = ?, expires_at = ?, updated_at = datetime('now') WHERE user_id = ? AND provider = 'google'`
  ).run(encryptToken(tokens.access_token), expiresAt, userId);

  return tokens.access_token;
}

/* ------------------------------------------------------------------ */
/* Connect flow                                                        */
/* ------------------------------------------------------------------ */

export async function completeDriveConnection(
  userId: number,
  code: string,
  redirectUri: string
): Promise<{ email: string }> {
  const tokens = await exchangeCodeForTokens(code, redirectUri);
  if (!tokens.refresh_token) {
    throw new Error('NO_REFRESH_TOKEN');
  }
  if (!tokens.id_token) {
    throw new Error('NO_ID_TOKEN');
  }
  const identity = decodeIdTokenPayload(tokens.id_token);
  if (!identity.sub) throw new Error('NO_IDENTITY');

  // Persist encrypted tokens + connection row.
  db.prepare(
    `INSERT INTO oauth_accounts (user_id, provider, provider_account_id, provider_email, access_token_encrypted, refresh_token_encrypted, expires_at, scope)
     VALUES (?, 'google', ?, ?, ?, ?, ?, ?)
     ON CONFLICT (user_id, provider) DO UPDATE SET
       provider_account_id = excluded.provider_account_id,
       provider_email = excluded.provider_email,
       access_token_encrypted = excluded.access_token_encrypted,
       refresh_token_encrypted = excluded.refresh_token_encrypted,
       expires_at = excluded.expires_at,
       scope = excluded.scope,
       updated_at = datetime('now')`
  ).run(
    userId,
    identity.sub,
    identity.email ?? null,
    encryptToken(tokens.access_token),
    encryptToken(tokens.refresh_token),
    Date.now() + (tokens.expires_in ?? 3600) * 1000,
    tokens.scope ?? DRIVE_SCOPE
  );

  db.prepare(
    `INSERT INTO drive_connections (user_id, google_account_id, google_email, status, connected_at, last_verified_at)
     VALUES (?, ?, ?, 'connected', datetime('now'), datetime('now'))
     ON CONFLICT (user_id) DO UPDATE SET
       google_account_id = excluded.google_account_id,
       google_email = excluded.google_email,
       status = 'connected',
       connected_at = datetime('now'),
       last_verified_at = datetime('now')`
  ).run(userId, identity.sub, identity.email ?? null);

  // Provision the student's own folder tree in THEIR Drive.
  await getOrCreateStudentFolders(userId);

  return { email: identity.email ?? '' };
}

/* ------------------------------------------------------------------ */
/* Low-level Drive REST helpers (student's credentials only)           */
/* ------------------------------------------------------------------ */

async function driveFetch(userId: number, pathAndQuery: string, init?: RequestInit): Promise<Response> {
  const accessToken = await getValidAccessToken(userId);
  const res = await fetch(`${DRIVE_API}${pathAndQuery}`, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res;
}

async function findFolderByName(userId: number, name: string, parentId?: string): Promise<string | null> {
  const clauses = [
    "mimeType = 'application/vnd.google-apps.folder'",
    'trashed = false',
    `name = ${JSON.stringify(name)}`,
  ];
  if (parentId) clauses.push(`${JSON.stringify(parentId)} in parents`);
  const q = encodeURIComponent(clauses.join(' and '));
  const res = await driveFetch(userId, `/files?q=${q}&fields=files(id,name)&pageSize=5&spaces=drive`);
  if (!res.ok) throw new Error(`Drive query failed (${res.status})`);
  const data = await res.json();
  return data.files?.[0]?.id ?? null;
}

async function createFolder(userId: number, name: string, parentId?: string): Promise<string> {
  const accessToken = await getValidAccessToken(userId);
  const body: Record<string, unknown> = { name, mimeType: 'application/vnd.google-apps.folder' };
  if (parentId) body.parents = [parentId];
  const res = await fetch(`${DRIVE_API}/files?fields=id`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Drive folder creation failed (${res.status}): ${t.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.id;
}

/**
 * Ensure the "RAGHVYON Academy" root folder + 5 subfolders exist in the
 * student's OWN My Drive. Returns the connection row with folder ids filled.
 */
export async function getOrCreateStudentFolders(userId: number): Promise<any> {
  const connection = loadConnection(userId);
  if (!connection || connection.status !== 'connected') throw new Error('NOT_CONNECTED');

  const missing = !connection.root_folder_id ||
    !connection.assignments_folder_id ||
    !connection.notes_folder_id ||
    !connection.certificates_folder_id ||
    !connection.materials_folder_id ||
    !connection.submissions_folder_id;

  if (!missing) return connection;

  // Root folder (re-resolve if lost).
  let rootId = connection.root_folder_id;
  if (!rootId) {
    rootId = (await findFolderByName(userId, FOLDER_NAMES.root)) ??
      (await createFolder(userId, FOLDER_NAMES.root));
  }

  const subfolders: Record<FolderKey, string> = {
    root: rootId!,
    assignments: connection.assignments_folder_id ?? '',
    notes: connection.notes_folder_id ?? '',
    certificates: connection.certificates_folder_id ?? '',
    materials: connection.materials_folder_id ?? '',
    submissions: connection.submissions_folder_id ?? '',
  };

  for (const key of ['assignments', 'notes', 'certificates', 'materials', 'submissions'] as const) {
    if (!subfolders[key]) {
      subfolders[key] = (await findFolderByName(userId, FOLDER_NAMES[key], rootId!)) ??
        (await createFolder(userId, FOLDER_NAMES[key], rootId!));
    }
  }

  db.prepare(
    `UPDATE drive_connections SET root_folder_id = ?, assignments_folder_id = ?, notes_folder_id = ?,
      certificates_folder_id = ?, materials_folder_id = ?, submissions_folder_id = ?, last_verified_at = datetime('now')
     WHERE user_id = ?`
  ).run(subfolders.root, subfolders.assignments, subfolders.notes, subfolders.certificates,
        subfolders.materials, subfolders.submissions, userId);

  return loadConnection(userId);
}

export function folderIdFor(userId: number, key: FolderKey): string {
  const conn = loadConnection(userId);
  const map: Record<FolderKey, string | null> = {
    root: conn?.root_folder_id ?? null,
    assignments: conn?.assignments_folder_id ?? null,
    notes: conn?.notes_folder_id ?? null,
    certificates: conn?.certificates_folder_id ?? null,
    materials: conn?.materials_folder_id ?? null,
    submissions: conn?.submissions_folder_id ?? null,
  };
  const id = map[key];
  if (!id) throw new Error('NOT_CONNECTED');
  return id;
}

/* ------------------------------------------------------------------ */
/* File creation                                                       */
/* ------------------------------------------------------------------ */

export interface DriveUploadResult {
  driveFileId: string;
  driveWebViewLink: string;
  fileName: string;
  mimeType: string;
  size: number;
}

/** Upload a real binary file into the student's Drive folder (student owns it). */
export async function uploadStudentFile(
  userId: number,
  folderKey: FolderKey,
  file: { buffer: Buffer; originalname: string; mimetype: string; size: number }
): Promise<DriveUploadResult> {
  const folderId = folderIdFor(userId, folderKey);
  const accessToken = await getValidAccessToken(userId);

  const params = new URLSearchParams({
    uploadType: 'multipart',
    fields: 'id,name,mimeType,size,webViewLink',
    supportsAllDrives: 'false',
  });

  const boundary = 'raghvyon_' + Math.random().toString(36).slice(2);
  const metadata = JSON.stringify({
    name: file.originalname,
    parents: [folderId],
  });

  const multipartBody = Buffer.concat([
    Buffer.from(
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n` +
      `--${boundary}\r\nContent-Type: ${file.mimetype}\r\n\r\n`
    ),
    file.buffer,
    Buffer.from(`\r\n--${boundary}--`),
  ]);

  const res = await fetch(`${DRIVE_UPLOAD_API}/files?${params.toString()}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: new Uint8Array(multipartBody),
  });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 403 && text.includes('storageQuotaExceeded')) throw new Error('DRIVE_QUOTA_EXCEEDED');
    if (res.status === 401) throw new Error('TOKEN_EXPIRED');
    throw new Error(`Drive upload failed (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  return {
    driveFileId: data.id,
    driveWebViewLink: data.webViewLink ?? `https://drive.google.com/file/d/${data.id}/view`,
    fileName: data.name ?? file.originalname,
    mimeType: data.mimeType ?? file.mimetype,
    size: data.size ? Number(data.size) : file.size,
  };
}

/** Create a Google Doc note from text content (student owns it). */
export async function createStudentNote(
  userId: number,
  title: string,
  content: string
): Promise<DriveUploadResult> {
  const folderId = folderIdFor(userId, 'notes');
  const accessToken = await getValidAccessToken(userId);

  const metadata = JSON.stringify({
    name: title,
    mimeType: 'application/vnd.google-apps.document',
    parents: [folderId],
  });

  const boundary = 'raghvyon_note_' + Math.random().toString(36).slice(2);
  const multipartBody = Buffer.concat([
    Buffer.from(
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n` +
      `--${boundary}\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n${content}\r\n--${boundary}--`
    ),
  ]);

  const res = await fetch(`${DRIVE_UPLOAD_API}/files?uploadType=multipart&fields=id,name,webViewLink`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: new Uint8Array(multipartBody),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Drive note creation failed (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  return {
    driveFileId: data.id,
    driveWebViewLink: data.webViewLink ?? `https://docs.google.com/document/d/${data.id}/edit`,
    fileName: data.name ?? title,
    mimeType: 'application/vnd.google-apps.document',
    size: Buffer.byteLength(content),
  };
}

/* ------------------------------------------------------------------ */
/* Status / verification / disconnect                                  */
/* ------------------------------------------------------------------ */

export function getConnectionStatus(userId: number) {
  const conn = loadConnection(userId);
  if (!conn || conn.status !== 'connected') {
    return { isConnected: false, email: null, rootFolderId: null };
  }
  return {
    isConnected: true,
    email: conn.google_email,
    rootFolderId: conn.root_folder_id,
    connectedAt: conn.connected_at,
    lastVerifiedAt: conn.last_verified_at,
  };
}

/** Verify the stored token actually works against Drive right now. */
export async function verifyDriveConnection(userId: number): Promise<boolean> {
  try {
    await getValidAccessToken(userId);
    const aboutRes = await driveFetch(userId, '/about?fields=user');
    if (!aboutRes.ok) return false;
    db.prepare(`UPDATE drive_connections SET last_verified_at = datetime('now') WHERE user_id = ?`).run(userId);
    return true;
  } catch {
    return false;
  }
}

/**
 * Disconnect: revoke Google authorization (best effort), wipe tokens from the
 * database, mark disconnected. Academic records in the platform are preserved;
 * the student's Drive files remain untouched (they own them).
 */
export async function disconnectDrive(userId: number, revoke: boolean): Promise<void> {
  const account = loadAccount(userId);
  if (account?.refresh_token_encrypted && revoke) {
    try {
      const refreshToken = decryptToken(account.refresh_token_encrypted);
      await fetch('https://oauth2.googleapis.com/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ token: refreshToken }),
      });
    } catch {
      // Best-effort revoke — local disconnect still proceeds.
    }
  }
  db.prepare('DELETE FROM oauth_accounts WHERE user_id = ? AND provider = ?').run(userId, 'google');
  db.prepare(
    `UPDATE drive_connections SET status = 'disconnected', google_account_id = NULL, last_verified_at = datetime('now') WHERE user_id = ?`
  ).run(userId);
}

function markDisconnected(userId: number, status: 'disconnected' | 'revoked') {
  db.prepare(`UPDATE drive_connections SET status = ? WHERE user_id = ?`).run(status, userId);
}

export type { OAuth2Client };
