/**
 * Pure rules for tasks and goals: order, new rows, edits, moving and reordering.
 * Shared by the API (the source of truth) and the views (for optimistic updates).
 */
import type { Goal, GoalPatch, Task, TaskInput, TaskPatch } from "./planner-schema";

/** Open tasks in their order, then done ones, most recently ticked first. */
export function sortTasks(tasks: Task[]) {
  const open = tasks.filter((task) => !task.done).sort((a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt));
  const done = tasks.filter((task) => task.done).sort((a, b) => (b.doneAt ?? "").localeCompare(a.doneAt ?? ""));
  return [...open, ...done];
}

export function tasksOn(tasks: Task[], date: string) {
  return sortTasks(tasks.filter((task) => task.date === date));
}

export function inRange(date: string, from: string, to: string) {
  return date >= from && date <= to;
}

export function countDone<T extends { done: boolean }>(items: T[]) {
  return { done: items.filter((item) => item.done).length, total: items.length };
}

/** Open tasks planned for a day before `today`, oldest first. */
export function unfinishedBefore(tasks: Task[], today: string) {
  return tasks
    .filter((task) => !task.done && task.date < today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.order - b.order);
}

/** One past the highest order already used on that day, so a new task goes to the end. */
export function nextOrder(tasks: { order: number }[]) {
  return tasks.reduce((highest, task) => Math.max(highest, task.order + 1), 0);
}

export function createTask(input: TaskInput, sameDay: Task[], id: string, now: Date): Task {
  const stamp = now.toISOString();
  return { ...input, id, done: false, doneAt: null, order: nextOrder(sameDay), createdAt: stamp, updatedAt: stamp };
}

/** Ticking stamps doneAt; unticking clears it. Moving to another day puts it at the end there. */
export function patchTask(task: Task, patch: TaskPatch, now: Date, targetDay: Task[] = []): Task {
  const stamp = now.toISOString();
  const next: Task = { ...task, ...patch, updatedAt: stamp };

  if (patch.done !== undefined && patch.done !== task.done) next.doneAt = patch.done ? stamp : null;
  if (patch.date !== undefined && patch.date !== task.date) next.order = nextOrder(targetDay);

  return next;
}

/** The given ids take orders 0, 1, 2…; anything not listed keeps its order. */
export function reorderTasks(tasks: Task[], ids: string[], now: Date) {
  const byId = new Map(tasks.map((task) => [task.id, task]));
  return ids.flatMap((id, index) => {
    const task = byId.get(id);
    return task && task.order !== index ? [{ ...task, order: index, updatedAt: now.toISOString() }] : [];
  });
}

/** Moves open tasks to `date`, after what's already there, keeping their relative order. */
export function moveTasks(selected: Task[], date: string, alreadyThere: Task[], now: Date) {
  const start = nextOrder(alreadyThere);
  return selected
    .filter((task) => !task.done && task.date !== date)
    .sort((a, b) => a.date.localeCompare(b.date) || a.order - b.order)
    .map((task, index) => ({ ...task, date, order: start + index, updatedAt: now.toISOString() }));
}

export function sortGoals(goals: Goal[]) {
  return [...goals].sort((a, b) => Number(a.done) - Number(b.done) || a.order - b.order || a.createdAt.localeCompare(b.createdAt));
}

export function createGoal(weekStart: string, title: string, sameWeek: Goal[], id: string, now: Date): Goal {
  const stamp = now.toISOString();
  return { id, weekStart, title, done: false, doneAt: null, order: nextOrder(sameWeek), createdAt: stamp, updatedAt: stamp };
}

export function patchGoal(goal: Goal, patch: GoalPatch, now: Date): Goal {
  const stamp = now.toISOString();
  const next: Goal = { ...goal, ...patch, updatedAt: stamp };
  if (patch.done !== undefined && patch.done !== goal.done) next.doneAt = patch.done ? stamp : null;
  return next;
}

/** Names for ranges already fetched, shared by the page (server) and the views (client). */
export const rangeKey = {
  tasks: (from: string, to: string) => `tasks:${from}:${to}`,
  unfinished: (today: string) => `unfinished:${today}`,
  goals: (week: string) => `goals:${week}`,
  notes: (from: string, to: string) => `notes:${from}:${to}`,
};
