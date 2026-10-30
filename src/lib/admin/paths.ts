/**
 * Guards every repository write: only normalised, lower-case paths inside content/ or
 * public/uploads/ are allowed, with no traversal segments.
 */
const ALLOWED_ROOTS = ["content/", "public/uploads/"];
const SEGMENT = /^[a-z0-9][a-z0-9._-]*$/;

export function isWritablePath(filePath: string) {
  if (!ALLOWED_ROOTS.some((root) => filePath.startsWith(root))) {
    return false;
  }

  return filePath
    .split("/")
    .every((segment) => SEGMENT.test(segment) && segment !== "." && !segment.includes(".."));
}

export function assertWritablePath(filePath: string) {
  if (!isWritablePath(filePath)) {
    throw new Error(`Refusing to write outside content/ or public/uploads/: ${filePath}`);
  }
}
