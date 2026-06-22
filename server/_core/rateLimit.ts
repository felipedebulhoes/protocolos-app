// ---------------------------------------------------------------------------
// Minimal in-memory rate limiter.
//
// Good enough for this app's scale (single doctor, a few dozen patients,
// one server process). It is NOT distributed — if you ever run multiple
// instances behind a load balancer, replace this with a shared store
// (Redis, the DB, etc.) keyed the same way.
// ---------------------------------------------------------------------------

import type { IncomingMessage } from "http";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Periodic cleanup so the map doesn't grow unbounded across a long-running process.
setInterval(() => {
  const now = Date.now();
  buckets.forEach((bucket, key) => {
    if (bucket.resetAt <= now) buckets.delete(key);
  });
}, 10 * 60 * 1000).unref?.();

/**
 * Returns true if the action identified by `key` is still allowed under the
 * given limit, and records this attempt. Returns false once `max` attempts
 * have been recorded inside the current `windowMs` window.
 */
export function checkRateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= max) return false;
  bucket.count += 1;
  return true;
}

/**
 * Best-effort extraction of the caller's IP for rate-limit keying.
 *
 * NOTE: behind a reverse proxy, req.ip only reflects the real client IP if
 * Express's `trust proxy` setting matches your proxy topology (see
 * app.set("trust proxy", ...) in server/_core/index.ts). Until that's tuned
 * for your exact deployment, treat the IP-based bucket as a loose secondary
 * signal, not the primary defense — the per-email / per-token buckets carry
 * that job.
 */
export function clientIp(req: IncomingMessage & { ip?: string }): string {
  return req.ip ?? req.socket?.remoteAddress ?? "unknown";
}
