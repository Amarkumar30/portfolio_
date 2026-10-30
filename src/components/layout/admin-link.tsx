"use client";

/**
 * AdminLink shows a small "Admin" link only in a browser that has logged in.
 * It reads a non-secret hint cookie (the real session cookie is httpOnly), so pages stay static.
 * Used in: site footer.
 */
import Link from "next/link";
import { useSyncExternalStore } from "react";

const subscribe = () => () => undefined;
const hasHint = () => document.cookie.split("; ").some((part) => part === "admin_hint=1");

export function AdminLink() {
  const show = useSyncExternalStore(subscribe, hasHint, () => false);

  return show ? (
    <Link href="/admin" className="hover:text-accent">
      Admin
    </Link>
  ) : null;
}
