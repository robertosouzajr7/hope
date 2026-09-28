// Parses "89,90", "89.90", "R$ 1.234,56" or "1234" into cents.
export function parseMoney(input: string): number | null {
  const cleaned = input.replace(/[^\d,.-]/g, "");
  if (!cleaned) return null;
  let normalized = cleaned;
  if (cleaned.includes(",")) normalized = cleaned.replace(/\./g, "").replace(",", ".");
  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100);
}

export function centsToInput(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",");
}

export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function splitList(input: string) {
  return input
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}
