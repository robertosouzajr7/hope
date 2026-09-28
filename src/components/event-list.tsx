import { ArrowUpRight, MapPin } from "lucide-react";
import type { Event } from "@/db/schema";
import { formatDay, formatMonth, formatWeekday } from "@/lib/format";
import { Reveal } from "./reveal";

export function EventList({ events, muted = false }: { events: Event[]; muted?: boolean }) {
  return (
    <div className="border-t border-cream/15">
      {events.map((event, i) => {
        const Wrapper = event.link ? "a" : "div";
        return (
          <Reveal key={event.id} delay={i * 0.06}>
            <div className="border-b border-cream/15">
              <Wrapper
                {...(event.link ? { href: event.link, target: "_blank", rel: "noreferrer" } : {})}
                className={`group grid grid-cols-[auto_1fr_auto] items-center gap-5 py-7 transition-colors md:grid-cols-[120px_1fr_1fr_auto] md:gap-10 md:py-9 ${
                  muted ? "opacity-50" : "hover:bg-cream/[0.03]"
                }`}
              >
                <div className="flex items-baseline gap-2 md:flex-col md:gap-0">
                  <span className="font-display text-5xl leading-none text-cream md:text-6xl">
                    {formatDay(event.date)}
                  </span>
                  <span className="text-xs uppercase tracking-[0.25em] text-latte">
                    {formatMonth(event.date)}
                  </span>
                </div>
                <div>
                  <p className="font-display text-2xl text-cream transition-transform duration-500 ease-out-expo group-hover:translate-x-2 md:text-3xl">
                    {event.title}
                  </p>
                  <p className="mt-1 text-sm capitalize text-stone">
                    {formatWeekday(event.date)}
                    {event.time ? ` · ${event.time}` : ""}
                  </p>
                </div>
                <p className="col-span-3 flex items-center gap-2 text-sm text-cream/60 md:col-span-1">
                  <MapPin className="size-4 shrink-0 text-latte" />
                  {event.venue} — {event.city}
                </p>
                <span className={`${event.link ? "md:flex" : "md:invisible md:flex"} hidden size-12 items-center justify-center rounded-full border border-cream/20 text-cream transition-all duration-500 group-hover:rotate-45 group-hover:border-latte group-hover:bg-latte group-hover:text-ink`}>
                  <ArrowUpRight className="size-5" />
                </span>
              </Wrapper>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
