/**
 * ExternalLink: every link off the site opens in a new tab, passes no referrer or ranking credit,
 * and shows a small icon.
 */
import { ExternalLink as ExternalLinkIcon } from "lucide-react";

export function ExternalLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer nofollow" className={className}>
      {children}
      <ExternalLinkIcon aria-hidden="true" className="inline h-3.5 w-3.5 shrink-0" />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
