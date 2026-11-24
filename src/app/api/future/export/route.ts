/**
 * /api/future/export — every event, task, goal and note as a JSON download. Admin session only.
 * The file has the shape /api/future/import accepts (version 2).
 */
import type { NextRequest } from "next/server";
import { istDate } from "@/features/future/dates";
import { guardFutureRequest, json, storageFailed, storesOrError } from "@/features/future/guard";
import type { PlannerExport } from "@/features/future/planner-schema";
import { sortTasks } from "@/features/future/tasks";
import { compareEvents } from "@/features/future/timeline";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const denied = await guardFutureRequest(request);
  if (denied) return denied;

  const { stores, error } = storesOrError();
  if (error) return error;

  try {
    const now = new Date();
    const [events, tasks, goals, notes] = await Promise.all([
      stores.events.list(),
      stores.tasks.list(),
      stores.goals.list(),
      stores.notes.list(),
    ]);
    const file: PlannerExport = {
      version: 2,
      exportedAt: now.toISOString(),
      events: events.sort(compareEvents),
      tasks: sortTasks(tasks).sort((a, b) => a.date.localeCompare(b.date)),
      goals: goals.sort((a, b) => a.weekStart.localeCompare(b.weekStart) || a.order - b.order),
      notes: notes.sort((a, b) => a.date.localeCompare(b.date)),
    };

    return json(file, 200, {
      "Content-Disposition": `attachment; filename="future-events-${istDate(now.getTime())}.json"`,
    });
  } catch (caught) {
    return storageFailed(caught);
  }
}
