import { pillars } from "@/content/site";
import { Reveal, RevealText } from "../reveal";

export function Pillars() {
  return (
    <section className="bg-sand py-28 text-ink md:py-40">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <div className="mb-20 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <RevealText
            text="O que move o nosso som"
            className="max-w-2xl font-display text-5xl leading-[1.02] md:text-7xl"
          />
          <Reveal delay={0.2}>
            <p className="max-w-sm text-ink/65">
              Vocais bem harmonizados, arranjos ousados, groove e muito swing — música com
              mensagens fortes e envolventes.
            </p>
          </Reveal>
        </div>

        <div className="grid border-t border-ink/15 md:grid-cols-4">
          {pillars.map((p, i) => (
            <Reveal
              key={p.title}
              delay={i * 0.1}
              className="group relative border-b border-ink/15 py-10 md:border-b-0 md:border-r md:px-8 md:py-12 md:first:pl-0 md:last:border-r-0"
            >
              <div>
                <span className="font-display text-sm text-cocoa">0{i + 1}</span>
                <h3 className="mt-6 font-display text-3xl transition-transform duration-500 ease-out-expo group-hover:translate-x-2">
                  {p.title}
                </h3>
                <p className="mt-4 leading-relaxed text-ink/65">{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
