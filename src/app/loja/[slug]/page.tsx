import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { categories, getProduct, products } from "@/content/products";
import { formatPrice } from "@/lib/format";
import { AddToCart } from "@/components/add-to-cart";
import { Photo } from "@/components/photo";
import { ProductCard, categoryIcons } from "@/components/product-card";
import { Reveal } from "@/components/reveal";

export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/loja/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const product = getProduct(slug);
  if (!product) return {};
  return { title: product.name, description: product.description };
}

export default async function ProductPage(props: PageProps<"/loja/[slug]">) {
  const { slug } = await props.params;
  const product = getProduct(slug);
  if (!product) notFound();

  const category = categories.find((c) => c.value === product.category);
  const related = products.filter((p) => p.slug !== product.slug).slice(0, 3);

  return (
    <div className="bg-cream text-ink">
      <section className="mx-auto max-w-7xl px-5 pb-24 pt-32 md:px-10 md:pt-40">
        <Link href="/loja" className="group mb-10 inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink">
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          Voltar para a loja
        </Link>

        <div className="grid gap-12 md:grid-cols-2 md:gap-20">
          <Reveal>
            <Photo
              src={product.image}
              alt={product.name}
              sizes="(min-width: 768px) 50vw, 100vw"
              tone="light"
              priority
              icon={categoryIcons[product.category]}
              className="aspect-[4/5] w-full rounded-3xl"
            />
          </Reveal>

          <Reveal delay={0.1} className="md:pt-10">
            <p className="text-xs uppercase tracking-[0.35em] text-cocoa">{category?.label}</p>
            <h1 className="mt-4 font-display text-5xl leading-[1] md:text-6xl">{product.name}</h1>
            <p className="mt-6 font-display text-3xl tabular-nums text-cocoa">{formatPrice(product.price)}</p>
            <p className="mt-8 max-w-md leading-relaxed text-ink/70">{product.description}</p>
            <AddToCart product={product} />
            <p className="mt-6 text-xs text-stone">
              Pedido finalizado pelo WhatsApp · Envio para todo o Brasil ou retirada em Salvador.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-ink/10 py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <h2 className="mb-12 font-display text-4xl">Você também pode gostar</h2>
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
