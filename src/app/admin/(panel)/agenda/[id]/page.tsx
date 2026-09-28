import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { Trash2 } from "lucide-react";
import { getDb, schema } from "@/db";
import { EventForm } from "@/components/admin/event-form";
import { ConfirmButton } from "@/components/admin/form";
import { PageHeader } from "@/components/admin/ui";
import { deleteEvent, updateEvent } from "../actions";

export const metadata = { title: "Editar evento" };

export default async function EditEventPage(props: PageProps<"/admin/agenda/[id]">) {
  const { id } = await props.params;
  const db = await getDb();
  const [event] = await db.select().from(schema.events).where(eq(schema.events.id, Number(id) || 0));
  if (!event) notFound();

  return (
    <>
      <PageHeader
        title={event.title}
        back={{ href: "/admin/agenda", label: "Agenda" }}
        actions={
          <form action={deleteEvent.bind(null, event.id)}>
            <ConfirmButton message="Excluir este evento?"><Trash2 className="size-4" /> Excluir</ConfirmButton>
          </form>
        }
      />
      <EventForm action={updateEvent.bind(null, event.id)} event={event} />
    </>
  );
}
