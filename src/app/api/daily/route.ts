// Daily quote & joke feature: see src/features/daily. Read-only; safe to delete with the feature.
export { GET } from "@/features/daily/route";

// Re-check every 15 minutes so the joke switches soon after midnight IST.
export const revalidate = 900;
