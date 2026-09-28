import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { ExternalLink, MessageCircle, RefreshCw } from "lucide-react";
import { getDb, schema } from "@/db";
import { AdminForm } from "@/components/admin/form";
import { Badge, Field, PageHeader, formatDateTime, orderTone, paymentTone } from "@/components/admin/ui";
import { orderStatusLabels, paymentMethodLabels, paymentStatusLabels } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { whatsappUrl } from "@/lib/whatsapp";
import { addManualPayment, syncPayment, updateOrder } from "../actions";

export const metadata = { title: "Pedido" };

export default async function OrderDetailPage(props: PageProps<"/admin/pedidos/[id]">) {
  const { id } = await props.params;
  const db = await getDb();
  const [order] = await db.select().from(schema.orders).where(eq(schema.orders.id, Number(id) || 0));
  if (!order) notFound();

  const [items, payments] = await Promise.all([
    db.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, order.id)),
    db.select().from(schema.payments).where(eq(schema.payments.orderId, order.id)).orderBy(desc(schema.payments.id)),
  ]);
  const phone = order.phone.replace(/\D/g, "");
  const customerWhatsapp = whatsappUrl(
    phone.length <= 11 ? `55${phone}` : phone,
    `Olá, ${order.customerName.split(" ")[0]}! Aqui é do Vocal Hope, sobre o seu pedido ${order.code}.`,
  );

  return (
    <>
      <PageHeader
        title={`Pedido ${order.code}`}
        description={`Feito em ${formatDateTime(order.createdAt)}`}
        back={{ href: "/admin/pedidos", label: "Vendas" }}
        actions={
          <>
            <a href={customerWhatsapp} target="_blank" rel="noreferrer" className="admin-btn-ghost">
              <MessageCircle className="size-4" /> WhatsApp do cliente
            </a>
            <Link href={`/pedido/${order.code}`} target="_blank" className="admin-btn-ghost">
              <ExternalLink className="size-4" /> Página do cliente
            </Link>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <section className="admin-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl">Itens</h2>
              <Badge tone={orderTone[order.status]}>{orderStatusLabels[order.status]}</Badge>
            </div>
            <table className="admin-table">
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {item.productId ? (
                        <Link href={`/admin/produtos/${item.productId}`} className="font-medium hover:underline">{item.name}</Link>
                      ) : (
                        <span className="font-medium">{item.name}</span>
                      )}
                      <p className="text-xs text-ink/50">{[item.size && `Tam. ${item.size}`, item.color].filter(Boolean).join(" · ")}</p>
                    </td>
                    <td className="text-ink/60">{item.quantity} × {formatPrice(item.price)}</td>
                    <td className="text-right tabular-nums">{formatPrice(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <dl className="mt-4 space-y-1 text-sm">
              <div className="flex justify-between"><dt className="text-ink/60">Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-ink/60">Frete</dt><dd>{order.shippingFee ? formatPrice(order.shippingFee) : "—"}</dd></div>
              <div className="flex justify-between text-base font-semibold"><dt>Total</dt><dd>{formatPrice(order.total)}</dd></div>
            </dl>
          </section>

          <section className="admin-card">
            <h2 className="mb-4 font-display text-xl">Pagamentos</h2>
            {payments.length === 0 ? (
              <p className="text-sm text-ink/55">Nenhum pagamento registrado.</p>
            ) : (
              <ul className="divide-y divide-ink/5">
                {payments.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                    <div>
                      <p className="font-medium">
                        {p.provider === "mercadopago" ? "Mercado Pago" : "Manual"}
                        {p.method && ` · ${paymentMethodLabels[p.method] ?? p.method}`}
                      </p>
                      <p className="text-xs text-ink/50">
                        {formatDateTime(p.updatedAt)}
                        {p.providerId && ` · ID ${p.providerId}`}
                        {p.note && ` · ${p.note}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="tabular-nums">{formatPrice(p.amount)}</span>
                      <Badge tone={paymentTone[p.status]}>{paymentStatusLabels[p.status]}</Badge>
                      {p.providerId && (
                        <form action={syncPayment.bind(null, order.id, p.providerId)}>
                          <button className="admin-btn-ghost px-2 py-1" title="Atualizar com o Mercado Pago">
                            <RefreshCw className="size-3.5" />
                          </button>
                        </form>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {order.status === "pending" && (
              <details className="mt-4 rounded-xl bg-cream/60 p-4">
                <summary className="cursor-pointer text-sm font-medium">Registrar pagamento recebido por fora (Pix, dinheiro…)</summary>
                <AdminForm action={addManualPayment.bind(null, order.id)} submitLabel="Registrar pagamento" className="mt-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Forma">
                      <select name="method" className="admin-input">
                        <option value="pix">Pix</option>
                        <option value="manual">Dinheiro</option>
                        <option value="credit_card">Cartão (maquininha)</option>
                        <option value="bank_transfer">Transferência</option>
                      </select>
                    </Field>
                    <Field label="Observação">
                      <input name="note" placeholder="Ex.: pago no evento" className="admin-input" />
                    </Field>
                  </div>
                </AdminForm>
              </details>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="admin-card">
            <h2 className="mb-4 font-display text-xl">Atualizar pedido</h2>
            <AdminForm action={updateOrder.bind(null, order.id)}>
              <div className="space-y-4">
                <Field label="Status" hint="Cancelar devolve os itens ao estoque.">
                  <select name="status" defaultValue={order.status} className="admin-input">
                    {Object.entries(orderStatusLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </Field>
                {order.delivery === "shipping" && (
                  <Field label="Código de rastreio">
                    <input name="trackingCode" defaultValue={order.trackingCode ?? ""} className="admin-input font-mono" />
                  </Field>
                )}
              </div>
            </AdminForm>
          </section>

          <section className="admin-card space-y-4 text-sm">
            <div>
              <h3 className="admin-label">Cliente</h3>
              <p className="font-medium">{order.customerName}</p>
              <p><a href={`mailto:${order.email}`} className="hover:underline">{order.email}</a></p>
              <p>{order.phone}</p>
            </div>
            <div>
              <h3 className="admin-label">Entrega</h3>
              {order.address ? (
                <p>
                  {order.address.street}, {order.address.number}
                  {order.address.complement ? ` – ${order.address.complement}` : ""}
                  <br />
                  {order.address.district}
                  <br />
                  {order.address.city}/{order.address.state} · CEP {order.address.cep}
                </p>
              ) : (
                <p>Retirada em Salvador</p>
              )}
            </div>
            {order.notes && (
              <div>
                <h3 className="admin-label">Observações</h3>
                <p className="whitespace-pre-line">{order.notes}</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
