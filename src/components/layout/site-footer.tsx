/**
 * SiteFooter: one line about Amar, profile links, and the year.
 * Props: none.
 * Used in: root app layout across all routes.
 */
import Link from "next/link";
import { AdminLink } from "@/components/layout/admin-link";
import { siteContent, socialLinks } from "@/lib/data";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t py-10">
      <div className="container-shell flex flex-col gap-6 text-sm text-muted sm:flex-row sm:items-start sm:justify-between">
        <p className="max-w-md leading-6">{siteContent.footerLine}</p>
        <div className="flex flex-col gap-3 sm:items-end">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {socialLinks.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="hover:text-accent">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="flex gap-4">
            <span>© {new Date().getFullYear()} Amar Kumar</span>
            <AdminLink />
          </p>
        </div>
      </div>
    </footer>
  );
}
