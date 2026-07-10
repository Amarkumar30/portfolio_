/**
 * SectionHeading keeps page sections visually consistent with a shared eyebrow/title/description pattern.
 * Props: eyebrow, title, description, and optional alignment className.
 * Used in: all major landing page and route sections.
 * TODO: Add optional action slot if you later want section-level secondary CTAs.
 */
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description: string;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("max-w-3xl space-y-4", className)}>
      <span className="eyebrow">{eyebrow}</span>
      <div className="space-y-3">
        <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h2>
        <p className="text-base leading-8 text-muted sm:text-lg">{description}</p>
      </div>
    </div>
  );
}
