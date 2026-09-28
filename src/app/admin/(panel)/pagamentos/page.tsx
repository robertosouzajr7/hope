import Link from "next/link";
import { and, desc, eq, gte, sum } from "drizzle-orm";
import { CheckCircle2, XCircle } from "lucide-react";
import { getDb, schema } from "@/db";
import type { PaymentStatus } from "@/db/schema";
import { paymentMethodLabels, paymentStatusLabels } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { isMercadoPagoConfigured } from "@/lib/mercadopago";
import { Badge, Empty, PageHeader, formatDateTime, paymentTone } from "@/components/admin/ui";

export const metadata = { title: "Pagamentos" };

const { payments, orders } = schema;

export default async function PaymentsPage(props: PageProps<"/admin/pagamentos">) {
  const search = await props.searchParams;
  const status = typeof search.status === "string" && search.status in paymentStatusLabels ? (search.status as PaymentStatus) : undefined;

  const db = await getDb();
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const [rows, [month], byMethod] = await Promise.all([
    db
      .select({ payment: payments, order: { id: orders.id, code: orders.code, customerName: orders.customerName } })
      .from(payments)
      .innerJoin(orders, eq(orders.id, payments.orderId))
      .where(status ? eq(payments.status, status) : undefined)
      .orderBy(desc(payments.updatedAt))
      .limit(100),
    db.select({ total: sum(payments.amount) }).from(payments)
      .where(and(eq(payments.status, "approved"), gte(payments.updatedAt, monthStart))),
    db.select({ method: payments.method, total: sum(payments.amount) }).from(payments)
      .where(and(eq(payments.status, "approved"), gte(payments.updatedAt, monthStart)))
      .groupBy(payments.method),
  ]);

  const mpOn = isMercadoPagoConfigured();

  return (
    <>
      <PageHeader title="Pagamentos" description="Transações do Mercado Pago e pagamentos registrados manualmente." />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="admin-card">
          <p className="text-sm text-ink/55">Recebido no mês</p>
          <p className="mt-2 font-display text-3xl">{formatPrice(Number(month.total ?? 0))}</p>
        </div>
        <div className="admin-card">
          <p className="text-sm text-ink/55">Por forma de pagamento (mês)</p>
          <ul className="mt-2 space-y-1 text-sm">
            {byMethod.length === 0 && <li className="text-ink/45">—</li>}
            {byMethod.map((m) => (
              <li key={m.method ?? "?"} className="flex justify-between">
                <span>{paymentMethodLabels[m.method ?? ""] ?? m.method ?? "Outro"}</span>
                <span className="tabular-nums">{formatPrice(Number(m.total ?? 0))}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="admin-card text-sm">
          <p className="text-ink/55">Mercado Pago</p>
          <p className={`mt-2 flex items-center gap-2 font-medium ${mpOn ? "text-emerald-700" : "text-amber-700"}`}>
            {mpOn ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
            {mpOn ? "Conectado" : "Não configurado"}
          </p>
          {!mpOn && (
            <p className="mt-1 text-xs text-ink/55">
              Sem o Mercado Pago, os pedidos são pagos por fora e registrados manualmente em cada venda.
            </p>
          )}
        </div>
      </div>

      <nav className="mb-4 flex flex-wrap gap-1 rounded-xl bg-white p-1 text-sm">
        {[{ value: undefined, label: "Todos" }, ...Object.entries(paymentStatusLabels).map(([value, label]) => ({ value, label }))].map((t) => (
          <Link
            key={t.label}
            href={t.value ? `/admin/pagamentos?status=${t.value}` : "/admin/pagamentos"}
            className={`rounded-lg px-3 py-1.5 ${status === t.value ? "bg-ink text-cream" : "text-ink/65 hover:bg-ink/5"}`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <Empty>Nenhum pagamento encontrado.</Empty>
      ) : (
        <div className="admin-card overflow-x-auto p-0 md:p-0">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Pedido</th>
                <th>Origem</th>
                <th>Forma</th>
                <th>Status</th>
                <th className="text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ payment: p, order: o }) => (
                <tr key={p.id}>
                  <td className="whitespace-nowrap text-ink/60">{formatDateTime(p.updatedAt)}</td>
                  <td>
                    <Link href={`/admin/pedidos/${o.id}`} className="font-mono text-xs font-semibold hover:underline">{o.code}</Link>
                    <p className="text-xs text-ink/50">{o.customerName}</p>
                  </td>
                  <td>{p.provider === "mercadopago" ? "Mercado Pago" : "Manual"}</td>
                  <td className="text-ink/60">{p.method ? paymentMethodLabels[p.method] ?? p.method : "—"}</td>
                  <td><Badge tone={paymentTone[p.status]}>{paymentStatusLabels[p.status]}</Badge></td>
                  <td className="text-right tabular-nums">{formatPrice(p.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
