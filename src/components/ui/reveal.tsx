"use client";

/**
 * Reveal wraps content in a subtle entrance animation for section and card reveals.
 * Props: children plus optional className and delay.
 * Used in: page sections and card grids across the site.
 * TODO: Tune motion timing if you later add more complex page choreography.
 */
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.45, ease: "easeOut", delay }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
