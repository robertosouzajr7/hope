import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ExternalLink, Trash2 } from "lucide-react";
import { getDb, schema } from "@/db";
import { ConfirmButton } from "@/components/admin/form";
import { ProductForm } from "@/components/admin/product-form";
import { PageHeader } from "@/components/admin/ui";
import { deleteProduct, updateProduct } from "../actions";

export const metadata = { title: "Editar produto" };

export default async function EditProductPage(props: PageProps<"/admin/produtos/[id]">) {
  const { id } = await props.params;
  const { criado } = await props.searchParams;
  const db = await getDb();
  const [product] = await db.select().from(schema.products).where(eq(schema.products.id, Number(id) || 0));
  if (!product) notFound();

  return (
    <>
      <PageHeader
        title={product.name}
        back={{ href: "/admin/produtos", label: "Produtos" }}
        actions={
          <>
            <Link href={`/loja/${product.slug}`} target="_blank" className="admin-btn-ghost">
              <ExternalLink className="size-4" /> Ver na loja
            </Link>
            <form action={deleteProduct.bind(null, product.id)}>
              <ConfirmButton message="Excluir este produto? Os pedidos antigos continuam registrados.">
                <Trash2 className="size-4" /> Excluir
              </ConfirmButton>
            </form>
          </>
        }
      />
      {criado && <p className="mb-6 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">Produto criado com sucesso.</p>}
      <ProductForm action={updateProduct.bind(null, product.id)} product={product} />
    </>
  );
}
