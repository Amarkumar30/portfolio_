"use client";

/**
 * usePlanner: the tasks, goals and notes every tab shares, with the calls that change them.
 * Each change shows at once, then the server's answer replaces it; if the server refuses, the
 * change is rolled back and an error toast explains. Deletes offer Undo instead of a confirm.
 * Ranges are fetched once per view (week, month) and merged into one cache.
 */
import { useCallback, useMemo, useRef, useState } from "react";
import { useToast } from "@/components/admin/toast";
import type { DayNote, Goal, Task, TaskInput, TaskPatch } from "../planner-schema";
import { moveTasks, nextOrder, patchGoal, patchTask, rangeKey } from "../tasks";
import { request, send } from "./api-client";

export const PENDING = "pending-";

export interface InitialPlannerData {
  tasks: Task[];
  goals: Goal[];
  notes: DayNote[];
  /** Ranges the server already loaded, so they aren't fetched again. */
  loaded: string[];
}

export interface Undo {
  id: number;
  message: string;
  restore: () => void;
}

const byId = <T extends { id: string }>(items: T[]) => Object.fromEntries(items.map((item) => [item.id, item]));
const byDate = (items: DayNote[]) => Object.fromEntries(items.map((item) => [item.date, item]));


export function usePlanner(initial: InitialPlannerData, today: string) {
  const toast = useToast();
  const [taskMap, setTasks] = useState<Record<string, Task>>(() => byId(initial.tasks));
  const [goalMap, setGoals] = useState<Record<string, Goal>>(() => byId(initial.goals));
  const [noteMap, setNotes] = useState<Record<string, DayNote>>(() => byDate(initial.notes));
  const [version, setVersion] = useState(0);
  const [undo, setUndo] = useState<Undo | null>(null);
  const loaded = useRef(new Set(initial.loaded));
  const undoId = useRef(0);

  const tasks = useMemo(() => Object.values(taskMap), [taskMap]);
  const goals = useMemo(() => Object.values(goalMap), [goalMap]);

  const fail = useCallback(
    (error: unknown) => toast({ kind: "error", message: error instanceof Error ? error.message : "Something went wrong." }),
    [toast],
  );

  const offerUndo = useCallback((message: string, restore: () => void) => {
    undoId.current += 1;
    setUndo({ id: undoId.current, message, restore });
  }, []);

  const putTask = (task: Task) => setTasks((current) => ({ ...current, [task.id]: task }));
  const dropTask = (id: string) =>
    setTasks((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  const putGoal = (goal: Goal) => setGoals((current) => ({ ...current, [goal.id]: goal }));
  const dropGoal = (id: string) =>
    setGoals((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });

  const load = useCallback(
    async <T,>(key: string, url: string, apply: (body: T) => void) => {
      if (loaded.current.has(key)) return;
      loaded.current.add(key);
      try {
        apply(await request<T>(url));
      } catch (error) {
        loaded.current.delete(key);
        fail(error);
      }
    },
    [fail],
  );

  const loadTasks = useCallback(
    (from: string, to: string) =>
      load<{ tasks: Task[] }>(rangeKey.tasks(from, to), `/api/future/tasks?from=${from}&to=${to}`, ({ tasks: list }) =>
        setTasks((current) => ({ ...current, ...byId(list) })),
      ),
    [load],
  );

  const loadUnfinished = useCallback(
    () =>
      load<{ tasks: Task[] }>(rangeKey.unfinished(today), `/api/future/tasks?before=${today}`, ({ tasks: list }) =>
        setTasks((current) => ({ ...current, ...byId(list) })),
      ),
    [load, today],
  );

  const loadGoals = useCallback(
    (week: string) =>
      load<{ goals: Goal[] }>(rangeKey.goals(week), `/api/future/goals?week=${week}`, ({ goals: list }) =>
        setGoals((current) => ({ ...current, ...byId(list) })),
      ),
    [load],
  );

  const loadNotes = useCallback(
    (from: string, to: string) =>
      load<{ notes: DayNote[] }>(rangeKey.notes(from, to), `/api/future/notes?from=${from}&to=${to}`, ({ notes: list }) =>
        setNotes((current) => ({ ...current, ...byDate(list) })),
      ),
    [load],
  );

  /** After an import: forget everything, so the open views fetch again. */
  const reset = useCallback(() => {
    loaded.current.clear();
    setTasks({});
    setGoals({});
    setNotes({});
    setVersion((value) => value + 1);
  }, []);

  async function addTask(input: TaskInput) {
    const stamp = new Date().toISOString();
    const sameDay = tasks.filter((task) => task.date === input.date);
    const draft: Task = { ...input, id: `${PENDING}${crypto.randomUUID()}`, done: false, doneAt: null, order: nextOrder(sameDay), createdAt: stamp, updatedAt: stamp };
    putTask(draft);

    try {
      const { task } = await request<{ task: Task }>("/api/future/tasks", send("POST", input));
      setTasks((current) => {
        const next = { ...current, [task.id]: task };
        delete next[draft.id];
        return next;
      });
    } catch (error) {
      dropTask(draft.id);
      fail(error);
    }
  }

  async function updateTask(task: Task, patch: TaskPatch) {
    const targetDay = patch.date ? tasks.filter((item) => item.date === patch.date && item.id !== task.id) : [];
    putTask(patchTask(task, patch, new Date(), targetDay));

    try {
      putTask((await request<{ task: Task }>(`/api/future/tasks/${task.id}`, send("PATCH", patch))).task);
    } catch (error) {
      putTask(task);
      fail(error);
    }
  }

  async function restoreTask(task: Task) {
    putTask(task);
    try {
      await request(`/api/future/tasks/${task.id}`, send("PUT", task));
    } catch (error) {
      dropTask(task.id);
      fail(error);
    }
  }

  async function deleteTask(task: Task) {
    dropTask(task.id);
    try {
      await request(`/api/future/tasks/${task.id}`, send("DELETE"));
      offerUndo(`Deleted “${task.title}”`, () => void restoreTask(task));
    } catch (error) {
      putTask(task);
      fail(error);
    }
  }

  /** `ordered` is the day's open tasks in their new order. */
  async function reorderTasks(ordered: Task[]) {
    const before = ordered.map((task) => taskMap[task.id]).filter(Boolean);
    ordered.forEach((task, index) => putTask({ ...task, order: index }));

    try {
      await request("/api/future/tasks/reorder", send("POST", { ids: ordered.map((task) => task.id) }));
    } catch (error) {
      before.forEach(putTask);
      fail(error);
    }
  }

  async function moveToToday(selected: Task[]) {
    const moved = moveTasks(selected, today, tasks.filter((task) => task.date === today), new Date());
    moved.forEach(putTask);

    try {
      const result = await request<{ tasks: Task[] }>("/api/future/tasks/move-to-today", send("POST", { ids: moved.map((task) => task.id) }));
      result.tasks.forEach(putTask);
    } catch (error) {
      selected.forEach(putTask);
      fail(error);
    }
  }

  async function addGoal(weekStart: string, title: string) {
    const stamp = new Date().toISOString();
    const sameWeek = goals.filter((goal) => goal.weekStart === weekStart);
    const draft: Goal = { id: `${PENDING}${crypto.randomUUID()}`, weekStart, title, done: false, doneAt: null, order: nextOrder(sameWeek), createdAt: stamp, updatedAt: stamp };
    putGoal(draft);

    try {
      const { goal } = await request<{ goal: Goal }>("/api/future/goals", send("POST", { weekStart, title }));
      setGoals((current) => {
        const next = { ...current, [goal.id]: goal };
        delete next[draft.id];
        return next;
      });
    } catch (error) {
      dropGoal(draft.id);
      fail(error);
    }
  }

  async function updateGoal(goal: Goal, patch: { title?: string; done?: boolean }) {
    putGoal(patchGoal(goal, patch, new Date()));
    try {
      putGoal((await request<{ goal: Goal }>(`/api/future/goals/${goal.id}`, send("PATCH", patch))).goal);
    } catch (error) {
      putGoal(goal);
      fail(error);
    }
  }

  async function restoreGoal(goal: Goal) {
    putGoal(goal);
    try {
      await request(`/api/future/goals/${goal.id}`, send("PUT", goal));
    } catch (error) {
      dropGoal(goal.id);
      fail(error);
    }
  }

  async function deleteGoal(goal: Goal) {
    dropGoal(goal.id);
    try {
      await request(`/api/future/goals/${goal.id}`, send("DELETE"));
      offerUndo(`Deleted “${goal.title}”`, () => void restoreGoal(goal));
    } catch (error) {
      putGoal(goal);
      fail(error);
    }
  }

  async function saveNote(date: string, text: string) {
    const previous = noteMap[date];
    const trimmed = text.trim();
    if ((previous?.text ?? "") === trimmed) return;

    setNotes((current) => {
      const next = { ...current };
      if (trimmed) next[date] = { date, text: trimmed, updatedAt: new Date().toISOString() };
      else delete next[date];
      return next;
    });

    try {
      await request(`/api/future/notes/${date}`, send("PUT", { text: trimmed }));
    } catch (error) {
      setNotes((current) => {
        const next = { ...current };
        if (previous) next[date] = previous;
        else delete next[date];
        return next;
      });
      fail(error);
    }
  }

  return {
    today,
    tasks,
    goals,
    notes: noteMap,
    version,
    undo,
    dismissUndo: () => setUndo(null),
    loadTasks,
    loadUnfinished,
    loadGoals,
    loadNotes,
    reset,
    addTask,
    updateTask,
    deleteTask,
    reorderTasks,
    moveToToday,
    addGoal,
    updateGoal,
    deleteGoal,
    saveNote,
    fail,
  };
}

export type PlannerApi = ReturnType<typeof usePlanner>;
