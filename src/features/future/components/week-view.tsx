"use client";

/**
 * Week: the week's goals (checklist), then a board of seven days, each with its events (read-only)
 * and tasks, and a small "+ Add". Seven columns on wide screens, stacked cards on phones.
 */
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { addDays, dayOfMonth, shortMonth, startOfWeek, weekDays, weekLabel, weekdayLabel } from "../dates";
import { TITLE_MAX, type Goal } from "../planner-schema";
import type { FutureEvent } from "../schema";
import { countDone, sortGoals, tasksOn } from "../tasks";
import { EventChip, eventsOn } from "./event-chip";
import { AddTask, ProgressBar, TaskList } from "./task-list";
import { PENDING, type PlannerApi } from "./use-planner";

function GoalRow({ goal, planner }: { goal: Goal; planner: PlannerApi }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(goal.title);
  const pending = goal.id.startsWith(PENDING);

  function save() {
    const title = draft.trim();
    setEditing(false);
    if (title && title !== goal.title) void planner.updateGoal(goal, { title });
    else setDraft(goal.title);
  }

  return (
    <li className="flex items-start gap-1">
      <label className="flex min-h-11 min-w-11 shrink-0 items-center justify-center">
        <input
          type="checkbox"
          className="h-5 w-5 accent-[var(--accent)]"
          checked={goal.done}
          disabled={pending}
          onChange={(event) => void planner.updateGoal(goal, { done: event.target.checked })}
        />
        <span className="sr-only">{goal.done ? "Mark not done" : "Mark done"}: {goal.title}</span>
      </label>
      <div className="min-w-0 flex-1 py-2.5">
        {editing ? (
          <input
            className="field min-h-9 py-1"
            aria-label="Goal"
            autoFocus
            maxLength={TITLE_MAX}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={save}
            onKeyDown={(event) => {
              if (event.key === "Enter") save();
              if (event.key === "Escape") {
                setDraft(goal.title);
                setEditing(false);
              }
            }}
          />
        ) : (
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              setDraft(goal.title);
              setEditing(true);
            }}
            className={cn("block w-full break-words text-left", goal.done ? "text-subtle line-through" : "text-foreground")}
          >
            {goal.title}
            <span className="sr-only"> (edit)</span>
          </button>
        )}
      </div>
      <button
        type="button"
        className="btn btn-ghost btn-icon shrink-0"
        aria-label={`Delete ${goal.title}`}
        disabled={pending}
        onClick={() => void planner.deleteGoal(goal)}
      >
        <Trash2 aria-hidden="true" />
      </button>
    </li>
  );
}

function DayCard({ date, planner, events }: { date: string; planner: PlannerApi; events: FutureEvent[] }) {
  const [adding, setAdding] = useState(false);
  const isToday = date === planner.today;
  const tasks = tasksOn(planner.tasks, date);
  const dayEvents = eventsOn(events, date);

  return (
    <section
      aria-label={`${weekdayLabel(date)} ${dayOfMonth(date)} ${shortMonth(date)}`}
      className={cn("card flex min-w-0 flex-col p-3", isToday && "border-accent", date < planner.today && "bg-transparent")}
    >
      <h3 className="flex items-baseline justify-between gap-2">
        <span className={cn("text-small font-semibold", isToday && "text-accent")}>{weekdayLabel(date).slice(0, 3)}</span>
        <time dateTime={date} className="meta">
          {dayOfMonth(date)} {shortMonth(date)}
        </time>
      </h3>

      {dayEvents.length > 0 ? (
        <ul className="mt-2 space-y-1">
          {dayEvents.map((event) => (
            <li key={event.id}>
              <EventChip event={event} compact />
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-1 flex-1">
        <TaskList
          tasks={tasks}
          collapseDone={false}
          actions={{
            today: planner.today,
            onPatch: planner.updateTask,
            onDelete: planner.deleteTask,
            onMoveToToday: (task) => void planner.moveToToday([task]),
          }}
          onReorder={(ordered) => void planner.reorderTasks(ordered)}
        />
      </div>

      {adding ? (
        <AddTask
          compact
          autoFocus
          label={`Add a task for ${weekdayLabel(date)}`}
          onAdd={(title, category) => void planner.addTask({ title, category, date, priority: "normal" })}
          onDone={() => setAdding(false)}
        />
      ) : (
        <button type="button" className="btn btn-ghost -ml-2 mt-1 self-start" onClick={() => setAdding(true)}>
          <Plus aria-hidden="true" />
          Add<span className="sr-only"> a task for {weekdayLabel(date)}</span>
        </button>
      )}
    </section>
  );
}

export function WeekView({ planner, events }: { planner: PlannerApi; events: FutureEvent[] }) {
  const thisMonday = startOfWeek(planner.today);
  const [monday, setMonday] = useState(thisMonday);
  const { loadTasks, loadGoals, version } = planner;
  const days = weekDays(monday);

  useEffect(() => {
    void loadTasks(monday, addDays(monday, 6));
    void loadGoals(monday);
  }, [loadTasks, loadGoals, monday, version]);

  const goals = sortGoals(planner.goals.filter((goal) => goal.weekStart === monday));
  const weekTasks = planner.tasks.filter((task) => task.date >= monday && task.date <= addDays(monday, 6));
  const tasksDone = countDone(weekTasks);
  const goalsDone = countDone(goals);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-h2 font-semibold">Week of {weekLabel(monday)}</h2>
        <div className="flex items-center gap-1">
          <button type="button" className="btn btn-ghost btn-icon" aria-label="Previous week" onClick={() => setMonday(addDays(monday, -7))}>
            <ChevronLeft aria-hidden="true" />
          </button>
          <button type="button" className="btn btn-secondary" disabled={monday === thisMonday} onClick={() => setMonday(thisMonday)}>
            This week
          </button>
          <button type="button" className="btn btn-ghost btn-icon" aria-label="Next week" onClick={() => setMonday(addDays(monday, 7))}>
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      </div>

      {tasksDone.total + goalsDone.total > 0 ? (
        <ProgressBar
          done={tasksDone.done + goalsDone.done}
          total={tasksDone.total + goalsDone.total}
          label="This week's tasks and goals"
        />
      ) : null}

      <section aria-labelledby="goals-title" className="max-w-3xl">
        <h3 id="goals-title" className="eyebrow">
          Weekly goals
        </h3>
        {goals.length > 0 ? (
          <ul className="mt-1">
            {goals.map((goal) => (
              <GoalRow key={goal.id} goal={goal} planner={planner} />
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-small text-muted">Three to five big goals for the week works well.</p>
        )}
        <div className="mt-2">
          <AddTask label="Add a goal for this week" onAdd={(title) => void planner.addGoal(monday, title)} />
        </div>
      </section>

      <div className="grid gap-3 lg:grid-cols-7">
        {days.map((date) => (
          <DayCard key={date} date={date} planner={planner} events={events} />
        ))}
      </div>
    </div>
  );
}
