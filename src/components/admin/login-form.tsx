"use client";

/**
 * LoginForm posts admin credentials and moves to the dashboard on success.
 * Has a show/hide password toggle and a loading state; Enter submits.
 * Used in: /admin/login.
 */
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <form onSubmit={handleSubmit} className="card space-y-5 p-6" aria-describedby={error ? "login-error" : undefined}>
      <div>
        <label htmlFor="login-username" className="label">
          Username
        </label>
        <input
          id="login-username"
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          autoFocus
          className="field"
        />
      </div>
      <div>
        <label htmlFor="login-password" className="label">
          Password
        </label>
        <div className="relative">
          <input
            id="login-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className="field pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="btn btn-ghost btn-icon absolute inset-y-0 right-0 h-full rounded-l-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
          </button>
        </div>
      </div>
      {error ? (
        <p id="login-error" role="alert" className="text-small text-danger">
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={pending} aria-busy={pending} className="btn btn-primary w-full">
        {pending ? (
          <>
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-accent-foreground/35 border-t-accent-foreground"
            />
            Checking…
          </>
        ) : (
          "Log in"
        )}
      </button>
    </form>
  );
}
