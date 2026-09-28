import { Mail, MapPin, MessageCircle } from "lucide-react";
import type { SiteSettings } from "@/lib/settings-schema";
import { whatsappUrl } from "@/lib/whatsapp";
import { ContactForm } from "../contact-form";
import { Reveal, RevealText } from "../reveal";
import { SocialLinks } from "../social-icons";

export function Contact({ site }: { site: SiteSettings }) {
  return (
    <section id="contato" className="relative overflow-hidden bg-espresso py-28 md:py-40">
      <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 size-[40rem] rounded-full bg-cocoa/50 blur-[160px]" />
      <div className="relative mx-auto grid max-w-7xl gap-16 px-5 md:grid-cols-12 md:px-10">
        <div className="md:col-span-5">
          <Reveal>
            <p className="mb-6 text-xs uppercase tracking-[0.35em] text-latte">Agenda & contato</p>
          </Reveal>
          <RevealText
            text="Leve o Vocal Hope para o seu evento."
            className="font-display text-5xl leading-[1.02] text-cream md:text-6xl"
          />
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-sm text-cream/65">
              Cultos, programações jovens, casamentos, festivais e eventos especiais. Preencha o
              formulário e nossa equipe retorna com disponibilidade e detalhes.
            </p>
          </Reveal>
          <Reveal delay={0.25}>
            <ul className="mt-10 space-y-4 text-cream/80">
              <li className="flex items-center gap-3">
                <Mail className="size-5 text-latte" />
                <a href={`mailto:${site.email}`} className="hover:text-latte">{site.email}</a>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle className="size-5 text-latte" />
                <a href={whatsappUrl(site.whatsapp)} target="_blank" rel="noreferrer" className="hover:text-latte">
                  Fale pelo WhatsApp
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="size-5 text-latte" />
                {site.city}
              </li>
            </ul>
            <SocialLinks socials={site} className="mt-10 text-cream" />
          </Reveal>
        </div>

        <Reveal delay={0.15} className="md:col-span-6 md:col-start-7">
          <ContactForm />
        </Reveal>
      </div>
    </section>
  );
}
