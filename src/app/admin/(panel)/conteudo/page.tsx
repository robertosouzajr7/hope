import Image from "next/image";
import { AdminForm } from "@/components/admin/form";
import { Field, PageHeader } from "@/components/admin/ui";
import { getSiteSettings } from "@/lib/queries";
import { saveSiteSettings } from "../settings-actions";

export const metadata = { title: "Conteúdo do site" };

function ImageInput({ name, label, current, hint }: { name: string; label: string; current: string | null; hint: string }) {
  return (
    <div>
      <p className="admin-label">{label}</p>
      <div className="flex items-start gap-4">
        <div className="relative aspect-[4/3] w-32 shrink-0 overflow-hidden rounded-lg bg-sand">
          {current ? (
            <Image src={current} alt="" fill sizes="128px" className="object-cover" />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-xs text-ink/40">Sem foto</span>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input name={`${name}File`} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="admin-input file:mr-3 file:rounded file:border-0 file:bg-sand file:px-2 file:py-1" />
          <p className="text-xs text-ink/50">{hint}</p>
          {current && (
            <label className="flex items-center gap-2 text-xs text-red-700">
              <input type="checkbox" name={`${name}Remove`} className="accent-red-700" /> Remover foto atual
            </label>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function ContentPage() {
  const site = await getSiteSettings();
  const pillars = [...site.pillars, ...Array(Math.max(0, 6 - site.pillars.length)).fill({ title: "", text: "" })].slice(0, 6);

  return (
    <>
      <PageHeader title="Conteúdo do site" description="Textos, fotos principais, música e redes sociais. As mudanças aparecem no site na hora." />

      <AdminForm action={saveSiteSettings} submitLabel="Salvar e publicar">
        <div className="space-y-6">
          <section className="admin-card space-y-4">
            <h2 className="font-display text-xl">Identidade</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Nome do grupo"><input name="name" defaultValue={site.name} className="admin-input" /></Field>
              <Field label="Cidade"><input name="city" defaultValue={site.city} className="admin-input" /></Field>
              <Field label="Ano de fundação"><input name="foundedYear" type="number" defaultValue={site.foundedYear} className="admin-input" /></Field>
            </div>
            <Field label="Frase de destaque"><input name="tagline" defaultValue={site.tagline} className="admin-input" /></Field>
            <Field label="Descrição (Google e redes sociais)">
              <textarea name="description" rows={2} defaultValue={site.description} className="admin-input" />
            </Field>
            <ImageInput name="heroImage" label="Foto de capa (topo do site)" current={site.heroImage} hint="Foto horizontal em alta resolução (ideal 2400px de largura)." />
          </section>

          <section className="admin-card space-y-4">
            <h2 className="font-display text-xl">Nossa história</h2>
            <Field label="Título"><input name="aboutTitle" defaultValue={site.aboutTitle} className="admin-input" /></Field>
            <Field label="Parágrafo de abertura"><textarea name="aboutLead" rows={2} defaultValue={site.aboutLead} className="admin-input" /></Field>
            <Field label="Texto" hint="Deixe uma linha em branco para separar parágrafos.">
              <textarea name="aboutText" rows={7} defaultValue={site.aboutText} className="admin-input" />
            </Field>
            <ImageInput name="aboutImage" label="Foto da seção" current={site.aboutImage} hint="Foto vertical (retrato)." />
            <Field label="Influências" hint="Separadas por vírgula. Aparecem na faixa animada.">
              <input name="influences" defaultValue={site.influences.join(", ")} className="admin-input" />
            </Field>
          </section>

          <section className="admin-card space-y-4">
            <h2 className="font-display text-xl">Música em destaque</h2>
            <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
              <Field label="Título"><input name="singleTitle" defaultValue={site.singleTitle} className="admin-input" /></Field>
              <Field label="Ano"><input name="singleYear" type="number" defaultValue={site.singleYear} className="admin-input" /></Field>
            </div>
            <Field label="Descrição"><textarea name="singleDescription" rows={3} defaultValue={site.singleDescription} className="admin-input" /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Clipe no YouTube" hint="Cole o link do vídeo para exibir o player.">
                <input name="singleYoutubeId" defaultValue={site.singleYoutubeId} placeholder="https://youtu.be/..." className="admin-input" />
              </Field>
              <Field label="Faixa no Spotify" hint="Cole o link da música no Spotify.">
                <input name="singleSpotifyTrackId" defaultValue={site.singleSpotifyTrackId} placeholder="https://open.spotify.com/track/..." className="admin-input" />
              </Field>
            </div>
          </section>

          <section className="admin-card space-y-4">
            <h2 className="font-display text-xl">O que move o nosso som</h2>
            <p className="text-sm text-ink/55">Até 6 destaques. Deixe o título vazio para remover.</p>
            <div className="grid gap-4 md:grid-cols-2">
              {pillars.map((p, i) => (
                <div key={i} className="space-y-2 rounded-xl bg-cream/50 p-4">
                  <input name={`pillarTitle${i}`} defaultValue={p.title} placeholder="Título" className="admin-input font-medium" />
                  <textarea name={`pillarText${i}`} defaultValue={p.text} rows={2} placeholder="Texto" className="admin-input" />
                </div>
              ))}
            </div>
          </section>

          <section className="admin-card space-y-4">
            <h2 className="font-display text-xl">Contato e redes sociais</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="E-mail"><input name="email" type="email" defaultValue={site.email} className="admin-input" /></Field>
              <Field label="WhatsApp" hint="Com DDI e DDD, ex.: 5571999999999.">
                <input name="whatsapp" defaultValue={site.whatsapp} className="admin-input" />
              </Field>
              <Field label="Instagram"><input name="instagram" defaultValue={site.instagram} className="admin-input" /></Field>
              <Field label="YouTube"><input name="youtube" defaultValue={site.youtube} className="admin-input" /></Field>
              <Field label="Spotify" className="sm:col-span-2"><input name="spotify" defaultValue={site.spotify} className="admin-input" /></Field>
            </div>
          </section>
        </div>
      </AdminForm>
    </>
  );
}
