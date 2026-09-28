import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { PaymentStatus } from "@/db/schema";

// Mercado Pago Checkout Pro via REST API.
// Docs: https://www.mercadopago.com.br/developers/pt/docs/checkout-pro

const API = "https://api.mercadopago.com";

export function isMercadoPagoConfigured() {
  return Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN);
}

async function mp<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Mercado Pago ${path} respondeu ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

type PreferenceInput = {
  orderCode: string;
  items: { id: string; title: string; quantity: number; unitPrice: number }[];
  shippingFee: number;
  payer: { name: string; email: string };
  baseUrl: string;
};

export async function createPreference(input: PreferenceInput) {
  const { orderCode, baseUrl } = input;
  const returnUrl = `${baseUrl}/pedido/${orderCode}?novo=1`;
  const isPublic = baseUrl.startsWith("https://");

  const items = input.items.map((i) => ({
    id: i.id,
    title: i.title,
    quantity: i.quantity,
    unit_price: i.unitPrice / 100,
    currency_id: "BRL",
  }));
  if (input.shippingFee > 0) {
    items.push({ id: "frete", title: "Frete", quantity: 1, unit_price: input.shippingFee / 100, currency_id: "BRL" });
  }

  const [firstName, ...rest] = input.payer.name.trim().split(/\s+/);

  const preference = await mp<{ id: string; init_point: string }>("/checkout/preferences", {
    method: "POST",
    headers: { "X-Idempotency-Key": `pref-${orderCode}-${Date.now()}` },
    body: JSON.stringify({
      items,
      payer: { name: firstName, surname: rest.join(" "), email: input.payer.email },
      external_reference: orderCode,
      statement_descriptor: "VOCALHOPE",
      back_urls: { success: returnUrl, pending: returnUrl, failure: returnUrl },
      // Mercado Pago only accepts these for publicly reachable HTTPS URLs.
      ...(isPublic && {
        auto_return: "approved",
        notification_url: `${baseUrl}/api/webhooks/mercadopago`,
      }),
    }),
  });

  return { preferenceId: preference.id, checkoutUrl: preference.init_point };
}

export type MercadoPagoPayment = {
  id: number;
  status: string;
  status_detail: string;
  external_reference: string | null;
  transaction_amount: number;
  payment_type_id: string;
  payment_method_id: string;
  date_approved: string | null;
};

export function getPayment(id: string) {
  return mp<MercadoPagoPayment>(`/v1/payments/${encodeURIComponent(id)}`);
}

export function mapPaymentStatus(status: string): PaymentStatus {
  switch (status) {
    case "approved":
      return "approved";
    case "rejected":
      return "rejected";
    case "cancelled":
      return "cancelled";
    case "refunded":
    case "charged_back":
      return "refunded";
    case "in_process":
    case "in_mediation":
    case "authorized":
      return "in_process";
    default:
      return "pending";
  }
}

export function mapPaymentMethod(payment: MercadoPagoPayment) {
  if (payment.payment_method_id === "pix") return "pix";
  return payment.payment_type_id;
}

// Validates the x-signature header Mercado Pago sends with webhooks.
// https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
export function verifyWebhookSignature(headers: Headers, dataId: string) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return true;

  const signature = headers.get("x-signature") ?? "";
  const requestId = headers.get("x-request-id") ?? "";
  const parts = Object.fromEntries(
    signature.split(",").map((part) => part.split("=").map((s) => s.trim()) as [string, string]),
  );
  if (!parts.ts || !parts.v1) return false;

  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${parts.ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(parts.v1);
  return a.length === b.length && timingSafeEqual(a, b);
}
