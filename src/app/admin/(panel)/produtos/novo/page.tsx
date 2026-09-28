import { PageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/product-form";
import { createProduct } from "../actions";

export const metadata = { title: "Novo produto" };

export default function NewProductPage() {
  return (
    <>
      <PageHeader title="Novo produto" back={{ href: "/admin/produtos", label: "Produtos" }} />
      <ProductForm action={createProduct} />
    </>
  );
}
