/**
 * /api/future/goals/[id] — edit (PATCH: title, done), put back after a delete (PUT, for undo), or
 * delete (DELETE). Admin session only.
 */
import type { NextRequest } from "next/server";
import { LIMITS } from "@/features/future/config";
import { guardFutureRequest, json, readJson, storageFailed, storesOrError, validate } from "@/features/future/guard";
import { goalPatchSchema, goalSchema } from "@/features/future/planner-schema";
import { patchGoal } from "@/features/future/tasks";

export const dynamic = "force-dynamic";

interface Context {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: Context) {
  const denied = await guardFutureRequest(request);
  if (denied) return denied;

  const { stores, error } = storesOrError();
  if (error) return error;

  const body = await readJson(request, LIMITS.eventBytes);
  if ("error" in body) return body.error;
  const patch = validate(goalPatchSchema, body.data);
  if ("error" in patch) return patch.error;

  try {
    const goal = await stores.goals.get((await params).id);
    if (!goal) return json({ error: "That goal no longer exists." }, 404);

    const updated = patchGoal(goal, patch.data, new Date());
    await stores.goals.putMany([updated]);
    return json({ goal: updated });
  } catch (caught) {
    return storageFailed(caught);
  }
}

export async function PUT(request: NextRequest, { params }: Context) {
  const denied = await guardFutureRequest(request);
  if (denied) return denied;

  const { stores, error } = storesOrError();
  if (error) return error;

  const body = await readJson(request, LIMITS.eventBytes);
  if ("error" in body) return body.error;
  const goal = validate(goalSchema, body.data);
  if ("error" in goal) return goal.error;
  if (goal.data.id !== (await params).id) return json({ error: "The id doesn't match." }, 400);

  try {
    await stores.goals.putMany([goal.data]);
    return json({ goal: goal.data });
  } catch (caught) {
    return storageFailed(caught);
  }
}

export async function DELETE(request: NextRequest, { params }: Context) {
  const denied = await guardFutureRequest(request);
  if (denied) return denied;

  const { stores, error } = storesOrError();
  if (error) return error;

  try {
    const removed = await stores.goals.remove((await params).id);
    return removed ? json({ ok: true }) : json({ error: "That goal no longer exists." }, 404);
  } catch (caught) {
    return storageFailed(caught);
  }
}
