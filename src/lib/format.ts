const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatPrice(cents: number) {
  return currency.format(cents / 100);
}

export function parseDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatDay(iso: string) {
  return String(parseDate(iso).getDate()).padStart(2, "0");
}

export function formatMonth(iso: string) {
  return parseDate(iso)
    .toLocaleDateString("pt-BR", { month: "short" })
    .replace(".", "");
}

export function formatWeekday(iso: string) {
  return parseDate(iso).toLocaleDateString("pt-BR", { weekday: "long" });
}

export function formatFullDate(iso: string) {
  return parseDate(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
