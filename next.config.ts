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
};

export default nextConfig;
