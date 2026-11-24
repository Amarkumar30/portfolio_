/**
 * Calls the /api/future routes from the browser, turning failures into readable messages.
 */
export async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { ...init, headers: { "Content-Type": "application/json" } });
  } catch {
    throw new Error("You're offline, or the site can't be reached.");
  }

  const body = (await response.json().catch(() => null)) as { error?: string } | null;
  if (response.ok && body) return body as T;
  // Without a session the API is a plain 404 page, not JSON.
  if (response.status === 404 && !body) throw new Error("Your session has expired. Log in again.");
  throw new Error(body?.error ?? `Something went wrong (${response.status}).`);
}

export const send = (method: string, body?: unknown): RequestInit => ({
  method,
  body: body === undefined ? undefined : JSON.stringify(body),
});
