import type { Event } from "@/db/schema";
import { AdminForm, type ActionResult } from "./form";
import { Checkbox, Field } from "./ui";

export function EventForm({
  action,
  event,
}: {
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  event?: Event;
}) {
  return (
    <AdminForm action={action} submitLabel={event ? "Salvar alterações" : "Criar evento"}>
      <div className="admin-card max-w-2xl space-y-4">
        <Field label="Nome do evento">
          <input name="title" required defaultValue={event?.title} placeholder="Ex.: Culto Jovem Especial" className="admin-input" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Data"><input name="date" type="date" required defaultValue={event?.date} className="admin-input" /></Field>
          <Field label="Horário"><input name="time" defaultValue={event?.time ?? ""} placeholder="19h30" className="admin-input" /></Field>
          <Field label="Local"><input name="venue" required defaultValue={event?.venue} placeholder="IASD Central" className="admin-input" /></Field>
          <Field label="Cidade"><input name="city" required defaultValue={event?.city ?? "Salvador, BA"} className="admin-input" /></Field>
        </div>
        <Field label="Link (opcional)" hint="Ingressos, transmissão ou mapa.">
          <input name="link" type="url" defaultValue={event?.link ?? ""} className="admin-input" />
        </Field>
        <Checkbox name="published" label="Publicado no site" defaultChecked={event?.published ?? true} />
      </div>
    </AdminForm>
  );
}
