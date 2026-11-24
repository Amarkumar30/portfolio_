/**
 * /api/future/tasks — tasks in a date range (GET ?from=&to=), or open tasks planned before a day
 * (GET ?before=), and create (POST). Admin session only.
 */
import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { LIMITS } from "@/features/future/config";
import { guardFutureRequest, json, readJson, readRange, storageFailed, storesOrError, validate } from "@/features/future/guard";
import { dateField, taskInputSchema } from "@/features/future/planner-schema";
import { createTask, inRange, sortTasks, unfinishedBefore } from "@/features/future/tasks";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const denied = await guardFutureRequest(request);
  if (denied) return denied;

  const { stores, error } = storesOrError();
  if (error) return error;

  const before = new URL(request.url).searchParams.get("before");
  if (before !== null && !dateField.safeParse(before).success) return json({ error: "Give before as YYYY-MM-DD." }, 400);

  const range = before === null ? readRange(request) : null;
  if (range && "error" in range) return range.error;

  try {
    const tasks = await stores.tasks.list();
    if (before !== null) return json({ tasks: unfinishedBefore(tasks, before) });
    return json({ tasks: sortTasks(tasks.filter((task) => inRange(task.date, range!.from, range!.to))) });
  } catch (caught) {
    return storageFailed(caught);
  }
}

export async function POST(request: NextRequest) {
  const denied = await guardFutureRequest(request);
  if (denied) return denied;

  const { stores, error } = storesOrError();
  if (error) return error;

  const body = await readJson(request, LIMITS.eventBytes);
  if ("error" in body) return body.error;
  const input = validate(taskInputSchema, body.data);
  if ("error" in input) return input.error;

  try {
    const sameDay = (await stores.tasks.list()).filter((task) => task.date === input.data.date);
    const task = createTask(input.data, sameDay, randomUUID(), new Date());
    await stores.tasks.putMany([task]);
    return json({ task }, 201);
  } catch (caught) {
    return storageFailed(caught);
  }
}
