import fs from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

const publicFileExists = (file: string) =>
  fs.existsSync(path.join(process.cwd(), "public", file));

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_HAS_RESUME: publicFileExists("resume.pdf") ? "1" : "",
    NEXT_PUBLIC_HAS_PHOTO: publicFileExists("amar.jpg") ? "1" : "",
  },
  // Content is read from disk at request time by dynamic routes, so ship it with every function.
  outputFileTracingIncludes: {
    "/**": ["./content/**/*"],
  },
  // ISR pages (the home page and /api/daily, which revalidate every 15 minutes) are never served
  // more than an hour stale. The default is a year: after a quiet spell the first visitor got the
  // old page while it rebuilt in the background, so the Daily card could show a past day's pick.
  expireTime: 3600,
  // Soft cross-fade between routes via React's <ViewTransition> (see app/layout.tsx).
  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;
