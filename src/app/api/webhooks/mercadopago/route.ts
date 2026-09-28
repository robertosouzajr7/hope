import { verifyWebhookSignature } from "@/lib/mercadopago";
import { isMercadoPagoConfigured, syncMercadoPagoPayment } from "@/lib/orders";

// Mercado Pago notifications. The payment is always re-fetched from the
// Mercado Pago API, so the request body is never trusted for its status.
export async function POST(request: Request) {
  if (!isMercadoPagoConfigured()) return new Response("Not configured", { status: 503 });

  const url = new URL(request.url);
  let body: { type?: string; action?: string; data?: { id?: string | number } } = {};
  try {
    body = await request.json();
  } catch {
    // Some notifications only carry query parameters.
  }

  const type = body.type ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
  const dataId = String(body.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? "");

  if (type !== "payment" || !/^\d+$/.test(dataId)) return new Response("Ignored", { status: 200 });
  if (!verifyWebhookSignature(request.headers, url.searchParams.get("data.id") ?? dataId)) {
    return new Response("Invalid signature", { status: 401 });
  }

  try {
    await syncMercadoPagoPayment(dataId);
  } catch (error) {
    console.error("Webhook Mercado Pago falhou", error);
    // Non-2xx makes Mercado Pago retry later.
    return new Response("Error", { status: 500 });
  }
  return new Response("OK", { status: 200 });
}
