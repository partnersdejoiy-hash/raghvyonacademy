# Authentication architecture

This guide describes the implementation in this repository. `DEPLOYMENT.md`
and `ENV_VARIABLES.md` cover deployment settings; the in-app documentation lives
in `src/components/DocumentationView.tsx`.

## Components

| Component | Responsibility |
| --- | --- |
| `src/components/LoginModal.tsx` | Password form and Google sign-in link; demo controls only when enabled by server configuration |
| `src/lib/api.ts` | Requests with `credentials: 'include'`; no bearer token storage |
| `src/App.tsx` | Restores `/api/auth/session` and opens the server-assigned role's portal |
| `server.ts` | Express middleware, cookie/session settings, API and frontend serving |
| `server/routes.ts` | Sign-in, logout, session, Drive callbacks and protected endpoints |
| `server/lib/auth.ts` | Google identity resolution, bcrypt comparison and authorization guards |
| `server/lib/permissions.ts` | Role-to-capability mapping |
| `server/db.ts` | Users, verified parent links, academic data and encrypted OAuth account records |
| `server/lib/googleDriveService.ts` | Separate Drive consent, token exchange/refresh, file operations and disconnect |
| `server/lib/crypto.ts` | AES-256-GCM token encryption and cryptographic OAuth state generation |
| `server/lib/audit.ts`, `rateLimit.ts` | Audit events and process-local request throttling |

## Request flow

Password: browser submits `POST /api/auth/login` → Zod validates the input →
`verifyPasswordLogin` finds the account and compares its bcrypt hash → regenerate
session ID → store `userId` in the server session → return a safe user profile.
Login requests are limited to 10 per five-minute window by the route middleware.

Google identity: `GET /api/auth/google` stores a random state, sign-in intent and
return path in the session → redirects to Google with `openid email profile` →
callback checks state and intent → server exchanges the code using the client
secret → calls Google's userinfo endpoint → requires explicitly verified email →
finds the account by Google subject or links an existing matching email; new
accounts become students → configured `ADMIN_EMAIL` can bootstrap the owner as
admin → regenerate the session, set `userId`, save and redirect to a local path.
The return path is captured before regeneration and rejects protocol-relative
paths and backslashes.

Protected requests: cookie identifies the session → `getSessionUser` loads the
current user's role from SQLite → `requireAuth`, `requireRole` or
`requirePermission` checks the endpoint → student queries use the authenticated
ID; parent queries require a verified `parent_student_links` relationship.
The UI's role checks are for navigation; backend guards enforce access.
Logout destroys the session and clears `raghvyon.sid`.

## Credentials and tokens

- Passwords: database stores bcrypt hashes (demo seeding uses cost 10), never
  plaintext passwords. Demo credentials are development/test only; don't reuse
  a development database in production.
- Browser session: signed opaque ID in `raghvyon.sid`, HttpOnly, seven-day cookie
  lifetime. Secure is enabled in production or configured HTTPS/split deployments.
  SameSite is Lax normally and None for `FRONTEND_URL` deployments. Session data
  stays server-side; sessionStorage holds an intended UI view, not credentials.
- Google identity tokens: the sign-in access token is used transiently on the
  server for userinfo; it is not persisted as a browser login token.
- Drive tokens: a separate student-initiated consent requests `drive.file` plus
  identity scopes. Offline consent provides a refresh token. Access and refresh
  tokens are AES-256-GCM encrypted before storing in `oauth_accounts`, with a
  random 12-byte IV and authentication tag. The key is SHA-256 of `SESSION_SECRET`.
  Server code decrypts only to call Google. Expired access tokens are refreshed;
  `invalid_grant` marks the connection revoked. Disconnect attempts Google
  revocation and removes stored tokens without deleting the student's files.
- Admin and parent APIs do not expose Drive tokens. Admin support sees masked
  connection metadata; parents see academic information for verified children.
- `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET` and `GEMINI_API_KEY` belong on the server.
  `VITE_*` values enter the browser bundle and must contain no secrets.

## Production limits that still need attention

1. `express-session` currently uses its default MemoryStore. Sessions disappear
   on restart and are not shared across instances; use a durable production store.
2. The same secret signs sessions and encrypts Drive tokens. Rotating it also
   makes existing encrypted tokens unreadable. Plan token migration or require
   reconnect, and introduce a separately versioned encryption key for rotation.
3. Drive's ID token payload is decoded locally, not signature/audience/issuer
   verified. Replace that parsing with `OAuth2Client.verifyIdToken` before treating
   Drive identity metadata as independently verified.
4. Split deployments use SameSite=None. CORS headers alone do not reject requests;
   add explicit CSRF protection and strict origin enforcement for state changes.
5. OAuth has state checks but no PKCE implementation. Rate limits are in memory.
   Scope, revocation and real Google callback behavior require staging verification.
6. A SQLite database on ephemeral hosting loses accounts, relationships, academic
   records and encrypted grants. Persist and back up the database for real students.

## Verification

`npm run lint`, `npm run build`, `npm run test:security` and
`npm run test:auth` check types, bundling, role/data isolation and the mocked
Google sign-in callback. Mock tests don't contact Google or validate a deployed
OAuth client's redirect URI configuration.
