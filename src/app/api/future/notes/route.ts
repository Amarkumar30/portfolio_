/**
 * /api/future/notes — the "one line about today" notes in a date range (GET ?from=&to=).
 * Admin session only.
 */
import type { NextRequest } from "next/server";
import { guardFutureRequest, json, readRange, storageFailed, storesOrError } from "@/features/future/guard";
import { inRange } from "@/features/future/tasks";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const denied = await guardFutureRequest(request);
  if (denied) return denied;

  const { stores, error } = storesOrError();
  if (error) return error;

  const range = readRange(request);
  if ("error" in range) return range.error;

  try {
    const notes = (await stores.notes.list()).filter((note) => inRange(note.date, range.from, range.to));
    return json({ notes: notes.sort((a, b) => a.date.localeCompare(b.date)) });
  } catch (caught) {
    return storageFailed(caught);
  }
}
