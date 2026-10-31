/**
 * WritingTabs switches between long-form posts and short notes.
 * Props: the currently active tab.
 * Used in: /blog and /notes.
 */
import Link from "next/link";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "blog", href: "/blog", label: "Essays" },
  { id: "notes", href: "/notes", label: "Notes" },
] as const;

export function WritingTabs({ active }: { active: (typeof tabs)[number]["id"] }) {
  return (
    <nav aria-label="Writing" className="flex gap-6 border-b">
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={tab.href}
          aria-current={active === tab.id ? "page" : undefined}
          className={cn(
            "-mb-px inline-flex min-h-11 items-center border-b border-transparent text-small font-medium text-muted transition-colors duration-150 hover:text-foreground",
            active === tab.id && "border-foreground text-foreground",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
