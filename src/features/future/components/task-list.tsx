"use client";

/**
 * Task building blocks shared by Today, Week and Calendar.
 * - AddTask: type a task and press Enter; optional category chips (Today only).
 * - TaskList: checkbox, title (tap to edit inline), category dot and label, optional star, and a
 *   small menu (star, category, move up/down, move to today, delete). Drag to reorder with a mouse;
 *   on touch the menu's Move up/down does the same. Done tasks sit at the bottom, collapsed.
 * Everything renders as plain text.
 */
import { ArrowDown, ArrowUp, CalendarCheck, ChevronDown, GripVertical, MoreHorizontal, Star, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { CATEGORIES, TITLE_MAX, type Category, type Task, type TaskPatch } from "../planner-schema";
import { CATEGORY_DOT, categoryLabel } from "./category-meta";
import { PENDING } from "./use-planner";

export function CategoryTag({ category }: { category: Category }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden="true" className={cn("h-2 w-2 rounded-full", CATEGORY_DOT[category])} />
      {categoryLabel(category)}
    </span>
  );
}

export function AddTask({
  onAdd,
  id,
  label = "Add a task",
  withCategories = false,
  compact = false,
  autoFocus = false,
  onDone,
}: {
  onAdd: (title: string, category: Category) => void;
  id?: string;
  label?: string;
  withCategories?: boolean;
  compact?: boolean;
  autoFocus?: boolean;
  onDone?: () => void;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("other");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const text = title.trim();
        if (!text) return;
        onAdd(text, category);
        setTitle("");
      }}
      className="space-y-2"
    >
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        className={cn("field", compact && "text-small")}
        placeholder={`${label}…`}
        autoComplete="off"
        enterKeyHint="done"
        maxLength={TITLE_MAX}
        autoFocus={autoFocus}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") onDone?.();
        }}
      />
      {withCategories ? (
        <div role="group" aria-label="Category for the new task" className="-mx-gutter flex gap-1.5 overflow-x-auto px-gutter pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              className="chip shrink-0 gap-1.5"
              aria-pressed={category === item}
              onClick={() => setCategory(category === item ? "other" : item)}
            >
              <span aria-hidden="true" className={cn("h-2 w-2 rounded-full", CATEGORY_DOT[item])} />
              {categoryLabel(item)}
            </button>
          ))}
        </div>
      ) : null}
    </form>
  );
}

interface RowActions {
  today: string;
  onPatch: (task: Task, patch: TaskPatch) => void;
  onDelete: (task: Task) => void;
  onMove?: (task: Task, direction: -1 | 1) => void;
  onMoveToToday?: (task: Task) => void;
}

function TaskMenu({ task, first, last, actions, close }: { task: Task; first: boolean; last: boolean; actions: RowActions; close: () => void }) {
  const item = "flex min-h-11 w-full items-center gap-2 rounded-control px-3 text-left text-small hover:bg-surface-muted";
  const run = (action: () => void) => () => {
    action();
    close();
  };

  return (
    <div role="menu" aria-label={`Actions for ${task.title}`} className="card absolute right-0 top-full z-20 mt-1 w-56 p-1 shadow-lg shadow-black/5">
      <button type="button" role="menuitem" className={item} onClick={run(() => actions.onPatch(task, { priority: task.priority === "high" ? "normal" : "high" }))}>
        <Star aria-hidden="true" className="h-4 w-4" />
        {task.priority === "high" ? "Remove star" : "Star"}
      </button>
      {actions.onMove && !task.done ? (
        <>
          <button type="button" role="menuitem" className={item} disabled={first} onClick={run(() => actions.onMove!(task, -1))}>
            <ArrowUp aria-hidden="true" className="h-4 w-4" />
            Move up
          </button>
          <button type="button" role="menuitem" className={item} disabled={last} onClick={run(() => actions.onMove!(task, 1))}>
            <ArrowDown aria-hidden="true" className="h-4 w-4" />
            Move down
          </button>
        </>
      ) : null}
      {actions.onMoveToToday && !task.done && task.date !== actions.today ? (
        <button type="button" role="menuitem" className={item} onClick={run(() => actions.onMoveToToday!(task))}>
          <CalendarCheck aria-hidden="true" className="h-4 w-4" />
          Move to today
        </button>
      ) : null}
      <div role="group" aria-label="Category" className="flex flex-wrap gap-1 border-y px-2 py-2">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            role="menuitemradio"
            aria-checked={task.category === category}
            className={cn("chip min-h-8 gap-1.5 px-2 text-caption", task.category === category && "border-foreground text-foreground")}
            onClick={run(() => actions.onPatch(task, { category }))}
          >
            <span aria-hidden="true" className={cn("h-2 w-2 rounded-full", CATEGORY_DOT[category])} />
            {categoryLabel(category)}
          </button>
        ))}
      </div>
      <button type="button" role="menuitem" className={cn(item, "text-danger")} onClick={run(() => actions.onDelete(task))}>
        <Trash2 aria-hidden="true" className="h-4 w-4" />
        Delete
      </button>
    </div>
  );
}

function TaskRow({
  task,
  first,
  last,
  actions,
  showDate,
  dragging,
  drag,
}: {
  task: Task;
  first: boolean;
  last: boolean;
  actions: RowActions;
  showDate?: (date: string) => string;
  dragging: boolean;
  drag?: {
    onStart: () => void;
    onOver: () => void;
    onEnd: () => void;
  };
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);
  const [menuOpen, setMenuOpen] = useState(false);
  const [canDrag, setCanDrag] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pending = task.id.startsWith(PENDING);

  useEffect(() => {
    if (!menuOpen) return;
    function onPointer(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  function save() {
    const title = draft.trim();
    setEditing(false);
    if (title && title !== task.title) actions.onPatch(task, { title });
    else setDraft(task.title);
  }

  return (
    <li
      draggable={canDrag && !task.done}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move";
        drag?.onStart();
      }}
      onDragOver={(event) => {
        if (!drag) return;
        event.preventDefault();
        drag.onOver();
      }}
      onDragEnd={() => {
        setCanDrag(false);
        drag?.onEnd();
      }}
      className={cn("flex items-start gap-1", dragging && "opacity-50")}
    >
      {drag && !task.done ? (
        <span
          aria-hidden="true"
          title="Drag to reorder"
          onPointerDown={(event) => setCanDrag(event.pointerType === "mouse")}
          onPointerUp={() => setCanDrag(false)}
          className="hidden min-h-11 w-5 shrink-0 cursor-grab items-center justify-center text-subtle [@media(pointer:fine)]:flex"
        >
          <GripVertical className="h-4 w-4" />
        </span>
      ) : null}

      <label className="flex min-h-11 min-w-11 shrink-0 items-center justify-center">
        <input
          type="checkbox"
          className="h-5 w-5 accent-[var(--accent)]"
          checked={task.done}
          disabled={pending}
          onChange={(event) => actions.onPatch(task, { done: event.target.checked })}
        />
        <span className="sr-only">{task.done ? "Mark not done" : "Mark done"}: {task.title}</span>
      </label>

      <div className="min-w-0 flex-1 py-1.5">
        {editing ? (
          <input
            className="field min-h-9 py-1"
            aria-label="Task title"
            autoFocus
            maxLength={TITLE_MAX}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={save}
            onKeyDown={(event) => {
              if (event.key === "Enter") save();
              if (event.key === "Escape") {
                setDraft(task.title);
                setEditing(false);
              }
            }}
          />
        ) : (
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              setDraft(task.title);
              setEditing(true);
            }}
            className={cn("block w-full break-words text-left text-body", task.done ? "text-subtle line-through" : "text-foreground")}
          >
            {task.title}
            <span className="sr-only"> (edit)</span>
          </button>
        )}
        <p className="meta mt-0.5 flex flex-wrap items-center gap-x-2">
          <CategoryTag category={task.category} />
          {task.priority === "high" ? (
            <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300">
              <Star aria-hidden="true" className="h-3 w-3 fill-current" />
              Starred
            </span>
          ) : null}
          {showDate ? <time dateTime={task.date}>{showDate(task.date)}</time> : null}
        </p>
      </div>

      <div ref={menuRef} className="relative shrink-0">
        <button
          type="button"
          className="btn btn-ghost btn-icon"
          aria-label={`More for ${task.title}`}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          disabled={pending}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <MoreHorizontal aria-hidden="true" />
        </button>
        {menuOpen ? <TaskMenu task={task} first={first} last={last} actions={actions} close={() => setMenuOpen(false)} /> : null}
      </div>
    </li>
  );
}

/**
 * A day's tasks: open ones in order (reorderable), done ones collapsed below.
 * `onReorder` gets the open tasks in their new order.
 */
export function TaskList({
  tasks,
  actions,
  onReorder,
  showDate,
  collapseDone = true,
  empty,
}: {
  tasks: Task[];
  actions: RowActions;
  onReorder?: (ordered: Task[]) => void;
  showDate?: (date: string) => string;
  collapseDone?: boolean;
  empty?: string;
}) {
  const [showDone, setShowDone] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [preview, setPreview] = useState<Task[] | null>(null);

  const open = tasks.filter((task) => !task.done);
  const done = tasks.filter((task) => task.done);
  const shown = preview ?? open;

  function move(task: Task, direction: -1 | 1) {
    const index = open.findIndex((item) => item.id === task.id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= open.length) return;
    const next = [...open];
    [next[index], next[target]] = [next[target], next[index]];
    onReorder?.(next);
  }

  function dragOver(overId: string) {
    if (!dragId || dragId === overId) return;
    const list = [...shown];
    const from = list.findIndex((item) => item.id === dragId);
    const to = list.findIndex((item) => item.id === overId);
    if (from < 0 || to < 0) return;
    list.splice(to, 0, list.splice(from, 1)[0]);
    setPreview(list);
  }

  function dragEnd() {
    if (preview && preview.some((task, index) => task.id !== open[index]?.id)) onReorder?.(preview);
    setDragId(null);
    setPreview(null);
  }

  const rowActions: RowActions = { ...actions, onMove: onReorder ? move : undefined };

  return (
    <div>
      {shown.length === 0 && done.length === 0 && empty ? <p className="py-3 text-small text-muted">{empty}</p> : null}
      {shown.length > 0 ? (
        <ul>
          {shown.map((task, index) => (
            <TaskRow
              key={task.id}
              task={task}
              first={index === 0}
              last={index === shown.length - 1}
              actions={rowActions}
              showDate={showDate}
              dragging={dragId === task.id}
              drag={
                onReorder
                  ? { onStart: () => setDragId(task.id), onOver: () => dragOver(task.id), onEnd: dragEnd }
                  : undefined
              }
            />
          ))}
        </ul>
      ) : null}

      {done.length > 0 ? (
        collapseDone ? (
          <div className="mt-1">
            <button
              type="button"
              aria-expanded={showDone}
              onClick={() => setShowDone((value) => !value)}
              className="btn btn-ghost -ml-3"
            >
              <ChevronDown aria-hidden="true" className={cn("transition-transform motion-reduce:transition-none", showDone && "rotate-180")} />
              {showDone ? "Hide" : "Show"} {done.length} done
            </button>
            {showDone ? (
              <ul>
                {done.map((task, index) => (
                  <TaskRow key={task.id} task={task} first={index === 0} last={index === done.length - 1} actions={rowActions} showDate={showDate} dragging={false} />
                ))}
              </ul>
            ) : null}
          </div>
        ) : (
          <ul>
            {done.map((task, index) => (
              <TaskRow key={task.id} task={task} first={index === 0} last={index === done.length - 1} actions={rowActions} showDate={showDate} dragging={false} />
            ))}
          </ul>
        )
      ) : null}
    </div>
  );
}

/** A thin bar for "3/5 done". */
export function ProgressBar({ done, total, label }: { done: number; total: number; label: string }) {
  const percent = total ? Math.round((done / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        aria-valuetext={`${done} of ${total} done`}
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted"
      >
        <div className="h-full rounded-full bg-accent transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${percent}%` }} />
      </div>
      <span className="meta tabular whitespace-nowrap">
        {done}/{total} done
      </span>
    </div>
  );
}
