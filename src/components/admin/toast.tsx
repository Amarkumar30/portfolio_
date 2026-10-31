"use client";

/**
 * Minimal toast notifications for the admin: success/error messages with an optional link.
 * Toasts stack bottom-right (bottom, full width on phones) and dismiss after a few seconds.
 * Used in: admin layout (provider), editor and dashboard actions (useToast).
 */
import Link from "next/link";
import { CheckCircle2, CircleAlert, X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface Toast {
  id: number;
  kind: "success" | "error";
  message: string;
  link?: { href: string; label: string };
}

type ShowToast = (toast: Omit<Toast, "id">) => void;

const ToastContext = createContext<ShowToast>(() => undefined);

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback<ShowToast>(
    (toast) => {
      const id = nextId.current++;
      setToasts((current) => [...current.slice(-2), { ...toast, id }]);
      window.setTimeout(() => dismiss(id), toast.kind === "error" ? 8000 : 5000);
    },
    [dismiss],
  );

  const value = useMemo(() => show, [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-stretch gap-2 sm:left-auto sm:right-6 sm:bottom-6 sm:w-96"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.kind === "error" ? "alert" : "status"}
            className="card pointer-events-auto flex items-start gap-3 p-4 text-small shadow-lg shadow-black/5 motion-safe:animate-[toast-in_200ms_ease-out]"
          >
            {toast.kind === "success" ? (
              <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            ) : (
              <CircleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
            )}
            <div className="min-w-0 flex-1">
              <p className={cn("font-medium", toast.kind === "error" && "text-danger")}>{toast.message}</p>
              {toast.link ? (
                <Link href={toast.link.href} className="link mt-1 inline-block">
                  {toast.link.label}
                </Link>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="-m-1 rounded p-1 text-subtle hover:text-foreground"
              aria-label="Dismiss"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
