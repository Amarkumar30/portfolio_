"use client";

/**
 * Today: today's events (read-only), the to-do list, anything unfinished from earlier (moved only
 * when asked), and one optional line about the day.
 */
import { CalendarCheck, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { addDays, monthDay, shortDay, startOfWeek } from "../dates";
import { NOTE_MAX } from "../planner-schema";
import type { FutureEvent } from "../schema";
import { countDone, tasksOn, unfinishedBefore } from "../tasks";
import { EventChip, eventsOn } from "./event-chip";
import { AddTask, CategoryTag, ProgressBar, TaskList } from "./task-list";
import type { PlannerApi } from "./use-planner";

export const ADD_TASK_ID = "future-add-task";

function DayNote({ planner }: { planner: PlannerApi }) {
  const saved = planner.notes[planner.today]?.text ?? "";
  const [text, setText] = useState(saved);

  return (
    <div className="mt-10 border-t pt-6">
      <label htmlFor="future-day-note" className="eyebrow">
        One line about today
      </label>
      <input
        id="future-day-note"
        className="field mt-2"
        placeholder="One line about today…"
        maxLength={NOTE_MAX}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onBlur={() => void planner.saveNote(planner.today, text)}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
      />
      <p className="meta mt-1">
        {text.length} / {NOTE_MAX} · saved when you leave the field
      </p>
    </div>
  );
}

export function TodayView({ planner, events }: { planner: PlannerApi; events: FutureEvent[] }) {
  const { today, loadTasks, loadUnfinished, loadNotes, version } = planner;
  const monday = startOfWeek(today);

  useEffect(() => {
    void loadTasks(monday, addDays(monday, 6));
    void loadUnfinished();
    void loadNotes(monday, addDays(monday, 6));
  }, [loadTasks, loadUnfinished, loadNotes, monday, version]);

  const tasks = tasksOn(planner.tasks, today);
  const progress = countDone(tasks);
  const earlier = unfinishedBefore(planner.tasks, today);
  const todaysEvents = eventsOn(events, today);
  const actions = {
    today,
    onPatch: planner.updateTask,
    onDelete: planner.deleteTask,
    onMoveToToday: (task: (typeof tasks)[number]) => void planner.moveToToday([task]),
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div className="space-y-3">
        <h2 className="text-h2 font-semibold">
          Today, <time dateTime={today}>{shortDay(today)}</time>
        </h2>
        {progress.total > 0 ? <ProgressBar done={progress.done} total={progress.total} label="Today's tasks" /> : null}
      </div>

      {todaysEvents.length > 0 ? (
        <section aria-labelledby="today-events">
          <h3 id="today-events" className="eyebrow mb-2">
            Events today
          </h3>
          <ul className="space-y-1">
            {todaysEvents.map((event) => (
              <li key={event.id}>
                <EventChip event={event} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="today-tasks" className="space-y-3">
        <h3 id="today-tasks" className="sr-only">
          Tasks
        </h3>
        <AddTask id={ADD_TASK_ID} withCategories onAdd={(title, category) => void planner.addTask({ title, category, date: today, priority: "normal" })} />
        <TaskList
          tasks={tasks}
          actions={actions}
          onReorder={(ordered) => void planner.reorderTasks(ordered)}
          empty="Nothing planned for today yet. Add one small thing you can finish."
        />
      </section>

      {earlier.length > 0 ? (
        <section aria-labelledby="earlier-title" className="card p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 id="earlier-title" className="font-medium">
              {earlier.length} unfinished from earlier
            </h3>
            <button type="button" className="btn btn-secondary" onClick={() => void planner.moveToToday(earlier)}>
              <CalendarCheck aria-hidden="true" />
              Move all to today
            </button>
          </div>
          <ul className="mt-2 divide-y">
            {earlier.map((task) => (
              <li key={task.id} className="flex items-center gap-2 py-1">
                <div className="min-w-0 flex-1 py-1.5">
                  <p className="break-words text-small text-foreground">{task.title}</p>
                  <p className="meta flex flex-wrap gap-x-2">
                    <time dateTime={task.date}>{monthDay(task.date)}</time>
                    <CategoryTag category={task.category} />
                  </p>
                </div>
                <button type="button" className="btn btn-ghost shrink-0" onClick={() => void planner.moveToToday([task])}>
                  Move to today
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-icon shrink-0 text-danger"
                  aria-label={`Delete ${task.title}`}
                  onClick={() => void planner.deleteTask(task)}
                >
                  <Trash2 aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Remounted when data reloads, so it shows the saved line. */}
      <DayNote key={`${today}-${version}-${planner.notes[today]?.updatedAt ?? "none"}`} planner={planner} />
    </div>
  );
}
