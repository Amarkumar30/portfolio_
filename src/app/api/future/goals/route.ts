/**
 * /api/future/goals — a week's goals (GET ?week=<Monday>) and create (POST). Admin session only.
 */
import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { LIMITS } from "@/features/future/config";
import { guardFutureRequest, json, readJson, storageFailed, storesOrError, validate } from "@/features/future/guard";
import { goalInputSchema, mondayField } from "@/features/future/planner-schema";
import { createGoal, sortGoals } from "@/features/future/tasks";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const denied = await guardFutureRequest(request);
  if (denied) return denied;

  const { stores, error } = storesOrError();
  if (error) return error;

  const week = mondayField.safeParse(new URL(request.url).searchParams.get("week"));
  if (!week.success) return json({ error: "Give week as a Monday, YYYY-MM-DD." }, 400);

  try {
    const goals = (await stores.goals.list()).filter((goal) => goal.weekStart === week.data);
    return json({ goals: sortGoals(goals) });
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
  const input = validate(goalInputSchema, body.data);
  if ("error" in input) return input.error;

  try {
    const sameWeek = (await stores.goals.list()).filter((goal) => goal.weekStart === input.data.weekStart);
    const goal = createGoal(input.data.weekStart, input.data.title, sameWeek, randomUUID(), new Date());
    await stores.goals.putMany([goal]);
    return json({ goal }, 201);
  } catch (caught) {
    return storageFailed(caught);
  }
}
