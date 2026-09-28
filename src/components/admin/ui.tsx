import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function PageHeader({
  title,
  description,
  back,
  actions,
}: {
  title: string;
  description?: string;
  back?: { href: string; label: string };
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      {back && (
        <Link href={back.href} className="mb-3 inline-flex items-center gap-1.5 text-sm text-ink/55 hover:text-ink">
          <ArrowLeft className="size-4" /> {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl">{title}</h1>
          {description && <p className="mt-1 text-sm text-ink/60">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}

const tones = {
  gray: "bg-ink/5 text-ink/70",
  amber: "bg-amber-100 text-amber-800",
  green: "bg-emerald-100 text-emerald-800",
  blue: "bg-sky-100 text-sky-800",
  red: "bg-red-100 text-red-800",
  brown: "bg-sand text-espresso",
};

export type BadgeTone = keyof typeof tones;

export function Badge({ tone = "gray", children }: { tone?: BadgeTone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export const orderTone: Record<string, BadgeTone> = {
  pending: "amber",
  paid: "green",
  shipped: "blue",
  delivered: "gray",
  cancelled: "red",
};

export const paymentTone: Record<string, BadgeTone> = {
  pending: "amber",
  in_process: "blue",
  approved: "green",
  rejected: "red",
  cancelled: "red",
  refunded: "gray",
};

export const bookingTone: Record<string, BadgeTone> = {
  new: "amber",
  contacted: "blue",
  confirmed: "green",
  declined: "gray",
};

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-2xl border border-dashed border-ink/15 px-6 py-12 text-center text-sm text-ink/55">{children}</p>;
}

export function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="admin-label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink/50">{hint}</span>}
    </label>
  );
}

export function Checkbox({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="size-4 accent-ink" />
      {label}
    </label>
  );
}

export function formatDateTime(date: Date) {
  return date.toLocaleString("pt-BR", {
    timeZone: "America/Bahia",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
