/**
 * ButtonLink renders a link styled as a button (primary, secondary or ghost).
 * Styles live in globals.css (.btn, .btn-*) so form buttons use the exact same classes.
 * Props: href, children, optional variant, and optional className.
 * Used in: hero, page CTAs, 404, and admin.
 */
import Link from "next/link";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost";

export function buttonClass(variant: ButtonVariant = "primary", className?: string) {
  return cn("btn", `btn-${variant}`, className);
}

interface ButtonLinkProps {
  href: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
  className?: string;
}

export function ButtonLink({ href, children, variant = "primary", className }: ButtonLinkProps) {
  return (
    <Link href={href} className={buttonClass(variant, className)}>
      {children}
    </Link>
  );
}
