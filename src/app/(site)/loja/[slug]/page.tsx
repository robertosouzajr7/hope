import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { categoryLabel } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { getActiveProducts, getProductBySlug, getShopSettings } from "@/lib/queries";
import { AddToCart } from "@/components/add-to-cart";
import { ProductGallery } from "@/components/product-gallery";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";

export async function generateMetadata(props: PageProps<"/loja/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
    openGraph: { images: product.images.slice(0, 1) },
  };
}

export default async function ProductPage(props: PageProps<"/loja/[slug]">) {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [all, shop] = await Promise.all([getActiveProducts(), getShopSettings()]);
  const related = all.filter((p) => p.id !== product.id).slice(0, 3);
  const delivery = [
    shop.shippingEnabled && "Envio para todo o Brasil",
    shop.pickupEnabled && "retirada em Salvador",
  ].filter(Boolean);

  return (
    <div className="bg-cream text-ink">
      <section className="mx-auto max-w-7xl px-5 pb-24 pt-32 md:px-10 md:pt-40">
        <Link href="/loja" className="group mb-10 inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink">
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          Voltar para a loja
        </Link>

        <div className="grid gap-12 md:grid-cols-2 md:gap-20">
          <Reveal>
            <ProductGallery images={product.images} name={product.name} category={product.category} />
          </Reveal>

          <Reveal delay={0.1} className="md:pt-10">
            <p className="text-xs uppercase tracking-[0.35em] text-cocoa">{categoryLabel(product.category)}</p>
            <h1 className="mt-4 font-display text-5xl leading-[1] md:text-6xl">{product.name}</h1>
            <p className="mt-6 font-display text-3xl tabular-nums text-cocoa">{formatPrice(product.price)}</p>
            <p className="mt-8 max-w-md whitespace-pre-line leading-relaxed text-ink/70">{product.description}</p>
            {product.stock !== null && product.stock > 0 && product.stock <= 5 && (
              <p className="mt-4 text-sm font-medium text-cocoa">Últimas {product.stock} unidades!</p>
            )}
            <AddToCart product={product} />
            <p className="mt-6 text-xs text-stone">
              Pagamento por Pix, cartão ou boleto
              {delivery.length > 0 ? ` · ${delivery.join(" ou ")}` : ""}.
            </p>
          </Reveal>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-ink/10 py-24">
          <div className="mx-auto max-w-7xl px-5 md:px-10">
            <h2 className="mb-12 font-display text-4xl">Você também pode gostar</h2>
            <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
