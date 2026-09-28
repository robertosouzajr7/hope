import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { ShopGrid } from "@/components/shop-grid";
import { getActiveProducts, getShopSettings } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Loja",
  description: "Camisetas, canecas, bonés e acessórios oficiais do Vocal Hope.",
};

export default async function ShopPage() {
  const [products, shop] = await Promise.all([getActiveProducts(), getShopSettings()]);

  return (
    <>
      <PageHeader
        eyebrow="Loja oficial"
        title="Vista a esperança"
        description="Produtos personalizados do Vocal Hope. Cada compra apoia a produção das nossas próximas músicas e projetos."
      />
      <section className="bg-cream py-20 text-ink md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          {shop.notice && (
            <p className="mb-10 rounded-2xl bg-sand px-6 py-4 text-sm text-ink/80">{shop.notice}</p>
          )}
          <ShopGrid products={products} />
        </div>
      </section>
    </>
  );
}
