import Link from "next/link";
import { nav, site } from "@/content/site";
import { Logo } from "./header";
import { SocialLinks } from "./social-icons";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-cream/10 bg-ink pt-20 text-cream">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 md:grid-cols-[1.5fr_1fr_1fr] md:px-10">
        <div className="space-y-5">
          <Logo className="text-4xl" />
          <p className="max-w-sm text-cream/60">{site.tagline}</p>
          <SocialLinks />
        </div>
        <nav aria-label="Rodapé">
          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-stone">Navegue</p>
          <ul className="space-y-2">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-cream/80 transition-colors hover:text-latte">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-stone">Contato</p>
          <ul className="space-y-2 text-cream/80">
            <li>
              <a href={`mailto:${site.email}`} className="hover:text-latte">
                {site.email}
              </a>
            </li>
            <li>
              <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noreferrer" className="hover:text-latte">
                WhatsApp
              </a>
            </li>
            <li>{site.city}</li>
          </ul>
        </div>
      </div>

      <p
        aria-hidden
        className="pointer-events-none mt-16 select-none whitespace-nowrap text-center font-display text-[17vw] leading-[0.8] text-cream/[0.04]"
      >
        Vocal Hope
      </p>

      <div className="mx-auto flex max-w-7xl flex-col gap-2 border-t border-cream/10 px-5 py-6 text-xs text-stone md:flex-row md:justify-between md:px-10">
        <p>
          © {new Date().getFullYear()} {site.name}. Todos os direitos reservados.
        </p>
        <p>Ministério musical da Igreja Adventista do Sétimo Dia · desde {site.foundedYear}</p>
      </div>
    </footer>
  );
}
