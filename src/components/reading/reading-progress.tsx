"use client";

/**
 * ReadingProgress: a thin accent bar at the top of the viewport that fills as you read.
 * It only tracks scroll position (no animation), so it stays on with reduced motion.
 * Used in: blog posts and research write-ups.
 */
import { useEffect, useRef } from "react";

export function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;

    function update() {
      frame = 0;
      const root = document.documentElement;
      const max = root.scrollHeight - root.clientHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, root.scrollTop / max)) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`;
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5">
      <div ref={barRef} className="h-full origin-left scale-x-0 bg-accent" />
    </div>
  );
}
