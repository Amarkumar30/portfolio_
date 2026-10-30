/**
 * ButtonLink standardizes primary and secondary action styling for links.
 * Props: href, children, optional variant, and optional className.
 * Used in: hero section, page CTAs, project links, and contact links.
 */
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ButtonLinkProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold",
        variant === "primary"
          ? "bg-accent text-accent-foreground hover:opacity-90"
          : "border text-foreground hover:border-accent hover:text-accent",
        className,
      )}
    >
      {children}
    </Link>
  );
}
