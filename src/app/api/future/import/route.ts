/**
 * /api/future/import — loads an export file: version 1 (events only) or version 2 (events, tasks,
 * goals, notes). Rows are added, and ones with the same id (or date, for notes) are replaced;
 * nothing else is deleted. The whole file is validated before anything is written.
 * Admin session only.
 */
import type { NextRequest } from "next/server";
import { LIMITS } from "@/features/future/config";
import { guardFutureRequest, json, readJson, storageFailed, storesOrError } from "@/features/future/guard";
import { importSchema } from "@/features/future/planner-schema";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const denied = await guardFutureRequest(request);
  if (denied) return denied;

  const { stores, error } = storesOrError();
  if (error) return error;

  const body = await readJson(request, LIMITS.importBytes);
  if ("error" in body) return body.error;

  const parsed = importSchema.safeParse(body.data);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return json({ error: `That isn't a valid export file (${issue.path.join(".") || "file"}: ${issue.message}).` }, 400);
  }

  const file = parsed.data;
  const tasks = file.version === 2 ? file.tasks : [];
  const goals = file.version === 2 ? file.goals : [];
  const notes = file.version === 2 ? file.notes : [];

  try {
    await Promise.all([
      stores.events.putMany(file.events),
      stores.tasks.putMany(tasks),
      stores.goals.putMany(goals),
      stores.notes.putMany(notes),
    ]);

    // Same shape as version 1: one count, now of every row imported.
    return json({ imported: file.events.length + tasks.length + goals.length + notes.length });
  } catch (caught) {
    return storageFailed(caught);
  }
}
