/**
 * /api/future/tasks/[id] — edit (PATCH: title, date, category, priority, done), put back a deleted
 * task exactly as it was (PUT, for undo), or delete (DELETE). Admin session only.
 */
import type { NextRequest } from "next/server";
import { LIMITS } from "@/features/future/config";
import { guardFutureRequest, json, readJson, storageFailed, storesOrError, validate } from "@/features/future/guard";
import { taskPatchSchema, taskSchema } from "@/features/future/planner-schema";
import { patchTask } from "@/features/future/tasks";

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
  const patch = validate(taskPatchSchema, body.data);
  if ("error" in patch) return patch.error;

  try {
    const { id } = await params;
    const all = await stores.tasks.list();
    const task = all.find((item) => item.id === id);
    if (!task) return json({ error: "That task no longer exists." }, 404);

    const targetDay = patch.data.date ? all.filter((item) => item.date === patch.data.date && item.id !== id) : [];
    const updated = patchTask(task, patch.data, new Date(), targetDay);
    await stores.tasks.putMany([updated]);
    return json({ task: updated });
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
  const task = validate(taskSchema, body.data);
  if ("error" in task) return task.error;
  if (task.data.id !== (await params).id) return json({ error: "The id doesn't match." }, 400);

  try {
    await stores.tasks.putMany([task.data]);
    return json({ task: task.data });
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
    const removed = await stores.tasks.remove((await params).id);
    return removed ? json({ ok: true }) : json({ error: "That task no longer exists." }, 404);
  } catch (caught) {
    return storageFailed(caught);
  }
}
