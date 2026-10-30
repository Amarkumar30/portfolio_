"use client";

/**
 * AdminBar: page title, "New" button and logout.
 * Used in: all admin pages except login.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";

export function AdminBar({ title, storage }: { title: string; storage: "github" | "local" | null }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b pb-6">
      <div className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold">{title}</h1>
        {storage ? (
          <p className="text-sm text-muted">
            {storage === "github"
              ? "Publishing to GitHub — changes go live after Vercel redeploys (~1–2 min)."
              : "Local mode — files are written to this machine's working tree."}
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/admin"
          className="rounded-full border px-4 py-2 text-sm font-medium hover:border-accent hover:text-accent"
        >
          All content
        </Link>
        <Link
          href="/admin/new"
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90"
        >
          New
        </Link>
        <button
          type="button"
          onClick={logout}
          className="rounded-full px-3 py-2 text-sm font-medium text-muted hover:text-foreground"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
