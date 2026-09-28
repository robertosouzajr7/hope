"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

const MAX_SIDE = 2560;
const QUALITY = 0.85;

// Downscales a photo in the browser and re-encodes it as WebP, so camera
// originals (10–150 MB) upload as a few hundred KB and fit the server limits.
async function optimize(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", QUALITY));
  if (!blob) return file;
  const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
  return new File([blob], name, { type: "image/webp" });
}

export function ImageFileInput({
  name,
  multiple,
  className = "",
}: {
  name: string;
  multiple?: boolean;
  className?: string;
}) {
  const [status, setStatus] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const files = Array.from(input.files ?? []);
    if (files.length === 0) return;

    // Blocks form submission until the optimized files are in place.
    input.setCustomValidity("Aguarde a otimização das fotos.");
    const optimized = new DataTransfer();
    let before = 0;
    let after = 0;
    try {
      for (const [i, file] of files.entries()) {
        setStatus(`Otimizando foto ${i + 1} de ${files.length}…`);
        const result = await optimize(file).catch(() => file);
        before += file.size;
        after += result.size;
        optimized.items.add(result);
      }
      input.files = optimized.files;
      const mb = (n: number) => (n / 1024 / 1024).toFixed(1).replace(".", ",");
      setStatus(`${files.length} foto(s) pronta(s): ${mb(before)} MB → ${mb(after)} MB`);
    } finally {
      input.setCustomValidity("");
    }
  }

  return (
    <div>
      <input
        name={name}
        type="file"
        multiple={multiple}
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={handleChange}
        className={`admin-input file:mr-3 file:rounded file:border-0 file:bg-sand file:px-2 file:py-1 ${className}`}
      />
      {status && (
        <p className="mt-1 flex items-center gap-1.5 text-xs text-ink/60">
          {status.startsWith("Otimizando") && <Loader2 className="size-3 animate-spin" />}
          {status}
        </p>
      )}
    </div>
  );
}
