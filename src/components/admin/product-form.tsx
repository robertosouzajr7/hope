import Image from "next/image";
import type { Product } from "@/db/schema";
import { categories } from "@/lib/catalog";
import { centsToInput } from "@/lib/money";
import { AdminForm, type ActionResult } from "./form";
import { Checkbox, Field } from "./ui";

export function ProductForm({
  action,
  product,
}: {
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  product?: Product;
}) {
  return (
    <AdminForm action={action} submitLabel={product ? "Salvar alterações" : "Criar produto"}>
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="admin-card space-y-4">
          <Field label="Nome">
            <input name="name" required defaultValue={product?.name} className="admin-input" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Categoria">
              <select name="category" defaultValue={product?.category ?? "camisetas"} className="admin-input">
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Preço (R$)">
              <input name="price" required inputMode="decimal" placeholder="89,90" defaultValue={product ? centsToInput(product.price) : ""} className="admin-input" />
            </Field>
          </div>
          <Field label="Descrição">
            <textarea name="description" rows={5} defaultValue={product?.description} className="admin-input" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tamanhos" hint="Separados por vírgula. Deixe vazio se não tiver.">
              <input name="sizes" placeholder="P, M, G, GG" defaultValue={product?.sizes.join(", ")} className="admin-input" />
            </Field>
            <Field label="Cores" hint="Separadas por vírgula.">
              <input name="colors" placeholder="Preto, Creme" defaultValue={product?.colors.join(", ")} className="admin-input" />
            </Field>
          </div>
        </div>

        <div className="space-y-6">
          <div className="admin-card space-y-4">
            <Field label="Estoque" hint="Deixe vazio para não controlar estoque (sob encomenda).">
              <input name="stock" type="number" min={0} defaultValue={product?.stock ?? ""} className="admin-input" />
            </Field>
            <Field label="Ordem de exibição" hint="Menor aparece primeiro.">
              <input name="position" type="number" defaultValue={product?.position ?? 0} className="admin-input" />
            </Field>
            <Field label="Endereço (slug)" hint="Gerado a partir do nome se ficar vazio.">
              <input name="slug" defaultValue={product?.slug} className="admin-input" />
            </Field>
            <div className="space-y-2 pt-2">
              <Checkbox name="active" label="Visível na loja" defaultChecked={product?.active ?? true} />
              <Checkbox name="featured" label="Destaque na página inicial" defaultChecked={product?.featured} />
            </div>
          </div>

          <div className="admin-card space-y-4">
            <p className="admin-label">Fotos</p>
            {product && product.images.length > 0 && (
              <ul className="grid grid-cols-3 gap-3">
                {product.images.map((src, i) => (
                  <li key={src} className="space-y-1.5 text-xs">
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-sand">
                      <Image src={src} alt="" fill sizes="120px" className="object-cover" />
                    </div>
                    <label className="flex items-center gap-1.5">
                      <input type="radio" name="cover" value={src} defaultChecked={i === 0} className="accent-ink" /> Capa
                    </label>
                    <label className="flex items-center gap-1.5 text-red-700">
                      <input type="checkbox" name="removeImage" value={src} className="accent-red-700" /> Remover
                    </label>
                  </li>
                ))}
              </ul>
            )}
            <Field label="Adicionar fotos" hint="JPG, PNG ou WEBP até 6 MB cada.">
              <input name="images" type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple className="admin-input file:mr-3 file:rounded file:border-0 file:bg-sand file:px-2 file:py-1" />
            </Field>
          </div>
        </div>
      </div>
    </AdminForm>
  );
}
