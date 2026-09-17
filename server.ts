/**
 * RAGHVYON ACADEMY — Express server entry point.
 *
 * Security middleware stack: helmet, CORS allow-list, session cookies
 * (httpOnly, SameSite), JSON body limits, rate limiting, and sanitized errors.
 * In development, Vite middleware serves the React app with HMR respected.
 */
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { randomBytes } from 'crypto';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { api } from './server/routes';
import { db, seedDatabase } from './server/db';
import { initAuditLogger, logAudit } from './server/lib/audit';

// Load environment from .env / .env.local BEFORE any module reads process.env.
dotenv.config();
dotenv.config({ path: '.env.local', override: true });

seedDatabase();
initAuditLogger(db);

const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT || 3000);
const APP_URL = process.env.APP_URL;

function buildCorsOrigin(): string[] {
  const list = [
    'https://raghvyonacademy.com',
    'https://www.raghvyonacademy.com',
    'https://raghvyon.co.in',
    'https://www.raghvyon.co.in',
    // Free-host deploy domains (*.onrender.com etc.) — single-service URLs.
    'https://*.onrender.com',
  ];
  if (APP_URL) list.push(APP_URL.replace(/\/$/, ''));
  if (!isProd) {
    list.push('http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:3000');
    // Freebuff preview proxy origins (daytona proxy hosts).
    list.push('https://*.daytonaproxy01.net');
  }
  return list;
}

function createApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  /* --- Secure headers ---------------------------------------------- */
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'default-src': ["'self'"],
          'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://apis.google.com'],
          'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
          'img-src': ["'self'", 'data:', 'blob:', 'https:'],
          'connect-src': [
            "'self'",
            'https://accounts.google.com',
            'https://oauth2.googleapis.com',
            'https://www.googleapis.com',
            'https://generativelanguage.googleapis.com',
          ],
          'frame-ancestors': ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

  /* --- CORS allow-list for API calls -------------------------------- */
  app.use('/api', (req, res, next) => {
    const origin = req.headers.origin as string | undefined;
    const allowed = buildCorsOrigin();
    const originAllowed =
      !origin ||
      allowed.includes(origin) ||
      allowed.some((a) => a.endsWith('*') && origin.endsWith(a.slice(1))) ||
      (!isProd && origin.endsWith('.daytonaproxy01.net'));
    if (originAllowed) {
      if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  /* --- Body parsing (with request size limits) ---------------------- */
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));

  /* --- Sessions: httpOnly cookie, SameSite configurable -------------- */
  const sessionSecret = process.env.SESSION_SECRET || (isProd ? undefined : 'dev-only-insecure-session-secret');
  if (!sessionSecret) {
    throw new Error('SESSION_SECRET must be set in production.');
  }
  // Split deployments (static frontend + API on another origin) require
  // SameSite=None; Secure so the browser stores the session cookie at all.
  const isSplitDeployment = !!process.env.FRONTEND_URL;
  app.use(
    session({
      name: 'raghvyon.sid',
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: isProd || !!APP_URL || isSplitDeployment,
        sameSite: isSplitDeployment ? 'none' : 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    })
  );

  /* --- API ---------------------------------------------------------- */
  app.use('/api', api);

  /* --- Frontend (dev: Vite middleware / prod: static dist) ---------- */
  if (!isProd) {
    void (async () => {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    })();
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  return app;
}

export { createApp };

/* Only auto-start when executed directly (tests import createApp). */
if (process.env.NODE_ENV !== 'test') {
  const app = createApp();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RAGHVYON ACADEMY server listening on http://0.0.0.0:${PORT} (${isProd ? 'production' : 'development'})`);
    logAudit('SYSTEM_BOOT', null, 'System', `Server started on port ${PORT}`);
  });
}
