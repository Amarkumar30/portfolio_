"use client";

/**
 * EventForm: add or edit an event in a native <dialog> (focus trap and Escape come from the
 * browser). A bottom sheet on phones, a side panel from the sm breakpoint.
 * Validates with the same schema as the API and shows messages next to each field.
 * Ctrl/Cmd+Enter saves.
 * Props: open, the event being edited (or null for a new one), today's IST date, onSave, onClose.
 */
import { Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { LIMITS } from "../config";
import { EVENT_TYPES, PRIORITIES, eventInputSchema, fieldErrors, type EventInput, type FutureEvent } from "../schema";
import { TYPE_META } from "./type-meta";

interface FormValues {
  title: string;
  type: EventInput["type"];
  date: string;
  time: string;
  endDate: string;
  course: string;
  location: string;
  link: string;
  notes: string;
  priority: EventInput["priority"];
  status: EventInput["status"];
  prep: { text: string; done: boolean }[];
}

function toValues(event: FutureEvent | null, today: string): FormValues {
  return {
    title: event?.title ?? "",
    type: event?.type ?? "plan",
    date: event?.date ?? today,
    time: event?.time ?? "",
    endDate: event?.endDate ?? "",
    course: event?.course ?? "",
    location: event?.location ?? "",
    link: event?.link ?? "",
    notes: event?.notes ?? "",
    priority: event?.priority ?? "normal",
    status: event?.status ?? "upcoming",
    prep: event?.prep.map((item) => ({ ...item })) ?? [],
  };
}

interface EventFormProps {
  open: boolean;
  event: FutureEvent | null;
  today: string;
  onSave: (input: EventInput) => void;
  onClose: () => void;
}

export function EventForm(props: EventFormProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (props.open && !dialog.open) dialog.showModal();
    if (!props.open && dialog.open) dialog.close();
  }, [props.open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="event-form-title"
      onCancel={(event) => {
        event.preventDefault();
        props.onClose();
      }}
      className="fixed inset-x-0 top-auto bottom-0 m-0 max-h-[92svh] w-full max-w-none overflow-y-auto overscroll-contain rounded-t-card border bg-surface p-0 text-foreground backdrop:bg-black/40 backdrop:backdrop-blur-[2px] sm:inset-y-0 sm:right-0 sm:left-auto sm:h-dvh sm:max-h-dvh sm:w-[30rem] sm:rounded-none sm:border-y-0 sm:border-r-0"
    >
      {/* Remounted per open, so every open starts from the event's current values. */}
      {props.open ? <FormBody key={props.event?.id ?? "new"} {...props} /> : null}
    </dialog>
  );
}

function FormBody({ event, today, onSave, onClose }: EventFormProps) {
  const [values, setValues] = useState(() => toValues(event, today));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  function set<K extends keyof FormValues>(name: K, value: FormValues[K]) {
    const next = { ...values, [name]: value };
    setValues(next);
    // Once a message is showing, it clears as soon as the field is fixed.
    if (Object.keys(errors).length > 0) {
      const result = eventInputSchema.safeParse(next);
      setErrors(result.success ? {} : fieldErrors(result.error));
    }
  }

  function setPrep(index: number, change: Partial<FormValues["prep"][number]>) {
    set(
      "prep",
      values.prep.map((item, position) => (position === index ? { ...item, ...change } : item)),
    );
  }

  function submit(formEvent: React.FormEvent) {
    formEvent.preventDefault();
    const result = eventInputSchema.safeParse(values);

    if (!result.success) {
      const next = fieldErrors(result.error);
      setErrors(next);
      const first = Object.keys(next)[0]?.replace(/\.(\d+)\.text$/, "-$1").replace("prep.", "prep-");
      formRef.current?.querySelector<HTMLElement>(`#future-${first}`)?.focus();
      return;
    }

    onSave(result.data);
  }

  const field = (name: keyof FormValues) => ({
    id: `future-${name}`,
    name,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `future-${name}-error` : undefined,
  });

  const message = (name: string) =>
    errors[name] ? (
      <p id={`future-${name}-error`} className="field-error">
        {errors[name]}
      </p>
    ) : null;

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={submit}
      onKeyDown={(keyEvent) => {
        if (keyEvent.key === "Enter" && (keyEvent.metaKey || keyEvent.ctrlKey)) {
          keyEvent.preventDefault();
          formRef.current?.requestSubmit();
        }
      }}
      className="flex min-h-full flex-col"
    >
      <div className="flex items-center justify-between gap-4 border-b px-5 py-3">
        <h2 id="event-form-title" className="text-h3 font-semibold">
          {event ? "Edit event" : "New event"}
        </h2>
        <button type="button" onClick={onClose} className="btn btn-ghost btn-icon" aria-label="Close">
          <X aria-hidden="true" />
        </button>
      </div>

      <div className="flex-1 space-y-5 px-5 py-5">
        <div>
          <label htmlFor="future-title" className="label">
            Title
          </label>
          <input
            {...field("title")}
            className="field"
            autoFocus
            autoComplete="off"
            maxLength={LIMITS.title}
            value={values.title}
            onChange={(change) => set("title", change.target.value)}
            placeholder="DBMS mid-sem"
          />
          {message("title")}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="future-type" className="label">
              Type
            </label>
            <select
              {...field("type")}
              className="field"
              value={values.type}
              onChange={(change) => set("type", change.target.value as FormValues["type"])}
            >
              {EVENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {TYPE_META[type].label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="future-priority" className="label">
              Priority
            </label>
            <select
              {...field("priority")}
              className="field"
              value={values.priority}
              onChange={(change) => set("priority", change.target.value as FormValues["priority"])}
            >
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority[0].toUpperCase() + priority.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="future-date" className="label">
              Date
            </label>
            <input
              {...field("date")}
              type="date"
              className="field"
              value={values.date}
              onChange={(change) => set("date", change.target.value)}
            />
            {message("date")}
          </div>
          <div>
            <label htmlFor="future-time" className="label">
              Time <span className="font-normal text-subtle">(optional)</span>
            </label>
            <input
              {...field("time")}
              type="time"
              className="field"
              value={values.time}
              onChange={(change) => set("time", change.target.value)}
            />
            {message("time")}
          </div>
        </div>

        <div>
          <label htmlFor="future-endDate" className="label">
            End date <span className="font-normal text-subtle">(for multi-day events)</span>
          </label>
          <input
            {...field("endDate")}
            type="date"
            className="field"
            min={values.date}
            value={values.endDate}
            onChange={(change) => set("endDate", change.target.value)}
          />
          {message("endDate")}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="future-course" className="label">
              Course
            </label>
            <input
              {...field("course")}
              className="field"
              maxLength={LIMITS.course}
              value={values.course}
              onChange={(change) => set("course", change.target.value)}
              placeholder="DBMS"
            />
            {message("course")}
          </div>
          <div>
            <label htmlFor="future-location" className="label">
              Location
            </label>
            <input
              {...field("location")}
              className="field"
              maxLength={LIMITS.location}
              value={values.location}
              onChange={(change) => set("location", change.target.value)}
              placeholder="Room 204"
            />
            {message("location")}
          </div>
        </div>

        <div>
          <label htmlFor="future-link" className="label">
            Link
          </label>
          <input
            {...field("link")}
            type="url"
            inputMode="url"
            className="field"
            value={values.link}
            onChange={(change) => set("link", change.target.value)}
            placeholder="https://"
          />
          {message("link")}
        </div>

        <div>
          <label htmlFor="future-notes" className="label">
            Notes
          </label>
          <textarea
            {...field("notes")}
            rows={4}
            className="field resize-y"
            maxLength={LIMITS.notes}
            value={values.notes}
            onChange={(change) => set("notes", change.target.value)}
          />
          <p className={cn("meta mt-1", values.notes.length > LIMITS.notes * 0.9 && "text-danger")}>
            {values.notes.length} / {LIMITS.notes}
          </p>
          {message("notes")}
        </div>

        <fieldset>
          <legend className="label">Prep checklist</legend>
          {values.prep.length > 0 ? (
            <ul className="space-y-2">
              {values.prep.map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-5 w-5 shrink-0 accent-[var(--accent)]"
                    checked={item.done}
                    aria-label={`Done: ${item.text || `prep item ${index + 1}`}`}
                    onChange={(change) => setPrep(index, { done: change.target.checked })}
                  />
                  <input
                    id={`future-prep-${index}`}
                    className="field"
                    aria-label={`Prep item ${index + 1}`}
                    aria-invalid={errors[`prep.${index}.text`] ? true : undefined}
                    maxLength={LIMITS.prepText}
                    value={item.text}
                    onChange={(change) => setPrep(index, { text: change.target.value })}
                    placeholder="Revise unit 3"
                  />
                  <button
                    type="button"
                    className="btn btn-ghost btn-icon shrink-0"
                    aria-label={`Remove prep item ${index + 1}`}
                    onClick={() => set("prep", values.prep.filter((_, position) => position !== index))}
                  >
                    <X aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {Object.entries(errors)
            .filter(([key]) => key.startsWith("prep"))
            .slice(0, 1)
            .map(([key, text]) => (
              <p key={key} className="field-error">
                {text}
              </p>
            ))}
          {values.prep.length < LIMITS.prepItems ? (
            <button
              type="button"
              className="btn btn-ghost -ml-3 mt-1"
              onClick={() => set("prep", [...values.prep, { text: "", done: false }])}
            >
              <Plus aria-hidden="true" />
              Add prep item
            </button>
          ) : null}
        </fieldset>
      </div>

      <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t bg-surface px-5 py-3">
        <p className="meta hidden sm:block">Ctrl/⌘ + Enter to save</p>
        <div className="flex flex-1 justify-end gap-2">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {event ? "Save" : "Add event"}
          </button>
        </div>
      </div>
    </form>
  );
}
