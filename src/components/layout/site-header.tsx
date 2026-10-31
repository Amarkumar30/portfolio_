"use client";

/**
 * SiteHeader: name on the left, navigation and theme toggle on the right.
 * Turns translucent with a bottom hairline once the page scrolls.
 * On mobile the menu is a full-height sheet: it closes on navigation and Escape, locks page
 * scroll while open, and keeps keyboard focus inside the header.
 * Props: none.
 * Used in: root app layout across the entire site.
 */
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/about", label: "About", match: ["/about"] },
  { href: "/projects", label: "Projects", match: ["/projects"] },
  { href: "/research", label: "Research", match: ["/research"] },
  { href: "/blog", label: "Writing", match: ["/blog", "/notes"] },
  { href: "/contact", label: "Contact", match: ["/contact"] },
];

function isActive(pathname: string, match: string[]) {
  return match.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function SiteHeader() {
  const pathname = usePathname();
  const [openFor, setOpenFor] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  // Tie the open state to the current path so navigating always closes the menu.
  const isOpen = openFor === pathname;

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    headerRef.current?.querySelector<HTMLElement>("#mobile-menu a")?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenFor(null);
        toggleRef.current?.focus();
        return;
      }

      if (event.key !== "Tab" || !headerRef.current) return;

      // Keep focus inside the header (logo, theme toggle, close button, menu links).
      const focusable = Array.from(
        headerRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
      ).filter((element) => element.offsetParent !== null);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      root.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const solid = scrolled || isOpen;

  return (
    <header
      ref={headerRef}
      className={cn(
        "sticky top-0 z-40 border-b transition-[background-color,border-color] duration-200 ease-out",
        solid
          ? "border-border bg-[var(--header-bg)] backdrop-blur-md backdrop-saturate-150"
          : "border-transparent bg-background",
        isOpen && "bg-background",
      )}
    >
      <div className="container-shell flex h-header items-center justify-between gap-4">
        <Link
          href="/"
          className="-mx-2 inline-flex h-control items-center rounded-control px-2 text-small font-semibold tracking-tight"
          aria-current={pathname === "/" ? "page" : undefined}
        >
          Amar Kumar
        </Link>

        <div className="flex items-center gap-1">
          <nav className="hidden items-center md:flex" aria-label="Primary">
            {navItems.map((item) => {
              const active = isActive(pathname, item.match);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex h-control items-center rounded-control px-3 text-small text-muted transition-colors duration-150 hover:text-foreground",
                    active &&
                      "text-foreground underline decoration-border-strong decoration-1 underline-offset-[6px]",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <ThemeToggle />
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpenFor(isOpen ? null : pathname)}
            className="btn btn-ghost btn-icon md:hidden"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>

      {isOpen ? (
        <nav
          id="mobile-menu"
          aria-label="Menu"
          className="fixed inset-x-0 top-header bottom-0 overflow-y-auto border-t bg-background md:hidden"
        >
          <ul className="container-shell py-4">
            {[{ href: "/", label: "Home", match: [] as string[] }, ...navItems].map((item) => {
              const active = item.href === "/" ? pathname === "/" : isActive(pathname, item.match);

              return (
                <li key={item.href} className="border-b last:border-b-0">
                  <Link
                    href={item.href}
                    onClick={() => setOpenFor(null)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-14 items-center text-h3 font-medium text-muted",
                      active && "text-foreground",
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
