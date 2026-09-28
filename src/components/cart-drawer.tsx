"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { getProduct } from "@/content/products";
import { formatPrice } from "@/lib/format";
import { whatsappUrl } from "@/lib/whatsapp";
import { itemKey, useCart, type CartItem } from "./cart";
import { Photo } from "./photo";
import { categoryIcons } from "./product-card";

function orderMessage(items: CartItem[], total: number) {
  const lines = items.map((item) => {
    const product = getProduct(item.slug)!;
    const variant = [item.size && `tam. ${item.size}`, item.color]
      .filter(Boolean)
      .join(", ");
    return `• ${item.quantity}x ${product.name}${variant ? ` (${variant})` : ""} — ${formatPrice(product.price * item.quantity)}`;
  });
  return [
    "Olá, Vocal Hope! Quero fazer este pedido na loja:",
    "",
    ...lines,
    "",
    `Total: ${formatPrice(total)}`,
    "",
    "Nome:",
    "Cidade / forma de entrega:",
  ].join("\n");
}

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
                    const product = getProduct(item.slug);
                    if (!product) return null;
                    const key = itemKey(item);
                    return (
                      <li key={key} className="flex gap-4 py-5">
                        <Photo
                          src={product.image}
                          alt={product.name}
                          sizes="80px"
                          tone="light"
                          icon={categoryIcons[product.category]}
                          className="size-20 shrink-0 rounded-lg"
                        />
                        <div className="flex flex-1 flex-col">
                          <div className="flex justify-between gap-2">
                            <p className="font-medium leading-snug">{product.name}</p>
                            <button
                              type="button"
                              onClick={() => remove(key)}
                              aria-label={`Remover ${product.name}`}
                              className="text-stone hover:text-cocoa"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                          <p className="text-xs text-stone">
                            {[item.size && `Tamanho ${item.size}`, item.color]
                              .filter(Boolean)
                              .join(" · ")}
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
                              <span className="w-6 text-center text-sm tabular-nums">
                                {item.quantity}
                              </span>
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
                              {formatPrice(product.price * item.quantity)}
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
                    <span className="font-display text-2xl tabular-nums">
                      {formatPrice(total)}
                    </span>
                  </div>
                  <p className="text-xs text-stone">
                    O pedido é finalizado pelo WhatsApp, onde combinamos frete,
                    entrega e pagamento (Pix ou cartão).
                  </p>
                  <a
                    href={whatsappUrl(orderMessage(items, total))}
                    target="_blank"
                    rel="noreferrer"
                    className="flex w-full items-center justify-center rounded-full bg-ink py-4 text-sm font-semibold tracking-wide text-cream transition-colors hover:bg-cocoa"
                  >
                    Finalizar pedido pelo WhatsApp
                  </a>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
