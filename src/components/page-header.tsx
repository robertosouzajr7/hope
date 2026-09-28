import { Reveal, RevealText } from "./reveal";

export function PageHeader({
  eyebrow,
  title,
  description,
  tone = "dark",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  tone?: "dark" | "light";
}) {
  const light = tone === "light";
  return (
    <section className={`pb-16 pt-40 md:pb-24 md:pt-52 ${light ? "bg-cream text-ink" : "bg-ink text-cream"}`}>
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <Reveal>
          <p className={`mb-6 text-xs uppercase tracking-[0.35em] ${light ? "text-cocoa" : "text-latte"}`}>
            {eyebrow}
          </p>
        </Reveal>
        <RevealText as="h1" text={title} className="font-display text-6xl leading-[0.95] md:text-8xl" />
        {description && (
          <Reveal delay={0.2}>
            <p className={`mt-8 max-w-xl text-lg ${light ? "text-ink/65" : "text-cream/65"}`}>{description}</p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
