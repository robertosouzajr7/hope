import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { products } from "@/content/products";
import { ProductCard } from "../product-card";
import { Reveal, RevealText } from "../reveal";

export function ShopPreview() {
  const featured = products.filter((p) => p.featured).slice(0, 4);

  return (
    <section className="bg-cream py-28 text-ink md:py-40">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Reveal>
              <p className="mb-6 text-xs uppercase tracking-[0.35em] text-cocoa">Loja oficial</p>
            </Reveal>
            <RevealText text="Vista a esperança" className="font-display text-5xl md:text-7xl" />
            <Reveal delay={0.15}>
              <p className="mt-6 max-w-md text-ink/65">
                Produtos personalizados do Vocal Hope. Cada compra apoia diretamente a produção
                das nossas próximas músicas.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <Link
              href="/loja"
              className="group inline-flex items-center gap-3 rounded-full bg-ink px-7 py-4 text-sm font-semibold text-cream transition-colors hover:bg-cocoa"
            >
              Ver todos os produtos
              <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>

        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product, i) => (
            <Reveal key={product.slug} delay={i * 0.08}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
