"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import type { Product } from "@/db/schema";
import { useCart } from "./cart";

function OptionGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="mt-8">
      <legend className="mb-3 text-xs uppercase tracking-[0.2em] text-stone">
        {label}: <span className="text-ink">{value}</span>
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={value === option}
            onClick={() => onChange(option)}
            className={`min-w-12 rounded-full border px-4 py-2.5 text-sm transition-colors ${
              value === option
                ? "border-ink bg-ink text-cream"
                : "border-ink/20 hover:border-ink"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function AddToCart({ product }: { product: Product }) {
  const { add } = useCart();
  const [size, setSize] = useState(product.sizes[1] ?? product.sizes[0] ?? "");
  const [color, setColor] = useState(product.colors[0] ?? "");
  const soldOut = product.stock === 0;

  return (
    <div>
      {product.sizes.length > 0 && (
        <OptionGroup label="Tamanho" options={product.sizes} value={size} onChange={setSize} />
      )}
      {product.colors.length > 0 && (
        <OptionGroup label="Cor" options={product.colors} value={color} onChange={setColor} />
      )}
      <button
        type="button"
        disabled={soldOut}
        onClick={() =>
          add({
            productId: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            image: product.images[0] ?? null,
            size: size || undefined,
            color: color || undefined,
          })
        }
        className="mt-10 inline-flex w-full items-center justify-center gap-3 rounded-full bg-ink px-8 py-5 text-sm font-semibold tracking-wide text-cream transition-colors hover:bg-cocoa disabled:cursor-not-allowed disabled:opacity-40 md:w-auto"
      >
        <ShoppingBag className="size-4" />
        {soldOut ? "Esgotado" : "Adicionar à sacola"}
      </button>
    </div>
  );
}
