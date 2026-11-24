/**
 * /api/future/tasks/move-to-today — POST { ids } moves those open tasks to today (IST), after the
 * tasks already there. Admin session only.
 */
import type { NextRequest } from "next/server";
import { LIMITS } from "@/features/future/config";
import { istDate } from "@/features/future/dates";
import { guardFutureRequest, json, readJson, storageFailed, storesOrError, validate } from "@/features/future/guard";
import { moveSchema } from "@/features/future/planner-schema";
import { moveTasks } from "@/features/future/tasks";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const denied = await guardFutureRequest(request);
  if (denied) return denied;

  const { stores, error } = storesOrError();
  if (error) return error;

  const body = await readJson(request, LIMITS.eventBytes * 4);
  if ("error" in body) return body.error;
  const input = validate(moveSchema, body.data);
  if ("error" in input) return input.error;

  try {
    const now = new Date();
    const today = istDate(now.getTime());
    const all = await stores.tasks.list();
    const wanted = new Set(input.data.ids);
    const moved = moveTasks(
      all.filter((task) => wanted.has(task.id)),
      today,
      all.filter((task) => task.date === today),
      now,
    );
    await stores.tasks.putMany(moved);
    return json({ tasks: moved, date: today });
  } catch (caught) {
    return storageFailed(caught);
  }
}
