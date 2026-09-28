import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Calendar, Mail, MapPin, MessageCircle, Phone, Trash2 } from "lucide-react";
import { getDb, schema } from "@/db";
import type { BookingStatus } from "@/db/schema";
import { bookingStatusLabels } from "@/lib/catalog";
import { formatFullDate } from "@/lib/format";
import { whatsappUrl } from "@/lib/whatsapp";
import { ConfirmButton, SubmitButton } from "@/components/admin/form";
import { Badge, Empty, PageHeader, bookingTone, formatDateTime } from "@/components/admin/ui";
import { deleteBooking, setBookingStatus } from "./actions";

export const metadata = { title: "Pedidos de agenda" };

export default async function BookingsPage(props: PageProps<"/admin/mensagens">) {
  const search = await props.searchParams;
  const status = typeof search.status === "string" && search.status in bookingStatusLabels ? (search.status as BookingStatus) : undefined;
  const db = await getDb();
  const rows = await db
    .select()
    .from(schema.bookingRequests)
    .where(status ? eq(schema.bookingRequests.status, status) : undefined)
    .orderBy(desc(schema.bookingRequests.createdAt))
    .limit(100);

  return (
    <>
      <PageHeader title="Pedidos de agenda" description="Convites enviados pelo formulário de contato do site." />
      <nav className="mb-4 flex flex-wrap gap-1 rounded-xl bg-white p-1 text-sm">
        {[{ value: undefined, label: "Todos" }, ...Object.entries(bookingStatusLabels).map(([value, label]) => ({ value, label }))].map((t) => (
          <Link
            key={t.label}
            href={t.value ? `/admin/mensagens?status=${t.value}` : "/admin/mensagens"}
            className={`rounded-lg px-3 py-1.5 ${status === t.value ? "bg-ink text-cream" : "text-ink/65 hover:bg-ink/5"}`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <Empty>Nenhum pedido de agenda por aqui.</Empty>
      ) : (
        <div className="space-y-4">
          {rows.map((b) => {
            const phone = b.phone.replace(/\D/g, "");
            return (
              <article key={b.id} className="admin-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-display text-xl">{b.name}</h2>
                      <Badge tone={bookingTone[b.status]}>{bookingStatusLabels[b.status]}</Badge>
                    </div>
                    <p className="text-sm text-ink/55">{b.eventType} · recebido em {formatDateTime(b.createdAt)}</p>
                  </div>
                  <form action={setBookingStatus.bind(null, b.id)} className="flex items-center gap-2">
                    <select name="status" defaultValue={b.status} className="admin-input w-auto py-1.5">
                      {Object.entries(bookingStatusLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    <SubmitButton className="admin-btn-ghost py-1.5">Atualizar</SubmitButton>
                  </form>
                </div>
                <ul className="mt-4 grid gap-2 text-sm text-ink/75 sm:grid-cols-2">
                  <li className="flex items-center gap-2"><Calendar className="size-4 text-cocoa" />{b.date ? formatFullDate(b.date) : "Data a definir"}</li>
                  <li className="flex items-center gap-2"><MapPin className="size-4 text-cocoa" />{b.city}</li>
                  <li className="flex items-center gap-2"><Mail className="size-4 text-cocoa" /><a href={`mailto:${b.email}`} className="hover:underline">{b.email}</a></li>
                  <li className="flex items-center gap-2"><Phone className="size-4 text-cocoa" />{b.phone}</li>
                </ul>
                {b.message && <p className="mt-4 whitespace-pre-line rounded-xl bg-cream/60 p-4 text-sm">{b.message}</p>}
                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={whatsappUrl(phone.length <= 11 ? `55${phone}` : phone, `Olá, ${b.name.split(" ")[0]}! Aqui é do Vocal Hope, recebemos seu convite pelo site.`)}
                    target="_blank"
                    rel="noreferrer"
                    className="admin-btn-ghost"
                  >
                    <MessageCircle className="size-4" /> Responder no WhatsApp
                  </a>
                  <form action={deleteBooking.bind(null, b.id)}>
                    <ConfirmButton message="Excluir este pedido de agenda?"><Trash2 className="size-4" /> Excluir</ConfirmButton>
                  </form>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
