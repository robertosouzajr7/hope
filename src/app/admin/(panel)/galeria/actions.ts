"use server";

import { revalidatePath } from "next/cache";
import { asc, eq, max } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { ActionResult } from "@/components/admin/form";
import { requireUser } from "@/lib/auth";
import { hasFile, saveImage, UploadError } from "@/lib/storage";

const { photos } = schema;

export async function uploadPhotos(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireUser();
  const files = formData.getAll("photos").filter(hasFile);
  if (files.length === 0) return { ok: false, message: "Selecione pelo menos uma foto." };
  const alt = String(formData.get("alt") ?? "").trim();

  const db = await getDb();
  const [{ last }] = await db.select({ last: max(photos.position) }).from(photos);
  let position = (last ?? 0) + 1;
  try {
    for (const file of files) {
      const url = await saveImage(file, "galeria");
      await db.insert(photos).values({ url, alt: alt || "Vocal Hope", position: position++ });
    }
  } catch (error) {
    if (error instanceof UploadError) return { ok: false, message: error.message };
    throw error;
  }
  revalidatePath("/admin/galeria");
  return { ok: true, message: `${files.length} foto(s) adicionada(s).` };
}

export async function updatePhoto(id: number, formData: FormData) {
  await requireUser();
  const db = await getDb();
  await db.update(photos).set({ alt: String(formData.get("alt") ?? "").trim() }).where(eq(photos.id, id));
  revalidatePath("/admin/galeria");
}

export async function movePhoto(id: number, direction: -1 | 1) {
  await requireUser();
  const db = await getDb();
  const list = await db.select().from(photos).orderBy(asc(photos.position), asc(photos.id));
  const index = list.findIndex((p) => p.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= list.length) return;
  [list[index], list[target]] = [list[target], list[index]];
  await db.transaction(async (tx) => {
    for (const [i, p] of list.entries()) await tx.update(photos).set({ position: i }).where(eq(photos.id, p.id));
  });
  revalidatePath("/admin/galeria");
}

export async function deletePhoto(id: number) {
  await requireUser();
  const db = await getDb();
  await db.delete(photos).where(eq(photos.id, id));
  revalidatePath("/admin/galeria");
}
