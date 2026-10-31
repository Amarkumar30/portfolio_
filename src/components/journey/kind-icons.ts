/**
 * Icon for each journey milestone kind. Shared by the About page timeline and the admin editor.
 */
import {
  CircleDot,
  CodeXml,
  FlaskConical,
  GraduationCap,
  MonitorPlay,
  Rocket,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import type { JourneyKind } from "@/lib/content/sections";

export const journeyKindIcons: Record<JourneyKind, LucideIcon> = {
  education: GraduationCap,
  win: Trophy,
  project: CodeXml,
  research: FlaskConical,
  founder: Rocket,
  creator: MonitorPlay,
  now: CircleDot,
};
