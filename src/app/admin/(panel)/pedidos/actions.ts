"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { OrderStatus } from "@/db/schema";
import type { ActionResult } from "@/components/admin/form";
import { requireUser } from "@/lib/auth";
import { orderStatusLabels } from "@/lib/catalog";
import { isMercadoPagoConfigured } from "@/lib/mercadopago";
import { registerManualPayment, setOrderStatus, syncMercadoPagoPayment } from "@/lib/orders";

export async function updateOrder(id: number, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireUser();
  const status = String(formData.get("status")) as OrderStatus;
  if (!(status in orderStatusLabels)) return { ok: false, message: "Status inválido." };

  const db = await getDb();
  await db
    .update(schema.orders)
    .set({ trackingCode: String(formData.get("trackingCode") ?? "").trim() || null })
    .where(eq(schema.orders.id, id));
  await setOrderStatus(id, status);

  revalidatePath(`/admin/pedidos/${id}`);
  return { ok: true, message: "Pedido atualizado." };
}

export async function addManualPayment(id: number, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireUser();
  const method = String(formData.get("method") ?? "pix");
  const note = String(formData.get("note") ?? "").trim();
  await registerManualPayment(id, method, note);
  revalidatePath(`/admin/pedidos/${id}`);
  return { ok: true, message: "Pagamento registrado e pedido marcado como pago." };
}

export async function syncPayment(orderId: number, providerId: string) {
  await requireUser();
  if (isMercadoPagoConfigured()) await syncMercadoPagoPayment(providerId);
  revalidatePath(`/admin/pedidos/${orderId}`);
}
