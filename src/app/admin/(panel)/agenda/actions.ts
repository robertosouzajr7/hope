"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { ActionResult } from "@/components/admin/form";
import { requireUser } from "@/lib/auth";

function readEvent(formData: FormData) {
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const date = get("date");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Informe a data." } as const;
  if (!get("title")) return { error: "Informe o nome do evento." } as const;
  if (!get("venue") || !get("city")) return { error: "Informe o local e a cidade." } as const;
  return {
    values: {
      date,
      time: get("time") || null,
      title: get("title"),
      venue: get("venue"),
      city: get("city"),
      link: get("link") || null,
      published: formData.get("published") === "on",
    },
  } as const;
}

export async function createEvent(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireUser();
  const result = readEvent(formData);
  if ("error" in result) return { ok: false, message: result.error };
  const db = await getDb();
  await db.insert(schema.events).values(result.values);
  revalidatePath("/admin/agenda");
  redirect("/admin/agenda");
}

export async function updateEvent(id: number, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireUser();
  const result = readEvent(formData);
  if ("error" in result) return { ok: false, message: result.error };
  const db = await getDb();
  await db.update(schema.events).set(result.values).where(eq(schema.events.id, id));
  revalidatePath("/admin/agenda", "layout");
  return { ok: true, message: "Evento salvo." };
}

export async function deleteEvent(id: number) {
  await requireUser();
  const db = await getDb();
  await db.delete(schema.events).where(eq(schema.events.id, id));
  revalidatePath("/admin/agenda");
  redirect("/admin/agenda");
}
