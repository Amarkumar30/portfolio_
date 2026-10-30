import fs from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

const hasResume = fs.existsSync(path.join(process.cwd(), "public", "resume.pdf"));

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_HAS_RESUME: hasResume ? "1" : "",
  },
  // Content is read from disk at request time by dynamic routes, so ship it with every function.
  outputFileTracingIncludes: {
    "/**": ["./content/**/*"],
  },
};

export default nextConfig;
