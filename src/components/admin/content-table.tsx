"use client";

/**
 * ContentTable: every entry with section filter tabs, a search box, status badges, the entry
 * date, and row actions (Edit / Publish or Unpublish / Delete). Each section has an empty state.
 * Props: entries from the repository and per-section metadata.
 * Used in: /admin dashboard.
 */
import Link from "next/link";
import { FileText, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { EntryActions } from "@/components/admin/entry-actions";
import type { AdminEntrySummary } from "@/lib/admin/content-service";
import type { SectionId } from "@/lib/content/sections";
import { formatPartialDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface SectionMeta {
  id: SectionId;
  label: string;
  singular: string;
  kind: "collection" | "single";
  canDraft: boolean;
}

function StatusBadge({ entry }: { entry: AdminEntrySummary }) {
  if (!entry.valid) {
    return (
      <span className="tag border-danger/30 bg-transparent text-danger" title="Invalid frontmatter — hidden on the site">
        Invalid
      </span>
    );
  }

  return entry.draft ? (
    <span className="tag bg-transparent">Draft</span>
  ) : (
    <span className="tag border-accent/30 bg-accent-soft text-accent">Published</span>
  );
}

function newHref(section: SectionMeta) {
  return section.kind === "single"
    ? `/admin/edit/${section.id}/${section.id}`
    : `/admin/new?section=${section.id}`;
}

export function ContentTable({ entries, sections }: { entries: AdminEntrySummary[]; sections: SectionMeta[] }) {
  const [filter, setFilter] = useState<SectionId | "all">("all");
  const [query, setQuery] = useState("");
  const byId = useMemo(() => Object.fromEntries(sections.map((section) => [section.id, section])), [sections]);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return entries
      .filter((entry) => filter === "all" || entry.section === filter)
      .filter(
        (entry) =>
          !needle ||
          entry.title.toLowerCase().includes(needle) ||
          entry.slug.includes(needle),
      )
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }, [entries, filter, query]);

  const activeSection = filter === "all" ? null : byId[filter];
  const tabs = [{ id: "all" as const, label: "All" }, ...sections];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div
          role="group"
          aria-label="Filter by section"
          className="-mx-gutter flex gap-1.5 overflow-x-auto px-gutter pb-1 md:mx-0 md:px-0 md:pb-0"
        >
          {tabs.map((tab) => {
            const count = tab.id === "all" ? entries.length : entries.filter((entry) => entry.section === tab.id).length;

            return (
              <button
                key={tab.id}
                type="button"
                aria-pressed={filter === tab.id}
                onClick={() => setFilter(tab.id)}
                className="chip shrink-0 gap-1.5"
              >
                {tab.label}
                <span className="font-mono text-caption opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
        <label className="relative block md:w-64">
          <span className="sr-only">Search content</span>
          <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-subtle" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search titles"
            className="field pl-9"
          />
        </label>
      </div>

      {rows.length === 0 ? (
        <div className="card flex flex-col items-center px-6 py-14 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-control border bg-surface-muted text-muted">
            <FileText aria-hidden="true" className="h-5 w-5" />
          </span>
          <p className="mt-4 font-medium">
            {query
              ? `Nothing matches “${query}”`
              : activeSection
                ? `No ${activeSection.label.toLowerCase()} yet`
                : "No content yet"}
          </p>
          <p className="mt-1 text-small text-muted">
            {query ? "Try a different search, or clear it." : "Anything you publish will show up here."}
          </p>
          {!query ? (
            <Link
              href={activeSection ? newHref(activeSection) : "/admin/new"}
              className="btn btn-primary mt-6"
            >
              <Plus aria-hidden="true" />
              {activeSection
                ? activeSection.kind === "single"
                  ? `Write ${activeSection.label}`
                  : `New ${activeSection.singular.toLowerCase()}`
                : "New entry"}
            </Link>
          ) : null}
        </div>
      ) : (
        <ul className="card divide-y overflow-hidden">
          {rows.map((entry) => {
            const section = byId[entry.section];

            return (
              <li
                key={`${entry.section}/${entry.slug}`}
                className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:gap-6 sm:px-5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/edit/${entry.section}/${entry.slug}`}
                      className="truncate font-medium hover:text-accent"
                    >
                      {section.kind === "single" ? section.label : entry.title}
                    </Link>
                    <StatusBadge entry={entry} />
                  </div>
                  <p className="meta mt-1 flex flex-wrap gap-x-2">
                    <span>{section.label}</span>
                    <span aria-hidden="true">·</span>
                    <span>{entry.date ? formatPartialDate(entry.date) : "No date"}</span>
                    <span aria-hidden="true">·</span>
                    <a href={entry.url} className="truncate hover:text-foreground hover:underline">
                      {entry.url}
                    </a>
                  </p>
                </div>
                <EntryActions
                  section={entry.section}
                  slug={entry.slug}
                  title={entry.title}
                  draft={entry.draft}
                  canDraft={section.canDraft}
                  canDelete={section.kind === "collection"}
                />
              </li>
            );
          })}
        </ul>
      )}
      <p className={cn("meta", rows.length === 0 && "sr-only")}>
        {rows.length} {rows.length === 1 ? "entry" : "entries"}
      </p>
    </div>
  );
}
