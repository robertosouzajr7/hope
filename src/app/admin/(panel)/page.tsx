import Link from "next/link";
import { and, count, desc, eq, gte, inArray, isNotNull, lte, sql, sum } from "drizzle-orm";
import { AlertTriangle, CalendarDays, Clock, Inbox, Package, TrendingUp } from "lucide-react";
import { getDb, schema } from "@/db";
import { orderStatusLabels } from "@/lib/catalog";
import { formatDay, formatMonth, formatPrice } from "@/lib/format";
import { today } from "@/lib/queries";
import { Badge, Empty, PageHeader, formatDateTime, orderTone } from "@/components/admin/ui";

const { orders, products, events, bookingRequests } = schema;
const PAID = ["paid", "shipped", "delivered"] as const;

const DAY = 864e5;

function daysAgo(n: number) {
  return new Date(Date.now() - n * DAY);
}

function monthStart(offset = 0) {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + offset, 1);
}

export default async function Dashboard() {
  const db = await getDb();

  const [
    [thisMonth],
    [lastMonth],
    [pending],
    [toShip],
    [newBookings],
    recentOrders,
    lowStock,
    nextEvents,
    daily,
  ] = await Promise.all([
    db.select({ total: sum(orders.total), n: count() }).from(orders)
      .where(and(inArray(orders.status, [...PAID]), gte(orders.createdAt, monthStart()))),
    db.select({ total: sum(orders.total) }).from(orders)
      .where(and(inArray(orders.status, [...PAID]), gte(orders.createdAt, monthStart(-1)), lte(orders.createdAt, monthStart()))),
    db.select({ n: count() }).from(orders).where(eq(orders.status, "pending")),
    db.select({ n: count() }).from(orders).where(and(eq(orders.status, "paid"), eq(orders.delivery, "shipping"))),
    db.select({ n: count() }).from(bookingRequests).where(eq(bookingRequests.status, "new")),
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(6),
    db.select().from(products)
      .where(and(eq(products.active, true), isNotNull(products.stock), lte(products.stock, 5)))
      .orderBy(products.stock).limit(6),
    db.select().from(events).where(gte(events.date, today())).orderBy(events.date).limit(4),
    db.select({
      day: sql<string>`to_char(${orders.createdAt} at time zone 'America/Bahia', 'YYYY-MM-DD')`,
      total: sum(orders.total),
    }).from(orders)
      .where(and(inArray(orders.status, [...PAID]), gte(orders.createdAt, daysAgo(29))))
      .groupBy(sql`1`),
  ]);

  const monthTotal = Number(thisMonth.total ?? 0);
  const lastTotal = Number(lastMonth.total ?? 0);
  const change = lastTotal > 0 ? Math.round(((monthTotal - lastTotal) / lastTotal) * 100) : null;

  // Last 30 days of paid sales for the bar chart.
  const byDay = new Map(daily.map((d) => [d.day, Number(d.total ?? 0)]));
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = daysAgo(29 - i);
    const key = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bahia" }).format(d);
    return { key, total: byDay.get(key) ?? 0 };
  });
  const max = Math.max(...days.map((d) => d.total), 1);

  const stats = [
    {
      label: "Vendas no mês",
      value: formatPrice(monthTotal),
      hint: change === null ? `${thisMonth.n} pedido(s)` : `${change >= 0 ? "+" : ""}${change}% vs. mês anterior`,
      icon: TrendingUp,
      href: "/admin/pedidos?status=paid",
    },
    { label: "Aguardando pagamento", value: String(pending.n), hint: "pedidos", icon: Clock, href: "/admin/pedidos?status=pending" },
    { label: "Para enviar", value: String(toShip.n), hint: "pedidos pagos com envio", icon: Package, href: "/admin/pedidos?status=paid" },
    { label: "Pedidos de agenda", value: String(newBookings.n), hint: "novos", icon: Inbox, href: "/admin/mensagens" },
  ];

  return (
    <>
      <PageHeader title="Visão geral" description="Resumo da loja e do site." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, hint, icon: Icon, href }) => (
          <Link key={label} href={href} className="admin-card transition hover:border-ink/30">
            <div className="flex items-center justify-between text-ink/55">
              <span className="text-sm">{label}</span>
              <Icon className="size-4" />
            </div>
            <p className="mt-3 font-display text-3xl tabular-nums">{value}</p>
            <p className="mt-1 text-xs text-ink/50">{hint}</p>
          </Link>
        ))}
      </div>

      <section className="admin-card mt-6">
        <h2 className="text-sm font-medium text-ink/60">Vendas pagas · últimos 30 dias</h2>
        <div className="mt-6 flex h-36 items-end gap-1" role="img" aria-label="Gráfico de vendas diárias">
          {days.map((d) => (
            <div key={d.key} className="group relative flex-1">
              <div
                className="rounded-t bg-cocoa/80 transition group-hover:bg-ink"
                style={{ height: `${Math.max((d.total / max) * 136, d.total ? 4 : 1)}px` }}
              />
              <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-ink px-2 py-1 text-xs text-cream group-hover:block">
                {d.key.split("-").reverse().slice(0, 2).join("/")}: {formatPrice(d.total)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="admin-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl">Últimos pedidos</h2>
            <Link href="/admin/pedidos" className="text-sm text-ink/55 hover:text-ink">Ver todos</Link>
          </div>
          {recentOrders.length === 0 ? (
            <Empty>Nenhum pedido ainda.</Empty>
          ) : (
            <div className="overflow-x-auto">
              <table className="admin-table">
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td>
                        <Link href={`/admin/pedidos/${o.id}`} className="font-medium hover:underline">{o.customerName}</Link>
                        <p className="text-xs text-ink/50">{formatDateTime(o.createdAt)}</p>
                      </td>
                      <td><Badge tone={orderTone[o.status]}>{orderStatusLabels[o.status]}</Badge></td>
                      <td className="text-right tabular-nums">{formatPrice(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="space-y-6">
          <section className="admin-card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl">Próximos shows</h2>
              <Link href="/admin/agenda" className="text-sm text-ink/55 hover:text-ink">Agenda</Link>
            </div>
            {nextEvents.length === 0 ? (
              <p className="text-sm text-ink/55">Nenhum evento futuro cadastrado.</p>
            ) : (
              <ul className="space-y-3">
                {nextEvents.map((e) => (
                  <li key={e.id} className="flex items-center gap-3">
                    <div className="w-12 shrink-0 rounded-lg bg-sand py-1 text-center">
                      <p className="font-display text-lg leading-tight">{formatDay(e.date)}</p>
                      <p className="text-[10px] uppercase text-ink/60">{formatMonth(e.date)}</p>
                    </div>
                    <div className="min-w-0 text-sm">
                      <p className="truncate font-medium">{e.title}</p>
                      <p className="truncate text-ink/55">{e.venue}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/admin/agenda/novo" className="admin-btn-ghost mt-4 w-full">
              <CalendarDays className="size-4" /> Novo evento
            </Link>
          </section>

          <section className="admin-card">
            <h2 className="mb-4 flex items-center gap-2 font-display text-xl">
              <AlertTriangle className="size-4 text-amber-600" /> Estoque baixo
            </h2>
            {lowStock.length === 0 ? (
              <p className="text-sm text-ink/55">Tudo certo com o estoque.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {lowStock.map((p) => (
                  <li key={p.id} className="flex justify-between">
                    <Link href={`/admin/produtos/${p.id}`} className="hover:underline">{p.name}</Link>
                    <Badge tone={p.stock === 0 ? "red" : "amber"}>{p.stock === 0 ? "Esgotado" : `${p.stock} un.`}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
