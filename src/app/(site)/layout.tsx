import type { Metadata } from "next";
import { CartProvider } from "@/components/cart";
import { CartDrawer } from "@/components/cart-drawer";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { SmoothScroll } from "@/components/smooth-scroll";
import { getSiteSettings } from "@/lib/queries";

// Content comes from the database and is edited in the admin panel.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  return {
    title: {
      default: `${site.name} — Gospel contemporâneo de ${site.city.split(",")[0]}`,
      template: `%s · ${site.name}`,
    },
    description: site.description,
    keywords: [site.name, "grupo vocal", "gospel contemporâneo", "música adventista", site.city, site.singleTitle],
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: site.name,
      title: site.name,
      description: site.description,
      images: site.heroImage ? [site.heroImage] : undefined,
    },
  };
}

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const site = await getSiteSettings();
  const socials = { instagram: site.instagram, youtube: site.youtube, spotify: site.spotify };

  return (
    <CartProvider>
      <SmoothScroll />
      <Header socials={socials} />
      <main>{children}</main>
      <Footer site={site} />
      <CartDrawer />
    </CartProvider>
  );
}
