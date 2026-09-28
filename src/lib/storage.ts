import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const UPLOAD_DIR = path.join(process.cwd(), ".data", "uploads");

const MAX_BYTES = 6 * 1024 * 1024;
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export class UploadError extends Error {}

export function hasFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File && value.size > 0;
}

// Stores an image on Vercel Blob when configured, otherwise on local disk
// (served by the /uploads route). Returns the public URL.
export async function saveImage(file: File, folder: string) {
  const ext = ALLOWED[file.type];
  if (!ext) throw new UploadError("Envie imagens JPG, PNG, WEBP ou AVIF.");
  if (file.size > MAX_BYTES) throw new UploadError("Cada imagem pode ter no máximo 6 MB.");

  const name = `${folder}/${randomUUID()}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(name, file, { access: "public", contentType: file.type });
    return blob.url;
  }

  const target = path.join(UPLOAD_DIR, name);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}
