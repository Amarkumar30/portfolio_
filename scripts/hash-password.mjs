#!/usr/bin/env node
// Usage: node scripts/hash-password.mjs "your password"
// Prints a bcrypt hash for ADMIN_PASSWORD_HASH. The password itself is never stored anywhere.
import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error('Usage: node scripts/hash-password.mjs "your password"');
  process.exit(1);
}

if (password.length < 12) {
  console.error("Use at least 12 characters.");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);

console.log("\nFor Vercel (paste the value as-is):\n");
console.log(`  ADMIN_PASSWORD_HASH=${hash}`);
console.log("\nFor .env.local (each $ escaped so Next.js doesn't expand it):\n");
console.log(`  ADMIN_PASSWORD_HASH=${hash.replaceAll("$", "\\$")}`);
console.log("\nTip: clear your shell history afterwards if it saved the command.\n");
