import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { AudioLines } from "lucide-react";

type PhotoProps = {
  src: string | null;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  tone?: "dark" | "light";
  icon?: LucideIcon | null;
};

// Renders a real photo when available, otherwise a warm textured placeholder,
// so the layout stays intact while the group's photos are being produced.
export function Photo({
  src,
  alt,
  sizes = "100vw",
  priority,
  className = "",
  tone = "dark",
  icon: Icon = AudioLines,
}: PhotoProps) {
  return (
    <div className={`grain relative overflow-hidden ${className}`}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <div
          role="img"
          aria-label={alt}
          className={`absolute inset-0 flex items-center justify-center ${
            tone === "dark"
              ? "bg-[radial-gradient(ellipse_at_30%_20%,#6b4a32_0%,#3e2a1c_35%,#1c1916_75%)] text-latte/40"
              : "bg-[radial-gradient(ellipse_at_30%_20%,#f4eee3_0%,#e6d9c3_45%,#c9ae8c_100%)] text-cocoa/40"
          }`}
        >
          {Icon && <Icon className="size-1/5 max-h-24 max-w-24" strokeWidth={1} />}
        </div>
      )}
    </div>
  );
}
