/**
 * Daily tasks, weekly goals and day notes. Used by the API to validate every write and by the
 * views for inline checks. Safe to import from client components.
 */
import { z } from "zod";
import { eventSchema } from "./schema";

export const CATEGORIES = ["study", "dsa", "project", "health", "personal", "other"] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  study: "Study",
  dsa: "DSA",
  project: "Project",
  health: "Health",
  personal: "Personal",
  other: "Other",
};

export const TITLE_MAX = 160;
export const NOTE_MAX = 280;

/** A real calendar day, so 2026-02-30 is rejected. */
export const dateField = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a date like 2026-11-24")
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
  }, "That date doesn't exist");

/** A Monday, since weeks start on Monday. */
export const mondayField = dateField.refine(
  (value) => new Date(`${value}T00:00:00Z`).getUTCDay() === 1,
  "Weeks start on a Monday",
);

const title = z
  .string()
  .trim()
  .min(1, "Add a title")
  .max(TITLE_MAX, `Titles can be at most ${TITLE_MAX} characters`);
const id = z.string().regex(/^[a-zA-Z0-9-]{8,64}$/);
const timestamp = z.iso.datetime();

export const taskSchema = z.object({
  id,
  title,
  date: dateField,
  category: z.enum(CATEGORIES).default("other"),
  priority: z.enum(["normal", "high"]).default("normal"),
  done: z.boolean().default(false),
  doneAt: timestamp.nullable().default(null),
  order: z.number().int().min(0).max(1_000_000).default(0),
  createdAt: timestamp,
  updatedAt: timestamp,
});

export const taskInputSchema = taskSchema.pick({ title: true, date: true, category: true, priority: true });
export const taskPatchSchema = taskSchema
  .pick({ title: true, date: true, category: true, priority: true, done: true })
  .partial()
  .refine((patch) => Object.keys(patch).length > 0, "Nothing to change");

export const goalSchema = z.object({
  id,
  weekStart: mondayField,
  title,
  done: z.boolean().default(false),
  doneAt: timestamp.nullable().default(null),
  order: z.number().int().min(0).max(1_000_000).default(0),
  createdAt: timestamp,
  updatedAt: timestamp,
});

export const goalInputSchema = goalSchema.pick({ weekStart: true, title: true });
export const goalPatchSchema = goalSchema
  .pick({ title: true, done: true })
  .partial()
  .refine((patch) => Object.keys(patch).length > 0, "Nothing to change");

export const noteSchema = z.object({
  date: dateField,
  text: z.string().trim().min(1).max(NOTE_MAX, `At most ${NOTE_MAX} characters`),
  updatedAt: timestamp,
});

export const noteInputSchema = z.object({
  text: z.string().trim().max(NOTE_MAX, `At most ${NOTE_MAX} characters`),
});

export const reorderSchema = z.object({ ids: z.array(id).min(1).max(500) });
export const moveSchema = z.object({ ids: z.array(id).min(1).max(500) });

export type Task = z.infer<typeof taskSchema>;
export type TaskInput = z.infer<typeof taskInputSchema>;
export type TaskPatch = z.infer<typeof taskPatchSchema>;
export type Goal = z.infer<typeof goalSchema>;
export type GoalPatch = z.infer<typeof goalPatchSchema>;
export type DayNote = z.infer<typeof noteSchema>;

const MAX_ROWS = 20_000;

/** Version 1 files have events only; version 2 adds tasks, goals and notes. */
export const importSchema = z.discriminatedUnion("version", [
  z.object({
    version: z.literal(1),
    exportedAt: timestamp.optional(),
    events: z.array(eventSchema).max(MAX_ROWS),
  }),
  z.object({
    version: z.literal(2),
    exportedAt: timestamp.optional(),
    events: z.array(eventSchema).max(MAX_ROWS),
    tasks: z.array(taskSchema).max(MAX_ROWS).default([]),
    goals: z.array(goalSchema).max(MAX_ROWS).default([]),
    notes: z.array(noteSchema).max(MAX_ROWS).default([]),
  }),
]);

export type PlannerExport = {
  version: 2;
  exportedAt: string;
  events: z.infer<typeof eventSchema>[];
  tasks: Task[];
  goals: Goal[];
  notes: DayNote[];
};
