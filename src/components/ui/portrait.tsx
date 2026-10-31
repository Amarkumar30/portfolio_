/**
 * Portrait shows public/amar.jpg when it shipped with the build, otherwise an "AK" monogram.
 * Props: size in pixels, optional priority for above-the-fold use, and className.
 * Used in: home hero and about page.
 * Open item: add public/amar.jpg (see TODO.md).
 */
import Image from "next/image";
import { hasPhoto } from "@/lib/site";
import { cn } from "@/lib/utils";

interface PortraitProps {
  size?: number;
  priority?: boolean;
  className?: string;
}

export function Portrait({ size = 160, priority = false, className }: PortraitProps) {
  const shared = cn("shrink-0 rounded-full border", className);

  if (hasPhoto) {
    return (
      <Image
        src="/amar.jpg"
        alt="Amar Kumar"
        width={size}
        height={size}
        priority={priority}
        className={cn(shared, "object-cover")}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label="Amar Kumar"
      className={cn(
        shared,
        "flex items-center justify-center bg-surface-muted font-mono font-medium tracking-tight text-muted",
      )}
      style={{ width: size, height: size, fontSize: size * 0.3 }}
    >
      AK
    </div>
  );
}
