import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { ShopGrid } from "@/components/shop-grid";

export const metadata: Metadata = {
  title: "Loja",
  description: "Camisetas, canecas, bonés e acessórios oficiais do Vocal Hope.",
};

export default function ShopPage() {
  return (
    <>
      <PageHeader
        eyebrow="Loja oficial"
        title="Vista a esperança"
        description="Produtos personalizados do Vocal Hope. Cada compra apoia a produção das nossas próximas músicas e projetos."
      />
      <section className="bg-cream py-20 text-ink md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <ShopGrid />
        </div>
      </section>
    </>
  );
}
