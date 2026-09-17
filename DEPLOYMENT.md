# RAGHVYON ACADEMY — Deployment Guide ($0 / free hosting)

The whole app is **one Node.js process**: the Express server serves the API,
the sessions, the SQLite database AND the built React frontend from `dist/`.
One deploy, one URL. There is no second service to pay for.

The DB layer uses `libsql` (SQLite-compatible, **no native compilation**), so
it installs cleanly on any Node host.

---

## Option 1 — Render free tier (fastest way to get live, $0)

### Setup (New → Web Service → connect repo)

- **Runtime**: Node
- **Build Command**: `npm install --include=dev && npm run build`
- **Start Command**: `node dist/server.cjs`
- **Instance type**: Free

### Environment variables (Dashboard → Environment)

```
NODE_ENV=production
SESSION_SECRET=<openssl rand -hex 32 — generate a NEW one>
GOOGLE_CLIENT_ID=<your OAuth client id>
GOOGLE_CLIENT_SECRET=<rotate in Google Console first — old one was shared in chat>
ADMIN_EMAIL=<your gmail — signing in with it makes you admin>
# optional, enables the AI assistant:
# GEMINI_API_KEY=...
```

`PORT` is injected by the host; the SQLite file defaults to `data/` inside
the service — no extra config needed.

### ⚠️ What "free" actually means here (read this)

| Limitation | Effect | Mitigation |
|---|---|---|
| **Ephemeral disk** | SQLite data is wiped on every deploy/restart | See "Data resilience on free hosts" below |
| **Spins down after ~15 min idle** | First visitor waits ~30–60 s | Acceptable for a new academy site; Google OAuth still works |
| **750 instance-hours/mo** | Enough for one service 24/7 | — |

### Data resilience on free hosts (already built in)

When the database resets, the app **self-heals on boot**:

- Course catalog + teacher profile are re-seeded automatically.
- Your admin access is restored by signing in with Google using the
  `ADMIN_EMAIL` email (role is re-granted, audit-logged).
- Students' accounts are recreated on their next Google Sign-In.
- Student files were ALWAYS in **each student's own Google Drive** (not on
  the server), so real learning data survives host resets by design.
- What is genuinely lost on a reset: local notes/submissions history and
  students' Drive-folder mappings (students re-click "Connect Google Drive";
  their existing `RAGHVYON Academy` folder in their Drive is untouched).

When real student data starts mattering (real users, real submissions),
move the disk: mount Render's Persistent Disk at `/data` (paid) or move to
Option 2 (free forever, more setup).

### Custom domain (free on Render, including free tier)

1. Render → Settings → Custom Domains → add `raghvyon.co.in`
   (+ optionally `www.raghvyon.co.in`).
2. At your registrar **DELETE the old Vercel records** (A records pointing
   to `76.76.21.21` etc.) — they cause `ERR_SSL_UNRECOGNIZED_NAME_ALERT`.
3. Add the CNAME Render shows (→ `<service>.onrender.com`). TLS cert is
   automatic and free.

### Google Cloud Console (OAuth client)

Add to **Authorized redirect URIs** (exact, one per line):

```
https://raghvyon.co.in/api/auth/google/callback
https://raghvyon.co.in/api/drive/oauth2callback
https://<service-name>.onrender.com/api/auth/google/callback
https://<service-name>.onrender.com/api/drive/oauth2callback
```

### Verify

```bash
curl https://<service>.onrender.com/api/health   # JSON, not HTML
open https://<service>.onrender.com/             # full site + login works
```

---

## Option 2 — Oracle Cloud Always Free VM (free FOREVER, no sleep, persistent)

The only host with a genuinely free, always-on, persistent VM tier:

- Always Free: 2× AMD micro VMs (or up to 4 ARM OCPU / 24 GB RAM), 200 GB
  block storage — $0 forever, no spin-down.
- Requires a credit card at signup (identity check) but is not charged.

Sketch (full tutorial is beyond this doc):

1. Create an Always Free VM (Ubuntu), open ports 80/443 in the security list.
2. Install Node 20+, clone the repo, `npm install --include=dev && npm run build`.
3. Run with `systemd`: `ExecStart=/usr/bin/node dist/server.cjs`,
   `Environment=NODE_ENV=production`, plus the env vars above, and
   `DATABASE_PATH=/opt/raghvyon/data/raghvyon.db`.
4. nginx reverse-proxy 80/443 → `127.0.0.1:3000`, certbot for free TLS.
5. Point `raghvyon.co.in` A record at the VM's public IP.

Here the SQLite file is persistent — full data durability at $0.

---

## How login works in production

- **You (owner):** sign in with Google using the `ADMIN_EMAIL` address →
  you get the admin dashboard automatically (audited `ROLE_CHANGE`).
- **Students:** sign in with Google → a student account is created instantly;
  they connect their own Drive from the dashboard.
- Demo accounts / the role switcher do **not** exist in production.

## Security checklist for any host

- `SESSION_SECRET` freshly generated per environment (rotating it invalidates
  all sessions — expected).
- `GOOGLE_CLIENT_SECRET` rotated after any accidental exposure.
- `ADMIN_EMAIL` set to the owner's Gmail only.
- Never commit `.env` / `.env.local`.
