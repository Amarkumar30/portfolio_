"use client";

/**
 * AdminBar: page title, where changes go (GitHub or local), and All content / New / Log out.
 * Used in: all admin pages except login.
 */
import Link from "next/link";
import { LogOut, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function AdminBar({ title, storage }: { title: string; storage: "github" | "local" | null }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="eyebrow">Admin</p>
        <h1 className="mt-1 text-h2 font-semibold">{title}</h1>
        {storage ? (
          <p className="mt-1 text-small text-muted">
            {storage === "github"
              ? "Publishing to GitHub — changes go live after Vercel redeploys (~1–2 min)."
              : "Local mode — files are written to this machine's working tree."}
          </p>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <Link href="/admin" className="btn btn-ghost">
          All content
        </Link>
        <Link href="/admin/new" className="btn btn-primary">
          <Plus aria-hidden="true" />
          New
        </Link>
        <button type="button" onClick={logout} className="btn btn-ghost btn-icon" aria-label="Log out" title="Log out">
          <LogOut aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
