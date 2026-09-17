import type { Request } from 'express';

/**
 * Simple fixed-window in-memory rate limiter (per-IP + optional bucket).
 * Suitable for a single-node deployment; swap for a Redis-backed limiter
 * when horizontally scaling.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

// Periodic cleanup so the map does not grow unbounded.
const CLEANUP_MS = 5 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}, CLEANUP_MS);
if (typeof (setInterval as any).unref === 'function') (setInterval as any).unref();

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
}

export function rateLimit(options: RateLimitOptions) {
  const { windowMs, max, message } = options;
  return (req: Request, res: any, next: any) => {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const key = `${ip}`;
    const now = Date.now();

    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt < now) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }
    bucket.count += 1;

    res.setHeader('X-RateLimit-Limit', String(max));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - bucket.count)));
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

    if (bucket.count > max) {
      res.status(429).json({
        error: message || 'Too many requests. Please slow down and try again shortly.',
      });
      return;
    }
    next();
  };
}
