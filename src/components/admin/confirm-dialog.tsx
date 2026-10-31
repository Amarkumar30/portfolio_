"use client";

/**
 * ConfirmDialog: a small modal built on the native <dialog> element (focus trap, Escape and
 * backdrop handled by the browser). Opens whenever `open` is true.
 * Props: open, title, body, confirm label, destructive flag, onConfirm and onCancel.
 * Used in: dashboard delete, editor "discard local draft".
 */
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  body: React.ReactNode;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onCancel();
      }}
      aria-labelledby="confirm-title"
      className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-card border bg-surface p-0 text-foreground backdrop:bg-black/40 backdrop:backdrop-blur-[2px]"
    >
      <div className="p-6">
        <h2 id="confirm-title" className="text-h3 font-semibold">
          {title}
        </h2>
        <div className="mt-2 text-small text-muted">{body}</div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className="btn btn-secondary" autoFocus>
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn("btn", destructive ? "btn-danger" : "btn-primary")}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
