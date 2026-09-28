import Link from "next/link";
import { Coffee, Shirt, ShoppingBag, type LucideIcon } from "lucide-react";
import type { Product } from "@/db/schema";
import { formatPrice } from "@/lib/format";
import { Photo } from "./photo";

const icons: Record<string, LucideIcon> = {
  camisetas: Shirt,
  canecas: Coffee,
  bones: ShoppingBag,
  acessorios: ShoppingBag,
};

export function categoryIcon(category: string) {
  return icons[category] ?? ShoppingBag;
}

export function ProductCard({ product, tone = "light" }: { product: Product; tone?: "light" | "dark" }) {
  return (
    <Link href={`/loja/${product.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl">
        <div className="transition-transform duration-[1.2s] ease-out-expo group-hover:scale-105">
          <Photo
            src={product.images[0] ?? null}
            alt={product.name}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            tone={tone === "light" ? "light" : "dark"}
            icon={categoryIcon(product.category)}
            className="aspect-[4/5] w-full"
          />
        </div>
        <span className="absolute bottom-4 left-4 translate-y-3 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-cream opacity-0 transition-all duration-500 ease-out-expo group-hover:translate-y-0 group-hover:opacity-100">
          Ver produto
        </span>
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <p className="font-medium leading-snug">{product.name}</p>
        <p className="shrink-0 tabular-nums opacity-70">{formatPrice(product.price)}</p>
      </div>
      {product.stock === 0 && (
        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-cocoa">Esgotado</p>
      )}
    </Link>
  );
}
