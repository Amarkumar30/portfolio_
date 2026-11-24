/**
 * /api/future/progress — the Progress tab's numbers, computed here from tasks, events and notes.
 * Admin session only.
 */
import type { NextRequest } from "next/server";
import { guardFutureRequest, json, storageFailed, storesOrError } from "@/features/future/guard";
import { computeProgress } from "@/features/future/progress";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const denied = await guardFutureRequest(request);
  if (denied) return denied;

  const { stores, error } = storesOrError();
  if (error) return error;

  try {
    const [tasks, events, notes] = await Promise.all([stores.tasks.list(), stores.events.list(), stores.notes.list()]);
    return json({ progress: computeProgress({ tasks, events, notes, now: Date.now() }) });
  } catch (caught) {
    return storageFailed(caught);
  }
}
