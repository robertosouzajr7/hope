import { readFile } from "node:fs/promises";
import path from "node:path";
import { UPLOAD_DIR } from "@/lib/storage";

const types: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

// Serves images uploaded through the admin when no external storage is configured.
export async function GET(_req: Request, ctx: RouteContext<"/uploads/[...path]">) {
  const { path: parts } = await ctx.params;
  const file = path.resolve(UPLOAD_DIR, ...parts);
  if (!file.startsWith(UPLOAD_DIR + path.sep)) return new Response("Not found", { status: 404 });

  const type = types[path.extname(file).toLowerCase()];
  if (!type) return new Response("Not found", { status: 404 });

  try {
    const data = await readFile(file);
    return new Response(data, {
      headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
