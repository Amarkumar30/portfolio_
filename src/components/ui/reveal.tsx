/**
 * Reveal fades content up 8px the first time it scrolls into view.
 * The hidden state only applies once the inline script in the root layout has set
 * html[data-reveal], so without JS, or with reduced motion, content is simply visible.
 * Props: children, optional className, and index (staggers siblings by 60ms each).
 * Used in: card grids across the site.
 */
import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  index?: number;
}

export function Reveal({ children, className, index = 0 }: RevealProps) {
  return (
    <div
      className={cn("reveal", className)}
      style={index ? ({ "--reveal-delay": `${Math.min(index, 5) * 60}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
