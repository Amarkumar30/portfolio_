/**
 * 404 page, in Amar's voice.
 * Used in: any unmatched route, and notFound() calls.
 */
import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="container-shell py-20 sm:py-28">
      <div className="max-w-[68ch] space-y-6">
        <p className="eyebrow">404</p>
        <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
          This page isn&apos;t here.
        </h1>
        <p className="text-lg leading-8 text-muted">
          Either the link is old or I moved something. Fittingly, I study how things get
          found — and this one didn&apos;t. Here are a few places that do exist.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <ButtonLink href="/">Home</ButtonLink>
          <ButtonLink href="/projects" variant="secondary">
            Projects
          </ButtonLink>
          <ButtonLink href="/blog" variant="secondary">
            Writing
          </ButtonLink>
          <ButtonLink href="/contact" variant="secondary">
            Contact
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
