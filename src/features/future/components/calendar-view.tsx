"use client";

/**
 * Calendar: a month grid (Monday first) with up to three dots a day — coloured by event type for
 * events, neutral for tasks — and "+2" for more. Tap a day for its events and tasks, below the grid
 * on phones and beside it on wide screens. Plain CSS grid; Escape closes the day.
 */
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { addMonths, dayOfMonth, longDate, monthGrid, monthLabel } from "../dates";
import type { FutureEvent } from "../schema";
import { tasksOn } from "../tasks";
import { EventChip, eventsOn } from "./event-chip";
import { AddTask, TaskList } from "./task-list";
import { TYPE_META } from "./type-meta";
import type { PlannerApi } from "./use-planner";

const MAX_DOTS = 3;
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function CalendarView({ planner, events }: { planner: PlannerApi; events: FutureEvent[] }) {
  const thisMonth = planner.today.slice(0, 7);
  const [month, setMonth] = useState(thisMonth);
  const [selected, setSelected] = useState<string | null>(null);
  const { loadTasks, version } = planner;
  const days = monthGrid(month);
  const first = days[0];
  const last = days[days.length - 1];

  useEffect(() => {
    void loadTasks(first, last);
  }, [loadTasks, first, last, version]);

  useEffect(() => {
    if (!selected) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !document.querySelector("dialog[open]")) setSelected(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  function goTo(next: string) {
    setMonth(next);
    setSelected(null);
  }

  const dayTasks = selected ? tasksOn(planner.tasks, selected) : [];
  const dayEvents = selected ? eventsOn(events, selected) : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-h2 font-semibold" aria-live="polite">
          {monthLabel(month)}
        </h2>
        <div className="flex items-center gap-1">
          <button type="button" className="btn btn-ghost btn-icon" aria-label="Previous month" onClick={() => goTo(addMonths(month, -1))}>
            <ChevronLeft aria-hidden="true" />
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              goTo(thisMonth);
              setSelected(planner.today);
            }}
          >
            Today
          </button>
          <button type="button" className="btn btn-ghost btn-icon" aria-label="Next month" onClick={() => goTo(addMonths(month, 1))}>
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className={cn("grid gap-6", selected && "lg:grid-cols-[minmax(0,1fr)_20rem]")}>
        <div>
          <div aria-hidden="true" className="grid grid-cols-7 gap-1 pb-1 text-center">
            {WEEKDAYS.map((name) => (
              <span key={name} className="meta">
                {name}
              </span>
            ))}
          </div>
          <ul className="grid grid-cols-7 gap-1">
            {days.map((date) => {
              const inMonth = date.slice(0, 7) === month;
              const onDay = eventsOn(events, date);
              const tasks = planner.tasks.filter((task) => task.date === date);
              const dots = [
                ...onDay.map((event) => ({ key: event.id, className: TYPE_META[event.type].dot })),
                ...tasks.map((task) => ({ key: task.id, className: "bg-subtle" })),
              ];
              const extra = dots.length - MAX_DOTS;
              const isToday = date === planner.today;
              const summary = [
                onDay.length ? `${onDay.length} event${onDay.length === 1 ? "" : "s"}` : "",
                tasks.length ? `${tasks.length} task${tasks.length === 1 ? "" : "s"}` : "",
              ]
                .filter(Boolean)
                .join(", ");

              return (
                <li key={date}>
                  <button
                    type="button"
                    aria-pressed={selected === date}
                    aria-label={`${longDate(date)}${summary ? `: ${summary}` : ""}`}
                    onClick={() => setSelected(selected === date ? null : date)}
                    className={cn(
                      "flex aspect-square min-h-11 w-full flex-col items-center justify-start gap-1 rounded-control border border-transparent pt-1.5 text-small transition-colors hover:bg-surface-muted",
                      !inMonth && "text-subtle opacity-60",
                      inMonth && date < planner.today && "text-muted",
                      isToday && "border-foreground font-semibold",
                      selected === date && "border-accent bg-accent-soft",
                    )}
                  >
                    <time dateTime={date} className="tabular leading-none">
                      {dayOfMonth(date)}
                    </time>
                    <span aria-hidden="true" className="flex items-center gap-0.5">
                      {dots.slice(0, MAX_DOTS).map((dot) => (
                        <span key={dot.key} className={cn("h-1.5 w-1.5 rounded-full", dot.className)} />
                      ))}
                      {extra > 0 ? <span className="text-[0.625rem] leading-none text-subtle">+{extra}</span> : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="meta mt-3">
            <span aria-hidden="true">●</span> coloured dots are events, grey ones are tasks.
          </p>
        </div>

        {selected ? (
          <section aria-labelledby="calendar-day-title" className="card p-4 sm:p-5">
            <div className="flex items-start justify-between gap-2">
              <h3 id="calendar-day-title" className="font-semibold">
                <time dateTime={selected}>{longDate(selected)}</time>
              </h3>
              <button type="button" className="btn btn-ghost btn-icon -mr-2 -mt-2" aria-label="Close day" onClick={() => setSelected(null)}>
                <X aria-hidden="true" />
              </button>
            </div>

            {dayEvents.length > 0 ? (
              <ul className="mt-3 space-y-1">
                {dayEvents.map((event) => (
                  <li key={event.id}>
                    <EventChip event={event} />
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="mt-2">
              <TaskList
                tasks={dayTasks}
                collapseDone={false}
                actions={{
                  today: planner.today,
                  onPatch: planner.updateTask,
                  onDelete: planner.deleteTask,
                  onMoveToToday: (task) => void planner.moveToToday([task]),
                }}
                onReorder={(ordered) => void planner.reorderTasks(ordered)}
                empty={dayEvents.length === 0 ? "Nothing on this day yet." : undefined}
              />
            </div>
            <div className="mt-3">
              <AddTask
                key={selected}
                label="Add a task for this day"
                onAdd={(title, category) => void planner.addTask({ title, category, date: selected, priority: "normal" })}
              />
            </div>
          </section>
        ) : (
          <p className="text-small text-muted">Tap a day to see its events and tasks, or to plan something for it.</p>
        )}
      </div>
    </div>
  );
}

