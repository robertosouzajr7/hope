import { influences, photos, site } from "@/content/site";
import { Photo } from "../photo";
import { Reveal, RevealText } from "../reveal";
import { Parallax } from "../parallax";

const years = new Date().getFullYear() - site.foundedYear;

const stats = [
  { value: String(site.foundedYear), label: "Ano de fundação" },
  { value: `${years}+`, label: "Anos de ministério" },
  { value: "2024", label: "Primeiro single autoral" },
];

export function About() {
  return (
    <section id="sobre" className="relative bg-cream py-28 text-ink md:py-40">
      <div className="mx-auto grid max-w-7xl gap-16 px-5 md:grid-cols-12 md:px-10">
        <div className="md:col-span-5">
          <Reveal>
            <p className="mb-6 text-xs uppercase tracking-[0.35em] text-cocoa">Nossa história</p>
          </Reveal>
          <RevealText
            text="Uma década cantando esperança."
            className="font-display text-5xl leading-[1.02] md:text-7xl"
          />
          <div className="relative mt-14 hidden aspect-[4/5] md:block">
            <Parallax offset={60} className="absolute inset-0">
              <Photo src={photos[1].src} alt={photos[1].alt} sizes="40vw" className="h-full w-full rounded-2xl" />
            </Parallax>
          </div>
        </div>

        <div className="space-y-8 text-lg leading-relaxed text-ink/75 md:col-span-6 md:col-start-7 md:pt-24">
          <Reveal>
            <p className="font-display text-2xl leading-snug text-ink md:text-3xl">
              O Vocal Hope nasceu em {site.foundedYear} como um ministério musical da Igreja
              Adventista do Sétimo Dia e hoje tem sua casa em {site.city}.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <p>
              Ao longo dos anos, o grupo passou por diferentes formações — e cada voz deixou sua
              marca. Hoje, vivemos uma nova fase: a busca por um trabalho mais autoral e
              profissional, sem perder a essência que nos trouxe até aqui.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <p>
              Nosso som é gospel contemporâneo, com forte raiz na música cristã adventista e
              inspiração em grupos como {influences.slice(0, -1).join(", ")} e{" "}
              {influences.at(-1)}. Somos um grupo independente, construindo nossa própria
              história na música cristã — uma canção de cada vez.
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <dl className="grid grid-cols-3 gap-6 border-t border-ink/15 pt-10">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col">
                  <dt className="order-2 text-xs uppercase tracking-[0.15em] text-stone">{s.label}</dt>
                  <dd className="mb-2 font-display text-4xl text-cocoa md:text-5xl">{s.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <div className="relative aspect-[4/5] md:hidden">
            <Photo src={photos[1].src} alt={photos[1].alt} sizes="100vw" className="h-full w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
