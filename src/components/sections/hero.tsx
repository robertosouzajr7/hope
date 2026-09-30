"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowDown } from "lucide-react";
import type { SiteSettings } from "@/lib/settings-schema";
import { Photo } from "../photo";

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero({ site }: { site: SiteSettings }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.25]);
  const photoY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "60%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="relative h-svh min-h-[640px] overflow-hidden bg-ink">
      <motion.div
        style={{ scale, y: photoY }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.8, ease }}
        className="absolute inset-0"
      >
        <Photo src={site.heroImage} alt={site.name} priority icon={null} className="h-full w-full" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/20 to-ink" />

      <motion.div
        style={{ y: titleY, opacity: fade }}
        className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-16 md:px-10 md:pb-24"
      >
        <h1 className="font-display text-[19vw] leading-[0.82] tracking-tight text-cream md:text-[13vw]">
          {site.name.split(" ").slice(0, 2).map((word, i) => (
            <span key={word} className="block overflow-hidden">
              <motion.span
                className={`block ${i === 1 ? "pl-[12vw] italic text-sand" : ""}`}
                initial={{ y: "105%" }}
                animate={{ y: 0 }}
                transition={{ delay: 0.25 + i * 0.12, duration: 1.3, ease }}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h1>

        <div className="mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 1, ease }}
            className="max-w-md text-lg text-cream/75"
          >
            {site.tagline} Harmonias vocais, groove e letras que apontam para Jesus.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.05, duration: 1, ease }}
            className="flex flex-wrap gap-3"
          >
            <Link
              href="#musica"
              className="rounded-full bg-cream px-7 py-4 text-sm font-semibold text-ink transition-colors hover:bg-latte"
            >
              Ouça o single
            </Link>
            <Link
              href="#contato"
              className="rounded-full border border-cream/30 px-7 py-4 text-sm font-semibold text-cream transition-colors hover:border-cream hover:bg-cream/10"
            >
              Convide o grupo
            </Link>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 md:block"
      >
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
          <ArrowDown className="size-5 text-cream/50" />
        </motion.div>
      </motion.div>
    </section>
  );
}
