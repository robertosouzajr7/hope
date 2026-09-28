import "server-only";
import { randomInt } from "node:crypto";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema, type Database } from "@/db";
import type { Address, OrderStatus } from "@/db/schema";
import {
  createPreference,
  getPayment,
  isMercadoPagoConfigured,
  mapPaymentMethod,
  mapPaymentStatus,
} from "./mercadopago";
import { getShopSettings } from "./queries";

const { orders, orderItems, payments, products } = schema;
type Tx = Parameters<Parameters<Database["transaction"]>[0]>[0];

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function newOrderCode() {
  let code = "";
  for (let i = 0; i < 10; i++) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return code;
}

export class OrderError extends Error {}

export const checkoutSchema = z
  .object({
    name: z.string({ error: "Informe seu nome." }).trim().min(3, "Informe seu nome completo."),
    email: z.email("Informe um e-mail válido."),
    phone: z.string({ error: "Informe seu telefone." }).trim().min(10, "Informe seu telefone com DDD."),
    delivery: z.enum(["pickup", "shipping"], { error: "Escolha a forma de entrega." }),
    cep: z.string().trim().optional(),
    street: z.string().trim().optional(),
    number: z.string().trim().optional(),
    complement: z.string().trim().optional(),
    district: z.string().trim().optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    notes: z.string().trim().max(500).optional(),
    items: z
      .array(
        z.object({
          productId: z.number().int().positive(),
          size: z.string().optional(),
          color: z.string().optional(),
          quantity: z.number().int().min(1).max(20),
        }),
      )
      .min(1, "Sua sacola está vazia.")
      .max(30),
  })
  .superRefine((data, ctx) => {
    if (data.delivery !== "shipping") return;
    const required = { cep: "CEP", street: "Rua", number: "Número", district: "Bairro", city: "Cidade", state: "UF" } as const;
    for (const [field, label] of Object.entries(required)) {
      if (!data[field as keyof typeof required]) {
        ctx.addIssue({ code: "custom", path: [field], message: `Informe ${label}.` });
      }
    }
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export async function createOrder(input: CheckoutInput) {
  const db = await getDb();
  const shop = await getShopSettings();

  if (input.delivery === "shipping" && !shop.shippingEnabled) throw new OrderError("Envio indisponível no momento.");
  if (input.delivery === "pickup" && !shop.pickupEnabled) throw new OrderError("Retirada indisponível no momento.");

  const ids = [...new Set(input.items.map((i) => i.productId))];
  const rows = await db.select().from(products).where(and(inArray(products.id, ids), eq(products.active, true)));
  const byId = new Map(rows.map((p) => [p.id, p]));

  const wanted = new Map<number, number>();
  const lines = input.items.map((item) => {
    const product = byId.get(item.productId);
    if (!product) throw new OrderError("Um dos produtos da sacola não está mais disponível.");
    if (product.sizes.length > 0 && !product.sizes.includes(item.size ?? "")) {
      throw new OrderError(`Escolha um tamanho válido para ${product.name}.`);
    }
    if (product.colors.length > 0 && !product.colors.includes(item.color ?? "")) {
      throw new OrderError(`Escolha uma cor válida para ${product.name}.`);
    }
    wanted.set(product.id, (wanted.get(product.id) ?? 0) + item.quantity);
    return {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      size: product.sizes.length > 0 ? item.size! : null,
      color: product.colors.length > 0 ? item.color! : null,
    };
  });

  for (const [id, quantity] of wanted) {
    const product = byId.get(id)!;
    if (product.stock !== null && product.stock < quantity) {
      throw new OrderError(
        product.stock === 0
          ? `${product.name} está esgotado.`
          : `Temos apenas ${product.stock} unidade(s) de ${product.name}.`,
      );
    }
  }

  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const shippingFee = input.delivery === "shipping" ? shop.shippingFee : 0;
  const address: Address | null =
    input.delivery === "shipping"
      ? {
          cep: input.cep!,
          street: input.street!,
          number: input.number!,
          complement: input.complement || undefined,
          district: input.district!,
          city: input.city!,
          state: input.state!.toUpperCase(),
        }
      : null;

  return db.transaction(async (tx) => {
    const [order] = await tx
      .insert(orders)
      .values({
        code: newOrderCode(),
        customerName: input.name,
        email: input.email.toLowerCase(),
        phone: input.phone,
        delivery: input.delivery,
        address,
        notes: input.notes || null,
        subtotal,
        shippingFee,
        total: subtotal + shippingFee,
      })
      .returning();
    await tx.insert(orderItems).values(lines.map((l) => ({ ...l, orderId: order.id })));
    return { order, lines };
  });
}

export async function startMercadoPagoCheckout(orderId: number, baseUrl: string) {
  const db = await getDb();
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));

  const { preferenceId, checkoutUrl } = await createPreference({
    orderCode: order.code,
    items: items.map((i) => ({
      id: String(i.productId ?? i.id),
      title: [i.name, i.size, i.color].filter(Boolean).join(" · "),
      quantity: i.quantity,
      unitPrice: i.price,
    })),
    shippingFee: order.shippingFee,
    payer: { name: order.customerName, email: order.email },
    baseUrl,
  });

  await db.insert(payments).values({
    orderId: order.id,
    provider: "mercadopago",
    preferenceId,
    checkoutUrl,
    amount: order.total,
  });
  return checkoutUrl;
}

// Deducts an order's items from stock exactly once.
async function applyStock(tx: Tx, orderId: number) {
  const [order] = await tx.select().from(orders).where(eq(orders.id, orderId)).for("update");
  if (!order || order.stockApplied) return;
  const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  for (const item of items) {
    if (!item.productId) continue;
    await tx
      .update(products)
      .set({ stock: sql`greatest(${products.stock} - ${item.quantity}, 0)` })
      .where(and(eq(products.id, item.productId), sql`${products.stock} is not null`));
  }
  await tx.update(orders).set({ stockApplied: true }).where(eq(orders.id, orderId));
}

async function restoreStock(tx: Tx, orderId: number) {
  const [order] = await tx.select().from(orders).where(eq(orders.id, orderId)).for("update");
  if (!order?.stockApplied) return;
  const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  for (const item of items) {
    if (!item.productId) continue;
    await tx
      .update(products)
      .set({ stock: sql`${products.stock} + ${item.quantity}` })
      .where(and(eq(products.id, item.productId), sql`${products.stock} is not null`));
  }
  await tx.update(orders).set({ stockApplied: false }).where(eq(orders.id, orderId));
}

export async function setOrderStatus(orderId: number, status: OrderStatus) {
  const db = await getDb();
  await db.transaction(async (tx) => {
    if (status === "paid" || status === "shipped" || status === "delivered") await applyStock(tx, orderId);
    if (status === "cancelled") await restoreStock(tx, orderId);
    await tx.update(orders).set({ status }).where(eq(orders.id, orderId));
  });
}

// Records a payment made outside Mercado Pago (Pix direto, dinheiro no evento…).
export async function registerManualPayment(orderId: number, method: string, note?: string) {
  const db = await getDb();
  await db.transaction(async (tx) => {
    const [order] = await tx.select().from(orders).where(eq(orders.id, orderId));
    if (!order) throw new OrderError("Pedido não encontrado.");
    await tx.insert(payments).values({
      orderId,
      provider: "manual",
      status: "approved",
      method,
      amount: order.total,
      note: note || null,
    });
    await applyStock(tx, orderId);
    if (order.status === "pending") await tx.update(orders).set({ status: "paid" }).where(eq(orders.id, orderId));
  });
}

// Fetches a payment from Mercado Pago and mirrors it on the order. Used by the
// webhook, by the return page and by the "sincronizar" button in the admin.
export async function syncMercadoPagoPayment(paymentId: string, expectedOrderCode?: string) {
  const payment = await getPayment(paymentId);
  const code = payment.external_reference;
  if (!code || (expectedOrderCode && code !== expectedOrderCode)) return null;

  const db = await getDb();
  const [order] = await db.select().from(orders).where(eq(orders.code, code));
  if (!order) return null;

  const status = mapPaymentStatus(payment.status);
  const values = {
    status,
    method: mapPaymentMethod(payment),
    amount: Math.round(payment.transaction_amount * 100),
    raw: payment,
  };

  await db.transaction(async (tx) => {
    const [existing] = await tx.select().from(payments).where(eq(payments.providerId, String(payment.id)));
    if (existing) {
      await tx.update(payments).set(values).where(eq(payments.id, existing.id));
    } else {
      // Attach to the checkout row created for this order, or record a new one.
      const [pending] = await tx
        .select()
        .from(payments)
        .where(and(eq(payments.orderId, order.id), eq(payments.provider, "mercadopago"), sql`${payments.providerId} is null`))
        .orderBy(desc(payments.id))
        .limit(1);
      if (pending) {
        await tx.update(payments).set({ ...values, providerId: String(payment.id) }).where(eq(payments.id, pending.id));
      } else {
        await tx.insert(payments).values({ ...values, orderId: order.id, provider: "mercadopago", providerId: String(payment.id) });
      }
    }

    if (status === "approved") {
      await applyStock(tx, order.id);
      if (order.status === "pending") await tx.update(orders).set({ status: "paid" }).where(eq(orders.id, order.id));
    }
    if (status === "refunded" && order.status === "paid") {
      await restoreStock(tx, order.id);
      await tx.update(orders).set({ status: "cancelled" }).where(eq(orders.id, order.id));
    }
  });

  return { orderCode: code, status };
}

export async function getOrderByCode(code: string) {
  const db = await getDb();
  const [order] = await db.select().from(orders).where(eq(orders.code, code));
  if (!order) return null;
  const [items, orderPayments] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, order.id)),
    db.select().from(payments).where(eq(payments.orderId, order.id)).orderBy(desc(payments.id)),
  ]);
  return { order, items, payments: orderPayments };
}

export { isMercadoPagoConfigured };
