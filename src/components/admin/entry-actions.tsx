"use client";

/**
 * EntryActions: Edit / Unpublish (or Publish) / Delete for one dashboard row.
 * Delete asks for confirmation in a dialog; results are shown as toasts.
 * Used in: /admin dashboard (ContentTable).
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { useToast } from "@/components/admin/toast";

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
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const endpoint = `/api/admin/content/${section}/${slug}`;

  async function run(request: Promise<Response>, done: string) {
    setBusy(true);
    const response = await request.catch(() => null);
    const payload = (await response?.json().catch(() => null)) as { error?: string } | null;
    setBusy(false);

    if (!response?.ok) {
      toast({ kind: "error", message: payload?.error ?? "Request failed" });
      return;
    }

    toast({ kind: "success", message: done });
    router.refresh();
  }

  function toggleDraft() {
    run(
      fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft: !draft }),
      }),
      draft ? `Published “${title}” — live in ~1–2 min` : `Unpublished “${title}”`,
    );
  }

  function remove() {
    setConfirming(false);
    run(fetch(endpoint, { method: "DELETE" }), `Deleted “${title}”`);
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-1 sm:justify-end">
      <Link href={`/admin/edit/${section}/${slug}`} className="btn btn-secondary px-3">
        Edit
      </Link>
      {canDraft ? (
        <button type="button" onClick={toggleDraft} disabled={busy} className="btn btn-ghost px-3">
          {draft ? "Publish" : "Unpublish"}
        </button>
      ) : null}
      {canDelete ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          disabled={busy}
          className="btn btn-ghost px-3 text-danger hover:text-danger"
        >
          Delete
        </button>
      ) : null}
      <ConfirmDialog
        open={confirming}
        title={`Delete “${title}”?`}
        body="This commits a deletion to the repository. You can restore it from Git history, but not from here."
        confirmLabel="Delete"
        destructive
        onConfirm={remove}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
