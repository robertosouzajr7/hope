"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Photo } from "./photo";
import { categoryIcon } from "./product-card";

export function ProductGallery({ images, name, category }: { images: string[]; name: string; category: string }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? null;

  return (
    <div>
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={current ?? "placeholder"}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <Photo
              src={current}
              alt={name}
              sizes="(min-width: 768px) 50vw, 100vw"
              tone="light"
              priority
              icon={categoryIcon(category)}
              className="h-full w-full"
            />
          </motion.div>
        </AnimatePresence>
      </div>
      {images.length > 1 && (
        <div className="mt-4 flex gap-3">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ver imagem ${i + 1}`}
              aria-pressed={i === active}
              className={`relative size-20 overflow-hidden rounded-xl ring-2 transition ${
                i === active ? "ring-ink" : "ring-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Photo src={src} alt="" sizes="80px" tone="light" className="h-full w-full" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
