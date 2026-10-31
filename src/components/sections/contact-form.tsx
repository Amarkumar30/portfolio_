"use client";

/**
 * ContactForm submits contact details to the serverless API.
 * Fields validate when you leave them (and again on submit); errors are linked to their inputs.
 * The button shows a loading state, and a success message replaces the form.
 * If sending isn't configured or fails, it points visitors to email instead.
 * Props: none.
 * Used in: contact page.
 */
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { contactEmail } from "@/lib/data";

interface FormState {
  name: string;
  email: string;
  message: string;
  company: string;
}

type FieldName = "name" | "email" | "message";
type FieldErrors = Partial<Record<FieldName, string>>;

const initialState: FormState = {
  name: "",
  email: "",
  message: "",
  company: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateField(name: FieldName, value: string) {
  const trimmed = value.trim();

  if (name === "name" && !trimmed) return "Please enter your name.";
  if (name === "email" && !trimmed) return "Please enter your email.";
  if (name === "email" && !emailPattern.test(trimmed)) return "Please enter a valid email address.";
  if (name === "message" && !trimmed) return "Please add a message.";
  return undefined;
}

function validateForm(values: FormState): FieldErrors {
  const errors: FieldErrors = {};
  for (const name of ["name", "email", "message"] as const) {
    const error = validateField(name, values[name]);
    if (error) errors[name] = error;
  }
  return errors;
}

export function ContactForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [showEmailFallback, setShowEmailFallback] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function update(name: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
    // Clear an error as soon as the field becomes valid; new errors wait until blur.
    if (name !== "company" && fieldErrors[name] && !validateField(name, value)) {
      setFieldErrors((current) => ({ ...current, [name]: undefined }));
    }
  }

  function blur(name: FieldName) {
    setFieldErrors((current) => ({ ...current, [name]: validateField(name, form[name]) }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateForm(form);
    setFieldErrors(nextErrors);
    setErrorMessage("");
    setShowEmailFallback(false);

    const firstInvalid = (["name", "email", "message"] as const).find((name) => nextErrors[name]);
    if (firstInvalid) {
      document.getElementById(`contact-${firstInvalid}`)?.focus();
      setStatus("idle");
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
      <div className="card p-6 sm:p-8" role="status">
        <CheckCircle2 aria-hidden="true" className="h-6 w-6 text-accent" />
        <h2 className="mt-4 text-h3 font-semibold">Thanks for reaching out.</h2>
        <p className="mt-2 text-small text-muted">
          Your message has been sent successfully, and a confirmation email should already be on
          its way to your inbox.
        </p>
        <button type="button" onClick={() => setStatus("idle")} className="btn btn-secondary mt-6">
          Send another message
        </button>
      </div>
    );
  }

  const field = (name: FieldName) => ({
    id: `contact-${name}`,
    name,
    value: form[name],
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      update(name, event.target.value),
    onBlur: () => blur(name),
    "aria-invalid": fieldErrors[name] ? true : undefined,
    "aria-describedby": fieldErrors[name] ? `contact-${name}-error` : undefined,
    required: true,
    className: "field",
  });

  const error = (name: FieldName) =>
    fieldErrors[name] ? (
      <p id={`contact-${name}-error`} className="field-error">
        {fieldErrors[name]}
      </p>
    ) : null;

  return (
    <form className="card space-y-5 p-6 sm:p-8" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="label">
            Name
          </label>
          <input type="text" autoComplete="name" placeholder="Your name" {...field("name")} />
          {error("name")}
        </div>
        <div>
          <label htmlFor="contact-email" className="label">
            Email
          </label>
          <input
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            {...field("email")}
          />
          {error("email")}
        </div>
      </div>
      <div className="hidden" aria-hidden="true">
        <label>
          Company
          <input
            tabIndex={-1}
            autoComplete="off"
            name="company"
            type="text"
            value={form.company}
            onChange={(event) => update("company", event.target.value)}
          />
        </label>
      </div>
      <div>
        <label htmlFor="contact-message" className="label">
          Message
        </label>
        <textarea
          rows={6}
          placeholder="What are you working on, and how can I help?"
          {...field("message")}
          className="field resize-y"
        />
        {error("message")}
      </div>
      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={status === "loading"}
          aria-busy={status === "loading"}
          className="btn btn-primary w-full sm:w-auto"
        >
          {status === "loading" ? (
            <>
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-accent-foreground/35 border-t-accent-foreground"
              />
              Sending…
            </>
          ) : (
            "Send message"
          )}
        </button>
        <p className="text-small text-muted" role="status" aria-live="polite">
          {status === "error" && showEmailFallback ? (
            <>
              The form isn&apos;t working right now. Please email me directly at{" "}
              <a href={`mailto:${contactEmail}`} className="link font-medium">
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
