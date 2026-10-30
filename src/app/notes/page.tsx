/**
 * Notes: short updates and learning in public, shown in full on one page with per-note anchors.
 * Props: none for the route component.
 * Used in: /notes route (the "Notes" tab under Writing).
 */
import type { Metadata } from "next";
import { WritingTabs } from "@/components/sections/writing-tabs";
import { SectionHeading } from "@/components/ui/section-heading";
import { getEntries } from "@/lib/content/loader";
import { formatDate } from "@/lib/format";
import { renderMdx } from "@/lib/mdx";
import { buildMetadata } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Notes",
  description:
    "Short notes from Amar Kumar: what he's building, learning and noticing about GEO, AI search and software engineering.",
  path: "/notes",
});

export default async function NotesPage() {
  const notes = await Promise.all(
    getEntries("notes").map(async (note) => ({ ...note, content: await renderMdx(note.body) })),
  );

  return (
    <div className="container-shell space-y-10 py-12 sm:py-20">
      <SectionHeading
        as="h1"
        eyebrow="Writing"
        title="Notes"
        description="Short updates on what I'm building, learning and noticing. Less polished than the essays, on purpose."
      />

      <WritingTabs active="notes" />

      {notes.length === 0 ? (
        <p className="text-muted">Nothing here yet.</p>
      ) : (
        <ol className="max-w-[68ch] space-y-14">
          {notes.map((note) => (
            <li key={note.slug} id={note.slug} className="scroll-mt-24 space-y-4">
              <header className="space-y-1">
                <time dateTime={note.data.date} className="text-sm text-muted">
                  {formatDate(note.data.date)}
                  {note.data.draft ? " · Draft" : ""}
                </time>
                <h2 className="text-2xl font-semibold tracking-tight">
                  <a href={`#${note.slug}`} className="hover:text-accent">
                    {note.data.title}
                  </a>
                </h2>
              </header>
              <div className="rich-text">{note.content}</div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
