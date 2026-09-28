import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { upcomingEvents } from "@/content/events";
import { EventList } from "../event-list";
import { Reveal, RevealText } from "../reveal";

export function Agenda() {
  const events = upcomingEvents().slice(0, 4);

  return (
    <section id="agenda" className="bg-charcoal py-28 md:py-40">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Reveal>
              <p className="mb-6 text-xs uppercase tracking-[0.35em] text-latte">Agenda</p>
            </Reveal>
            <RevealText text="Próximas apresentações" className="font-display text-5xl text-cream md:text-7xl" />
          </div>
          <Reveal delay={0.2}>
            <Link href="/agenda" className="group inline-flex items-center gap-3 text-sm text-cream/80 hover:text-latte">
              Ver agenda completa
              <ArrowRight className="size-4 transition-transform duration-500 group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>

        {events.length > 0 ? (
          <EventList events={events} />
        ) : (
          <p className="border-t border-cream/15 py-12 text-cream/60">
            Novas datas em breve. Quer levar o Vocal Hope para o seu evento?{" "}
            <Link href="#contato" className="text-latte underline underline-offset-4">
              Fale com a gente
            </Link>
            .
          </p>
        )}
      </div>
    </section>
  );
}
