"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { itemKey, useCart } from "./cart";
import { Photo } from "./photo";

export function CartDrawer() {
  const { items, total, isOpen, close, setQuantity, remove } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Sacola de compras"
            data-lenis-prevent
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-cream text-ink"
          >
            <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
              <h2 className="font-display text-2xl">Sua sacola</h2>
              <button
                type="button"
                onClick={close}
                aria-label="Fechar sacola"
                className="flex size-10 items-center justify-center rounded-full hover:bg-ink/5"
              >
                <X className="size-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <ShoppingBag className="size-10 text-cocoa/50" strokeWidth={1.2} />
                <p className="text-stone">Sua sacola está vazia.</p>
                <Link
                  href="/loja"
                  onClick={close}
                  className="rounded-full bg-ink px-6 py-3 text-sm text-cream transition-colors hover:bg-cocoa"
                >
                  Conhecer a loja
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-ink/10 overflow-y-auto px-6">
                  {items.map((item) => {
                    const key = itemKey(item);
                    return (
                      <li key={key} className="flex gap-4 py-5">
                        <Photo
                          src={item.image}
                          alt={item.name}
                          sizes="80px"
                          tone="light"
                          icon={ShoppingBag}
                          className="size-20 shrink-0 rounded-lg"
                        />
                        <div className="flex flex-1 flex-col">
                          <div className="flex justify-between gap-2">
                            <Link href={`/loja/${item.slug}`} onClick={close} className="font-medium leading-snug hover:underline">
                              {item.name}
                            </Link>
                            <button
                              type="button"
                              onClick={() => remove(key)}
                              aria-label={`Remover ${item.name}`}
                              className="text-stone hover:text-cocoa"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                          <p className="text-xs text-stone">
                            {[item.size && `Tamanho ${item.size}`, item.color].filter(Boolean).join(" · ")}
                          </p>
                          <div className="mt-auto flex items-center justify-between pt-2">
                            <div className="flex items-center rounded-full border border-ink/15">
                              <button
                                type="button"
                                onClick={() => setQuantity(key, item.quantity - 1)}
                                aria-label="Diminuir quantidade"
                                className="flex size-8 items-center justify-center"
                              >
                                <Minus className="size-3.5" />
                              </button>
                              <span className="w-6 text-center text-sm tabular-nums">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => setQuantity(key, item.quantity + 1)}
                                aria-label="Aumentar quantidade"
                                className="flex size-8 items-center justify-center"
                              >
                                <Plus className="size-3.5" />
                              </button>
                            </div>
                            <span className="text-sm font-semibold tabular-nums">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <div className="space-y-4 border-t border-ink/10 px-6 py-6">
                  <div className="flex items-baseline justify-between">
                    <span className="text-stone">Subtotal</span>
                    <span className="font-display text-2xl tabular-nums">{formatPrice(total)}</span>
                  </div>
                  <p className="text-xs text-stone">Frete e forma de entrega calculados no checkout.</p>
                  <Link
                    href="/checkout"
                    onClick={close}
                    className="flex w-full items-center justify-center rounded-full bg-ink py-4 text-sm font-semibold tracking-wide text-cream transition-colors hover:bg-cocoa"
                  >
                    Finalizar compra
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
