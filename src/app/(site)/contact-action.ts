"use server";

import { z } from "zod";
import { getDb, schema } from "@/db";

// Missing fields (e.g. an unselected <select>) are absent from FormData entirely.
const required = (message: string) => z.string({ error: message }).trim();

const contactSchema = z.object({
  name: required("Informe seu nome.").min(2, "Informe seu nome."),
  email: z.email("Informe um e-mail válido."),
  phone: required("Informe um telefone com DDD.").min(8, "Informe um telefone com DDD."),
  eventType: required("Selecione o tipo de evento.").min(1, "Selecione o tipo de evento."),
  date: z.string().trim().optional(),
  city: required("Informe a cidade do evento.").min(2, "Informe a cidade do evento."),
  message: z.string().trim().max(2000).optional(),
  // Honeypot: real visitors never see or fill this field.
  company: z.string().optional(),
});

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Partial<Record<keyof z.infer<typeof contactSchema>, string>>;
  // Echoed back so the form keeps what the visitor typed (React resets it after the action).
  values?: Record<string, string>;
};

function escape(value: string) {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

export async function sendContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const values = Object.fromEntries(
    [...formData.entries()]
      .filter(([k, v]) => !k.startsWith("$") && typeof v === "string")
      .map(([k, v]) => [k, v as string]),
  );
  const parsed = contactSchema.safeParse(values);

  if (!parsed.success) {
    const errors: ContactState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof z.infer<typeof contactSchema>;
      errors[field] ??= issue.message;
    }
    return { status: "error", message: "Confira os campos destacados.", errors, values };
  }

  const data = parsed.data;
  if (data.company) return { status: "success", message: "Recebemos seu pedido!" };

  try {
    const db = await getDb();
    await db.insert(schema.bookingRequests).values({
      name: data.name,
      email: data.email,
      phone: data.phone,
      eventType: data.eventType,
      date: data.date || null,
      city: data.city,
      message: data.message || null,
    });
  } catch (error) {
    console.error("Falha ao salvar pedido de agenda", error);
    return {
      status: "error",
      message: "Não foi possível enviar agora. Tente novamente ou fale pelo WhatsApp.",
      values,
    };
  }

  await notifyByEmail(data);

  return {
    status: "success",
    message: "Recebemos seu pedido! Em breve entraremos em contato.",
  };
}

// Optional e-mail alert via Resend. The request is already saved in the admin panel.
async function notifyByEmail(data: z.infer<typeof contactSchema>) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_EMAIL_TO;
  const from = process.env.CONTACT_EMAIL_FROM ?? "Site Vocal Hope <onboarding@resend.dev>";
  if (!apiKey || !to) return;

  const rows: [string, string | undefined][] = [
    ["Nome", data.name],
    ["E-mail", data.email],
    ["Telefone", data.phone],
    ["Tipo de evento", data.eventType],
    ["Data", data.date],
    ["Cidade", data.city],
    ["Mensagem", data.message],
  ];

  const html = `<h2>Novo pedido de agenda</h2><table>${rows
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 12px 4px 0"><strong>${k}</strong></td><td>${escape(v!).replace(/\n/g, "<br>")}</td></tr>`,
    )
    .join("")}</table>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: to.split(",").map((s) => s.trim()),
        reply_to: data.email,
        subject: `Agenda: ${data.eventType} em ${data.city} — ${data.name}`,
        html,
      }),
    });
    if (!res.ok) throw new Error(`Resend respondeu ${res.status}`);
  } catch (error) {
    console.error("Falha ao enviar e-mail de contato", error);
  }
}
