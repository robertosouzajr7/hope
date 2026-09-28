import Link from "next/link";
import { and, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { Search } from "lucide-react";
import { getDb, schema } from "@/db";
import type { OrderStatus } from "@/db/schema";
import { orderStatusLabels } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { Badge, Empty, PageHeader, formatDateTime, orderTone } from "@/components/admin/ui";

export const metadata = { title: "Vendas" };

const { orders } = schema;
const PAGE_SIZE = 30;

export default async function OrdersPage(props: PageProps<"/admin/pedidos">) {
  const search = await props.searchParams;
  const status = typeof search.status === "string" && search.status in orderStatusLabels ? (search.status as OrderStatus) : undefined;
  const q = typeof search.q === "string" ? search.q.trim() : "";
  const page = Math.max(1, Number(search.pagina) || 1);

  const filters: SQL[] = [];
  if (status) filters.push(eq(orders.status, status));
  if (q) filters.push(or(ilike(orders.code, `%${q}%`), ilike(orders.customerName, `%${q}%`), ilike(orders.email, `%${q}%`))!);
  const where = filters.length ? and(...filters) : undefined;

  const db = await getDb();
  const [rows, [{ n }], counts] = await Promise.all([
    db.select().from(orders).where(where).orderBy(desc(orders.createdAt)).limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE),
    db.select({ n: count() }).from(orders).where(where),
    db.select({ status: orders.status, n: count() }).from(orders).groupBy(orders.status),
  ]);
  const countBy = Object.fromEntries(counts.map((c) => [c.status, c.n]));
  const total = counts.reduce((s, c) => s + c.n, 0);
  const pages = Math.ceil(n / PAGE_SIZE);

  const tab = (value?: string) => {
    const params = new URLSearchParams();
    if (value) params.set("status", value);
    if (q) params.set("q", q);
    const qs = params.toString();
    return `/admin/pedidos${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <PageHeader title="Vendas" description="Pedidos da loja virtual." />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <nav className="flex flex-wrap gap-1 rounded-xl bg-white p-1 text-sm">
          {[{ value: undefined, label: "Todos", n: total }, ...Object.entries(orderStatusLabels).map(([value, label]) => ({ value, label, n: countBy[value] ?? 0 }))].map((t) => (
            <Link
              key={t.label}
              href={tab(t.value)}
              className={`rounded-lg px-3 py-1.5 ${status === t.value ? "bg-ink text-cream" : "text-ink/65 hover:bg-ink/5"}`}
            >
              {t.label} <span className="opacity-60">{t.n}</span>
            </Link>
          ))}
        </nav>
        <form className="relative">
          {status && <input type="hidden" name="status" value={status} />}
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink/40" />
          <input name="q" defaultValue={q} placeholder="Buscar código, nome, e-mail" className="admin-input w-64 pl-9" />
        </form>
      </div>

      {rows.length === 0 ? (
        <Empty>Nenhum pedido encontrado.</Empty>
      ) : (
        <div className="admin-card overflow-x-auto p-0 md:p-0">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Data</th>
                <th>Entrega</th>
                <th>Status</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.id} className="hover:bg-cream/50">
                  <td>
                    <Link href={`/admin/pedidos/${o.id}`} className="font-mono text-xs font-semibold hover:underline">{o.code}</Link>
                  </td>
                  <td>
                    <Link href={`/admin/pedidos/${o.id}`} className="hover:underline">{o.customerName}</Link>
                    <p className="text-xs text-ink/50">{o.email}</p>
                  </td>
                  <td className="whitespace-nowrap text-ink/60">{formatDateTime(o.createdAt)}</td>
                  <td className="text-ink/60">{o.delivery === "shipping" ? "Envio" : "Retirada"}</td>
                  <td><Badge tone={orderTone[o.status]}>{orderStatusLabels[o.status]}</Badge></td>
                  <td className="text-right font-medium tabular-nums">{formatPrice(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="mt-4 flex justify-center gap-2 text-sm">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => {
            const params = new URLSearchParams();
            if (status) params.set("status", status);
            if (q) params.set("q", q);
            params.set("pagina", String(p));
            return (
              <Link key={p} href={`/admin/pedidos?${params}`} className={`rounded-lg px-3 py-1 ${p === page ? "bg-ink text-cream" : "bg-white"}`}>
                {p}
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
