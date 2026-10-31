/**
 * SectionHeading: optional eyebrow, a title, an optional description, and an optional action
 * (e.g. "All projects →") aligned to the right on wider screens.
 * h1 is the page title size; h2 is the section title size.
 * Props: optional eyebrow, title, optional description, optional action, heading level, id, className.
 * Used in: page headers and home page sections.
 */
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  as?: "h1" | "h2";
  id?: string;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  as: Heading = "h2",
  id,
  className,
}: SectionHeadingProps) {
  const isPageTitle = Heading === "h1";

  const text = (
    <div className="max-w-2xl">
      {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
      <Heading
        id={id}
        className={cn("font-semibold text-foreground", isPageTitle ? "text-h1" : "text-h2")}
      >
        {title}
      </Heading>
      {description ? (
        <p className={cn("text-muted", isPageTitle ? "mt-4 text-lead" : "mt-2 text-body")}>
          {description}
        </p>
      ) : null}
    </div>
  );

  if (!action) {
    return <div className={className}>{text}</div>;
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-x-8 gap-y-2",
        className,
      )}
    >
      {text}
      <div className="shrink-0">{action}</div>
    </div>
  );
}
