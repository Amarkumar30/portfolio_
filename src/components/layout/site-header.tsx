"use client";

/**
 * SiteHeader renders the sticky navigation, active route states, and theme toggle.
 * Props: none.
 * Used in: root app layout across the entire site.
 * TODO: Replace the resume link if you later move the file or add analytics tracking.
 */
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { hasResume } from "@/lib/site";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Writing" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/86 backdrop-blur-xl">
      <div className="container-shell flex min-h-18 items-center justify-between gap-4">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border bg-accent text-sm font-heading font-semibold text-accent-foreground shadow-sm">
            AK
          </span>
          <span className="font-heading text-base font-semibold tracking-tight">
            Amar Kumar
          </span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex" aria-label="Primary">
          {navItems.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium hover:bg-accent-soft hover:text-accent",
                  isActive && "bg-accent text-accent-foreground hover:text-accent-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          {hasResume ? (
            <Link
              href="/resume.pdf"
              className="rounded-full border px-4 py-2 text-sm font-medium hover:-translate-y-0.5 hover:border-accent hover:text-accent"
            >
              Resume
            </Link>
          ) : null}
          <ThemeToggle />
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-surface"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {isOpen ? (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className="container-shell flex flex-col gap-2 border-t border-border/70 py-4 md:hidden"
        >
          {navItems.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "rounded-2xl border px-4 py-3 text-sm font-medium",
                  isActive ? "border-accent bg-accent-soft text-accent" : "bg-surface",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          {hasResume ? (
            <Link
              href="/resume.pdf"
              onClick={() => setIsOpen(false)}
              className="rounded-2xl border px-4 py-3 text-sm font-medium"
            >
              Download Resume
            </Link>
          ) : null}
        </nav>
      ) : null}
    </header>
  );
}
