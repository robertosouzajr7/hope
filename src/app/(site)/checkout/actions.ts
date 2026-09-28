"use server";

import { redirect } from "next/navigation";
import { checkoutSchema, createOrder, OrderError, startMercadoPagoCheckout } from "@/lib/orders";
import { isMercadoPagoConfigured } from "@/lib/mercadopago";
import { getBaseUrl } from "@/lib/base-url";

export type CheckoutState = {
  status: "idle" | "error";
  message?: string;
  errors?: Record<string, string>;
  values?: Record<string, string>;
};

export async function placeOrder(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && !key.startsWith("$") && key !== "items") values[key] = value;
  }

  let items: unknown = [];
  try {
    items = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    // handled by validation below
  }

  const parsed = checkoutSchema.safeParse({ ...values, items });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      errors[key] ??= issue.message;
    }
    return { status: "error", message: errors.items ?? "Confira os campos destacados.", errors, values };
  }

  let destination: string;
  try {
    const { order } = await createOrder(parsed.data);
    destination = `/pedido/${order.code}?novo=1`;

    if (isMercadoPagoConfigured()) {
      try {
        destination = await startMercadoPagoCheckout(order.id, await getBaseUrl());
      } catch (error) {
        // The order exists; the customer can retry payment from the order page.
        console.error("Falha ao iniciar pagamento no Mercado Pago", error);
      }
    }
  } catch (error) {
    if (error instanceof OrderError) return { status: "error", message: error.message, values };
    console.error("Falha ao criar pedido", error);
    return { status: "error", message: "Não foi possível concluir o pedido. Tente novamente.", values };
  }
  redirect(destination);
}
