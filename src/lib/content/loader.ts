/**
 * Reads, validates and sorts content files for every section in sections.ts.
 * Invalid files are logged and skipped; drafts are hidden in production.
 * Server-only (uses the filesystem).
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { z } from "zod";
import {
  SLUG_PATTERN,
  entryPath,
  sectionSchemas,
  sections,
  type SectionData,
  type SectionId,
} from "@/lib/content/sections";

export interface Entry<K extends SectionId> {
  section: K;
  slug: string;
  data: SectionData<K>;
  body: string;
  readingTime: string;
}

const showDrafts = process.env.NODE_ENV !== "production";

function isDraft(data: object) {
  return "draft" in data && data.draft === true;
}

function readEntry<K extends SectionId>(sectionId: K, slug: string): Entry<K> | null {
  const section = sections[sectionId];

  if (section.kind === "collection" && !SLUG_PATTERN.test(slug)) {
    return null;
  }

  const filePath = path.join(/* turbopackIgnore: true */ process.cwd(), entryPath(section, slug));

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const { data, content } = matter(fs.readFileSync(filePath, "utf8"));
  const parsed = sectionSchemas[sectionId].safeParse(data);

  if (!parsed.success) {
    console.warn(
      `[content] Skipping ${entryPath(section, slug)}: invalid frontmatter\n${z.prettifyError(parsed.error)}`,
    );
    return null;
  }

  if (isDraft(parsed.data) && !showDrafts) {
    return null;
  }

  return {
    section: sectionId,
    slug,
    data: parsed.data as SectionData<K>,
    body: content,
    readingTime: readingTime(content).text,
  };
}

export function getEntries<K extends SectionId>(sectionId: K): Entry<K>[] {
  const section = sections[sectionId];
  const dir = path.join(/* turbopackIgnore: true */ process.cwd(), section.dir);

  if (section.kind === "single" || !fs.existsSync(dir)) {
    return [];
  }

  const dateKey = section.dateField as keyof SectionData<K>;

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx"))
    .flatMap((file) => {
      const entry = readEntry(sectionId, file.replace(/\.mdx$/, ""));
      return entry ? [entry] : [];
    })
    .sort(
      (a, b) =>
        Date.parse(String(b.data[dateKey])) - Date.parse(String(a.data[dateKey])),
    );
}

export function getEntry<K extends SectionId>(sectionId: K, slug: string) {
  return readEntry(sectionId, slug);
}

export function getSingle<K extends SectionId>(sectionId: K) {
  return readEntry(sectionId, sectionId);
}

export function getTags(sectionId: "blog" | "notes" | "research") {
  return Array.from(new Set(getEntries(sectionId).flatMap((entry) => entry.data.tags))).sort();
}
