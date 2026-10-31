"use client";

/**
 * CodeBlock wraps a rehype-pretty-code figure with a copy button.
 * A filename label comes from the fence meta, e.g. ```ts title="lib/site.ts".
 * Used in: mdxComponents (figure[data-rehype-pretty-code-figure]).
 */
import { Check, Copy } from "lucide-react";
import { useRef, useState } from "react";

export function CodeBlock({ children, className, ...props }: React.ComponentProps<"figure">) {
  const ref = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  async function copy() {
    const text = ref.current?.querySelector("pre")?.innerText ?? "";

    try {
      await navigator.clipboard.writeText(text.replace(/\n$/, ""));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <figure ref={ref} {...props} className={`code-block ${className ?? ""}`}>
      {children}
      <button
        type="button"
        onClick={copy}
        data-copied={copied}
        className="copy-button btn btn-secondary btn-icon h-8 w-8"
        aria-label={copied ? "Copied" : "Copy code"}
      >
        {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      </button>
    </figure>
  );
}
