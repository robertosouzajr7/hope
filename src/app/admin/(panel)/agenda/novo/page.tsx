import { EventForm } from "@/components/admin/event-form";
import { PageHeader } from "@/components/admin/ui";
import { createEvent } from "../actions";

export const metadata = { title: "Novo evento" };

export default function NewEventPage() {
  return (
    <>
      <PageHeader title="Novo evento" back={{ href: "/admin/agenda", label: "Agenda" }} />
      <EventForm action={createEvent} />
    </>
  );
}
