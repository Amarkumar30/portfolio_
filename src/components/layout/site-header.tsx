"use client";

/**
 * SiteHeader renders the sticky navigation, active route states, and theme toggle.
 * Props: none.
 * Used in: root app layout across the entire site.
 */
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", match: ["/"] },
  { href: "/about", label: "About", match: ["/about"] },
  { href: "/projects", label: "Projects", match: ["/projects"] },
  { href: "/research", label: "Research", match: ["/research"] },
  { href: "/blog", label: "Writing", match: ["/blog", "/notes"] },
  { href: "/contact", label: "Contact", match: ["/contact"] },
];

function isActive(pathname: string, match: string[]) {
  return match.some((prefix) =>
    prefix === "/" ? pathname === "/" : pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [openFor, setOpenFor] = useState<string | null>(null);
  // Tie the open state to the current path so navigating always closes the menu.
  const isOpen = openFor === pathname;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
      <div className="container-shell flex h-16 items-center justify-between gap-4">
        <Link href="/" className="font-heading text-base font-semibold tracking-tight">
          Amar Kumar
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {navItems.map((item) => {
            const active = isActive(pathname, item.match);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium text-muted hover:text-foreground",
                  active &&
                    "text-foreground underline decoration-accent decoration-2 underline-offset-[10px]",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <ThemeToggle className="ml-2" />
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpenFor(isOpen ? null : pathname)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {isOpen ? (
        <nav id="mobile-menu" aria-label="Mobile" className="border-t md:hidden">
          <ul className="container-shell py-2">
            {navItems.map((item) => {
              const active = isActive(pathname, item.match);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpenFor(null)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block py-3 text-base font-medium text-muted",
                      active && "text-accent",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
