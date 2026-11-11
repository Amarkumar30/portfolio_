/**
 * The event model. Used by the API to validate every write and by the form for inline messages,
 * so both always agree. Safe to import from client components.
 */
import { z } from "zod";
import { LIMITS } from "./config";

export const EVENT_TYPES = [
  "exam",
  "quiz",
  "assignment",
  "interview",
  "hackathon",
  "deadline",
  "class",
  "plan",
  "personal",
] as const;

export const PRIORITIES = ["high", "normal", "low"] as const;
export const STATUSES = ["upcoming", "done", "skipped"] as const;

export type EventType = (typeof EVENT_TYPES)[number];
export type Priority = (typeof PRIORITIES)[number];
export type Status = (typeof STATUSES)[number];

/** A real calendar day, so 2026-02-30 is rejected. */
const dateField = z
  .string({ error: "Pick a date" })
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a date like 2026-11-14")
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
  }, "That date doesn't exist");

const timeField = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use a time like 09:30");

/** Empty form fields count as "not set". */
function optional<T extends z.ZodType>(schema: T) {
  return z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    schema.optional(),
  );
}

function text(max: number, label: string) {
  return z.string().trim().max(max, `${label} can be at most ${max} characters`);
}

const linkField = text(LIMITS.link, "The link").refine(
  (value) => URL.canParse(value) && /^https?:\/\//i.test(value),
  "Use a full https:// link",
);

const prepItem = z.object({
  text: text(LIMITS.prepText, "A prep item").min(1, "Prep items can't be empty"),
  done: z.boolean().default(false),
});

const fields = {
  title: text(LIMITS.title, "The title").min(1, "Add a title"),
  type: z.enum(EVENT_TYPES).default("plan"),
  date: dateField,
  time: optional(timeField),
  endDate: optional(dateField),
  course: optional(text(LIMITS.course, "The course")),
  location: optional(text(LIMITS.location, "The location")),
  link: optional(linkField),
  notes: optional(text(LIMITS.notes, "Notes")),
  priority: z.enum(PRIORITIES).default("normal"),
  status: z.enum(STATUSES).default("upcoming"),
  prep: z.array(prepItem).max(LIMITS.prepItems, `At most ${LIMITS.prepItems} prep items`).default([]),
};

function endsAfterStart(event: { date: string; endDate?: string }, context: z.RefinementCtx) {
  if (event.endDate && event.endDate < event.date) {
    context.addIssue({ code: "custom", path: ["endDate"], message: "The end date is before the start" });
  }
}

/** What the form sends when creating or editing. */
export const eventInputSchema = z.object(fields).superRefine(endsAfterStart);

/** A stored event, also the shape of an export. */
export const eventSchema = z
  .object({
    ...fields,
    id: z.string().regex(/^[a-zA-Z0-9-]{8,64}$/),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .superRefine(endsAfterStart);

export const exportSchema = z.object({
  version: z.literal(1),
  exportedAt: z.iso.datetime().optional(),
  events: z.array(eventSchema).max(LIMITS.importEvents),
});

export type EventInput = z.infer<typeof eventInputSchema>;
export type FutureEvent = z.infer<typeof eventSchema>;
export type FutureExport = z.infer<typeof exportSchema>;

/** The editable part of an event. */
export function toInput(event: FutureEvent): EventInput {
  const { id, createdAt, updatedAt, ...input } = event;
  void id;
  void createdAt;
  void updatedAt;
  return input;
}

/** Field → first message, for inline errors. */
export function fieldErrors(error: z.ZodError) {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".") || "form";
    errors[key] ??= issue.message;
  }
  return errors;
}
