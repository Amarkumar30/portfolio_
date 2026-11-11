/**
 * Label, icon and colour for each event type. Colours meet AA contrast in both themes.
 */
import {
  AlarmClock,
  BookOpen,
  CalendarDays,
  GraduationCap,
  Handshake,
  ListChecks,
  NotebookPen,
  Rocket,
  User,
  type LucideIcon,
} from "lucide-react";
import type { EventType } from "../schema";

export const TYPE_META: Record<EventType, { label: string; icon: LucideIcon; className: string }> = {
  exam: { label: "Exam", icon: GraduationCap, className: "text-rose-700 dark:text-rose-300" },
  quiz: { label: "Quiz", icon: ListChecks, className: "text-amber-700 dark:text-amber-300" },
  assignment: { label: "Assignment", icon: NotebookPen, className: "text-sky-700 dark:text-sky-300" },
  interview: { label: "Interview", icon: Handshake, className: "text-violet-700 dark:text-violet-300" },
  hackathon: { label: "Hackathon", icon: Rocket, className: "text-emerald-700 dark:text-emerald-300" },
  deadline: { label: "Deadline", icon: AlarmClock, className: "text-orange-700 dark:text-orange-300" },
  class: { label: "Class", icon: BookOpen, className: "text-muted" },
  plan: { label: "Plan", icon: CalendarDays, className: "text-accent" },
  personal: { label: "Personal", icon: User, className: "text-fuchsia-700 dark:text-fuchsia-300" },
};
