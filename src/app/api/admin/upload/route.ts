import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { guardAdminRequest } from "@/lib/admin/auth";
import { handleAdminError } from "@/lib/admin/handle-error";
import { getStorage } from "@/lib/admin/storage";
import { slugify } from "@/lib/content/sections";

const MAX_BYTES = 4 * 1024 * 1024;

/** Identify the image type from its first bytes; the browser-supplied MIME type isn't trusted. */
function sniffImage(bytes: Buffer): "jpg" | "png" | "webp" | "gif" | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return "webp";
  if (bytes.toString("ascii", 0, 6) === "GIF87a" || bytes.toString("ascii", 0, 6) === "GIF89a") return "gif";
  return null;
}

export async function POST(request: Request) {
  const denied = await guardAdminRequest(request);
  if (denied) return denied;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected a file upload." }, { status: 400 });
  }

  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Expected a file upload." }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Images must be 4 MB or smaller." }, { status: 413 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = sniffImage(bytes);

  if (!ext) {
    return NextResponse.json({ error: "Only JPG, PNG, WebP and GIF images are allowed." }, { status: 415 });
  }

  const now = new Date();
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "image";
  const name = `${base.slice(0, 50)}-${randomBytes(3).toString("hex")}.${ext}`;
  const filePath = `public/uploads/${year}/${month}/${name}`;

  try {
    const storage = getStorage();
    await storage.write(filePath, bytes, `content(uploads): add ${name}`);
    const url = `/uploads/${year}/${month}/${name}`;
    return NextResponse.json({ url, storage: storage.kind });
  } catch (error) {
    return handleAdminError(error);
  }
}
