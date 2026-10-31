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

/** Journey links can also point inside the site ("/projects/bayana"). */
const siteOrWebLinkSchema = z.object({
  label: z.string().min(1),
  href: z
    .string()
    .refine(
      (value) =>
        (value.startsWith("/") && !value.startsWith("//")) ||
        (URL.canParse(value) && /^https?:\/\//.test(value)),
      { message: "Use a site path like /projects/bayana or a full https:// URL" },
    ),
});

/** "2026" or "2026-08". YAML may read a bare year as a number, so accept that too. */
const yearMonthField = z
  .union([z.string(), z.number()])
  .transform((value) => String(value))
  .refine((value) => /^\d{4}(-(0[1-9]|1[0-2]))?$/.test(value), { message: "Use YYYY or YYYY-MM" });

export const journeyKinds = [
  { value: "education", label: "Education" },
  { value: "win", label: "Win" },
  { value: "project", label: "Project" },
  { value: "research", label: "Research" },
  { value: "founder", label: "Founder" },
  { value: "creator", label: "Creator" },
  { value: "now", label: "Now" },
] as const;

export type JourneyKind = (typeof journeyKinds)[number]["value"];

const journeyKindValues = journeyKinds.map((kind) => kind.value) as [JourneyKind, ...JourneyKind[]];

/** Soft guides shown in the admin; the summary has a hard limit a little above its guide. */
export const JOURNEY_SUMMARY_GUIDE = 120;
export const JOURNEY_STORY_GUIDE = 600;

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
    year: z.number().int().min(1990).max(2100).optional(),
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
  journey: z.object({
    title: z.string().min(1),
    // Optional so a milestone can go up before its date is known; the label is hidden until then.
    date: yearMonthField.optional(),
    summary: z.string().min(1).max(160),
    kind: z.enum(journeyKindValues),
    highlight: z.boolean().optional().default(false),
    links: z.array(siteOrWebLinkSchema).default([]),
    image: imagePathField,
    imageAlt: z.string().optional(),
    order: z.number().int().optional(),
    draft: draftField,
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
  | "image"
  | "select";

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  placeholder?: string;
  /** Choices for "select" fields. */
  options?: readonly { value: string; label: string }[];
  /** Icons shown with a "select" field's options (see components/admin/field-icons). */
  iconSet?: "journeyKind";
  /** Soft length guide: the editor shows a character count against it. */
  lengthGuide?: number;
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
  /** For sections without detail pages: prefix for the entry's anchor id on `route`. */
  anchorPrefix?: string;
  /** Soft length guide for the body, shown as a character count in the editor. */
  bodyGuide?: number;
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
      {
        name: "year",
        label: "Year",
        type: "number",
        help: "Shown in the case study details. Leave empty to hide it.",
      },
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
  journey: {
    id: "journey",
    label: "Journey",
    singular: "Milestone",
    kind: "collection",
    dir: "content/journey",
    route: "/about",
    anchorPrefix: "journey-",
    hasDetailPage: false,
    titleField: "title",
    dateField: "date",
    bodyGuide: JOURNEY_STORY_GUIDE,
    fields: [
      titleDef,
      {
        name: "date",
        label: "Date",
        type: "text",
        placeholder: "2026 or 2026-08",
        help: "YYYY or YYYY-MM. Leave empty if unknown: the date label is hidden and Position decides the place.",
      },
      {
        name: "summary",
        label: "Summary",
        type: "textarea",
        required: true,
        lengthGuide: JOURNEY_SUMMARY_GUIDE,
        help: "The one line shown when the milestone is collapsed.",
      },
      {
        name: "kind",
        label: "Kind",
        type: "select",
        required: true,
        options: journeyKinds,
        iconSet: "journeyKind",
        help: "Sets the icon. “Now” always shows last.",
      },
      { name: "highlight", label: "Highlight (accent dot and title)", type: "boolean" },
      {
        name: "links",
        label: "Links",
        type: "links",
        help: "One per line: Label | /projects/bayana or Label | https://…",
      },
      { name: "image", label: "Image", type: "image" },
      { name: "imageAlt", label: "Image description (alt text)", type: "text" },
      {
        name: "order",
        label: "Position",
        type: "number",
        help: "Places milestones without a date, and breaks ties between the same date. Lower comes first.",
      },
    ],
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
  return section.hasDetailPage
    ? `${section.route}/${slug}`
    : `${section.route}#${section.anchorPrefix ?? ""}${slug}`;
}
