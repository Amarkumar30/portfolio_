/**
 * SiteFooter provides a compact close to each page with profile links and positioning copy.
 * Props: none.
 * Used in: root app layout across all routes.
 * TODO: Add any future newsletter or speaking links here once they are real.
 */
import Link from "next/link";
import { socialLinks } from "@/lib/data";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 py-10">
      <div className="container-shell flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="font-heading text-lg font-semibold">Amar Kumar</p>
          <p className="max-w-xl text-sm leading-6 text-muted">
            Computer Science undergraduate building full-stack products, researching
            GEO, and preparing for product-focused SDE roles.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm text-muted sm:items-end">
          {socialLinks.map((link) => (
            <Link key={link.label} href={link.href} className="hover:text-accent">
              {link.display}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
