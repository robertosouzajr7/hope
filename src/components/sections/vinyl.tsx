"use client";

import { motion } from "motion/react";
import { single } from "@/content/site";

// Sleeve + record that slides out and spins, a nod to the single's 80s pop aesthetic.
export function Vinyl() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md">
      <motion.div
        initial={{ x: 0, rotate: 0 }}
        whileInView={{ x: "28%", rotate: 0 }}
        viewport={{ once: true, margin: "-20%" }}
        transition={{ duration: 1.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-[4%]"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
          className="h-full w-full rounded-full shadow-2xl"
          style={{
            background:
              "repeating-radial-gradient(circle, #111 0 2px, #1c1916 2px 4px), #111",
          }}
        >
          <div className="absolute inset-[34%] flex items-center justify-center rounded-full bg-[conic-gradient(from_0deg,#c9ae8c,#6b4a32,#e6d9c3,#c9ae8c)]">
            <span className="size-3 rounded-full bg-ink" />
          </div>
        </motion.div>
      </motion.div>

      <div className="grain absolute inset-0 overflow-hidden rounded-md bg-[linear-gradient(160deg,#e6d9c3_0%,#c9ae8c_45%,#6b4a32_100%)] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)]">
        <div className="absolute inset-x-0 top-[38%] h-[3px] bg-ink/80" />
        <div className="absolute inset-x-0 top-[44%] h-[3px] bg-ink/60" />
        <div className="absolute inset-x-0 top-[50%] h-[3px] bg-ink/40" />
        <div className="absolute -right-[20%] top-[10%] size-[70%] rounded-full bg-cream/40 blur-2xl" />
        <div className="absolute inset-0 flex flex-col justify-between p-7">
          <p className="text-[11px] uppercase tracking-[0.4em] text-ink/70">Vocal Hope</p>
          <p className="font-display text-4xl italic leading-[0.95] text-ink md:text-5xl">
            {single.title}
          </p>
        </div>
      </div>
    </div>
  );
}
