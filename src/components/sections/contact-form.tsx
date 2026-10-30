"use client";

/**
 * ContactForm submits contact details to the serverless API with client validation and clear UI states.
 * Props: none.
 * Used in: contact page.
 * TODO: Replace the inline status message with a richer toast system only if you add one site-wide.
 */
import { useState } from "react";

interface FormState {
  name: string;
  email: string;
  message: string;
  company: string;
}

type FieldErrors = Partial<Record<keyof FormState, string>>;

const contactEmail = "amar.kumar.career@gmail.com";

const initialState: FormState = {
  name: "",
  email: "",
  message: "",
  company: "",
};

export function ContactForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [showEmailFallback, setShowEmailFallback] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function validateForm(values: FormState) {
    const nextErrors: FieldErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!values.name.trim()) {
      nextErrors.name = "Please enter your name.";
    }

    if (!values.email.trim()) {
      nextErrors.email = "Please enter your email.";
    } else if (!emailPattern.test(values.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!values.message.trim()) {
      nextErrors.message = "Please add a message.";
    }

    return nextErrors;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateForm(form);
    setFieldErrors(nextErrors);
    setErrorMessage("");
    setShowEmailFallback(false);

    if (Object.keys(nextErrors).length > 0) {
      setStatus("error");
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as { error?: string };

      if (response.status === 503 && payload.error === "not_configured") {
        setStatus("error");
        setShowEmailFallback(true);
        return;
      }

      if (!response.ok) {
        throw new Error(payload.error ?? "Request failed");
      }

      setStatus("success");
      setForm(initialState);
    } catch (error) {
      setStatus("error");
      setShowEmailFallback(true);
      setErrorMessage(error instanceof Error ? error.message : "");
    }
  }

  if (status === "success") {
    return (
      <div className="section-card space-y-4 p-6">
        <span className="eyebrow">Message sent</span>
        <h2 className="font-heading text-3xl font-semibold tracking-tight">
          Thanks for reaching out.
        </h2>
        <p className="text-sm leading-7 text-muted">
          Your message has been sent successfully, and a confirmation email should
          already be on its way to your inbox.
        </p>
      </div>
    );
  }

  return (
    <form className="section-card space-y-5 p-6" onSubmit={handleSubmit}>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium">
          <span>Name</span>
          <input
            required
            type="text"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            aria-invalid={Boolean(fieldErrors.name)}
            className="w-full rounded-2xl border bg-surface-strong px-4 py-3 outline-none focus:border-accent"
            placeholder="Your name"
          />
          {fieldErrors.name ? (
            <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.name}</p>
          ) : null}
        </label>
        <label className="space-y-2 text-sm font-medium">
          <span>Email</span>
          <input
            required
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            aria-invalid={Boolean(fieldErrors.email)}
            className="w-full rounded-2xl border bg-surface-strong px-4 py-3 outline-none focus:border-accent"
            placeholder="you@example.com"
          />
          {fieldErrors.email ? (
            <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.email}</p>
          ) : null}
        </label>
      </div>
      <label className="hidden" aria-hidden="true">
        <span>Company</span>
        <input
          tabIndex={-1}
          autoComplete="off"
          name="company"
          type="text"
          value={form.company}
          onChange={(event) => setForm({ ...form, company: event.target.value })}
        />
      </label>
      <label className="space-y-2 text-sm font-medium">
        <span>Message</span>
        <textarea
          required
          rows={6}
          value={form.message}
          onChange={(event) => setForm({ ...form, message: event.target.value })}
          aria-invalid={Boolean(fieldErrors.message)}
          className="w-full rounded-3xl border bg-surface-strong px-4 py-3 outline-none focus:border-accent"
          placeholder="Share a quick note about the role, collaboration, or conversation you have in mind."
        />
        {fieldErrors.message ? (
          <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.message}</p>
        ) : null}
      </label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status === "loading" ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent-foreground/35 border-t-accent-foreground" />
              Sending...
            </>
          ) : (
            "Send message"
          )}
        </button>
        <p className="text-sm text-muted" role="status">
          {status === "error" && showEmailFallback ? (
            <>
              The form isn&apos;t working right now. Please email me directly at{" "}
              <a
                href={`mailto:${contactEmail}`}
                className="font-semibold text-accent underline underline-offset-4"
              >
                {contactEmail}
              </a>
              .
            </>
          ) : status === "error" && errorMessage ? (
            errorMessage
          ) : null}
        </p>
      </div>
    </form>
  );
}
