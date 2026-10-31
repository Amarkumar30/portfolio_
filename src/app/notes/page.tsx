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
    <div className="container-shell page">
      <SectionHeading
        as="h1"
        eyebrow="Writing"
        title="Notes"
        description="Short updates on what I'm building, learning and noticing. Less polished than the essays, on purpose."
      />

      <div className="mt-12 max-w-3xl space-y-8">
        <WritingTabs active="notes" />

        {notes.length === 0 ? (
          <p className="border-y py-8 text-muted">No notes yet. The first one is on its way.</p>
        ) : (
          <ol className="max-w-[42.5rem] divide-y">
            {notes.map((note) => (
              <li key={note.slug} id={note.slug} className="py-10 first:pt-2">
                <header className="mb-4">
                  <p className="meta">
                    <time dateTime={note.data.date}>{formatDate(note.data.date)}</time>
                    {note.data.draft ? " · Draft" : ""}
                  </p>
                  <h2 className="-mb-2.5 mt-0.5 text-h3 font-semibold">
                    <a href={`#${note.slug}`} className="inline-block py-2.5 transition-colors duration-150 hover:text-accent">
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
    </div>
  );
}
