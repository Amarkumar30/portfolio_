/**
 * 404 page, in Amar's voice.
 * Used in: any unmatched route, and notFound() calls.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import { DailyJoke } from "@/features/daily";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

const elsewhere = [
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Writing" },
  { href: "/contact", label: "Contact" },
];

export default function NotFound() {
  return (
    <div className="container-shell flex min-h-[calc(100svh-var(--header-height)-12rem)] items-center justify-center py-16">
      <div className="max-w-md text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-3 text-h1 font-semibold">This page isn&apos;t here.</h1>
        <p className="mt-4 text-muted">
          Either the link is old or I moved something. Fittingly, I study how things get found —
          and this one didn&apos;t.
        </p>
        <ButtonLink href="/" className="mt-8">
          Back home
        </ButtonLink>
        <p className="mt-6 flex justify-center gap-x-5 text-small">
          {elsewhere.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex min-h-11 items-center text-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </p>
        <div className="mt-10">
          <DailyJoke />
        </div>
      </div>
    </div>
  );
}
