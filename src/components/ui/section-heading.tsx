/**
 * SectionHeading: optional eyebrow, a title, and an optional description.
 * h1 is the page title size; h2 is the section title size.
 * Props: optional eyebrow, title, optional description, heading level, id, and className.
 * Used in: page headers and home page sections.
 */
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: React.ReactNode;
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
  const isPageTitle = Heading === "h1";

  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
      <Heading
        id={id}
        className={cn("font-semibold text-foreground", isPageTitle ? "text-h1" : "text-h2")}
      >
        {title}
      </Heading>
      {description ? (
        <p className={cn("text-muted", isPageTitle ? "mt-4 text-lead" : "mt-3 text-body")}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
