"use client";

/**
 * Editor: create or edit an entry in any section.
 * Fields come from the section's config; the body is Markdown/MDX with a live preview.
 * Used in: /admin/new and /admin/edit/[section]/[slug].
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  SLUG_PATTERN,
  entryUrl,
  sectionList,
  sectionSchemas,
  sections,
  slugify,
  type FieldDef,
  type SectionId,
} from "@/lib/content/sections";
import { cn } from "@/lib/utils";

type FormValues = Record<string, string | boolean>;

interface EditorProps {
  mode: "create" | "update";
  initialSection: SectionId;
  initialSlug?: string;
  initialData?: Record<string, unknown>;
  initialBody?: string;
  existingSlugs: Partial<Record<SectionId, string[]>>;
  storage: "github" | "local" | null;
}

interface Result {
  kind: "success" | "error";
  message: string;
  url?: string;
  issues?: string;
}

function today() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function toFormValues(fields: FieldDef[], data: Record<string, unknown> = {}): FormValues {
  const values: FormValues = {};

  for (const field of fields) {
    const value = data[field.name];

    switch (field.type) {
      case "boolean":
        values[field.name] = value === true;
        break;
      case "tags":
        values[field.name] = Array.isArray(value) ? value.join(", ") : "";
        break;
      case "links":
        values[field.name] = Array.isArray(value)
          ? value
              .map((link: { label?: string; href?: string }) => `${link.label ?? ""} | ${link.href ?? ""}`)
              .join("\n")
          : "";
        break;
      case "date":
        values[field.name] = typeof value === "string" && value ? value : today();
        break;
      case "number":
        values[field.name] = typeof value === "number" ? String(value) : "";
        break;
      default:
        values[field.name] = typeof value === "string" ? value : "";
    }
  }

  return values;
}

function fromFormValues(fields: FieldDef[], values: FormValues) {
  const data: Record<string, unknown> = {};

  for (const field of fields) {
    const value = values[field.name];

    if (field.type === "boolean") {
      data[field.name] = value === true;
    } else if (field.type === "tags") {
      data[field.name] = String(value ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    } else if (field.type === "links") {
      data[field.name] = String(value ?? "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [label, ...rest] = line.split("|");
          return { label: label.trim(), href: rest.join("|").trim() };
        });
    } else {
      const text = String(value ?? "").trim();
      if (text) data[field.name] = field.type === "number" ? Number(text) : text;
    }
  }

  return data;
}

function stripMdxComments(source: string) {
  return source.replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
}

async function uploadImage(file: File) {
  const form = new FormData();
  form.append("file", file);
  const response = await fetch("/api/admin/upload", { method: "POST", body: form });
  const payload = (await response.json().catch(() => ({}))) as { url?: string; error?: string };

  if (!response.ok || !payload.url) {
    throw new Error(payload.error ?? "Upload failed");
  }

  return payload.url;
}

export function Editor({
  mode,
  initialSection,
  initialSlug = "",
  initialData,
  initialBody = "",
  existingSlugs,
  storage,
}: EditorProps) {
  const router = useRouter();
  const [sectionId, setSectionId] = useState<SectionId>(initialSection);
  const section = sections[sectionId];
  const [values, setValues] = useState<FormValues>(() =>
    toFormValues(sections[initialSection].fields, initialData),
  );
  const [body, setBody] = useState(initialBody);
  const [slug, setSlug] = useState(
    sections[initialSection].kind === "single" ? initialSection : initialSlug,
  );
  const [slugTouched, setSlugTouched] = useState(mode === "update");
  const [pane, setPane] = useState<"write" | "preview">("write");
  const [pending, setPending] = useState<"draft" | "publish" | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const supportsDraft = "draft" in sectionSchemas[sectionId].shape;
  const wasDraft = initialData?.draft === true;
  const words = useMemo(() => body.trim().split(/\s+/).filter(Boolean).length, [body]);
  const minutes = Math.max(1, Math.round(words / 200));

  const slugValid = SLUG_PATTERN.test(slug);
  const slugTaken =
    mode === "create" && section.kind === "collection" && (existingSlugs[sectionId] ?? []).includes(slug);

  function changeSection(next: SectionId) {
    if (sections[next].kind === "single" && (existingSlugs[next] ?? []).includes(next)) {
      router.push(`/admin/edit/${next}/${next}`);
      return;
    }

    const title = values.title;
    setSectionId(next);
    setValues({ ...toFormValues(sections[next].fields), ...(title !== undefined ? { title } : {}) });
    if (sections[next].kind === "single") {
      setSlug(next);
    } else if (!slugTouched) {
      setSlug(slugify(String(title ?? "")));
    }
    setResult(null);
  }

  function setField(name: string, value: string | boolean) {
    setValues((current) => ({ ...current, [name]: value }));

    if (name === "title" && !slugTouched && section.kind === "collection") {
      setSlug(slugify(String(value)));
    }
  }

  function insertAtCursor(text: string) {
    const textarea = bodyRef.current;
    const start = textarea?.selectionStart ?? body.length;
    const end = textarea?.selectionEnd ?? body.length;
    const next = `${body.slice(0, start)}${text}${body.slice(end)}`;
    setBody(next);

    requestAnimationFrame(() => {
      textarea?.focus();
      textarea?.setSelectionRange(start + text.length, start + text.length);
    });
  }

  async function handleBodyImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    setResult(null);
    try {
      const url = await uploadImage(file);
      const alt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
      insertAtCursor(`\n![${alt}](${url})\n`);
    } catch (error) {
      setResult({ kind: "error", message: error instanceof Error ? error.message : "Upload failed" });
    } finally {
      setUploading(false);
    }
  }

  async function handleFieldImage(name: string, event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    setResult(null);
    try {
      setField(name, await uploadImage(file));
    } catch (error) {
      setResult({ kind: "error", message: error instanceof Error ? error.message : "Upload failed" });
    } finally {
      setUploading(false);
    }
  }

  async function save(draft: boolean) {
    if (!slugValid || slugTaken) return;

    setPending(draft ? "draft" : "publish");
    setResult(null);

    const response = await fetch(`/api/admin/content/${sectionId}/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: fromFormValues(section.fields, values), body, mode, draft }),
    }).catch(() => null);

    const payload = (await response?.json().catch(() => null)) as {
      error?: string;
      issues?: string;
      url?: string;
      storage?: "github" | "local";
    } | null;

    setPending(null);

    if (!response?.ok || !payload?.url) {
      setResult({
        kind: "error",
        message: payload?.error ?? "Couldn't save. Check your connection and try again.",
        issues: payload?.issues,
      });
      return;
    }

    const live = payload.storage === "github";
    setResult({
      kind: "success",
      url: payload.url,
      message: draft
        ? live
          ? "Draft committed. It won't appear on the live site."
          : "Draft saved. It's visible locally but hidden in production."
        : live
          ? "Published — live in ~1–2 min, once Vercel finishes redeploying."
          : "Saved locally.",
    });

    if (mode === "create") {
      router.replace(`/admin/edit/${sectionId}/${slug}`);
    }
    router.refresh();
  }

  const labelClass = "block space-y-1.5 text-sm font-medium";
  const tabClass = (active: boolean) =>
    cn(
      "-mb-px border-b-2 border-transparent px-1 pb-2 text-sm font-semibold text-muted",
      active && "border-accent text-foreground",
    );

  return (
    <form
      className="space-y-8"
      onSubmit={(event) => {
        event.preventDefault();
        save(false);
      }}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <label className={labelClass}>
          <span>Section</span>
          <select
            className="field"
            value={sectionId}
            disabled={mode === "update"}
            onChange={(event) => changeSection(event.target.value as SectionId)}
          >
            {sectionList.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        {section.kind === "collection" ? (
          <label className={labelClass}>
            <span>Slug</span>
            <input
              className="field font-mono text-sm"
              value={slug}
              disabled={mode === "update"}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value.toLowerCase());
              }}
              aria-invalid={!slugValid || slugTaken}
              aria-describedby="slug-help"
            />
            <span id="slug-help" className="block text-xs font-normal text-muted">
              {slugTaken ? (
                <span className="text-red-700 dark:text-red-400">That slug is already used in {section.label}.</span>
              ) : !slugValid && slug ? (
                <span className="text-red-700 dark:text-red-400">Use a–z, 0–9 and single hyphens.</span>
              ) : (
                <>URL: {entryUrl(section, slug || "your-slug")}</>
              )}
            </span>
          </label>
        ) : null}

        {section.fields.map((field) => {
          const id = `field-${field.name}`;
          const value = values[field.name];
          const wide = field.type === "textarea" || field.type === "links";

          if (field.type === "boolean") {
            return (
              <label key={field.name} className="flex items-center gap-3 text-sm font-medium md:col-span-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--accent)]"
                  checked={value === true}
                  onChange={(event) => setField(field.name, event.target.checked)}
                />
                {field.label}
              </label>
            );
          }

          return (
            <label key={field.name} htmlFor={id} className={cn(labelClass, wide && "md:col-span-2")}>
              <span>
                {field.label}
                {field.required ? <span className="text-accent"> *</span> : null}
              </span>
              {field.type === "textarea" || field.type === "links" ? (
                <textarea
                  id={id}
                  rows={field.type === "links" ? 3 : 2}
                  className="field"
                  value={String(value ?? "")}
                  required={field.required}
                  placeholder={field.type === "links" ? "GitHub | https://github.com/…" : undefined}
                  onChange={(event) => setField(field.name, event.target.value)}
                />
              ) : field.type === "image" ? (
                <span className="flex gap-2">
                  <input
                    id={id}
                    className="field"
                    value={String(value ?? "")}
                    placeholder="/uploads/…"
                    onChange={(event) => setField(field.name, event.target.value)}
                  />
                  <span className="relative inline-flex shrink-0 cursor-pointer items-center rounded-lg border px-3 text-sm hover:border-accent">
                    Upload
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="absolute inset-0 cursor-pointer opacity-0"
                      aria-label={`Upload ${field.label.toLowerCase()}`}
                      onChange={(event) => handleFieldImage(field.name, event)}
                    />
                  </span>
                </span>
              ) : (
                <input
                  id={id}
                  type={field.type === "date" || field.type === "number" ? field.type : "text"}
                  className="field"
                  value={String(value ?? "")}
                  required={field.required}
                  onChange={(event) => setField(field.name, event.target.value)}
                />
              )}
              {field.help ? <span className="block text-xs font-normal text-muted">{field.help}</span> : null}
            </label>
          );
        })}
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b">
          <div className="flex gap-4 lg:hidden" role="tablist" aria-label="Editor view">
            <button type="button" role="tab" aria-selected={pane === "write"} className={tabClass(pane === "write")} onClick={() => setPane("write")}>
              Write
            </button>
            <button type="button" role="tab" aria-selected={pane === "preview"} className={tabClass(pane === "preview")} onClick={() => setPane("preview")}>
              Preview
            </button>
          </div>
          <p className="hidden pb-2 text-sm font-semibold lg:block">Body</p>
          <div className="flex items-center gap-4 pb-2 text-xs text-muted">
            <span>
              {words} words · {minutes} min read
            </span>
            <span className="relative inline-flex cursor-pointer items-center rounded-md border px-2 py-1 font-medium text-foreground hover:border-accent">
              {uploading ? "Uploading…" : "Insert image"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="absolute inset-0 cursor-pointer opacity-0"
                aria-label="Insert image into body"
                disabled={uploading}
                onChange={handleBodyImage}
              />
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <textarea
            ref={bodyRef}
            aria-label="Body (Markdown or MDX)"
            className={cn("field min-h-[28rem] font-mono text-sm leading-6", pane !== "write" && "hidden lg:block")}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder={"Write in Markdown. Use ## for headings, - for lists, **bold**, [links](https://…)."}
          />
          <div
            aria-label="Preview"
            className={cn("card min-h-[28rem] overflow-auto p-6", pane !== "preview" && "hidden lg:block")}
          >
            {body.trim() ? (
              <div className="rich-text">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{stripMdxComments(body)}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm text-muted">The preview appears here.</p>
            )}
            {storage === "github" && body.includes("](/uploads/") ? (
              <p className="mt-6 text-xs text-muted">
                Newly uploaded images show up after the next deploy.
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {result ? (
        <div
          role={result.kind === "error" ? "alert" : "status"}
          className={cn(
            "rounded-xl border p-4 text-sm",
            result.kind === "error" ? "border-red-500/40 text-red-700 dark:text-red-400" : "border-accent/40",
          )}
        >
          <p className="font-medium">{result.message}</p>
          {result.url ? (
            <Link href={result.url} className="mt-1 inline-block font-semibold text-accent hover:underline">
              View {result.url}
            </Link>
          ) : null}
          {result.issues ? <pre className="mt-2 whitespace-pre-wrap text-xs">{result.issues}</pre> : null}
        </div>
      ) : null}

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center justify-end gap-3 border-t bg-background/95 px-4 py-4 backdrop-blur sm:mx-0 sm:px-0">
        {supportsDraft ? (
          <button
            type="button"
            onClick={() => save(true)}
            disabled={pending !== null || !slugValid || slugTaken}
            className="rounded-full border px-5 py-2.5 text-sm font-semibold hover:border-accent hover:text-accent disabled:opacity-50"
          >
            {pending === "draft" ? "Saving…" : "Save draft"}
          </button>
        ) : null}
        <button
          type="submit"
          disabled={pending !== null || !slugValid || slugTaken}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-50"
        >
          {pending === "publish" ? "Publishing…" : mode === "update" && !wasDraft ? "Update" : "Publish"}
        </button>
      </div>
    </form>
  );
}
