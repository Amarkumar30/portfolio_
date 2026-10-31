/**
 * Admin-side content operations on top of Storage: list, read, save, delete, and toggle drafts.
 * Validates slugs, frontmatter (per-section zod schema) and MDX before anything is written,
 * so a bad edit can't break the next deploy.
 * Server-only.
 */
import matter from "gray-matter";
import { z } from "zod";
import { getStorage } from "@/lib/admin/storage";
import {
  SLUG_PATTERN,
  entryPath,
  entryUrl,
  sectionList,
  sectionSchemas,
  sections,
  type SectionId,
} from "@/lib/content/sections";
import { compileMdx } from "@/lib/mdx";

export interface AdminEntrySummary {
  section: SectionId;
  slug: string;
  title: string;
  date: string;
  draft: boolean;
  valid: boolean;
  url: string;
}

export class ContentError extends Error {
  constructor(
    message: string,
    public status = 400,
    public issues?: string,
  ) {
    super(message);
  }
}

function toDateString(value: unknown) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "number") return String(value);
  return typeof value === "string" ? value : "";
}

function resolvePath(sectionId: SectionId, slug: string) {
  const section = sections[sectionId];

  if (section.kind === "single") {
    if (slug !== sectionId) throw new ContentError("Unknown entry", 404);
  } else if (!SLUG_PATTERN.test(slug) || slug.length > 80) {
    throw new ContentError("Slugs may only use a–z, 0–9 and single hyphens.");
  }

  return entryPath(section, slug);
}

function summarize(sectionId: SectionId, slug: string, source: string): AdminEntrySummary {
  const section = sections[sectionId];
  const { data } = matter(source);
  const valid = sectionSchemas[sectionId].safeParse(data).success;

  return {
    section: sectionId,
    slug,
    title: String(data[section.titleField] ?? slug),
    date: toDateString(data[section.dateField]),
    draft: data.draft === true,
    valid,
    url: entryUrl(section, slug),
  };
}

export async function listEntries(onlySection?: SectionId) {
  const storage = getStorage();
  const targets = onlySection ? [sections[onlySection]] : sectionList;

  const perSection = await Promise.all(
    targets.map(async (section) => {
      if (section.kind === "single") {
        const source = await storage.read(section.file!);
        return source ? [summarize(section.id, section.id, source)] : [];
      }

      const files = (await storage.list(section.dir)).filter((file) => file.endsWith(".mdx"));

      return Promise.all(
        files.map(async (file) => {
          const slug = file.replace(/\.mdx$/, "");
          const source = (await storage.read(`${section.dir}/${file}`)) ?? "";
          return summarize(section.id, slug, source);
        }),
      );
    }),
  );

  return perSection
    .flat()
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}

export async function readEntry(sectionId: SectionId, slug: string) {
  const source = await getStorage().read(resolvePath(sectionId, slug));

  if (source === null) {
    throw new ContentError("Not found", 404);
  }

  const { data, content } = matter(source);

  // Normalise YAML dates back to strings for the editor.
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Date) data[key] = toDateString(value);
  }

  return { data: data as Record<string, unknown>, body: content.replace(/^\n+/, "") };
}

function stripEmpty(data: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(data).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );
}

export async function saveEntry({
  section: sectionId,
  slug,
  data,
  body,
  mode,
  draft,
}: {
  section: SectionId;
  slug: string;
  data: Record<string, unknown>;
  body: string;
  mode: "create" | "update";
  draft: boolean;
}) {
  const section = sections[sectionId];
  const filePath = resolvePath(sectionId, slug);
  const storage = getStorage();

  const candidate = stripEmpty({ ...data });
  if ("draft" in sectionSchemas[sectionId].shape) {
    if (draft) candidate.draft = true;
    else delete candidate.draft;
  }

  const parsed = sectionSchemas[sectionId].safeParse(candidate);
  if (!parsed.success) {
    throw new ContentError("Some fields need attention.", 400, z.prettifyError(parsed.error));
  }

  try {
    await compileMdx(body);
  } catch (error) {
    throw new ContentError(
      "The body has invalid MDX. Check for unclosed tags or stray { } characters.",
      400,
      error instanceof Error ? error.message : undefined,
    );
  }

  const exists = await storage.exists(filePath);
  if (mode === "create" && exists && section.kind === "collection") {
    throw new ContentError(`A ${section.singular.toLowerCase()} with the slug "${slug}" already exists.`, 409);
  }
  if (mode === "update" && !exists) {
    throw new ContentError("Not found", 404);
  }

  // Keep the author's key order; gray-matter quotes dates so YAML keeps them as strings.
  const file = matter.stringify(`\n${body.trim()}\n`, stripEmpty({ ...candidate, ...parsed.data, draft: candidate.draft }));
  const title = String(candidate[section.titleField] ?? slug);
  const verb = draft ? "save draft" : mode === "create" ? "publish" : "update";

  await storage.write(filePath, file, `content(${sectionId}): ${verb} "${title}"`);

  return { path: filePath, url: entryUrl(section, slug), storage: storage.kind };
}

export async function setDraft(sectionId: SectionId, slug: string, draft: boolean) {
  const { data, body } = await readEntry(sectionId, slug);
  return saveEntry({ section: sectionId, slug, data, body, mode: "update", draft });
}

export async function deleteEntry(sectionId: SectionId, slug: string) {
  const section = sections[sectionId];

  if (section.kind === "single") {
    throw new ContentError(`The ${section.label} page can be edited but not deleted.`);
  }

  const filePath = resolvePath(sectionId, slug);
  const storage = getStorage();
  const source = await storage.read(filePath);

  if (source === null) {
    throw new ContentError("Not found", 404);
  }

  const title = String(matter(source).data[section.titleField] ?? slug);
  await storage.remove(filePath, `content(${sectionId}): delete "${title}"`);
}
