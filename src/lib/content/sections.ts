/**
 * Content sections: one entry per kind of content the site publishes.
 * Each entry declares where its files live, its public route, its frontmatter schema,
 * and the fields the admin editor shows. Adding a section is one entry here plus its pages.
 * Safe to import from client components (no Node APIs).
 */
import { z } from "zod";

const dateField = z
  .union([z.string(), z.date()])
  .transform((value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value))
  .refine((value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)), {
    message: "Use a YYYY-MM-DD date",
  });

const tagsField = z.array(z.string().min(1)).default([]);
const draftField = z.boolean().optional().default(false);
const imagePathField = z
  .string()
  .regex(/^\/uploads\/[a-z0-9/._-]+$/i, "Use an uploaded image path like /uploads/2026/10/photo.jpg")
  .optional();

const linkSchema = z.object({
  label: z.string().min(1),
  href: z.url(),
});

export const sectionSchemas = {
  blog: z.object({
    title: z.string().min(1),
    excerpt: z.string().min(1),
    date: dateField,
    category: z.string().min(1),
    tags: tagsField,
    cover: imagePathField,
    draft: draftField,
  }),
  notes: z.object({
    title: z.string().min(1),
    date: dateField,
    tags: tagsField,
    draft: draftField,
  }),
  projects: z.object({
    title: z.string().min(1),
    summary: z.string().min(1),
    date: dateField,
    role: z.string().min(1),
    collaborationNote: z.string().optional(),
    stack: z.array(z.string().min(1)).default([]),
    links: z.array(linkSchema).default([]),
    featured: z.boolean().optional().default(false),
    status: z.string().optional(),
    order: z.number().int().optional(),
    cover: imagePathField,
    coverAlt: z.string().optional(),
    draft: draftField,
  }),
  research: z.object({
    title: z.string().min(1),
    excerpt: z.string().min(1),
    date: dateField,
    status: z.string().min(1).default("In progress"),
    tags: tagsField,
    draft: draftField,
  }),
  now: z.object({
    updated: dateField,
  }),
} as const;

export type SectionId = keyof typeof sectionSchemas;
export type SectionData<K extends SectionId> = z.infer<(typeof sectionSchemas)[K]>;

export type FieldType =
  | "text"
  | "textarea"
  | "date"
  | "number"
  | "tags"
  | "boolean"
  | "links"
  | "image";

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
}

export interface SectionConfig {
  id: SectionId;
  label: string;
  singular: string;
  /** "collection" = many files in `dir`; "single" = one file at `file`. */
  kind: "collection" | "single";
  dir: string;
  file?: string;
  route: string;
  hasDetailPage: boolean;
  /** Frontmatter key used as the entry's display title in the admin. */
  titleField: string;
  /** Frontmatter key holding the entry's date. */
  dateField: string;
  fields: FieldDef[];
}

const titleDef: FieldDef = { name: "title", label: "Title", type: "text", required: true };
const dateDef: FieldDef = { name: "date", label: "Date", type: "date", required: true };
const tagsDef: FieldDef = {
  name: "tags",
  label: "Tags",
  type: "tags",
  help: "Comma-separated",
};

export const sections: Record<SectionId, SectionConfig> = {
  blog: {
    id: "blog",
    label: "Blog",
    singular: "Blog post",
    kind: "collection",
    dir: "content/blog",
    route: "/blog",
    hasDetailPage: true,
    titleField: "title",
    dateField: "date",
    fields: [
      titleDef,
      { name: "excerpt", label: "Excerpt", type: "textarea", required: true },
      { name: "category", label: "Category", type: "text", required: true },
      dateDef,
      tagsDef,
      { name: "cover", label: "Cover image", type: "image" },
    ],
  },
  notes: {
    id: "notes",
    label: "Notes",
    singular: "Note",
    kind: "collection",
    dir: "content/notes",
    route: "/notes",
    hasDetailPage: false,
    titleField: "title",
    dateField: "date",
    fields: [titleDef, dateDef, tagsDef],
  },
  projects: {
    id: "projects",
    label: "Projects",
    singular: "Project",
    kind: "collection",
    dir: "content/projects",
    route: "/projects",
    hasDetailPage: true,
    titleField: "title",
    dateField: "date",
    fields: [
      titleDef,
      { name: "summary", label: "Summary", type: "textarea", required: true },
      { name: "role", label: "My role", type: "textarea", required: true },
      {
        name: "collaborationNote",
        label: "Team note",
        type: "textarea",
        help: "Shown at the top for team projects",
      },
      dateDef,
      { name: "stack", label: "Stack", type: "tags", help: "Comma-separated" },
      { name: "links", label: "Links", type: "links", help: "One per line: Label | https://…" },
      {
        name: "status",
        label: "Label",
        type: "text",
        help: 'Shown above the title, e.g. "Founder · in progress". Defaults to "Case study".',
      },
      {
        name: "order",
        label: "Position",
        type: "number",
        help: "Lower comes first. Leave empty to sort by date.",
      },
      { name: "featured", label: "Feature on home page", type: "boolean" },
      { name: "cover", label: "Screenshot", type: "image" },
      { name: "coverAlt", label: "Screenshot description (alt text)", type: "text" },
    ],
  },
  research: {
    id: "research",
    label: "Research",
    singular: "Research write-up",
    kind: "collection",
    dir: "content/research",
    route: "/research",
    hasDetailPage: true,
    titleField: "title",
    dateField: "date",
    fields: [
      titleDef,
      { name: "excerpt", label: "Excerpt", type: "textarea", required: true },
      { name: "status", label: "Status", type: "text", help: "e.g. In progress, Draft paper" },
      dateDef,
      tagsDef,
    ],
  },
  now: {
    id: "now",
    label: "Now",
    singular: "Now page",
    kind: "single",
    dir: "content",
    file: "content/now.mdx",
    route: "/now",
    hasDetailPage: false,
    titleField: "updated",
    dateField: "updated",
    fields: [{ name: "updated", label: "Updated", type: "date", required: true }],
  },
};

export const sectionList = Object.values(sections);

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isSectionId(value: string): value is SectionId {
  return Object.hasOwn(sections, value);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

/** Repo-relative path of an entry's file. Callers must validate `slug` first. */
export function entryPath(section: SectionConfig, slug: string) {
  return section.kind === "single" ? section.file! : `${section.dir}/${slug}.mdx`;
}

/** Public URL of an entry. */
export function entryUrl(section: SectionConfig, slug: string) {
  if (section.kind === "single") return section.route;
  return section.hasDetailPage ? `${section.route}/${slug}` : `${section.route}#${slug}`;
}
