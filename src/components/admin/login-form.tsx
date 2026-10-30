"use client";

/**
 * LoginForm posts admin credentials and moves to the dashboard on success.
 * Used in: /admin/login.
 */
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: form.get("username"), password: form.get("password") }),
    }).catch(() => null);

    if (response?.ok) {
      router.replace("/admin");
      router.refresh();
      return;
    }

    const payload = (await response?.json().catch(() => null)) as { error?: string } | null;
    setError(payload?.error ?? "Couldn't reach the server.");
    setPending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="section-card space-y-4 p-6">
      <label className="block space-y-2 text-sm font-medium">
        <span>Username</span>
        <input name="username" autoComplete="username" required className="field" />
      </label>
      <label className="block space-y-2 text-sm font-medium">
        <span>Password</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="field"
        />
      </label>
      {error ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Checking…" : "Log in"}
      </button>
    </form>
  );
}
