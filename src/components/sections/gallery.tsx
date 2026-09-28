"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Photo } from "../photo";

const shapes = ["aspect-[4/5]", "aspect-[3/4] mt-24", "aspect-square", "aspect-[4/5] mt-16", "aspect-[3/4]"];

// Vertical scroll drives a horizontal photo strip while the section is pinned.
export type GalleryPhoto = { id: number; url: string | null; alt: string };

export function Gallery({ photos }: { photos: GalleryPhoto[] }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const trackRef = useRef<HTMLUListElement>(null);
  const [distance, setDistance] = useState(0);
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => setDistance(Math.max(0, track.scrollWidth - window.innerWidth));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <section ref={ref} aria-label="Galeria" className="relative h-[280vh] bg-ink">
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden">
        <div className="mx-auto mb-10 flex w-full max-w-7xl items-end justify-between px-5 md:px-10">
          <h2 className="font-display text-5xl text-cream md:text-7xl">
            Em <em className="text-latte">cena</em>
          </h2>
          <p className="hidden max-w-xs text-sm text-cream/50 md:block">
            Palcos, bastidores e ensaios. Momentos de quem vive a música como ministério.
          </p>
        </div>
        <motion.ul ref={trackRef} style={{ x }} className="flex w-max items-start gap-6 px-5 md:gap-10 md:px-10">
          {photos.map((photo, i) => (
            <li key={photo.id} className={`relative w-[70vw] shrink-0 md:w-[32vw] ${shapes[i % shapes.length]}`}>
              <Photo
                src={photo.url}
                alt={photo.alt}
                sizes="(min-width: 768px) 32vw, 70vw"
                className="h-full w-full rounded-2xl"
              />
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-stone">
                {String(i + 1).padStart(2, "0")} — {photo.alt}
              </p>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
