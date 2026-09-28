"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Product } from "@/db/schema";
import { categories } from "@/lib/catalog";
import { ProductCard } from "./product-card";

export function ShopGrid({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState<string>("todos");
  const visible = filter === "todos" ? products : products.filter((p) => p.category === filter);
  const available = categories.filter((c) => products.some((p) => p.category === c.value));

  if (products.length === 0) {
    return <p className="py-20 text-center text-ink/60">Novos produtos em breve.</p>;
  }

  return (
    <>
      <div role="tablist" aria-label="Categorias" className="mb-14 flex flex-wrap gap-2">
        {[{ value: "todos" as const, label: "Todos" }, ...available].map((c) => (
          <button
            key={c.value}
            type="button"
            role="tab"
            aria-selected={filter === c.value}
            onClick={() => setFilter(c.value)}
            className={`relative rounded-full px-5 py-2.5 text-sm transition-colors ${
              filter === c.value ? "text-cream" : "text-ink/70 hover:text-ink"
            }`}
          >
            {filter === c.value && (
              <motion.span
                layoutId="shop-filter"
                className="absolute inset-0 rounded-full bg-ink"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative">{c.label}</span>
          </button>
        ))}
      </div>

      <motion.div layout className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.map((product) => (
            <motion.div
              key={product.slug}
              layout
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
