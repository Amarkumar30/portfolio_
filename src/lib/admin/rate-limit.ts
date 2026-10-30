/**
 * Failed-login rate limiting: 5 failures per IP per 15 minutes.
 *
 * Limitation: state lives in this server instance's memory. On Vercel, separate
 * serverless instances (and cold starts) don't share it, so the limit is per instance
 * and best-effort. Use a shared store such as Upstash Redis for a hard guarantee.
 */
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;

const failures = new Map<string, { count: number; resetAt: number }>();

function current(key: string) {
  const entry = failures.get(key);

  if (entry && entry.resetAt <= Date.now()) {
    failures.delete(key);
    return null;
  }

  return entry ?? null;
}

export function clientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/** Seconds until the caller may try again, or 0 when not limited. */
export function retryAfter(key: string) {
  const entry = current(key);
  return entry && entry.count >= MAX_FAILURES ? Math.ceil((entry.resetAt - Date.now()) / 1000) : 0;
}

export function recordFailure(key: string) {
  const entry = current(key);

  if (entry) {
    entry.count += 1;
  } else {
    failures.set(key, { count: 1, resetAt: Date.now() + WINDOW_MS });
  }
}

export function clearFailures(key: string) {
  failures.delete(key);
}
