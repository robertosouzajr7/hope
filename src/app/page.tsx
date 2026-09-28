import { influences } from "@/content/site";
import { About } from "@/components/sections/about";
import { Agenda } from "@/components/sections/agenda";
import { Contact } from "@/components/sections/contact";
import { Gallery } from "@/components/sections/gallery";
import { Hero } from "@/components/sections/hero";
import { Marquee } from "@/components/sections/marquee";
import { Music } from "@/components/sections/music";
import { Pillars } from "@/components/sections/pillars";
import { ShopPreview } from "@/components/sections/shop-preview";

// Re-render hourly so past events drop off the agenda without a redeploy.
export const revalidate = 3600;

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee
        items={["Harmonia", "Groove", "Swing", "Esperança", "Gospel contemporâneo"]}
        className="border-y border-cream/10 bg-ink text-cream"
      />
      <About />
      <Music />
      <Pillars />
      <Gallery />
      <Agenda />
      <ShopPreview />
      <Marquee items={influences} className="bg-latte text-ink" />
      <Contact />
    </>
  );
}
