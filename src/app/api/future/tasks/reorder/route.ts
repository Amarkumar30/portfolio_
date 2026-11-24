/**
 * /api/future/tasks/reorder — POST { ids } puts those tasks in that order. Admin session only.
 */
import type { NextRequest } from "next/server";
import { LIMITS } from "@/features/future/config";
import { guardFutureRequest, json, readJson, storageFailed, storesOrError, validate } from "@/features/future/guard";
import { reorderSchema } from "@/features/future/planner-schema";
import { reorderTasks } from "@/features/future/tasks";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const denied = await guardFutureRequest(request);
  if (denied) return denied;

  const { stores, error } = storesOrError();
  if (error) return error;

  const body = await readJson(request, LIMITS.eventBytes * 4);
  if ("error" in body) return body.error;
  const input = validate(reorderSchema, body.data);
  if ("error" in input) return input.error;

  try {
    const changed = reorderTasks(await stores.tasks.list(), input.data.ids, new Date());
    await stores.tasks.putMany(changed);
    return json({ tasks: changed });
  } catch (caught) {
    return storageFailed(caught);
  }
}
