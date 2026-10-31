"use client";

/**
 * Editor: create or edit an entry in any section.
 * - Fields come from the section's config; the body is Markdown/MDX with a live preview that
 *   uses the site's real prose styles (two panes on desktop, tabs on mobile).
 * - Sticky bar with section, status, word count, Save draft and Publish.
 * - Markdown toolbar with shortcuts: Ctrl/Cmd+B, I, K, and S (save draft).
 * - Images upload from the toolbar, by drag-and-drop or by paste, with progress and an inline
 *   placeholder until the upload finishes.
 * - A local copy autosaves to localStorage every few seconds and can be restored; leaving with
 *   unsaved changes asks first.
 * Used in: /admin/new and /admin/edit/[section]/[slug].
 */
import { useRouter } from "next/navigation";
import {
  Bold,
  Code,
  Heading2,
  ImagePlus,
  Italic,
  Link2,
  List,
  Quote,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { journeyKindIcons } from "@/components/journey/kind-icons";
import { useToast } from "@/components/admin/toast";
import {
  SLUG_PATTERN,
  entryUrl,
  sectionList,
  sectionSchemas,
  sections,
  slugify,
  type FieldDef,
  type JourneyKind,
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

interface LocalDraft {
  sectionId: SectionId;
  slug: string;
  values: FormValues;
  body: string;
  savedAt: number;
}

const AUTOSAVE_MS = 3000;
const IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/gif";

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
      case "select":
        values[field.name] = typeof value === "string" && value ? value : (field.options?.[0]?.value ?? "");
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

/** Uploads one image to /api/admin/upload, reporting progress (0–1). */
function uploadImage(file: File, onProgress: (fraction: number) => void) {
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/upload");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    };
    xhr.onload = () => {
      let payload: { url?: string; error?: string } = {};
      try {
        payload = JSON.parse(xhr.responseText);
      } catch {}
      if (xhr.status >= 200 && xhr.status < 300 && payload.url) resolve(payload.url);
      else reject(new Error(payload.error ?? "Upload failed"));
    };
    xhr.onerror = () => reject(new Error("Upload failed. Check your connection."));
    const form = new FormData();
    form.append("file", file);
    xhr.send(form);
  });
}

function readLocalDraft(key: string): LocalDraft | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as LocalDraft) : null;
  } catch {
    return null;
  }
}

function writeLocalDraft(key: string, draft: LocalDraft | null) {
  try {
    if (draft) window.localStorage.setItem(key, JSON.stringify(draft));
    else window.localStorage.removeItem(key);
  } catch {
    // Storage can be full or blocked (private mode); autosave is best-effort.
  }
}

function timeAgo(timestamp: number) {
  const minutes = Math.round((Date.now() - timestamp) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return new Date(timestamp).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

const isMac = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

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
  const toast = useToast();
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
  const [uploads, setUploads] = useState<Record<string, number>>({});
  const [issues, setIssues] = useState<{ message: string; issues?: string } | null>(null);
  const [status, setStatus] = useState<"new" | "draft" | "published">(
    mode === "create" ? "new" : initialData?.draft === true ? "draft" : "published",
  );
  const [restore, setRestore] = useState<LocalDraft | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [dragging, setDragging] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const storageKey = `admin-editor:${mode === "create" ? `new/${initialSection}` : `${initialSection}/${initialSlug}`}`;
  const snapshot = JSON.stringify({ sectionId, slug, values, body });
  const [savedSnapshot, setSavedSnapshot] = useState(snapshot);
  const dirty = snapshot !== savedSnapshot;

  const supportsDraft = "draft" in sectionSchemas[sectionId].shape;
  const words = useMemo(() => body.trim().split(/\s+/).filter(Boolean).length, [body]);
  const minutes = Math.max(1, Math.round(words / 200));
  const uploading = Object.keys(uploads).length;
  const uploadProgress = uploading
    ? Math.round((Object.values(uploads).reduce((sum, value) => sum + value, 0) / uploading) * 100)
    : 0;

  const slugValid = SLUG_PATTERN.test(slug);
  const slugTaken =
    mode === "create" && section.kind === "collection" && (existingSlugs[sectionId] ?? []).includes(slug);
  const canSave = pending === null && slugValid && !slugTaken && uploading === 0;

  // Offer to restore a local copy that differs from what was loaded.
  useEffect(() => {
    const draft = readLocalDraft(storageKey);
    if (!draft) return;
    const same =
      JSON.stringify({ sectionId: draft.sectionId, slug: draft.slug, values: draft.values, body: draft.body }) ===
      savedSnapshot;
    if (same) writeLocalDraft(storageKey, null);
    // Deferred so the banner appears after hydration without a cascading render.
    else window.setTimeout(() => setRestore(draft), 0);
    // Only on first load for this entry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // Autosave a local copy while there are unsaved changes.
  useEffect(() => {
    if (!dirty || restore) return;
    const timer = window.setTimeout(() => {
      writeLocalDraft(storageKey, { sectionId, slug, values, body, savedAt: Date.now() });
    }, AUTOSAVE_MS);
    return () => window.clearTimeout(timer);
  }, [dirty, restore, storageKey, sectionId, slug, values, body]);

  // Warn before closing or reloading the tab with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function applyRestore() {
    if (!restore) return;
    setSectionId(restore.sectionId);
    setSlug(restore.slug);
    setValues(restore.values);
    setBody(restore.body);
    setSlugTouched(true);
    setRestore(null);
    toast({ kind: "success", message: "Restored your local draft." });
  }

  function discardRestore() {
    writeLocalDraft(storageKey, null);
    setRestore(null);
    setConfirmDiscard(false);
  }

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
    setIssues(null);
  }

  function setField(name: string, value: string | boolean) {
    setValues((current) => ({ ...current, [name]: value }));

    if (name === "title" && !slugTouched && section.kind === "collection") {
      setSlug(slugify(String(value)));
    }
  }

  /** Replaces the current selection (or inserts at the cursor) and reselects a range in the result. */
  const replaceSelection = useCallback(
    (build: (selected: string) => { text: string; select?: [number, number] }) => {
      const textarea = bodyRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const { text, select } = build(body.slice(start, end));
      setBody(`${body.slice(0, start)}${text}${body.slice(end)}`);

      requestAnimationFrame(() => {
        textarea.focus();
        const [from, to] = select ?? [text.length, text.length];
        textarea.setSelectionRange(start + from, start + to);
      });
    },
    [body],
  );

  function wrap(before: string, after: string, placeholder: string) {
    replaceSelection((selected) => {
      const inner = selected || placeholder;
      return { text: `${before}${inner}${after}`, select: [before.length, before.length + inner.length] };
    });
  }

  function prefixLines(prefix: string, placeholder: string) {
    const textarea = bodyRef.current;
    if (!textarea) return;
    // Extend the selection to whole lines so the prefix lands at the start of each.
    const lineStart = body.lastIndexOf("\n", textarea.selectionStart - 1) + 1;
    textarea.setSelectionRange(lineStart, textarea.selectionEnd);
    replaceSelection((selected) => {
      const text = (selected || placeholder)
        .split("\n")
        .map((line) => `${prefix}${line}`)
        .join("\n");
      return { text, select: [prefix.length, text.length] };
    });
  }

  function insertLink() {
    replaceSelection((selected) => {
      const label = selected || "link text";
      const text = `[${label}](https://)`;
      // Select the URL so it can be typed straight away.
      return { text, select: [label.length + 3, text.length - 1] };
    });
  }

  function insertCode() {
    replaceSelection((selected) =>
      selected.includes("\n")
        ? { text: `\n\`\`\`\n${selected}\n\`\`\`\n`, select: [5, 5 + selected.length] }
        : { text: `\`${selected || "code"}\``, select: [1, 1 + (selected || "code").length] },
    );
  }

  async function uploadIntoBody(files: File[]) {
    const images = files.filter((file) => IMAGE_TYPES.split(",").includes(file.type));
    if (images.length === 0) {
      if (files.length > 0) toast({ kind: "error", message: "Only JPG, PNG, WebP and GIF images can be uploaded." });
      return;
    }

    for (const file of images) {
      const id = Math.random().toString(36).slice(2, 8);
      const alt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
      const placeholder = `![Uploading ${alt}…](uploading-${id})`;

      replaceSelection(() => ({ text: `\n${placeholder}\n` }));
      setUploads((current) => ({ ...current, [id]: 0 }));

      try {
        const url = await uploadImage(file, (fraction) =>
          setUploads((current) => (id in current ? { ...current, [id]: fraction } : current)),
        );
        setBody((current) => current.replace(placeholder, `![${alt}](${url})`));
      } catch (error) {
        setBody((current) => current.replace(`\n${placeholder}\n`, "\n").replace(placeholder, ""));
        toast({ kind: "error", message: error instanceof Error ? error.message : "Upload failed" });
      } finally {
        setUploads((current) => {
          const next = { ...current };
          delete next[id];
          return next;
        });
      }
    }
  }

  async function handleFieldImage(name: string, event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploads((current) => ({ ...current, [name]: 0 }));
    try {
      setField(name, await uploadImage(file, (fraction) => setUploads((current) => ({ ...current, [name]: fraction }))));
    } catch (error) {
      toast({ kind: "error", message: error instanceof Error ? error.message : "Upload failed" });
    } finally {
      setUploads((current) => {
        const next = { ...current };
        delete next[name];
        return next;
      });
    }
  }

  async function save(draft: boolean) {
    if (!canSave) return;

    setPending(draft ? "draft" : "publish");
    setIssues(null);

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
      const message = payload?.error ?? "Couldn't save. Check your connection and try again.";
      setIssues({ message, issues: payload?.issues });
      toast({ kind: "error", message });
      return;
    }

    const live = payload.storage === "github";
    setSavedSnapshot(snapshot);
    setStatus(draft ? "draft" : "published");
    writeLocalDraft(storageKey, null);
    toast({
      kind: "success",
      link: draft && live ? undefined : { href: payload.url, label: `View ${payload.url}` },
      message: draft
        ? live
          ? "Draft committed. It won't appear on the live site."
          : "Draft saved. It's visible locally but hidden in production."
        : live
          ? "Published — live in ~1–2 min"
          : "Saved locally.",
    });

    if (mode === "create") {
      router.replace(`/admin/edit/${sectionId}/${slug}`);
    }
    router.refresh();
  }

  function onBodyKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!(event.metaKey || event.ctrlKey) || event.altKey) return;
    const key = event.key.toLowerCase();

    if (key === "b") {
      event.preventDefault();
      wrap("**", "**", "bold text");
    } else if (key === "i") {
      event.preventDefault();
      wrap("_", "_", "italic text");
    } else if (key === "k") {
      event.preventDefault();
      insertLink();
    }
  }

  // Ctrl/Cmd+S saves a draft from anywhere in the editor.
  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  });
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "s") return;
      event.preventDefault();
      if (supportsDraft) saveRef.current(true);
      else toast({ kind: "error", message: `${section.label} has no drafts — use Publish to save.` });
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [supportsDraft, section.label, toast]);

  const mod = isMac() ? "⌘" : "Ctrl+";
  const toolbar = [
    { id: "bold", label: "Bold", shortcut: `${mod}B`, icon: Bold },
    { id: "italic", label: "Italic", shortcut: `${mod}I`, icon: Italic },
    { id: "heading", label: "Heading", icon: Heading2 },
    { id: "link", label: "Link", shortcut: `${mod}K`, icon: Link2 },
    { id: "list", label: "List", icon: List },
    { id: "quote", label: "Quote", icon: Quote },
    { id: "code", label: "Code", icon: Code },
    { id: "image", label: "Image", icon: ImagePlus },
  ] as const;

  function runTool(id: (typeof toolbar)[number]["id"]) {
    if (id === "bold") wrap("**", "**", "bold text");
    else if (id === "italic") wrap("_", "_", "italic text");
    else if (id === "heading") prefixLines("## ", "Heading");
    else if (id === "link") insertLink();
    else if (id === "list") prefixLines("- ", "List item");
    else if (id === "quote") prefixLines("> ", "Quote");
    else if (id === "code") insertCode();
    else fileRef.current?.click();
  }

  const statusLabel = { new: "New", draft: "Draft", published: "Published" }[status];
  const publishLabel = pending === "publish" ? "Publishing…" : status === "published" ? "Update" : "Publish";
  const tabClass = (active: boolean) =>
    cn(
      "-mb-px inline-flex min-h-11 items-center border-b border-transparent px-1 text-small font-medium text-muted",
      active && "border-foreground text-foreground",
    );

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        save(false);
      }}
    >
      <div className="sticky top-header z-30 -mx-gutter flex flex-wrap items-center gap-x-4 gap-y-2 border-b bg-[var(--header-bg)] px-gutter py-3 backdrop-blur-md">
        <div className="flex min-w-0 items-center gap-2 text-small">
          <span className="font-medium">{section.label}</span>
          <span
            className={cn(
              "tag",
              status === "published" && "border-accent/30 bg-accent-soft text-accent",
              status !== "published" && "bg-transparent",
            )}
          >
            {statusLabel}
          </span>
          {dirty ? (
            <span className="flex items-center gap-1.5 text-caption text-subtle">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-subtle" />
              Unsaved
            </span>
          ) : null}
        </div>
        <span className="meta hidden sm:inline">
          {words} words · {minutes} min read
        </span>
        {uploading ? (
          <span className="meta" role="status">
            Uploading {uploading > 1 ? `${uploading} images` : "image"}… {uploadProgress}%
          </span>
        ) : null}
        <div className="ml-auto flex gap-2">
          {supportsDraft ? (
            <button
              type="button"
              onClick={() => save(true)}
              disabled={!canSave}
              className="btn btn-secondary"
              title={`Save draft (${mod}S)`}
            >
              {pending === "draft" ? "Saving…" : "Save draft"}
            </button>
          ) : null}
          <button type="submit" disabled={!canSave} className="btn btn-primary">
            {publishLabel}
          </button>
        </div>
      </div>

      {restore ? (
        <div role="status" className="card flex flex-col gap-3 p-4 text-small sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="font-medium">You have unsaved local changes</span>{" "}
            <span className="text-muted">from {timeAgo(restore.savedAt)}.</span>
          </p>
          <div className="flex gap-2">
            <button type="button" className="btn btn-ghost" onClick={() => setConfirmDiscard(true)}>
              Discard
            </button>
            <button type="button" className="btn btn-primary" onClick={applyRestore}>
              Restore
            </button>
          </div>
        </div>
      ) : null}

      {issues ? (
        <div role="alert" className="card border-danger/40 p-4 text-small text-danger">
          <p className="font-medium">{issues.message}</p>
          {issues.issues ? <pre className="mt-2 whitespace-pre-wrap font-mono text-caption">{issues.issues}</pre> : null}
        </div>
      ) : null}

      <fieldset className="card grid gap-5 p-5 sm:p-6 md:grid-cols-2">
        <legend className="sr-only">Details</legend>
        <div>
          <label htmlFor="field-section" className="label">
            Section
          </label>
          <select
            id="field-section"
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
        </div>

        {section.kind === "collection" ? (
          <div>
            <label htmlFor="field-slug" className="label">
              Slug
            </label>
            <input
              id="field-slug"
              className="field font-mono text-small"
              value={slug}
              disabled={mode === "update"}
              autoCapitalize="none"
              spellCheck={false}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value.toLowerCase());
              }}
              aria-invalid={!slugValid || slugTaken}
              aria-describedby="slug-help"
            />
            <p id="slug-help" className={cn("mt-1.5 text-caption", slugTaken || (!slugValid && slug) ? "text-danger" : "text-subtle")}>
              {slugTaken
                ? `That slug is already used in ${section.label}.`
                : !slugValid && slug
                  ? "Use a–z, 0–9 and single hyphens."
                  : `URL: ${entryUrl(section, slug || "your-slug")}`}
            </p>
          </div>
        ) : null}

        {section.fields.map((field) => {
          const id = `field-${field.name}`;
          const value = values[field.name];
          const wide = field.type === "textarea" || field.type === "links";
          const SelectIcon =
            field.iconSet === "journeyKind" ? journeyKindIcons[String(value) as JourneyKind] : undefined;

          if (field.type === "boolean") {
            return (
              <label key={field.name} className="flex min-h-11 items-center gap-3 text-small font-medium md:col-span-2">
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
            <div key={field.name} className={cn(wide && "md:col-span-2")}>
              <label htmlFor={id} className="label">
                {field.label}
                {field.required ? <span className="text-subtle"> *</span> : null}
              </label>
              {field.type === "textarea" || field.type === "links" ? (
                <textarea
                  id={id}
                  rows={field.type === "links" ? 3 : 2}
                  className="field"
                  value={String(value ?? "")}
                  required={field.required}
                  placeholder={field.placeholder ?? (field.type === "links" ? "GitHub | https://github.com/…" : undefined)}
                  onChange={(event) => setField(field.name, event.target.value)}
                />
              ) : field.type === "select" ? (
                <div className="relative">
                  {SelectIcon ? (
                    <SelectIcon
                      aria-hidden="true"
                      className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted"
                    />
                  ) : null}
                  <select
                    id={id}
                    className={cn("field", SelectIcon && "pl-9")}
                    value={String(value ?? "")}
                    required={field.required}
                    onChange={(event) => setField(field.name, event.target.value)}
                  >
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : field.type === "image" ? (
                <div className="flex gap-2">
                  <input
                    id={id}
                    className="field"
                    value={String(value ?? "")}
                    placeholder="/uploads/…"
                    onChange={(event) => setField(field.name, event.target.value)}
                  />
                  <label className="btn btn-secondary relative shrink-0 cursor-pointer">
                    {field.name in uploads ? `${Math.round(uploads[field.name] * 100)}%` : "Upload"}
                    <input
                      type="file"
                      accept={IMAGE_TYPES}
                      className="absolute inset-0 cursor-pointer opacity-0"
                      aria-label={`Upload ${field.label.toLowerCase()}`}
                      onChange={(event) => handleFieldImage(field.name, event)}
                    />
                  </label>
                </div>
              ) : (
                <input
                  id={id}
                  type={field.type === "date" || field.type === "number" ? field.type : "text"}
                  className="field"
                  value={String(value ?? "")}
                  required={field.required}
                  placeholder={field.placeholder}
                  onChange={(event) => setField(field.name, event.target.value)}
                />
              )}
              {field.help || field.lengthGuide ? (
                <div className="mt-1.5 flex justify-between gap-4 text-caption text-subtle">
                  {field.help ? <p>{field.help}</p> : <span />}
                  {field.lengthGuide ? (
                    <p
                      className={cn(
                        "tabular shrink-0",
                        String(value ?? "").length > field.lengthGuide && "text-danger",
                      )}
                    >
                      {String(value ?? "").length} / {field.lengthGuide}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </fieldset>

      <div className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2 border-b">
          <div className="flex gap-4 lg:hidden" role="tablist" aria-label="Editor view">
            <button type="button" role="tab" aria-selected={pane === "write"} className={tabClass(pane === "write")} onClick={() => setPane("write")}>
              Write
            </button>
            <button type="button" role="tab" aria-selected={pane === "preview"} className={tabClass(pane === "preview")} onClick={() => setPane("preview")}>
              Preview
            </button>
          </div>
          <p className="hidden min-h-11 items-center text-small font-medium lg:flex">Body</p>
          {section.bodyGuide ? (
            <span
              className={cn("meta pb-2 lg:ml-auto lg:pb-0 lg:self-center", body.trim().length > section.bodyGuide && "text-danger")}
            >
              {body.trim().length} / ~{section.bodyGuide} characters
            </span>
          ) : null}
          <span className="meta pb-2 sm:hidden">
            {words} words · {minutes} min
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className={cn("card overflow-hidden", pane !== "write" && "hidden lg:block")}>
            <div role="toolbar" aria-label="Formatting" className="flex flex-wrap gap-0.5 border-b bg-surface-muted p-1.5">
              {toolbar.map((tool) => (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => runTool(tool.id)}
                  className="btn btn-ghost btn-icon"
                  aria-label={"shortcut" in tool ? `${tool.label} (${tool.shortcut})` : tool.label}
                  title={"shortcut" in tool ? `${tool.label} (${tool.shortcut})` : tool.label}
                >
                  <tool.icon aria-hidden="true" />
                </button>
              ))}
              <input
                ref={fileRef}
                type="file"
                accept={IMAGE_TYPES}
                multiple
                className="hidden"
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? []);
                  event.target.value = "";
                  uploadIntoBody(files);
                }}
              />
            </div>
            <textarea
              ref={bodyRef}
              aria-label="Body (Markdown or MDX)"
              className={cn(
                "block min-h-[60vh] w-full resize-y bg-surface p-4 font-mono text-small leading-relaxed text-foreground outline-none lg:min-h-[32rem]",
                dragging && "bg-accent-soft",
              )}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              onKeyDown={onBodyKeyDown}
              onPaste={(event) => {
                const files = Array.from(event.clipboardData.files);
                if (files.length > 0) {
                  event.preventDefault();
                  uploadIntoBody(files);
                }
              }}
              onDragOver={(event) => {
                if (event.dataTransfer.types.includes("Files")) {
                  event.preventDefault();
                  setDragging(true);
                }
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                if (event.dataTransfer.files.length === 0) return;
                event.preventDefault();
                setDragging(false);
                uploadIntoBody(Array.from(event.dataTransfer.files));
              }}
              placeholder={"Write in Markdown. Use ## for headings, - for lists, **bold**, [links](https://…).\nDrop or paste images to upload them."}
            />
          </div>
          <div
            aria-label="Preview"
            className={cn("card min-h-[60vh] overflow-auto p-6 lg:min-h-[32rem]", pane !== "preview" && "hidden lg:block")}
          >
            {body.trim() ? (
              <div className="rich-text">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{stripMdxComments(body)}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-small text-subtle">The preview appears here.</p>
            )}
            {storage === "github" && body.includes("](/uploads/") ? (
              <p className="meta mt-6">Newly uploaded images show up after the next deploy.</p>
            ) : null}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDiscard}
        title="Discard local changes?"
        body="The copy saved in this browser will be deleted. What's in the repository stays as it is."
        confirmLabel="Discard"
        destructive
        onConfirm={discardRestore}
        onCancel={() => setConfirmDiscard(false)}
      />
    </form>
  );
}
