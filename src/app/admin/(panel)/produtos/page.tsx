import Image from "next/image";
import Link from "next/link";
import { asc } from "drizzle-orm";
import { Eye, EyeOff, Plus } from "lucide-react";
import { getDb, schema } from "@/db";
import { categoryLabel } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { Badge, Empty, PageHeader } from "@/components/admin/ui";
import { toggleProduct } from "./actions";

export const metadata = { title: "Produtos" };

export default async function ProductsPage() {
  const db = await getDb();
  const products = await db.select().from(schema.products).orderBy(asc(schema.products.position), asc(schema.products.id));

  return (
    <>
      <PageHeader
        title="Produtos"
        description={`${products.length} produto(s) cadastrados.`}
        actions={
          <Link href="/admin/produtos/novo" className="admin-btn">
            <Plus className="size-4" /> Novo produto
          </Link>
        }
      />
      {products.length === 0 ? (
        <Empty>Nenhum produto. Cadastre o primeiro!</Empty>
      ) : (
        <div className="admin-card overflow-x-auto p-0 md:p-0">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Categoria</th>
                <th className="text-right">Preço</th>
                <th className="text-right">Estoque</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/admin/produtos/${p.id}`} className="flex items-center gap-3 font-medium hover:underline">
                      <span className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-sand">
                        {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="40px" className="object-cover" />}
                      </span>
                      {p.name}
                    </Link>
                  </td>
                  <td className="text-ink/60">{categoryLabel(p.category)}</td>
                  <td className="text-right tabular-nums">{formatPrice(p.price)}</td>
                  <td className="text-right tabular-nums">
                    {p.stock === null ? <span className="text-ink/40">—</span> : p.stock === 0 ? <Badge tone="red">Esgotado</Badge> : p.stock}
                  </td>
                  <td className="space-x-1">
                    <Badge tone={p.active ? "green" : "gray"}>{p.active ? "Visível" : "Oculto"}</Badge>
                    {p.featured && <Badge tone="brown">Destaque</Badge>}
                  </td>
                  <td className="text-right">
                    <form action={toggleProduct.bind(null, p.id, !p.active)}>
                      <button className="admin-btn-ghost px-2 py-1.5" title={p.active ? "Ocultar da loja" : "Mostrar na loja"}>
                        {p.active ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
