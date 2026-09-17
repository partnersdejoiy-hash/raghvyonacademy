# RAGHVYON ACADEMY — Environment Variables (placeholders only)

Never commit real secrets. Configure them in your hosting provider's dashboard
(Freebuff preview: Settings → Environment; any Node host: service env vars).

## Core

```
NODE_ENV=production          # production | development
PORT=3000                    # injected by most hosts
SESSION_SECRET=              # openssl rand -hex 32 — rotating it invalidates sessions
DATABASE_PATH=               # default ./data/raghvyon.db — persistent disk recommended in production
                             # (on free hosts without a disk the DB resets on redeploy — see DEPLOYMENT.md)
```

## Google OAuth

```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=         # optional override; defaults derived from APP_URL
```

## Admin bootstrap (production)

```
ADMIN_EMAIL=your-gmail@gmail.com   # sign in with Google using this email → admin dashboard
```

Only this designated email is elevated to admin; every other Google sign-in
becomes a student account.

## Split deployment (static frontend + API on another origin) — OPTIONAL

```
APP_URL=https://raghvyon.co.in          # public URL of the API host (used to build OAuth callback URIs)
FRONTEND_URL=https://raghvyon.co.in     # public URL of the SPA host (OAuth callbacks redirect here)
```

- `FRONTEND_URL` unset  → callbacks redirect to relative paths (single-host mode).
- `FRONTEND_URL` set    → session cookies automatically switch to `SameSite=None; Secure`.
- Frontend build needs: `VITE_API_URL=https://<api-host>` (Vite env var, set at build time).

Not needed for the recommended single-service setup — see DEPLOYMENT.md.

## AI

```
GEMINI_API_KEY=
```

## CORS

Allowed origins are hard-coded for `raghvyonacademy.com` and `raghvyon.co.in`
plus the value of `APP_URL`. Add new frontend origins in `server.ts`
(`buildCorsOrigin`).
