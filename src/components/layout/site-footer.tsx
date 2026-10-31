/**
 * SiteFooter: one quiet row with a line about Amar, profile links, RSS, and the year.
 * Props: none.
 * Used in: root app layout across all routes.
 */
import { AdminLink } from "@/components/layout/admin-link";
import { siteContent, socialLinks } from "@/lib/data";

const footerLinks = [
  ...["GitHub", "LinkedIn", "Email"].flatMap((label) =>
    socialLinks.filter((link) => link.label === label),
  ),
  { label: "RSS", href: "/feed.xml" },
];

const linkClass =
  "inline-flex min-h-11 min-w-11 items-center justify-center transition-colors duration-150 hover:text-foreground sm:min-h-0 sm:min-w-0";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="container-shell flex flex-col gap-4 py-8 text-small text-subtle lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        <p className="max-w-md">{siteContent.footerLine}</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
          <ul className="flex flex-wrap gap-x-5">
            {footerLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href} className={linkClass}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="flex items-center gap-4">
            <span className="tabular">© {new Date().getFullYear()} Amar Kumar</span>
            <AdminLink className={linkClass} />
          </p>
        </div>
      </div>
    </footer>
  );
}
