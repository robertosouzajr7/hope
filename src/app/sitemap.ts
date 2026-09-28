import type { MetadataRoute } from "next";
import { getActiveProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getActiveProducts();
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/agenda`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/loja`, changeFrequency: "weekly", priority: 0.8 },
    ...products.map((p) => ({
      url: `${base}/loja/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
