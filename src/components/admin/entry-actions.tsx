"use client";

/**
 * EntryActions: Edit / Unpublish (or Publish) / Delete for one dashboard row.
 * Used in: /admin dashboard.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface EntryActionsProps {
  section: string;
  slug: string;
  title: string;
  draft: boolean;
  canDraft: boolean;
  canDelete: boolean;
}

export function EntryActions({ section, slug, title, draft, canDraft, canDelete }: EntryActionsProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const endpoint = `/api/admin/content/${section}/${slug}`;

  async function run(request: Promise<Response>, done: string) {
    setBusy(true);
    setMessage("");
    const response = await request.catch(() => null);
    const payload = (await response?.json().catch(() => null)) as { error?: string } | null;
    setBusy(false);

    if (!response?.ok) {
      setMessage(payload?.error ?? "Request failed");
      return;
    }

    setMessage(done);
    router.refresh();
  }

  function toggleDraft() {
    run(
      fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft: !draft }),
      }),
      draft ? "Published" : "Unpublished",
    );
  }

  function remove() {
    if (!window.confirm(`Delete "${title}"? This commits a deletion to the repo.`)) return;
    run(fetch(endpoint, { method: "DELETE" }), "Deleted");
  }

  const button = "rounded-md px-2 py-1 text-sm font-medium hover:bg-accent-soft disabled:opacity-50";

  return (
    <div className="flex flex-wrap items-center gap-1">
      <Link href={`/admin/edit/${section}/${slug}`} className={`${button} text-accent`}>
        Edit
      </Link>
      {canDraft ? (
        <button type="button" onClick={toggleDraft} disabled={busy} className={button}>
          {draft ? "Publish" : "Unpublish"}
        </button>
      ) : null}
      {canDelete ? (
        <button
          type="button"
          onClick={remove}
          disabled={busy}
          className={`${button} text-red-700 dark:text-red-400`}
        >
          Delete
        </button>
      ) : null}
      {message ? (
        <span role="status" className="text-xs text-muted">
          {message}
        </span>
      ) : null}
    </div>
  );
}
