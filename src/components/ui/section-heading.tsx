/**
 * SectionHeading keeps page sections visually consistent with a shared eyebrow/title/description pattern.
 * Props: optional eyebrow, title, optional description, heading level, and className.
 * Used in: all major landing page and route sections.
 */
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  as?: "h1" | "h2";
  id?: string;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  as: Heading = "h2",
  id,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("max-w-[68ch] space-y-3", className)}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <Heading
        id={id}
        className={cn(
          "font-heading font-semibold tracking-tight text-balance",
          Heading === "h1" ? "text-4xl sm:text-5xl" : "text-2xl sm:text-3xl",
        )}
      >
        {title}
      </Heading>
      {description ? (
        <p className="text-base leading-7 text-muted sm:text-lg sm:leading-8">
          {description}
        </p>
      ) : null}
    </div>
  );
}
