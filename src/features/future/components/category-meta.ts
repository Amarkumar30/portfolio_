/**
 * One muted colour per task category, used as a small dot next to its label (the label carries the
 * meaning, so the colour is only a hint). Works in light and dark.
 */
import { CATEGORY_LABELS, type Category } from "../planner-schema";

export const CATEGORY_DOT: Record<Category, string> = {
  study: "bg-sky-500 dark:bg-sky-400",
  dsa: "bg-violet-500 dark:bg-violet-400",
  project: "bg-amber-500 dark:bg-amber-400",
  health: "bg-emerald-500 dark:bg-emerald-400",
  personal: "bg-rose-400 dark:bg-rose-300",
  other: "bg-neutral-400 dark:bg-neutral-500",
};

export function categoryLabel(category: Category) {
  return CATEGORY_LABELS[category];
}
