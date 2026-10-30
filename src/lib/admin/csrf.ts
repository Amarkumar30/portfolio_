/**
 * Same-origin check for state-changing admin requests. Browsers always send Origin on
 * cross-site POST/PUT/PATCH/DELETE, so requiring it to match our host blocks CSRF.
 */
export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");

  if (!origin || !host) {
    return false;
  }

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
