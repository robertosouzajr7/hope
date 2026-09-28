"use server";

import { redirect } from "next/navigation";
import { getBaseUrl } from "@/lib/base-url";
import { getOrderByCode, startMercadoPagoCheckout } from "@/lib/orders";

export async function payOrder(code: string) {
  const data = await getOrderByCode(code);
  if (!data || data.order.status !== "pending") redirect(`/pedido/${code}`);
  const url = await startMercadoPagoCheckout(data.order.id, await getBaseUrl());
  redirect(url);
}
