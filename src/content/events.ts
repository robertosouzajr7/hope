// Agenda de apresentações. Datas no formato AAAA-MM-DD.
// Eventos passados saem automaticamente da lista de "próximos".
// TODO(vocal-hope): substituir pelos eventos reais.

export type Event = {
  date: string;
  time?: string;
  title: string;
  venue: string;
  city: string;
  link?: string;
};

export const events: Event[] = [
  {
    date: "2026-10-17",
    time: "19h30",
    title: "Culto Jovem Especial",
    venue: "IASD Central de Salvador",
    city: "Salvador, BA",
  },
  {
    date: "2026-11-07",
    time: "18h00",
    title: "Noite de Louvor",
    venue: "IASD Pituba",
    city: "Salvador, BA",
  },
  {
    date: "2026-11-28",
    time: "20h00",
    title: "Encontro de Grupos Vocais",
    venue: "Teatro a confirmar",
    city: "Feira de Santana, BA",
  },
  {
    date: "2026-12-19",
    time: "19h00",
    title: "Cantata de Natal",
    venue: "IASD Brotas",
    city: "Salvador, BA",
  },
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function upcomingEvents() {
  const now = today();
  return events
    .filter((e) => e.date >= now)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function pastEvents() {
  const now = today();
  return events
    .filter((e) => e.date < now)
    .sort((a, b) => b.date.localeCompare(a.date));
}
