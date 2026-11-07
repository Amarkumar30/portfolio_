/**
 * WritingTabs switches between long-form posts, short notes and Tech Today.
 * Props: the currently active tab.
 * Used in: /blog, /notes and /tech-today.
 */
import Link from "next/link";
import { TECH_TODAY_ENABLED, TECH_TODAY_PATH } from "@/features/tech-today/config";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "blog", href: "/blog", label: "Essays" },
  { id: "notes", href: "/notes", label: "Notes" },
  { id: "tech-today", href: TECH_TODAY_PATH, label: "Tech Today" },
] as const;

export function WritingTabs({ active }: { active: (typeof tabs)[number]["id"] }) {
  return (
    <nav aria-label="Writing" className="flex gap-6 border-b">
      {tabs.filter((tab) => tab.id !== "tech-today" || TECH_TODAY_ENABLED).map((tab) => (
        <Link
          key={tab.id}
          href={tab.href}
          aria-current={active === tab.id ? "page" : undefined}
          className={cn(
            "-mb-px inline-flex min-h-11 min-w-11 items-center justify-center border-b border-transparent text-small font-medium text-muted transition-colors duration-150 hover:text-foreground",
            active === tab.id && "border-foreground text-foreground",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
