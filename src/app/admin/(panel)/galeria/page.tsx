import Image from "next/image";
import { asc } from "drizzle-orm";
import { ArrowLeft, ArrowRight, Trash2 } from "lucide-react";
import { getDb, schema } from "@/db";
import { AdminForm, ConfirmButton, SubmitButton } from "@/components/admin/form";
import { Empty, Field, PageHeader } from "@/components/admin/ui";
import { deletePhoto, movePhoto, updatePhoto, uploadPhotos } from "./actions";

export const metadata = { title: "Galeria" };

export default async function GalleryAdminPage() {
  const db = await getDb();
  const photos = await db.select().from(schema.photos).orderBy(asc(schema.photos.position), asc(schema.photos.id));

  return (
    <>
      <PageHeader title="Galeria de fotos" description="Fotos exibidas na seção “Em cena” da página inicial, na ordem abaixo." />

      <section className="admin-card mb-6">
        <AdminForm action={uploadPhotos} submitLabel="Enviar fotos" resetOnSuccess>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Fotos" hint="Selecione várias de uma vez. JPG, PNG ou WEBP até 6 MB.">
              <input name="photos" type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="admin-input file:mr-3 file:rounded file:border-0 file:bg-sand file:px-2 file:py-1" />
            </Field>
            <Field label="Legenda" hint="Descreve a foto (acessibilidade e Google).">
              <input name="alt" placeholder="Ex.: Apresentação na IASD Central" className="admin-input" />
            </Field>
          </div>
        </AdminForm>
      </section>

      {photos.length === 0 ? (
        <Empty>Nenhuma foto ainda. Enquanto isso, o site mostra imagens de exemplo.</Empty>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo, i) => (
            <li key={photo.id} className="admin-card space-y-3 p-3 md:p-3">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-sand">
                <Image src={photo.url} alt={photo.alt} fill sizes="(min-width: 1024px) 33vw, 50vw" className="object-cover" />
                <span className="absolute left-2 top-2 rounded-full bg-ink/80 px-2 py-0.5 text-xs text-cream">{i + 1}</span>
              </div>
              <form action={updatePhoto.bind(null, photo.id)} className="flex gap-2">
                <input name="alt" defaultValue={photo.alt} className="admin-input" aria-label="Legenda" />
                <SubmitButton className="admin-btn-ghost">OK</SubmitButton>
              </form>
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  <form action={movePhoto.bind(null, photo.id, -1)}>
                    <button disabled={i === 0} className="admin-btn-ghost px-2 py-1.5" title="Mover para antes"><ArrowLeft className="size-4" /></button>
                  </form>
                  <form action={movePhoto.bind(null, photo.id, 1)}>
                    <button disabled={i === photos.length - 1} className="admin-btn-ghost px-2 py-1.5" title="Mover para depois"><ArrowRight className="size-4" /></button>
                  </form>
                </div>
                <form action={deletePhoto.bind(null, photo.id)}>
                  <ConfirmButton message="Remover esta foto da galeria?"><Trash2 className="size-4" /> Remover</ConfirmButton>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
