import { About } from "@/components/sections/about";
import { Agenda } from "@/components/sections/agenda";
import { Contact } from "@/components/sections/contact";
import { Gallery, type GalleryPhoto } from "@/components/sections/gallery";
import { Hero } from "@/components/sections/hero";
import { Marquee } from "@/components/sections/marquee";
import { Music } from "@/components/sections/music";
import { Pillars } from "@/components/sections/pillars";
import { ShopPreview } from "@/components/sections/shop-preview";
import { getActiveProducts, getPhotos, getSiteSettings, getUpcomingEvents } from "@/lib/queries";

// Shown until photos are uploaded in the admin panel.
const placeholderPhotos: GalleryPhoto[] = [
  "Vocal Hope em apresentação ao vivo",
  "Integrantes do Vocal Hope nos bastidores",
  "Ensaio do Vocal Hope",
  "Vocal Hope em sessão de fotos",
  "Público em apresentação do Vocal Hope",
].map((alt, i) => ({ id: -i - 1, url: null, alt }));

export default async function Home() {
  const [site, photos, events, products] = await Promise.all([
    getSiteSettings(),
    getPhotos(),
    getUpcomingEvents(),
    getActiveProducts(),
  ]);

  return (
    <>
      <Hero site={site} />
      <Marquee
        items={["Harmonia", "Groove", "Swing", "Esperança", "Gospel contemporâneo"]}
        className="border-y border-cream/10 bg-ink text-cream"
      />
      <About site={site} />
      <Music site={site} />
      <Pillars pillars={site.pillars} />
      <Gallery photos={photos.length > 0 ? photos : placeholderPhotos} />
      <Agenda events={events.slice(0, 4)} />
      <ShopPreview products={products} />
      {site.influences.length > 0 && <Marquee items={site.influences} className="bg-latte text-ink" />}
      <Contact site={site} />
    </>
  );
}
