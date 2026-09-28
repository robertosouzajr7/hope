"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Loader2, Lock, ShoppingBag, Store, Truck } from "lucide-react";
import { placeOrder, type CheckoutState } from "@/app/(site)/checkout/actions";
import { formatPrice } from "@/lib/format";
import type { ShopSettings } from "@/lib/settings-schema";
import { useCart } from "./cart";
import { Photo } from "./photo";

const inputClass =
  "w-full rounded-xl border border-ink/15 bg-white/60 px-4 py-3 outline-none transition focus:border-ink aria-[invalid=true]:border-cocoa";

type Fields = Record<
  "name" | "email" | "phone" | "cep" | "street" | "number" | "complement" | "district" | "city" | "state" | "notes",
  string
>;

const empty: Fields = {
  name: "", email: "", phone: "", cep: "", street: "", number: "",
  complement: "", district: "", city: "", state: "", notes: "",
};

function Input({
  label, name, value, onChange, error, className = "", ...props
}: {
  label: string;
  name: keyof Fields;
  value: string;
  onChange: (name: keyof Fields, value: string) => void;
  error?: string;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "name">) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm text-ink/70">{label}</span>
      <input
        name={name}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        aria-invalid={!!error}
        className={inputClass}
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-cocoa">{error}</span>}
    </label>
  );
}

export function CheckoutForm({ shop, onlinePayment }: { shop: ShopSettings; onlinePayment: boolean }) {
  const { items, total } = useCart();
  const [fields, setFields] = useState<Fields>(empty);
  const [delivery, setDelivery] = useState<"pickup" | "shipping">(shop.shippingEnabled ? "shipping" : "pickup");
  const [state, action, pending] = useActionState<CheckoutState, FormData>(placeOrder, { status: "idle" });
  const e = state.errors ?? {};

  const set = (name: keyof Fields, value: string) => setFields((f) => ({ ...f, [name]: value }));
  const shippingFee = delivery === "shipping" ? shop.shippingFee : 0;

  // Fills the address from the CEP using the public ViaCEP API.
  async function lookupCep(cep: string) {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (data.erro) return;
      setFields((f) => ({
        ...f,
        street: data.logradouro || f.street,
        district: data.bairro || f.district,
        city: data.localidade || f.city,
        state: data.uf || f.state,
      }));
    } catch {
      // Lookup is a convenience; the customer can type the address.
    }
  }

  if (items.length === 0) {
    return (
      <div className="mt-16 flex flex-col items-start gap-5">
        <ShoppingBag className="size-10 text-cocoa/50" strokeWidth={1.2} />
        <p className="text-lg text-ink/70">Sua sacola está vazia.</p>
        <Link href="/loja" className="rounded-full bg-ink px-6 py-3 text-sm text-cream hover:bg-cocoa">
          Conhecer a loja
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="mt-12 grid gap-12 lg:grid-cols-[1fr_400px]">
      <input
        type="hidden"
        name="items"
        value={JSON.stringify(items.map(({ productId, size, color, quantity }) => ({ productId, size, color, quantity })))}
      />
      <input type="hidden" name="delivery" value={delivery} />

      <div className="space-y-12">
        <fieldset className="space-y-4">
          <legend className="mb-4 font-display text-2xl">Seus dados</legend>
          <Input label="Nome completo" name="name" value={fields.name} onChange={set} error={e.name} autoComplete="name" required />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="E-mail" name="email" type="email" value={fields.email} onChange={set} error={e.email} autoComplete="email" required />
            <Input label="WhatsApp" name="phone" type="tel" value={fields.phone} onChange={set} error={e.phone} autoComplete="tel" placeholder="(71) 9 0000-0000" required />
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-4 font-display text-2xl">Entrega</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {shop.shippingEnabled && (
              <button
                type="button"
                onClick={() => setDelivery("shipping")}
                aria-pressed={delivery === "shipping"}
                className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${delivery === "shipping" ? "border-ink bg-white" : "border-ink/15 hover:border-ink/40"}`}
              >
                <Truck className="mt-0.5 size-5 shrink-0" />
                <span>
                  <span className="block font-medium">Envio pelos Correios</span>
                  <span className="text-sm text-ink/60">{shop.shippingFee > 0 ? formatPrice(shop.shippingFee) : "Frete grátis"}</span>
                </span>
              </button>
            )}
            {shop.pickupEnabled && (
              <button
                type="button"
                onClick={() => setDelivery("pickup")}
                aria-pressed={delivery === "pickup"}
                className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${delivery === "pickup" ? "border-ink bg-white" : "border-ink/15 hover:border-ink/40"}`}
              >
                <Store className="mt-0.5 size-5 shrink-0" />
                <span>
                  <span className="block font-medium">Retirar em Salvador</span>
                  <span className="text-sm text-ink/60">Grátis</span>
                </span>
              </button>
            )}
          </div>

          {delivery === "pickup" && shop.pickupInfo && (
            <p className="mt-4 rounded-xl bg-sand/60 px-4 py-3 text-sm text-ink/75">{shop.pickupInfo}</p>
          )}

          {delivery === "shipping" && (
            <div className="mt-6 grid gap-4 sm:grid-cols-6">
              <Input label="CEP" name="cep" value={fields.cep} onChange={set} onBlur={(ev) => lookupCep(ev.target.value)} error={e.cep} inputMode="numeric" autoComplete="postal-code" className="sm:col-span-2" />
              <Input label="Rua" name="street" value={fields.street} onChange={set} error={e.street} autoComplete="address-line1" className="sm:col-span-4" />
              <Input label="Número" name="number" value={fields.number} onChange={set} error={e.number} className="sm:col-span-2" />
              <Input label="Complemento" name="complement" value={fields.complement} onChange={set} autoComplete="address-line2" className="sm:col-span-4" />
              <Input label="Bairro" name="district" value={fields.district} onChange={set} error={e.district} className="sm:col-span-3" />
              <Input label="Cidade" name="city" value={fields.city} onChange={set} error={e.city} autoComplete="address-level2" className="sm:col-span-2" />
              <Input label="UF" name="state" value={fields.state} onChange={set} error={e.state} maxLength={2} autoComplete="address-level1" className="sm:col-span-1" />
            </div>
          )}
        </fieldset>

        <label className="block">
          <span className="mb-1.5 block text-sm text-ink/70">Observações (opcional)</span>
          <textarea name="notes" value={fields.notes} onChange={(ev) => set("notes", ev.target.value)} rows={3} className={`${inputClass} resize-none`} />
        </label>
      </div>

      <aside className="h-fit rounded-3xl bg-white/70 p-6 lg:sticky lg:top-28">
        <h2 className="font-display text-2xl">Resumo</h2>
        <ul className="mt-6 divide-y divide-ink/10">
          {items.map((item) => (
            <li key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-3 py-3">
              <Photo src={item.image} alt={item.name} sizes="56px" tone="light" icon={null} className="size-14 shrink-0 rounded-lg" />
              <div className="flex-1 text-sm">
                <p className="font-medium">{item.quantity}× {item.name}</p>
                <p className="text-ink/60">{[item.size, item.color].filter(Boolean).join(" · ")}</p>
              </div>
              <p className="text-sm tabular-nums">{formatPrice(item.price * item.quantity)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-ink/10 pt-4 text-sm">
          <div className="flex justify-between"><dt className="text-ink/60">Subtotal</dt><dd className="tabular-nums">{formatPrice(total)}</dd></div>
          <div className="flex justify-between"><dt className="text-ink/60">Entrega</dt><dd className="tabular-nums">{shippingFee ? formatPrice(shippingFee) : "Grátis"}</dd></div>
          <div className="flex justify-between pt-2 text-lg font-semibold"><dt>Total</dt><dd className="tabular-nums">{formatPrice(total + shippingFee)}</dd></div>
        </dl>

        {state.status === "error" && state.message && (
          <p role="alert" className="mt-4 rounded-xl bg-cocoa/10 px-4 py-3 text-sm text-cocoa">{state.message}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-ink py-4 text-sm font-semibold text-cream transition-colors hover:bg-cocoa disabled:opacity-60"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
          {onlinePayment ? "Ir para o pagamento" : "Confirmar pedido"}
        </button>
        <p className="mt-3 text-center text-xs text-ink/55">
          {onlinePayment
            ? "Pagamento seguro pelo Mercado Pago: Pix, cartão ou boleto."
            : "Após confirmar, combinamos o pagamento pelo WhatsApp."}
        </p>
      </aside>
    </form>
  );
}
