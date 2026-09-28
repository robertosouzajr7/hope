import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, CreditCard, PackageCheck, Truck, XCircle } from "lucide-react";
import { orderStatusLabels, paymentMethodLabels, paymentStatusLabels } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { getOrderByCode, isMercadoPagoConfigured, syncMercadoPagoPayment } from "@/lib/orders";
import { getSiteSettings } from "@/lib/queries";
import { whatsappUrl } from "@/lib/whatsapp";
import { payOrder } from "./actions";
import { ClearCart } from "@/components/clear-cart";

export const metadata: Metadata = {
  title: "Seu pedido",
  robots: { index: false },
};

const statusIcon = {
  pending: Clock,
  paid: CheckCircle2,
  shipped: Truck,
  delivered: PackageCheck,
  cancelled: XCircle,
};

export default async function OrderPage(props: PageProps<"/pedido/[code]">) {
  const { code } = await props.params;
  const search = await props.searchParams;

  // Returning from Mercado Pago: sync right away instead of waiting for the webhook.
  const paymentId = search.payment_id ?? search.collection_id;
  if (typeof paymentId === "string" && /^\d+$/.test(paymentId) && isMercadoPagoConfigured()) {
    await syncMercadoPagoPayment(paymentId, code).catch((error) =>
      console.error("Falha ao sincronizar pagamento", error),
    );
  }

  const [data, site] = await Promise.all([getOrderByCode(code), getSiteSettings()]);
  if (!data) notFound();
  const { order, items, payments } = data;
  const Icon = statusIcon[order.status];
  const lastPayment = payments[0];
  const isNew = search.novo === "1";

  const whatsappMessage = `Olá, Vocal Hope! Fiz o pedido ${order.code} na loja (total ${formatPrice(order.total)}). Como faço o pagamento?`;

  return (
    <div className="min-h-svh bg-cream text-ink">
      {isNew && <ClearCart />}
      <div className="mx-auto max-w-3xl px-5 pb-24 pt-32 md:pt-40">
        <p className="text-xs uppercase tracking-[0.35em] text-cocoa">Pedido {order.code}</p>
        <h1 className="mt-4 font-display text-5xl md:text-6xl">
          {isNew || order.status === "pending" ? "Pedido recebido!" : "Obrigado pela compra!"}
        </h1>

        <div className="mt-8 flex items-center gap-3 rounded-2xl bg-white/70 p-5">
          <Icon className="size-6 shrink-0 text-cocoa" />
          <div>
            <p className="font-semibold">{orderStatusLabels[order.status]}</p>
            {lastPayment && lastPayment.status !== "pending" && (
              <p className="text-sm text-ink/60">
                Pagamento: {paymentStatusLabels[lastPayment.status]}
                {lastPayment.method ? ` · ${paymentMethodLabels[lastPayment.method] ?? lastPayment.method}` : ""}
              </p>
            )}
          </div>
        </div>

        {order.status === "pending" && (
          <div className="mt-6 rounded-2xl border border-ink/10 p-6">
            {isMercadoPagoConfigured() ? (
              <>
                <p className="text-ink/75">
                  {lastPayment?.status === "in_process"
                    ? "Seu pagamento está em análise. Assim que for aprovado, este status será atualizado."
                    : "Conclua o pagamento para confirmarmos seu pedido."}
                </p>
                {lastPayment?.status !== "in_process" && (
                  <form action={payOrder.bind(null, order.code)} className="mt-4">
                    <button className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream hover:bg-cocoa">
                      <CreditCard className="size-4" /> Pagar agora
                    </button>
                  </form>
                )}
              </>
            ) : (
              <>
                <p className="text-ink/75">
                  Vamos combinar o pagamento (Pix ou cartão) e a entrega pelo WhatsApp. Envie o código do seu pedido:
                </p>
                <a
                  href={whatsappUrl(site.whatsapp, whatsappMessage)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream hover:bg-cocoa"
                >
                  Combinar pagamento no WhatsApp
                </a>
              </>
            )}
          </div>
        )}

        {order.trackingCode && (
          <p className="mt-6 rounded-2xl bg-white/70 p-5 text-sm">
            Código de rastreio: <strong className="font-mono">{order.trackingCode}</strong>
          </p>
        )}

        <section className="mt-12">
          <h2 className="font-display text-2xl">Itens</h2>
          <ul className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between gap-4 py-3 text-sm">
                <span>
                  {item.quantity}× {item.name}
                  {(item.size || item.color) && (
                    <span className="text-ink/55"> · {[item.size, item.color].filter(Boolean).join(" · ")}</span>
                  )}
                </span>
                <span className="tabular-nums">{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-ink/60">Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink/60">Entrega</dt><dd>{order.shippingFee ? formatPrice(order.shippingFee) : "Grátis"}</dd></div>
            <div className="flex justify-between text-base font-semibold"><dt>Total</dt><dd>{formatPrice(order.total)}</dd></div>
          </dl>
        </section>

        <section className="mt-12 grid gap-6 text-sm sm:grid-cols-2">
          <div>
            <h3 className="mb-2 text-xs uppercase tracking-[0.2em] text-stone">Cliente</h3>
            <p>{order.customerName}</p>
            <p className="text-ink/60">{order.email}</p>
          </div>
          <div>
            <h3 className="mb-2 text-xs uppercase tracking-[0.2em] text-stone">Entrega</h3>
            {order.address ? (
              <p className="text-ink/75">
                {order.address.street}, {order.address.number}
                {order.address.complement ? ` – ${order.address.complement}` : ""}
                <br />
                {order.address.district} · {order.address.city}/{order.address.state} · {order.address.cep}
              </p>
            ) : (
              <p className="text-ink/75">Retirada em Salvador</p>
            )}
          </div>
        </section>

        <Link href="/loja" className="mt-14 inline-block text-sm text-ink/60 underline underline-offset-4 hover:text-ink">
          Voltar para a loja
        </Link>
      </div>
    </div>
  );
}
