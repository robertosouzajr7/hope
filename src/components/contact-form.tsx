"use client";

import { useActionState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Check, Loader2 } from "lucide-react";
import { sendContact, type ContactState } from "@/app/actions/contact";
import { whatsappUrl } from "@/lib/whatsapp";

const eventTypes = [
  "Culto / programação na igreja",
  "Evento jovem",
  "Casamento",
  "Evento corporativo",
  "Festival / show",
  "Outro",
];

function Field({
  label,
  name,
  error,
  className = "",
  children,
}: {
  label: string;
  name: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={name} className={`group block ${className}`}>
      <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-stone">
        {label}
      </span>
      {children}
      {error && <span className="mt-1.5 block text-xs text-latte">{error}</span>}
    </label>
  );
}

const inputClass =
  "w-full border-b border-cream/20 bg-transparent py-3 text-lg text-cream outline-none transition-colors placeholder:text-cream/25 focus:border-latte aria-[invalid=true]:border-latte";

function fallbackMessage(v: Record<string, string>) {
  return [
    "Olá, Vocal Hope! Gostaria de convidar o grupo para um evento.",
    "",
    `Nome: ${v.name}`,
    `Telefone: ${v.phone}`,
    `E-mail: ${v.email}`,
    `Evento: ${v.eventType}`,
    `Data: ${v.date || "a definir"}`,
    `Cidade: ${v.city}`,
    v.message ? `\n${v.message}` : "",
  ].join("\n");
}

export function ContactForm() {
  const [state, action, pending] = useActionState<ContactState, FormData>(
    sendContact,
    { status: "idle" },
  );
  const e = state.errors ?? {};
  const v = state.values ?? {};

  if (state.status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-start gap-5 py-10"
      >
        <span className="flex size-14 items-center justify-center rounded-full bg-latte text-ink">
          <Check className="size-6" />
        </span>
        <p className="font-display text-3xl text-cream">Obrigado!</p>
        <p className="text-cream/70">{state.message}</p>
      </motion.div>
    );
  }

  return (
    <form action={action} noValidate className="grid gap-8 sm:grid-cols-2">
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />
      <Field label="Nome" name="name" error={e.name}>
        <input id="name" name="name" defaultValue={v.name} autoComplete="name" required aria-invalid={!!e.name} className={inputClass} placeholder="Seu nome" />
      </Field>
      <Field label="Telefone / WhatsApp" name="phone" error={e.phone}>
        <input id="phone" name="phone" defaultValue={v.phone} type="tel" autoComplete="tel" required aria-invalid={!!e.phone} className={inputClass} placeholder="(71) 9 0000-0000" />
      </Field>
      <Field label="E-mail" name="email" error={e.email} className="sm:col-span-2">
        <input id="email" name="email" defaultValue={v.email} type="email" autoComplete="email" required aria-invalid={!!e.email} className={inputClass} placeholder="voce@email.com" />
      </Field>
      <Field label="Tipo de evento" name="eventType" error={e.eventType}>
        <select key={v.eventType ?? ""} id="eventType" name="eventType" required defaultValue={v.eventType ?? ""} aria-invalid={!!e.eventType} className={`${inputClass} [&>option]:bg-charcoal`}>
          <option value="" disabled>
            Selecione
          </option>
          {eventTypes.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </Field>
      <Field label="Data prevista" name="date" error={e.date}>
        <input id="date" name="date" defaultValue={v.date} type="date" className={`${inputClass} [color-scheme:dark]`} />
      </Field>
      <Field label="Cidade / local" name="city" error={e.city} className="sm:col-span-2">
        <input id="city" name="city" defaultValue={v.city} required aria-invalid={!!e.city} className={inputClass} placeholder="Ex.: IASD Pituba, Salvador" />
      </Field>
      <Field label="Mensagem" name="message" error={e.message} className="sm:col-span-2">
        <textarea id="message" name="message" defaultValue={v.message} rows={3} className={`${inputClass} resize-none`} placeholder="Conte um pouco sobre o evento, horário, público…" />
      </Field>

      <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <AnimatePresence mode="wait">
          {state.status === "error" && (
            <motion.p key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-latte">
              {state.message}
            </motion.p>
          )}
          {state.status === "fallback" && (
            <motion.p key="fb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-cream/70">
              Não conseguimos enviar por e-mail agora.{" "}
              <a href={whatsappUrl(fallbackMessage(v))} target="_blank" rel="noreferrer" className="text-latte underline underline-offset-4">
                Envie pelo WhatsApp
              </a>
              .
            </motion.p>
          )}
        </AnimatePresence>
        <button
          type="submit"
          disabled={pending}
          className="group ml-auto inline-flex items-center gap-3 rounded-full bg-cream px-8 py-4 text-sm font-semibold tracking-wide text-ink transition-colors hover:bg-latte disabled:opacity-60"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          Solicitar agenda
          <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:rotate-45" />
        </button>
      </div>
    </form>
  );
}
