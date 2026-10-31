/**
 * EntryList: simple rows for writing, notes and research (date · title · reading time).
 * On small screens the date and reading time sit on one line above the title.
 * Props: rows with href, title, date, optional label, excerpt and trailing meta.
 * Used in: home, /blog, /research.
 */
import Link from "next/link";
import { formatDate } from "@/lib/format";

export interface EntryRow {
  href: string;
  title: string;
  date: string;
  datePrefix?: string;
  label?: string;
  excerpt?: string;
  trailing?: string;
}

export function EntryList({ rows }: { rows: EntryRow[] }) {
  return (
    <ul className="border-t">
      {rows.map((row) => (
        <li key={row.href} className="border-b">
          <Link
            href={row.href}
            className="group grid gap-x-6 gap-y-1 py-4 sm:grid-cols-[7.5rem_minmax(0,1fr)_auto] sm:items-baseline"
          >
            <span className="meta flex gap-2 sm:block">
              <time dateTime={row.date}>
                {row.datePrefix}
                {formatDate(row.date, "short")}
              </time>
              {row.trailing ? <span className="sm:hidden">· {row.trailing}</span> : null}
            </span>
            <span className="min-w-0">
              <span className="font-medium text-foreground transition-colors duration-150 group-hover:text-accent">
                {row.title}
              </span>
              {row.label ? <span className="eyebrow ml-2 align-[0.1em]">{row.label}</span> : null}
              {row.excerpt ? (
                <span className="mt-1 block text-small text-muted">{row.excerpt}</span>
              ) : null}
            </span>
            {row.trailing ? (
              <span className="meta hidden whitespace-nowrap sm:block">{row.trailing}</span>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}
