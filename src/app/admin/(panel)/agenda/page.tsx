import Link from "next/link";
import { asc, desc, gte, lt } from "drizzle-orm";
import { Plus } from "lucide-react";
import { getDb, schema } from "@/db";
import type { Event } from "@/db/schema";
import { formatDay, formatMonth, formatWeekday } from "@/lib/format";
import { today } from "@/lib/queries";
import { Badge, Empty, PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Agenda" };

function EventRows({ events }: { events: Event[] }) {
  return (
    <ul className="admin-card divide-y divide-ink/5 p-0 md:p-0">
      {events.map((e) => (
        <li key={e.id}>
          <Link href={`/admin/agenda/${e.id}`} className="flex items-center gap-4 px-5 py-3 hover:bg-cream/50">
            <div className="w-14 shrink-0 rounded-lg bg-sand py-1 text-center">
              <p className="font-display text-xl leading-tight">{formatDay(e.date)}</p>
              <p className="text-[10px] uppercase text-ink/60">{formatMonth(e.date)} {e.date.slice(2, 4)}</p>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{e.title}</p>
              <p className="truncate text-sm text-ink/55">
                <span className="capitalize">{formatWeekday(e.date)}</span>
                {e.time && ` · ${e.time}`} · {e.venue} — {e.city}
              </p>
            </div>
            {!e.published && <Badge>Rascunho</Badge>}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default async function AgendaAdminPage() {
  const db = await getDb();
  const now = today();
  const [upcoming, past] = await Promise.all([
    db.select().from(schema.events).where(gte(schema.events.date, now)).orderBy(asc(schema.events.date)),
    db.select().from(schema.events).where(lt(schema.events.date, now)).orderBy(desc(schema.events.date)).limit(30),
  ]);

  return (
    <>
      <PageHeader
        title="Agenda de shows"
        description="Apresentações exibidas no site."
        actions={<Link href="/admin/agenda/novo" className="admin-btn"><Plus className="size-4" /> Novo evento</Link>}
      />
      <h2 className="mb-3 text-sm font-medium text-ink/60">Próximos</h2>
      {upcoming.length ? <EventRows events={upcoming} /> : <Empty>Nenhum evento futuro.</Empty>}
      {past.length > 0 && (
        <>
          <h2 className="mb-3 mt-10 text-sm font-medium text-ink/60">Anteriores</h2>
          <EventRows events={past} />
        </>
      )}
    </>
  );
}
