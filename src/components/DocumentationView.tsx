import React, { useState } from 'react';
import {
  FileText, Key, Database, ShieldCheck, HardDrive, Rocket, AlertTriangle, Copy, Check, ExternalLink,
} from 'lucide-react';

export const DocumentationView: React.FC = () => {
  const [activeDoc, setActiveDoc] = useState<'architecture' | 'auth' | 'drive' | 'db' | 'security' | 'env' | 'ops'>('architecture');
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FFF9EE]/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 bg-[#FFF9EE] border border-[#2454A6]/15 px-3 py-1 rounded-full text-xs font-bold text-[#2454A6] mb-2">
                <FileText className="w-3.5 h-3.5 text-[#35B8A6]" />
                <span>PLATFORM SPECIFICATION</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2454A6]">RAGHVYON ACADEMY System Documentation</h1>
              <p className="text-xs sm:text-sm text-[#172B4D]/70 mt-1">
                This documentation describes the code that actually runs in this repository — implemented flows, storage, and security boundaries.
              </p>
            </div>
            <div className="flex flex-col space-y-2">
              <span className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-full">
                Real DB · Real OAuth · Real RBAC
                <span className="block text-[10px] font-semibold text-emerald-700/80">Google Drive OAuth requires server credentials to be configured</span>
                <span className="block text-[10px] font-semibold text-emerald-700/80">Demo accounts exist only outside production</span>
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-2 border-b border-gray-200 pb-2 overflow-x-auto scrollbar-none">
          {([
            ['architecture', 'Architecture'],
            ['auth', 'Authentication'],
            ['drive', 'Google Drive OAuth'],
            ['db', 'Database'],
            ['security', 'Security & RBAC'],
            ['env', 'Environment'],
            ['ops', 'Deployment & Ops'],
          ] as Array<[typeof activeDoc, string]>).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveDoc(key)}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap transition-colors ${
                activeDoc === key ? 'bg-[#2454A6] text-white' : 'text-[#172B4D]/70 hover:text-[#2454A6]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ARCHITECTURE */}
        {activeDoc === 'architecture' && (
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-6">
            <h3 className="text-xl font-bold text-[#172B4D]">Architecture</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                <span className="text-xs font-bold text-[#2454A6] uppercase">Frontend</span>
                <p className="text-sm font-bold text-[#172B4D] mt-1">React 19 + TypeScript + Vite</p>
                <p className="text-xs text-gray-500 mt-1">Tailwind CSS 4, code-split dashboards, httpOnly session cookie auth.</p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                <span className="text-xs font-bold text-[#35B8A6] uppercase">Backend</span>
                <p className="text-sm font-bold text-[#172B4D] mt-1">Express (TypeScript) + SQLite</p>
                <p className="text-xs text-gray-500 mt-1">better-sqlite3 (WAL), zod validation, helmet, rate limiting, multer uploads.</p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                <span className="text-xs font-bold text-[#F28C72] uppercase">Integrations</span>
                <p className="text-sm font-bold text-[#172B4D] mt-1">Google OAuth 2.0 · Drive API · Gemini</p>
                <p className="text-xs text-gray-500 mt-1">Identity sign-in (openid/email/profile) + separate Drive authorization (drive.file). Gemini key stays server-side.</p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-[#172B4D] uppercase">Ownership model (the core guarantee)</span>
              <pre className="bg-[#172B4D] text-[#FFF9EE] p-4 rounded-2xl text-xs font-mono overflow-x-auto leading-relaxed">
{`Student RAGHVYON account
      ↓  (Google Sign-In: openid + email + profile only)
Google identity  →  linked to the student's platform account
      ↓  (SEPARATE explicit "Connect Google Drive" action)
Google Drive OAuth  →  drive.file scope, access_type=offline
      ↓  (refresh token encrypted AES-256-GCM server-side)
Student's OWN My Drive
      ↓
RAGHVYON Academy/  (created in THAT student's Drive)
├── Assignments/
├── Study Notes/
├── Certificates/
├── Course Materials/
└── Submissions/

Files are created WITH the student's OAuth token → the student's
Google account is the OWNER. There is no Academy service account
and no shared Academy Drive anywhere in this codebase.`}
              </pre>
            </div>
          </section>
        )}

        {/* AUTH */}
        {activeDoc === 'auth' && (
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-6">
            <h3 className="text-xl font-bold text-[#172B4D]">Authentication</h3>
            <div className="space-y-4 text-xs sm:text-sm text-[#172B4D]/85">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-blue-950 space-y-2">
                <span className="font-bold block text-blue-900">Google Sign-In (identity only)</span>
                <p><code>GET /api/auth/google</code> → Google consent (scopes: <code>openid email profile</code>) → <code>GET /api/auth/google/callback</code> → state validated → code exchanged server-side → identity fetched from Google's userinfo endpoint → account linked or provisioned → session cookie issued.</p>
                <p>Drive permission is NEVER requested during sign-in.</p>
              </div>
              <div className="bg-[#FFF9EE] border border-[#2454A6]/15 rounded-2xl p-4 space-y-2">
                <span className="font-bold text-[#2454A6] block">Email + password</span>
                <p><code>POST /api/auth/login</code> with bcrypt-hashed passwords (10 rounds). Failed attempts are rate-limited and audited.</p>
              </div>
              <div className="bg-[#FFF9EE] border border-[#2454A6]/15 rounded-2xl p-4 space-y-2">
                <span className="font-bold text-[#2454A6] block">Sessions</span>
                <p><code>express-session</code> with httpOnly + SameSite=Lax cookies, <code>SESSION_SECRET</code>-signed. Session id regenerates on login (fixation protection). Rotating <code>SESSION_SECRET</code> invalidates all sessions by design.</p>
              </div>
              <div className="bg-[#FFF9EE] border border-[#2454A6]/15 rounded-2xl p-4 space-y-2">
                <span className="font-bold text-[#2454A6] block">Role model</span>
                <p>Roles: <code>student</code>, <code>parent</code>, <code>admin</code> — stored server-side and resolved from the session on every request. The frontend can neither set nor spoof them.</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-900 space-y-2">
                <span className="font-bold block">Demo mode (development only)</span>
                <p><code>POST /api/auth/switch-role</code> exists only when <code>NODE_ENV !== 'production'</code> and returns 404 otherwise. Demo accounts are seeded only in non-production. The login dialog shows the demo panel only when the server reports demo mode.</p>
              </div>
            </div>
          </section>
        )}

        {/* DRIVE */}
        {activeDoc === 'drive' && (
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-6">
            <h3 className="text-xl font-bold text-[#172B4D]">Google Drive OAuth — per-student ownership</h3>
            <div className="space-y-4 text-xs sm:text-sm text-[#172B4D]/85">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-blue-950 space-y-2">
                <span className="font-bold block text-blue-900">Flow</span>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Student clicks "Connect Google Drive" → <code>GET /api/drive/connect</code></li>
                  <li>Server issues a signed state, redirects to Google with <code>scope=drive.file</code>, <code>access_type=offline</code>, <code>prompt=consent</code></li>
                  <li><code>GET /api/drive/oauth2callback</code>: session + state validated, code exchanged, identity from id_token</li>
                  <li>Refresh + access tokens encrypted (AES-256-GCM) and stored in <code>oauth_accounts</code></li>
                  <li><code>RAGHVYON Academy</code> folder + 5 subfolders are created in the student's own Drive via the Drive API</li>
                  <li>Folder IDs saved to <code>drive_connections</code> for that user only</li>
                </ol>
              </div>
              <div className="bg-[#FFF9EE] border border-[#2454A6]/15 rounded-2xl p-4 space-y-2">
                <span className="font-bold text-[#2454A6] block">Scope policy</span>
                <p>Only <code>https://www.googleapis.com/auth/drive.file</code>. Never <code>drive</code> (full), Gmail, Contacts, Calendar, or Photos. The app can only see files it created through this authorization.</p>
              </div>
              <div className="bg-[#FFF9EE] border border-[#2454A6]/15 rounded-2xl p-4 space-y-2">
                <span className="font-bold text-[#2454A6] block">Token handling</span>
                <p>Refresh tokens never leave the server. Access tokens are refreshed automatically on expiry; <code>invalid_grant</code> marks the connection revoked and surfaces a friendly re-connect message. Disconnect revokes the grant at Google and deletes stored tokens.</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-950 space-y-2">
                <span className="font-bold block text-emerald-900">Disconnect semantics</span>
                <p>Disconnect revokes Google authorization (best-effort), deletes <code>oauth_accounts</code> rows, marks <code>drive_connections.status</code> disconnected. Academic records are preserved. The student's Drive files are NOT touched — the student owns them.</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-950 space-y-2">
                <span className="font-bold block text-red-900">What admins can and cannot see</span>
                <p>Admins see connection status and a masked Google email (<code>ab***@gmail.com</code>) for support. There is no admin endpoint that returns tokens or folder browsing — ever.</p>
              </div>
            </div>
          </section>
        )}

        {/* DATABASE */}
        {activeDoc === 'db' && (
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-6">
            <h3 className="text-xl font-bold text-[#172B4D]">Database (SQLite, WAL)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {[
                ['users', 'email, name, bcrypt hash, role, google_sub, grade, student_code'],
                ['parent_student_links', 'explicit verified parent→student relationships'],
                ['courses / enrollments', 'catalog + per-student enrollment'],
                ['assignments / submissions', 'coursework + per-student submissions with Drive file metadata'],
                ['study_notes', 'per-student notes with optional Drive copy'],
                ['certificates', 'per-student certificates with verification codes'],
                ['oauth_accounts', 'encrypted access/refresh tokens, expiry, scope (per user)'],
                ['drive_connections', 'per-user Drive folder IDs + connection status'],
                ['enquiries / demo_bookings', 'public lead capture'],
                ['audit_logs', 'security events without secrets'],
              ].map(([name, desc]) => (
                <div key={name} className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                  <code className="text-xs font-bold text-[#2454A6]">{name}</code>
                  <p className="text-[11px] text-gray-500 mt-1">{desc}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500">All student-scoped queries filter by the authenticated user's id. Parent queries require a verified <code>parent_student_links</code> row.</p>
          </section>
        )}

        {/* SECURITY */}
        {activeDoc === 'security' && (
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-6">
            <h3 className="text-xl font-bold text-[#172B4D]">Security & RBAC</h3>
            <div className="space-y-4 text-xs sm:text-sm text-[#172B4D]/85">
              <div className="p-4 rounded-2xl bg-[#FFF9EE] border border-[#2454A6]/15 space-y-2">
                <span className="font-bold text-[#2454A6] block">Server-side authorization</span>
                <p>Every protected route derives identity from the session. <code>requireRole('student'|'parent'|'admin')</code> guards each portal. Request bodies can never set role or user id.</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FFF9EE] border border-[#2454A6]/15 space-y-2">
                <span className="font-bold text-[#2454A6] block">Parent-child isolation</span>
                <p><code>GET /api/parent/child-data/:studentId</code> checks a <strong>verified</strong> row in <code>parent_student_links</code>; otherwise 403 + audit log. Knowing a student's email grants nothing.</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FFF9EE] border border-[#2454A6]/15 space-y-2">
                <span className="font-bold text-[#2454A6] block">Student isolation</span>
                <p>Notes, submissions, certificates, and Drive connections are always filtered by the session user id. Student A cannot read or write Student B's data.</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FFF9EE] border border-[#2454A6]/15 space-y-2">
                <span className="font-bold text-[#2454A6] block">Transport & headers</span>
                <p>helmet (CSP, frame-ancestors, no-sniff), CORS allow-list, 1 MB JSON body limit, 10 MB upload limit, per-IP rate limits on auth/AI/forms, multer MIME allow-list for uploads.</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FFF9EE] border border-[#2454A6]/15 space-y-2">
                <span className="font-bold text-[#2454A6] block">Error sanitization</span>
                <p>API errors are generic by default; Drive-specific failures map to friendly, non-leaking messages. Stack traces and secrets never reach responses.</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FFF9EE] border border-[#2454A6]/15 space-y-2">
                <span className="font-bold text-[#2454A6] block">Audit logging</span>
                <p>LOGIN, GOOGLE_LOGIN, LOGOUT, DRIVE_CONNECT/DISCONNECT, DRIVE_FILE_CREATE/UPLOAD, ASSIGNMENT_SUBMISSION, NOTE_CREATED, PROFILE_UPDATED, ACCOUNT_DELETION_REQUEST, ADMIN_ACTION are recorded with actor + IP. Tokens and secrets are never logged.</p>
              </div>
            </div>
          </section>
        )}

        {/* ENV */}
        {activeDoc === 'env' && (
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#172B4D]">Environment Variables</h3>
              <button
                onClick={() => copyToClipboard('env', 'GOOGLE_CLIENT_ID=\nGOOGLE_CLIENT_SECRET=\nGOOGLE_REDIRECT_URI=\nSESSION_SECRET=\nAPP_URL=\nGEMINI_API_KEY=')}
                className="flex items-center space-x-1 text-xs font-bold text-[#2454A6] bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200"
              >
                {copied === 'env' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied === 'env' ? 'Copied' : 'Copy Template'}</span>
              </button>
            </div>
            <pre className="bg-[#172B4D] text-[#FFF9EE] p-5 rounded-2xl text-xs font-mono overflow-x-auto leading-relaxed">
{`# Server-side only — NEVER expose to the frontend
GOOGLE_CLIENT_ID=          # OAuth 2.0 Web client id
GOOGLE_CLIENT_SECRET=      # OAuth 2.0 client secret
GOOGLE_REDIRECT_URI=       # Optional override; else {APP_URL}/api/drive/oauth2callback
SESSION_SECRET=            # REQUIRED in prod: openssl rand -base64 48
APP_URL=                   # Public base URL (builds OAuth redirect URIs)
GEMINI_API_KEY=            # AI assistant (server-side only)

# Optional
DATABASE_PATH=             # SQLite file path (default ./data/raghvyon.db)
NODE_ENV=production
PORT=3000`}
            </pre>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-1">
              <span className="font-bold block">Redirect URIs to register in Google Cloud Console</span>
              <p><code>{'{APP_URL}'}/api/auth/google/callback</code> (Sign-In) and <code>{'{APP_URL}'}/api/drive/oauth2callback</code> (Drive). Use HTTPS in production.</p>
            </div>
          </section>
        )}

        {/* OPS */}
        {activeDoc === 'ops' && (
          <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-2xs space-y-6">
            <h3 className="text-xl font-bold text-[#172B4D]">Deployment, Backup & Incident Handling</h3>
            <div className="space-y-4 text-xs sm:text-sm text-[#172B4D]/85">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                <span className="font-bold text-[#172B4D] block">Commands</span>
                <pre className="bg-white p-3 rounded-xl font-mono text-[11px] border border-gray-200">
{`bun install
bun run dev      # tsx server.ts (Vite middleware, dev mode)
bun run build    # vite build + esbuild server bundle → dist/
bun run start    # node dist/server.cjs (production)`}
                </pre>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                <span className="font-bold text-[#172B4D] block">Backups</span>
                <p>SQLite database lives at <code>data/raghvyon.db</code> (WAL). Back up by copying the file (or use <code>sqlite3 .backup</code>) on a schedule; keep off-site copies. The DB contains no plaintext secrets — tokens are AES-GCM encrypted with a key derived from <code>SESSION_SECRET</code>; rotating <code>SESSION_SECRET</code> requires users to reconnect Drive and invalidates sessions.</p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                <span className="font-bold text-[#172B4D] block">Data deletion</span>
                <p>Students can delete their platform account from the dashboard (notes, submissions, certificates, enrollments, links, Drive tokens are removed; audit trail retains a non-sensitive deletion record). Drive files remain the student's property in their own Drive.</p>
              </div>
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 space-y-2 text-red-950">
                <span className="font-bold text-red-900 block">Incident handling</span>
                <p>If <code>SESSION_SECRET</code> or <code>GOOGLE_CLIENT_SECRET</code> is suspected compromised: rotate immediately (sessions invalidate), revoke the OAuth client's existing grants in Google Cloud Console, and force users to reconnect Drive. Audit logs provide the event trail. No tokens are recoverable from DB without the current secret.</p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 text-emerald-950">
                <span className="font-bold text-emerald-900 block">Honest status</span>
                <p>Implemented &amp; testable: auth (Google + password), sessions, RBAC, DB persistence, per-student Drive OAuth with real file creation, uploads with validation, disconnect/revoke, token refresh, audit logging, rate limits, admin metadata-only views. Google-dependent paths additionally require real Google credentials to be configured on the server; the isolation architecture is enforced in code and covered by automated checks (see <code>scripts/security-tests.mjs</code>).</p>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
