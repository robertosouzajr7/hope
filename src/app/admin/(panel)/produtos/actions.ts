"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, ne } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { ActionResult } from "@/components/admin/form";
import { requireUser } from "@/lib/auth";
import { categories } from "@/lib/catalog";
import { parseMoney, slugify, splitList } from "@/lib/money";
import { hasFile, saveImage, UploadError } from "@/lib/storage";

const { products } = schema;

async function readProduct(formData: FormData, currentImages: string[]) {
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return { error: "Informe o nome do produto." } as const;

  const category = String(formData.get("category") ?? "");
  if (!categories.some((c) => c.value === category)) return { error: "Escolha uma categoria." } as const;

  const price = parseMoney(String(formData.get("price") ?? ""));
  if (price === null || price <= 0) return { error: "Informe um preço válido (ex.: 89,90)." } as const;

  const stockRaw = String(formData.get("stock") ?? "").trim();
  const stock = stockRaw === "" ? null : Number.parseInt(stockRaw, 10);
  if (stock !== null && (!Number.isFinite(stock) || stock < 0)) return { error: "Estoque inválido." } as const;

  const removed = new Set(formData.getAll("removeImage").map(String));
  const images = currentImages.filter((src) => !removed.has(src));
  for (const file of formData.getAll("images")) {
    if (hasFile(file)) images.push(await saveImage(file, "produtos"));
  }
  const cover = String(formData.get("cover") ?? "");
  if (cover && images.includes(cover)) images.sort((a, b) => (a === cover ? -1 : b === cover ? 1 : 0));

  return {
    values: {
      name,
      slug: slugify(String(formData.get("slug") ?? "") || name),
      category,
      price,
      stock,
      description: String(formData.get("description") ?? "").trim(),
      sizes: splitList(String(formData.get("sizes") ?? "")),
      colors: splitList(String(formData.get("colors") ?? "")),
      featured: formData.get("featured") === "on",
      active: formData.get("active") === "on",
      position: Number.parseInt(String(formData.get("position") ?? "0"), 10) || 0,
      images,
    },
  } as const;
}

async function slugTaken(slug: string, exceptId?: number) {
  const db = await getDb();
  const [row] = await db
    .select({ id: products.id })
    .from(products)
    .where(exceptId ? and(eq(products.slug, slug), ne(products.id, exceptId)) : eq(products.slug, slug));
  return Boolean(row);
}

export async function createProduct(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireUser();
  let id: number;
  try {
    const result = await readProduct(formData, []);
    if ("error" in result) return { ok: false, message: result.error };
    if (await slugTaken(result.values.slug)) return { ok: false, message: "Já existe um produto com esse endereço (slug)." };
    const db = await getDb();
    [{ id }] = await db.insert(products).values(result.values).returning({ id: products.id });
  } catch (error) {
    if (error instanceof UploadError) return { ok: false, message: error.message };
    throw error;
  }
  revalidatePath("/admin/produtos");
  redirect(`/admin/produtos/${id}?criado=1`);
}

export async function updateProduct(id: number, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireUser();
  const db = await getDb();
  const [current] = await db.select().from(products).where(eq(products.id, id));
  if (!current) return { ok: false, message: "Produto não encontrado." };

  try {
    const result = await readProduct(formData, current.images);
    if ("error" in result) return { ok: false, message: result.error };
    if (await slugTaken(result.values.slug, id)) return { ok: false, message: "Já existe um produto com esse endereço (slug)." };
    await db.update(products).set(result.values).where(eq(products.id, id));
  } catch (error) {
    if (error instanceof UploadError) return { ok: false, message: error.message };
    throw error;
  }
  revalidatePath("/admin/produtos", "layout");
  return { ok: true, message: "Produto salvo." };
}

export async function deleteProduct(id: number) {
  await requireUser();
  const db = await getDb();
  // Order history keeps the item name and price; the product link becomes null.
  await db.delete(products).where(eq(products.id, id));
  revalidatePath("/admin/produtos");
  redirect("/admin/produtos");
}

export async function toggleProduct(id: number, active: boolean) {
  await requireUser();
  const db = await getDb();
  await db.update(products).set({ active }).where(eq(products.id, id));
  revalidatePath("/admin/produtos");
}
