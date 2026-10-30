/**
 * Reveal fades content in as it scrolls into view using a CSS scroll-driven animation.
 * Content is fully visible by default: the animation only applies in browsers that support
 * animation-timeline and for visitors who haven't asked for reduced motion. No client JS.
 * Props: children plus optional className and delay (seconds, kept for API compatibility).
 * Used in: card grids across the site.
 */
import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function Reveal({ children, className }: RevealProps) {
  return <div className={cn("reveal", className)}>{children}</div>;
}
