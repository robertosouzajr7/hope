import type { Metadata } from "next";
import Link from "next/link";
import { getPastEvents, getUpcomingEvents } from "@/lib/queries";
import { EventList } from "@/components/event-list";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Agenda",
  description: "Próximas apresentações do Vocal Hope em Salvador e região.",
};

export default async function AgendaPage() {
  const [upcoming, past] = await Promise.all([getUpcomingEvents(), getPastEvents()]);

  return (
    <>
      <PageHeader
        eyebrow="Agenda"
        title="Onde vamos cantar"
        description="Acompanhe as próximas apresentações do Vocal Hope. Quer levar o grupo para sua igreja ou evento? Fale com a gente."
      />
      <section className="bg-ink pb-28">
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          {upcoming.length > 0 ? (
            <EventList events={upcoming} />
          ) : (
            <p className="border-t border-cream/15 py-12 text-cream/60">Novas datas em breve.</p>
          )}

          {past.length > 0 && (
            <>
              <h2 className="mb-8 mt-24 font-display text-3xl text-cream/60">Já passou por aqui</h2>
              <EventList events={past} muted />
            </>
          )}

          <div className="mt-24 flex flex-col items-start justify-between gap-6 rounded-3xl bg-charcoal p-10 md:flex-row md:items-center md:p-14">
            <p className="max-w-lg font-display text-3xl text-cream md:text-4xl">
              Leve o Vocal Hope para o seu evento.
            </p>
            <Link
              href="/#contato"
              className="rounded-full bg-cream px-7 py-4 text-sm font-semibold text-ink transition-colors hover:bg-latte"
            >
              Solicitar agenda
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
